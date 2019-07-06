var MarketPlace = artifacts.require("./MarketPlace.sol");

const ether = 10**18; // 1 ether = 1000000000000000000 wei
const reward = 0 * ether;
const initialDepositsBalance = 0 * ether;

// contract("MarketPlace - basic initialization", function(accounts) {
//   const alice = accounts[1];

//   it("should deposit correct amount", async () => {
//     const marketPlace = await MarketPlace.deployed();
//     const deposit = 0.2 * ether;

//     await marketPlace.deposit({from: alice, value: web3.utils.toBN(deposit)});
//     const balance = await marketPlace.balance({from: alice});
//     assert.equal(balance, reward + deposit, "deposit failed, check deposit method");
//     const depositsBalance = await marketPlace.depositsBalance();
//     assert.equal(depositsBalance, initialDepositsBalance+deposit,
//         "depositsBalance increase failure");

//     const expectedEventResult = {accountAddress: alice, amount: deposit};

//     const log = await new Promise(function (resolve, reject) {
//       marketPlace.getPastEvents('LogDepositMade', function (error, events) {
//         resolve(events[0].returnValues);
//       });
//     });
//     assert.equal(log.accountAddress, expectedEventResult.accountAddress,
//         "LogDepositMade event accountAddress property not emitted");
//     assert.equal(log.amount, expectedEventResult.amount,
//         "LogDepositMade event amount property not emitted");
//   });
// });

// contract("MarketPlace - withdraw all after deposit", function(accounts) {
//   const alice = accounts[1];

//   it("should withdraw correct amount", async () => {
//     const marketPlace = await MarketPlace.deployed();
//     const deposit = 0.1 * ether;

//     await marketPlace.deposit({from: alice, value: web3.utils.toBN(deposit)});
//     await marketPlace.withdraw(web3.utils.toBN(deposit), {from: alice});

//     const balance = await marketPlace.balance({from: alice});
//     assert.equal(balance, deposit - deposit, "withdrawal failed after deposit");
//   });
// });

// contract("MarketPlace - withdraw more than balance", function(accounts) {
//   const alice = accounts[1];

//   it("should keep balance unchanged if withdraw greater than balance", async() => {
//     const marketPlace = await MarketPlace.deployed();
//     const deposit = 0.1 * ether;

//     await marketPlace.deposit({from: alice, value: web3.utils.toBN(deposit)});
//     await marketPlace.withdraw(web3.utils.toBN(deposit * 1.01), {from: alice});

//     const balance = await marketPlace.balance({from: alice});
//     assert.equal(balance, deposit, "balance not kept intact");
//   });
// });

contract("MarketPlace - fallback works", function(accounts) {
  const alice = accounts[1];

  it("should revert ether sent to this contract through fallback", async() => {
    const marketPlace = await MarketPlace.deployed();
    const deposit = 0.1 * ether;

    try {
      await marketPlace.send(web3.utils.toBN(deposit), {from: alice});
    } catch(e) {
      assert(e, "Error: VM Exception while processing transaction: revert");
    }

    const depositsBalance = await marketPlace.depositsBalance();
    assert.equal(depositsBalance, initialDepositsBalance, "balance not kept intact");
  });
});

contract("MarketPlace - withdraw full amount", function(accounts) {
  const alice = accounts[1];

  it("should register a store owner", async () => {
    const marketPlace = await MarketPlace.deployed();

    const userCountBefore = (await marketPlace.getUserCount()).toNumber();
    await marketPlace.register("StoreOwner#1",{from: alice});
    const userCountAfter = (await marketPlace.getUserCount()).toNumber();
    assert.equal(userCountBefore + 1, userCountAfter, "user count did not increase by 1");
  });

  it("should create and send funds to store", async () => {
    const marketPlace = await MarketPlace.deployed();
    const deposit = 5 * ether;

    const storeCountBefore = (await marketPlace.getStoreCount()).toNumber();
    await marketPlace.createStore("Store#1","General Store #1","images/store1.png",{from: alice, value: web3.utils.toBN(deposit)}); 
    const storeCountAfter = (await marketPlace.getStoreCount()).toNumber();
    assert.equal(storeCountBefore + 1, storeCountAfter, "store count did not increase by 1");
    const storeId = (await marketPlace.getStoreIdForOwner(0, {from: alice})).toNumber();
    assert.equal(storeCountAfter - 1 , storeId, "store id is nit store count - 1");
  });

  it("should withdraw all funds from store", async () => {
    const marketPlace = await MarketPlace.deployed();
    const withdraw = 5 * ether;

    const storeId = (await marketPlace.getStoreIdForOwner(0, {from: alice})).toNumber();
    await marketPlace.withdrawStore(storeId, web3.utils.toBN(withdraw),{from: alice}); 
    const balance = await marketPlace.balance({from: alice});
    assert.equal(balance, withdraw - withdraw, "withdraw all funds failed");
  });

});

contract("MarketPlace - withdraw higher amount, then full amount", function(accounts) {
  const bob = accounts[2];
  const deposit = 0.1 * ether;

  it("should register a store owner", async () => {
    const marketPlace = await MarketPlace.deployed();

    const userCountBefore = (await marketPlace.getUserCount()).toNumber();
    await marketPlace.register("StoreOwner#1",{from: bob});
    const userCountAfter = (await marketPlace.getUserCount()).toNumber();
    assert.equal(userCountBefore + 1, userCountAfter, "user count did not increase by 1");
  });

  it("should create and send funds to store", async () => {
    const marketPlace = await MarketPlace.deployed();

    const storeCountBefore = (await marketPlace.getStoreCount()).toNumber();
    await marketPlace.createStore("Store#2","General Store #2","images/store2.png",{from: bob, value: web3.utils.toBN(deposit)}); 
    const storeCountAfter = (await marketPlace.getStoreCount()).toNumber();
    assert.equal(storeCountBefore + 1, storeCountAfter, "store count did not increase by 1");
    const storeId = (await marketPlace.getStoreIdForOwner(0, {from: bob})).toNumber();
    assert.equal(storeCountAfter - 1 , storeId, "store id is not store count - 1");
  });

  it("should withdraw too much from store, leave store balance intact", async () => {
    const marketPlace = await MarketPlace.deployed();

    const storeId = (await marketPlace.getStoreIdForOwner(0, {from: bob})).toNumber();
    await marketPlace.withdrawStore(storeId, web3.utils.toBN(deposit * 1.01),{from: bob}); 
    const balance = await marketPlace.balance({from: bob});
    assert.equal(balance, deposit, "balance not kept intact");
  });

  it("should withdraw all funds from store (repeat)", async () => {
    const marketPlace = await MarketPlace.deployed();

    const storeId = (await marketPlace.getStoreIdForOwner(0, {from: bob})).toNumber();
    await marketPlace.withdrawStore(storeId, web3.utils.toBN(deposit),{from: bob}); 
    const balance = await marketPlace.balance({from: bob});
    assert.equal(balance, deposit -  deposit, "withdraw all funds failed");
  });

});

contract("MarketPlace - start to finish ecommerce", function(accounts) {
  const bob = accounts[2];
  const evelyn = accounts[3];
  const deposit = 10 * ether;

  it("should register a store owner", async () => {
    const marketPlace = await MarketPlace.deployed();

    const userCountBefore = (await marketPlace.getUserCount()).toNumber();
    await marketPlace.register("StoreOwner#1",{from: bob});
    const userCountAfter = (await marketPlace.getUserCount()).toNumber();
    assert.equal(userCountBefore + 1, userCountAfter, "user count did not increase by 1");
  });

  it("should create and send funds to store", async () => {
    const marketPlace = await MarketPlace.deployed();

    const storeCountBefore = (await marketPlace.getStoreCount()).toNumber();
    await marketPlace.createStore("Store#2","General Store #2","images/store2.png",{from: bob, value: web3.utils.toBN(deposit)}); 
    const storeCountAfter = (await marketPlace.getStoreCount()).toNumber();
    assert.equal(storeCountBefore + 1, storeCountAfter, "store count did not increase by 1");
    const storeId = (await marketPlace.getStoreIdForOwner(0, {from: bob})).toNumber();
    assert.equal(storeCountAfter - 1 , storeId, "store id is not store count - 1");
  });

  it("should create a product", async () => {
    const marketPlace = await MarketPlace.deployed();

    const productCountBefore = (await marketPlace.getProductCount()).toNumber();
    await marketPlace.createProduct("Product#1","This is Product #2","images/product1.png",{from: bob}); 
    const productCountAfter = (await marketPlace.getProductCount()).toNumber();
    assert.equal(productCountBefore + 1, productCountAfter, "product count did not increase by 1");
    const productId = (await marketPlace.getProductIdForOwner(0, {from: bob})).toNumber();
    assert.equal(productCountAfter - 1 , productId, "product id is not product count - 1");
  });

  it("should create a store product", async () => {
    const marketPlace = await MarketPlace.deployed();

    const storeId = (await marketPlace.getStoreIdForOwner(0, {from: bob})).toNumber();
    const productId = (await marketPlace.getProductIdForOwner(0, {from: bob})).toNumber();
    const price = 1;
    const qty_avail = 10;
    const status = 0;
    const spCountBefore = (await marketPlace.getStoreProductCount()).toNumber();
    await marketPlace.createStoreProduct(storeId,productId,price,qty_avail,status,{from: bob}); 
    const spCountAfter = (await marketPlace.getStoreProductCount()).toNumber();
    assert.equal(spCountBefore + 1, spCountAfter, "store product count did not increase by 1");
    const spid = (await marketPlace.getStoreProductIdForStore(storeId, 0)).toNumber();
    assert.equal(spCountAfter - 1 , spid, "store product id is not store product count - 1");
  });

  it("should sell a store product", async () => {
    const marketPlace = await MarketPlace.deployed();

    const storeId = (await marketPlace.getStoreIdForOwner(0, {from: bob})).toNumber();
    const productId = (await marketPlace.getProductIdForOwner(0, {from: bob})).toNumber();
    const spid = (await marketPlace.getStoreProductIdForStore(storeId, 0)).toNumber();
    const price = 1;
    const qty = 1;
    const saleValue = price * qty;
    const oCountBefore = (await marketPlace.getOrderCount()).toNumber();
    await marketPlace.sellProduct(storeId,spid,productId,qty,price,{from: evelyn, value: web3.utils.toBN(saleValue)}); 
    const oCountAfter = (await marketPlace.getOrderCount()).toNumber();
    assert.equal(oCountBefore + 1, oCountAfter, "order count did not increase by 1");
  });

  it("should withdraw sale proceeds from store", async () => {
    const marketPlace = await MarketPlace.deployed();
    const price = 1;
    const qty = 1;
    const saleValue = price * qty;

    const balanceBefore = await marketPlace.balance({from: bob});
    const storeId = (await marketPlace.getStoreIdForOwner(0, {from: bob})).toNumber();
    await marketPlace.withdrawStore(storeId, web3.utils.toBN(saleValue),{from: bob}); 
    const balanceAfter = await marketPlace.balance({from: bob});
    assert.equal(balanceAfter, balanceBefore -  saleValue, "withdraw sale proceeds failed");
  });

  it("should withdraw too much from store, leave store balance intact", async () => {
    const marketPlace = await MarketPlace.deployed();

    const storeId = (await marketPlace.getStoreIdForOwner(0, {from: bob})).toNumber();
    await marketPlace.withdrawStore(storeId, web3.utils.toBN(deposit * 1.01),{from: bob}); 
    const balance = await marketPlace.balance({from: bob});
    assert.equal(balance, deposit, "balance not kept intact");
  });

  it("should withdraw all funds from store (repeat)", async () => {
    const marketPlace = await MarketPlace.deployed();

    const storeId = (await marketPlace.getStoreIdForOwner(0, {from: bob})).toNumber();
    await marketPlace.withdrawStore(storeId, web3.utils.toBN(deposit),{from: bob}); 
    const balance = await marketPlace.balance({from: bob});
    assert.equal(balance, deposit -  deposit, "withdraw all funds failed");
    assert.equal(balance, 0, "withdraw all funds (v2) failed");
  });

});
