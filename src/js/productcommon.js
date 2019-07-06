function createProduct() 
{
    console.log("Starting createProduct() javascript method...");
    console.log("Creating product");
    setStatus("Creating, please wait.", "warning");
    showSpinner();

    // use web3 current account to paying for transaction and set gaslimit for transaction
    account = accounts[0];
    var gaslimit = 500000;

    // gather page fields for contract call
    var name   = document.getElementById("name").value;
    var desc   = document.getElementById("desc").value;
    var imgsrc = document.getElementById("imgsrc").value;
    console.log("New Product (account:"+account+", name:"+name+", desc:"+desc+", imgsrc:"+imgsrc+")");
    
    console.log("About to call createProduct on contract...");
	MarketPlaceContract.createProduct(account, name, desc, imgsrc, {from: account, gas: gaslimit}).then(function(txId) 
	{
    console.log("Back from MarketPlace.createProduct...");
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
  console.log("Exiting createProduct() javascript method...");
};

function loadProducts()
{
  setStatus("Products being fetched...", "warning");
  setInfo("This page shows the current products.");
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
    
    waitAndRefreshProducts(count);
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

function waitAndRefreshProducts(count)
{
  if (productsArray.length < count)
  {
    console.log("Sleeping, Count: " + count + " Length: " + productsArray.length);
    setTimeout(waitAndRefreshProducts, 500, count);
  }
  else
  {
    var productSection = document.getElementById("products");
    var res = "";
    for (var j = 0; j < count; j++)
    {
        var entity = productsArray[j];
        res = res + "<tr>";
        res = res + "<td><a href='productupdate.html?productId=" + entity[0] + "'>" + entity[0] + "</a></td>";
        res = res + "<td>" + entity[2] + "</td>";
        res = res + "<td>" + entity[3] + "</td>";
        res = res + "<td>" + entity[4] + "</td>";
        res = res + "<td>" + entity[1] + "</td>";
        res = res + "</tr>";
    }
    productSection.innerHTML = res;
    setStatus("");
  }
};

function loadProductToForm()
{
  var pid = getUrlParameter("productId")
  console.log("Loading product from contract to form: " + pid);
  setStatus("Product being fetched...", "warning");
  setInfo("This page is used to update the product information.");

  // pull product from contract
  MarketPlaceContract.getProduct.call(pid).then(function(product)
  {
    product[9]     = pid; // save uid in user structure
    var id         = document.getElementById("pid");
    var name       = document.getElementById("name");
    var desc       = document.getElementById("desc");
    var imgsrc     = document.getElementById("imgsrc");
    var address    = document.getElementById("address");
    id.innerHTML   = product[9];
    name.innerHTML = product[2];
    desc.value     = product[3];
    imgsrc.value   = product[4];
    address.innerHTML = product[1];
  });

  setStatus("");
};

function updateProduct()
{
  console.log("Updating product");
  setStatus("Updating, please wait.", "warning");
  showSpinner();

  // use web3 current account to paying for transaction and set gaslimit for transaction
  account = accounts[0];
  var gaslimit = 500000;

  // gather page fields for contract call
  var pid    = document.getElementById("pid").innerHTML;
  var name   = document.getElementById("name").innerHTML;
  var desc   = document.getElementById("desc").value;
  var imgsrc = document.getElementById("imgsrc").value;
  console.log("Update (pid:"+pid+", name:"+name+", desc:"+desc+", imgsrc:"+imgsrc+")");

  // call the contract function
  MarketPlaceContract.updateProduct(pid, name, desc, imgsrc, {from: account, gas: gaslimit}).then(function(txId) 
  {
		console.log(txId);
    if (txId["receipt"]["gasUsed"] == gaslimit) 
    {
		  setStatus("Product update failed", "error");
    }
    else
    {
		  setStatus("Updated<br>gasUsed: <b>"+txId["receipt"]["gasUsed"]+ "</b><br>tx: <b>" + txId["tx"]+"</b>");
		}
	});

  hideSpinner();
};