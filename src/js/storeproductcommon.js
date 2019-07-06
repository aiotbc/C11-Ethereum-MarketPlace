function loadStoresForOwner()
{
  account = accounts[0];
  setStatus("Stores being fetched...", "warning");
  setInfo("This page maintains the products within stores for currently logged in user.");
  // setInfo("This page shows the current stores for currently logged in user.");
  showSpinner();

  MarketPlaceContract.getStoreCountForOwner.call(account).then(function(count)
  {
    console.log("Number of stores " + count);
    if (count <= 0)
    {
      setStatus("No stores found", "error");
    }

    for (var i = 0; i < count; i++)
    {
      console.log("Getting store: "+i);
      getStoreForOwner(account, i);
    }
    
    waitAndRefreshStoresForOwner(account, count);
  });   

  hideSpinner();
};

function getStoreForOwner(account, storeId)
{
  MarketPlaceContract.getStoreForOwner.call(account, storeId).then(function(store)
  {
    console.log("Loading: " + storeId + " for " + account);
    store[9] = storeId;
    storesArray.push(store);
  });
};

function waitAndRefreshStoresForOwner(account, count)
{
  if (storesArray.length < count)
  {
    console.log("Sleeping, Count: " + count + " Length: " + storesArray.length);
    setTimeout(waitAndRefreshStoresForOwner, 500, account, count);
  }
  else
  {
    let ul = document.querySelector('.store-list');
    ul.innerHTML = ""; //clear old data
    let df = document.createDocumentFragment();
    storesArray.forEach(storeEntity => {
      let tr = document.createElement('tr');
      tr.className = 'store';
      tr.setAttribute('data-key', storeEntity[0]);
      tr.addEventListener('click', showStoreProducts);
      let td1 = document.createElement('td');
      td1.textContent = storeEntity[0];
      td1.setAttribute('data-key', storeEntity[0]);
      tr.appendChild(td1);
      td1 = document.createElement('td');
      td1.textContent = storeEntity[2];
      td1.setAttribute('data-key', storeEntity[0]);
      tr.appendChild(td1);
      td1 = document.createElement('td');
      td1.textContent = storeEntity[3];
      td1.setAttribute('data-key', storeEntity[0]);
      tr.appendChild(td1);

      // add row to document fragment
      df.appendChild(tr);
    });
    ul.appendChild(df);
  }
};

/*
 * User has clicked on store and this function shows
 * the products associated with the store selected.
*/
let showStoreProducts = function(ev){
  let store_id = ev.target.getAttribute('data-key');
  console.log("clicked on "+store_id);
  let oldActive = document.querySelector('.selected');
  (oldActive)?oldActive.classList.remove('selected'):null;

  // highlight the target Element (i.e., just the column)
  // ev.target.classList.add('selected');
  // highlight target's parentElement (i.e., the whole row)
  ev.target.parentElement.classList.add('selected');
  
  // let activeStore = storesArray[store_id];
  // let ul = document.querySelector('.storeProduct-list');
  // ul.innerHTML = ""; //clear old data
  // let df = document.createDocumentFragment();

  // get logged in user (account)
  account = accounts[0];
  // load the store product list
  loadStoreProductsForStore(store_id);
}

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
    }

    for (var i = 0; i < count; i++)
    {
      console.log("Getting store product: "+i);
      getStoreProductForStore(_sid, i);
    }
    
    waitAndRefreshProductsForStore(_sid, count);
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
    let ul = document.querySelector('.storeProduct-list');
    ul.innerHTML = "";
    let df = document.createDocumentFragment();
    if (storeProductsArray.length > 0)
    {
      storeProductsArray.forEach(storeProductEntity => {
        // get the store product fields to be displayed
        let spid = storeProductEntity[0];
        let sid = storeProductEntity[1];
        let pid = storeProductEntity[2];

        // get the product 
        let activeProduct = productsArray[pid];
        let tr = document.createElement('tr');
        tr.className = 'store';
        tr.setAttribute('data-key', spid);
        tr.addEventListener('click', loadStoreProductForm2);

        let td1 = document.createElement('td');
        td1.textContent = spid;
        td1.setAttribute('data-key', spid);
        tr.appendChild(td1);

        td1 = document.createElement('td');
        td1.textContent = sid;
        td1.setAttribute('data-key', spid);
        tr.appendChild(td1);

        td1 = document.createElement('td');
        td1.textContent = pid;
        td1.setAttribute('data-key', spid);
        tr.appendChild(td1);

        td1 = document.createElement('td');
        td1.textContent = activeProduct[2];
        td1.setAttribute('data-key', spid);
        tr.appendChild(td1);

        td1 = document.createElement('td');
        td1.textContent = activeProduct[3];
        td1.setAttribute('data-key', spid);
        tr.appendChild(td1);

        td1 = document.createElement('td');
        td1.textContent = activeProduct[4];
        td1.setAttribute('data-key', spid);
        tr.appendChild(td1);

        td1 = document.createElement('td');
        td1.textContent = storeProductEntity[3];
        td1.setAttribute('data-key', spid);
        tr.appendChild(td1);
 
        td1 = document.createElement('td');
        td1.textContent = storeProductEntity[4];
        td1.setAttribute('data-key', spid);
        tr.appendChild(td1);
 
        td1 = document.createElement('td');
        td1.textContent = storeProductEntity[5];
        td1.setAttribute('data-key', spid);
        tr.appendChild(td1);

        // add row to document fragment
        df.appendChild(tr);
      });
    }
    else
    {
      let tr = document.createElement('tr');
      let td1 = document.createElement('td');
      td1.colSpan = 4;
      td1.textContent = "No products found in store";
      tr.appendChild(td1);
      df.appendChild(tr);
    }
    ul.appendChild(df);

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

function addStoreProduct()
{
  let active = document.querySelector('.selected');
  if(!active) {
    console.log("addStoreProduct without active store!");
  }
  else
  {
    let store_id = active.getAttribute('data-key');
    console.log("clicked Add Store Product for "+store_id);
  }
}

function loadProducts2()
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
    
    waitAndRefreshProducts2(count);
  });   

  hideSpinner();
};

function waitAndRefreshProducts2(count)
{
    if (productsArray.length < count)
    {
      console.log("Sleeping, Count: " + count + " Length: " + productsArray.length);
      setTimeout(waitAndRefreshProducts2, 500, count);
    }
    else
    {
      let ul = document.querySelector('.product-list');
      ul.innerHTML = "";
      let df = document.createDocumentFragment();
      if (productsArray.length > 0)
      {
        productsArray.forEach(productEntity => {
          let tr = document.createElement('tr');
          tr.className = 'store';
          tr.setAttribute('data-key', productEntity[0]);
          tr.addEventListener('click', loadStoreProductForm);
          let td1 = document.createElement('td');
          td1.textContent = productEntity[0];
          td1.setAttribute('data-key', productEntity[0]);
          tr.appendChild(td1);
          td1 = document.createElement('td');
          td1.textContent = productEntity[2];
          td1.setAttribute('data-key', productEntity[0]);
          tr.appendChild(td1);
          td1 = document.createElement('td');
          td1.textContent = productEntity[3];
          td1.setAttribute('data-key', productEntity[0]);
          tr.appendChild(td1);
          td1 = document.createElement('td');
          td1.textContent = productEntity[4];
          td1.setAttribute('data-key', productEntity[0]);
          tr.appendChild(td1);
    
          // add row to document fragment
          df.appendChild(tr);
        });
      }
      else
      {
        let tr = document.createElement('tr');
        let td1 = document.createElement('td');
        td1.colSpan = 4;
        td1.textContent = "No products for owner";
        tr.appendChild(td1);
        df.appendChild(tr);
      }
      ul.appendChild(df);
  
    }
  };

/*
 * User has clicked on product and this function loads
 * the store product fields with defaults for new fields.
*/
let loadStoreProductForm = function(ev){
  let storerow = document.querySelector('.selected');
  if (storerow)
  {
    let store_id = storerow.getAttribute('data-key');
    let product_id = ev.target.getAttribute('data-key');
    console.log("clicked on product_id "+product_id+ " for store_id "+store_id);
    var sid        = document.getElementById("pid");
    var id         = document.getElementById("pid");
    var name       = document.getElementById("name");
    var desc       = document.getElementById("desc");
    var imgsrc     = document.getElementById("imgsrc");
    var price      = document.getElementById("price");
    var qty_avail  = document.getElementById("qty_avail");
    var status     = document.getElementById("status");
    if (storeProductExistsInStore(product_id))
    {
        console.log("Product is in the store already");
        alert("Product is in the store already");
        id.innerHTML   = "";
        name.innerHTML = "";
        desc.innerHTML     = "";
        imgsrc.innerHTML   = "";
        price.value       = 0;
        qty_avail.value   = 0;
        status.value      = 0;

        // show/hide buttons
        setElementByIdDisplay("createstoreproduct","none");
        setElementByIdDisplay("updatestoreproduct","none");
    }
    else
    {
        console.log("Product can be added to store!");
        var productEntity = productsArray[product_id];
        sid.innerHTML     = store_id;
        id.innerHTML      = productEntity[9];
        name.innerHTML    = productEntity[2];
        desc.innerHTML    = productEntity[3];
        imgsrc.innerHTML  = productEntity[4];
        price.value       = 0;
        qty_avail.value   = 0;
        status.value      = 0;

        // show/hide buttons
        setElementByIdDisplay("createstoreproduct","block");
        setElementByIdDisplay("updatestoreproduct","none");
    
    }
  }
  else
  {
    alert("Select a store before selecting a product.");
  }
}

/*
 * User has clicked on store product and this function loads
 * the store product fields and enables correct action buttons.
*/
let loadStoreProductForm2 = function(ev){
  let storerow = document.querySelector('.selected');
  if (storerow)
  {
    let store_id = storerow.getAttribute('data-key');
    let storeProduct_id = ev.target.getAttribute('data-key');
    let elmchildren = ev.target.parentElement.children;
    let product_id = elmchildren[2].innerHTML;    //pid
    console.log("clicked on spid "+storeProduct_id+ ", pid "+product_id+" for store_id "+store_id);
    var spid       = document.getElementById("spid");
    var sid        = document.getElementById("sid");
    var pid        = document.getElementById("pid");
    var name       = document.getElementById("name");
    var desc       = document.getElementById("desc");
    var imgsrc     = document.getElementById("imgsrc");
    var price      = document.getElementById("price");
    var qty_avail  = document.getElementById("qty_avail");
    var status     = document.getElementById("status");
    if (!storeProductExistsInStore(product_id))
    {
        console.log("Product is NOT in the store already");
        alert("Product is NOT in the store already");
        spid.innerHTML    = "";
        sid.innerHTML     = "";
        pid.innerHTML     = "";
        name.innerHTML    = "";
        desc.innerHTML    = "";
        imgsrc.innerHTML  = "";
        price.value       = 0;
        qty_avail.value   = 0;
        status.value      = 0;
        // show/hide buttons
        setElementByIdDisplay("createstoreproduct","none");
        setElementByIdDisplay("updatestoreproduct","none");
    }
    else
    {
        console.log("Product can be modified in the store!");
        var productEntity  = productsArray[product_id];
        spid.innerHTML     = storeProduct_id;
        sid.innerHTML      = store_id;
        pid.innerHTML      = productEntity[9];  //or product_id
        name.innerHTML     = productEntity[2];
        desc.innerHTML     = productEntity[3];
        imgsrc.innerHTML   = productEntity[4];
        price.value        = elmchildren[6].innerHTML;
        qty_avail.value    = elmchildren[7].innerHTML;
        status.value       = elmchildren[8].innerHTML;

        // show/hide buttons
        setElementByIdDisplay("createstoreproduct","none");
        setElementByIdDisplay("updatestoreproduct","block");
    }
  }
  else
  {
    alert("Select a store before selecting a product.");
  }
}

function storeProductExistsInStore(pid)
{
    var retBool = false;
    if (storeProductsArray.length > 0)
    {
      storeProductsArray.forEach(storeProductEntity => {
          var spe2 = storeProductEntity[2];
          if (spe2 == pid) {
            retBool = true;
          }
      });
    }
    return retBool;
}

function createStoreProduct() 
{
  console.log("Starting createStoreProduct() javascript method...");
  console.log("Creating storeproduct");
  setStatus("Creating, please wait.", "warning");
  showSpinner();

  // use web3 current account to paying for transaction and set gaslimit for transaction
  account = accounts[0];
  var gaslimit = 500000;

  // gather page fields for contract call
  let storerow  = document.querySelector('.selected');
  let sid       = storerow.getAttribute('data-key');
  var pid       = document.getElementById("pid").innerHTML;
  var price     = document.getElementById("price").value;
  var qty_avail = document.getElementById("qty_avail").value;
  var status    = document.getElementById("status").value;
  console.log("New StoreProduct (sid:"+sid+", pid:"+pid+", price:"+price+", qty_avail:"+qty_avail+", status:"+status+")");
  console.log("About to call createStoreProduct on contract...");
	MarketPlaceContract.createStoreProduct(sid, pid, price, qty_avail, status, {from: account, gas: gaslimit}).then(function(txId) 
	{
    console.log("Back from MarketPlace.createStoreProduct...");
		console.log(txId);
        if (txId["receipt"]["gasUsed"] == 500000) 
        {
            setStatus("Creation failed", "error");
        }
        else
        {
            setStatus("Created<br>gasUsed: <b>"+txId["receipt"]["gasUsed"]+ "</b><br>tx: <b>" + txId["tx"]+"</b>");
        }
        hideSpinner();
	});
  console.log("Exiting createStoreProduct() javascript method...");
};

function updateStoreProduct() 
{
  console.log("Updating StoreProduct");
  setStatus("Updating, please wait.", "warning");
  showSpinner();

  // use web3 current account to paying for transaction and set gaslimit for transaction
  account = accounts[0];
  var gaslimit = 500000;

  // gather page fields for contract call
  let spid      = document.getElementById("spid").innerHTML;
  let sid       = document.getElementById("sid").innerHTML;
  var pid       = document.getElementById("pid").innerHTML;
  var price     = document.getElementById("price").value;
  var qty_avail = document.getElementById("qty_avail").value;
  var status    = document.getElementById("status").value;
  console.log("Update StoreProduct (spid:"+spid+", sid:"+sid+", pid:"+pid+", price:"+price+", qty_avail:"+qty_avail+", status:"+status+")");
	MarketPlaceContract.updateStoreProduct(spid, sid, pid, price, qty_avail, status, {from: account, gas: gaslimit}).then(function(txId) 
	{
    console.log("Back from MarketPlace.updateStoreProduct...");
		console.log(txId);
    if (txId["receipt"]["gasUsed"] == 500000) 
    {
        setStatus("Update failed", "error");
    }
    else
    {
        setStatus("Updated<br>gasUsed: <b>"+txId["receipt"]["gasUsed"]+ "</b><br>tx: <b>" + txId["tx"]+"</b>");
    }
    hideSpinner();
	});
};