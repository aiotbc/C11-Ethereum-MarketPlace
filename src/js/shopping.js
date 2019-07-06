function loadStores()
{
  setStatus("Stores being fetched...", "warning");
  setInfo("This page shows the products for chosen store.");
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
    var storesRow = $('#storesRow');
    var storeTemplate = $('#storeTemplate');

    for (i = 0; i < count; i ++) {
        var usr = storesArray[i];
        storeTemplate.find('.panel-title').text(usr[2]);
        storeTemplate.find('img').attr('src', usr[5]);
        storeTemplate.find('.store-desc').text(usr[3]);
        storeTemplate.find('.btn-enter').attr('data-id', usr[0]);
        console.log("loading store id "+usr[0]);

        storesRow.append(storeTemplate.html());
    }

    setStatus("");
  }
};

function loadStoreProductsForStore(_sid)
{
  setStatus("Products being fetched...", "warning");
  storeProductsArray = [];
  showSpinner();

  MarketPlaceContract.getStoreProductCountForStore.call(_sid).then(function(count)
  {
    console.log("Number of products for store " + _sid + " = " + count);
    if (count <= 0)
    {
      setStatus("No products found in store", "warning");
      alert("No products found in store, come back later.");
    }
    else
    {
      // clear out old products
      $('#productsRow').empty();
      setElementByIdDisplay("storesRow","none");
      setElementByIdDisplay("productsRow","block");
      setElementByIdDisplay("storeExit","block");
      for (var i = 0; i < count; i++)
      {
        console.log("Getting store product: "+i);
        getStoreProductForStore(_sid, i);
      }

      waitAndRefreshProductsForStore(_sid, count);
    }

  });   

  hideSpinner();
};

function waitAndRefreshProductsForStore(_sid, count)
{
  if (storeProductsArray.length < count)
  {
    console.log("Sleeping, Count: " + count + " Length: " + storeProductsArray.length);
    setTimeout(waitAndRefreshProductsForStore, 500, _sid, count);
  }
  else
  {
    // get handle to productsRow (area to be populated)
    var productsRow = $('#productsRow');
    // get handle to product template
    var productTemplate = $('#productTemplate');

    for (i = 0; i < count; i ++) {
        var storeProductEntity = storeProductsArray[i];
        // get the product id
        let pid = storeProductEntity[2];
        // get the product 
        let activeProduct = productsArray[pid];
        // fill in template
        productTemplate.find('.panel-title').text(activeProduct[2]);
        productTemplate.find('img').attr('src', activeProduct[4]);
        productTemplate.find('.product-desc').text(activeProduct[3]);
        productTemplate.find('.product-price').text(storeProductEntity[3]);
        productTemplate.find('.product-qty-avail').text(storeProductEntity[4]);
        productTemplate.find('.btn-buy').attr('data-id', storeProductEntity[0]);
        console.log("loading store product id "+storeProductEntity[0]);
        productsRow.append(productTemplate.html());
    }
    setStatus("");
  }
};

function getStoreProductForStore(storeId, storeProductId)
{
  MarketPlaceContract.getStoreProductForStore.call(storeId, storeProductId).then(function(storeProduct)
  {
    console.log("Loading: " + storeProductId + " for " + storeId);
    storeProduct[9] = storeProductId;
    storeProductsArray.push(storeProduct);
  });
};

function loadProducts()
{
  setStatus("Products being fetched...", "warning");
  showSpinner();

  MarketPlaceContract.getProductCount.call().then(function(count)
  {
    console.log("Number of products " + count);
    if (count <= 0)
    {
      setStatus("No products found", "error");
    }

    for (var i = 0; i < count; i++)
    {
      console.log("Getting product: "+i);
      getProduct(i);
    }
    // waitAndRefreshProducts2(count);
  });   
  hideSpinner();
};

function getProduct(pid)
{
  MarketPlaceContract.getProduct.call(pid).then(function(product)
  {
    console.log("Loading: " + pid);
    product[9] = pid;
    productsArray.push(product);
  });
};


function loadStoreProducts()
{
  setStatus("Store Products being fetched...", "warning");
  storeProductsArray = [];
  showSpinner();

  MarketPlaceContract.getStoreProductCount.call().then(function(count)
  {
    console.log("Number of store products = " + count);
    if (count <= 0)
    {
      setStatus("No store products found", "warning");
    }
    else
    {
      for (var i = 0; i < count; i++)
      {
        console.log("Getting store product: "+i);
        getStoreProduct(i);
      }
    }

  });   

  hideSpinner();
};

function getStoreProduct(storeProductId)
{
  MarketPlaceContract.getStoreProduct.call(storeProductId).then(function(storeProduct)
  {
    console.log("Loading: spid " + storeProductId);
    storeProduct[9] = storeProductId;
    allStoreProductArray.push(storeProduct);
  });
};

function callFunctions()
{
    loadStores();
    loadProducts();
    loadStoreProducts();
    $(document).on('click', '.btn-enter', handleEnter);
    $(document).on('click', '.btn-buy', handleBuy);
    $(document).on('click', '.btn-exit', handleExit);
};

function handleEnter(event)
{
    event.preventDefault();
    var sid = parseInt($(event.target).data('id'));
    console.log("Entering store "+sid);
    loadStoreProductsForStore(sid);
}

function handleBuy(event)
{
    event.preventDefault();
    var spid = parseInt($(event.target).data('id'));
    console.log("Buying store product "+spid);
    var storeProductEntity = storeProductsArray[spid];
    // get the store id
    let sid = storeProductEntity[1];
    // get the product id
    let pid = storeProductEntity[2];
    // get the price
    let price = storeProductEntity[3];
    // get the qty avail
    let qty_avail = storeProductEntity[4];
    // get the qty avail
    let status = storeProductEntity[5];
    let qty = 1;
    sellProduct(sid, spid, pid, qty, price);
}

function handleExit()
{
    event.preventDefault();
    setElementByIdDisplay("storesRow","block");
    setElementByIdDisplay("productsRow","none");
    setElementByIdDisplay("storeExit","none");
}

function sellProduct(sid, spid, pid, qty, price) 
{
  console.log("Calling sellProduct");
  setStatus("Buying, please wait.", "warning");
  showSpinner();

  // use web3 current account to paying for transaction and set gaslimit for transaction
  account = accounts[0];
  var gaslimit = 500000;
  var txvalue = qty * price;

  // gather page fields for contract call
  console.log("Call sellProduct (sid:"+sid+", spid:"+spid+", pid:"+pid+", qty:"+qty+", price:"+price+", txvalue(toWei):"+web3.toWei(txvalue)+")");
  MarketPlaceContract.sellProduct(sid, spid, pid, qty, price, {from: account, value: web3.toWei(txvalue), gas: gaslimit}).then(function(txId) 
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
  console.log("Exiting sellProduct() javascript method...");
};