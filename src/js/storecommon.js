function createStore() 
{
  console.log("Creating store");
	setStatus("Creating, please wait.", "warning");
  showSpinner();

  // use web3 current account to paying for transaction and set gaslimit for transaction
  account = accounts[0];
  var gaslimit = 500000;

  // gather page fields for contract call
	var storename = document.getElementById("storename").value;
	var storedescription = document.getElementById("storedescription").value;
	var amount = parseFloat(document.getElementById("amount").value);
	var amountWei = web3.toWei(amount);
	var imgsrc = document.getElementById("imgsrc").value;
  console.log("New Store (account:"+account+", storename:"+storename+", storedescription:"+storedescription+", amount:"+amount+", amountWei:"+amountWei+", imgsrc:"+imgsrc+")");
    
	MarketPlaceContract.createStore(storename, storedescription, imgsrc, {from: account, value:amountWei, gas:500000}).then(function(txId) 
	{
		console.log(txId);
    if (txId["receipt"]["gasUsed"] == 500000) 
    {
			setStatus("Store creation failed", "error");
    }
    else
    {
		  setStatus("Created<br>gasUsed: <b>"+txId["receipt"]["gasUsed"]+ "</b><br>tx: <b>" + txId["tx"]+"</b>");
		}
    hideSpinner();
	});
};

function loadStores()
{
  setStatus("Stores being fetched...", "warning");
  setInfo("This page shows the current stores.");
  showSpinner();

  MarketPlaceContract.getStoreCount.call().then(function(count)
  {
    console.log("Number of stores " + count);
    if (count <= 0)
    {
      setStatus("No stores found", "error");
    }

    for (var i = 0; i < count; i++)
    {
      console.log("Getting store: "+i);
      getStore(i);
    }
    
    waitAndRefreshStores(count);
  });   

  hideSpinner();
};

function getStore(storeId)
{
  MarketPlaceContract.getStore.call(storeId).then(function(store)
  {
    console.log("Loading: " + storeId);
    store[9] = storeId;
    storesArray.push(store);
  });
};

function waitAndRefreshStores(count)
{
  if (storesArray.length < count)
  {
    console.log("Sleeping, Count: " + count + " Length: " + storesArray.length);
    setTimeout(waitAndRefreshStores, 500, count);
  }
  else
  {
    var storeSection = document.getElementById("stores");
    var res = "";
    for (var j = 0; j < count; j++)
    {
        var store = storesArray[j];
        res = res + "<tr>";
        res = res + "<td><a href='storeupdate.html?storeId=" + store[0] + "'>" + store[0] + "</a></td>";
        res = res + "<td>" + store[2] + "</td>";
        res = res + "<td>" + store[3] + "</td>";
        res = res + "<td>" + store[1] + "</td>";
        res = res + "<td>" + web3.fromWei(store[4], "ether") + "</td>";
        res = res + "<td>" + store[5] + "</td>";
        res = res + "</tr>";
    }
    storeSection.innerHTML = res;
    setStatus("");
  }
};

function loadStoreToForm()
{
  var sid = getUrlParameter("storeId")
  console.log("Loading store from contract to form: " + sid);
  setStatus("Store being fetched...", "warning");
  setInfo("This page is used to update the store information and withdraw funds from store (empty the registers).");

  // pull store from contract
  MarketPlaceContract.getStore.call(sid).then(function(store)
  {
    store[9] = sid; // save uid in user structure
    var storeid          = document.getElementById("store.id");
    var storename        = document.getElementById("store.name");
    var storedescription = document.getElementById("store.description");
    var amount           = document.getElementById("store.amount");
    var imgsrc           = document.getElementById("store.imgsrc");
    storeid.innerHTML       = store[9];
    storename.innerHTML     = store[2];
    storedescription.value  = store[3];
    amount.innerHTML        = web3.fromWei(store[4], "ether");
    imgsrc.value            = store[5];
  });

  setStatus("");
};

function updateStore()
{
  console.log("Updating store");
	setStatus("Updating, please wait.", "warning");
  showSpinner();

  // use web3 current account to paying for transaction and set gaslimit for transaction
  account = accounts[0];
  var gaslimit = 500000;

  // gather page fields for contract call
  var storeid          = document.getElementById("store.id").innerHTML;
  var storename        = document.getElementById("store.name").innerHTML;
  var storedescription = document.getElementById("store.description").value;
  var imgsrc           = document.getElementById("store.imgsrc").value;
  console.log("Update store (sid:"+storeid+", storename:"+storename+", storedescription:"+storedescription+", imgsrc:"+imgsrc+")");

  // call the contract function
  MarketPlaceContract.updateStore(storeid, storename, storedescription, imgsrc, {from: account, gas: gaslimit}).then(function(txId) 
  {
		console.log(txId);
    if (txId["receipt"]["gasUsed"] == gaslimit) 
    {
		  setStatus("Store update failed", "error");
    }
    else
    {
		  setStatus("Updated<br>gasUsed: <b>"+txId["receipt"]["gasUsed"]+ "</b><br>tx: <b>" + txId["tx"]+"</b>");
		}
	});

  hideSpinner();
};

function withdraw() 
{
  console.log("Calling withdraw");
  setStatus("Withdrawing, please wait.", "warning");
  showSpinner();

  // use web3 current account to paying for transaction and set gaslimit for transaction
  account = accounts[0];
  var gaslimit = 500000;

  // gather page fields for contract call
  var sid         = document.getElementById("store.id").innerHTML;
  var amount      = web3.toWei(document.getElementById("store.amount").innerHTML);
  console.log("Call withdraw (sid:"+sid+", amount:"+amount+")");
	MarketPlaceContract.withdrawStore(sid, amount, {from: account, gas: gaslimit}).then(function(txId) 
	{
    console.log("Back from MarketPlace.sellProduct...");
		console.log(txId);
        if (txId["receipt"]["gasUsed"] == 500000) 
        {
            setStatus("SellProduct failed", "error");
        }
        else
        {
            setStatus("Bought<br>gasUsed: <b>"+txId["receipt"]["gasUsed"]+ "</b><br>tx: <b>" + txId["tx"]+"</b>");
        }
        hideSpinner();
	});
  console.log("Exiting withdraw() javascript method...");
};