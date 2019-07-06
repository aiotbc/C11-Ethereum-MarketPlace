var web3;
var web3Provider;
var allStoreProductArray = [];
var contract;
var currentBlockNumber;
var accounts;
var account;
var MarketPlaceContract;
var MarketPlaceArtifact;
var products;
var productsArray = [];
var stores;
var storesArray = [];
var storeProducts;
var storeProductsArray = [];
var users;
var usersArray = [];
var uType;

function start()
{
    console.log("Starting MarketPlace application");

    if (typeof web3 !== 'undefined') 
    {
      console.log("Connecting to Injected Metamask");
      web3Provider = web3.currentProvider;
    } 
    else 
    {
      console.log("Connecting to Localhost port 8545");
      web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(web3Provider);

    $.getJSON('MarketPlace.json', function(data)
    {
      console.log("Getting MarketPlace contract file");
      MarketPlaceArtifact = data;
    }).then(getContract);
};

function getContract()
{
    console.log("Getting instance from network");
    contract = TruffleContract(MarketPlaceArtifact);
    contract.setProvider(web3Provider);
    var wea = web3.eth.accounts;
    web3.eth.getAccounts(function(err, accs)
    {
      if (err != null) 
      {
        alert("There was an error fetching accounts.");
        return;
      }
      accounts = accs;
      console.log("Accounts: ", accounts);
      account = accounts[0];
      console.log("Account: ", account);

      contract.deployed().then(function(instance)
      {
        MarketPlaceContract = instance;
      }).then(callCommonFunctions);
    });
};

function callCommonFunctions()
{
  watchEvents();
  account = accounts[0];

  MarketPlaceContract.getUserType.call(account).then(function(userType)
  {
    uType = userType;
    console.log("Address is: " + account + ", uType = "+ uType + ", userType = "+ userType);

    if(window.location.href.endsWith("index.html") || window.location.href.endsWith("/") || window.location.href.endsWith("shopping.html"))
    {
      buildMenu();
    }
    updateNetworkInfo();
    updateBlockNumber();
    // call page specific functions
    callFunctions();
  });

};

function buildMenu()
{
  var usertype = document.getElementById("usertype");
  var navbarlist = document.getElementById("navbarlist");
  navbarlist.innerHTML = "";
  let df = document.createDocumentFragment();

  if (uType == 0)
  {
    // Admin menu
    appendMenuListItem(df, "userlist.html", "Users");
    usertype.innerHTML = "Admin";
  }
  else if (uType == 1)
  {
    // Owner menu
    appendMenuListItem(df, "storelist.html", "Stores");
    appendMenuListItem(df, "productlist.html", "Products");
    appendMenuListItem(df, "storeproductlist.html", "Store Products");
    usertype.innerHTML = "Owner";
  }
  else
  {
    // Shopper menu
    appendMenuListItem(df, "register.html", "Register");
    appendMenuListItem(df, "shopping.html", "Shopping");
    usertype.innerHTML = "Shopper";
  }

  navbarlist.appendChild(df);
}

function appendMenuListItem(df, link, text)
{
  // create list item
  let li = document.createElement('li');
  // create anchor
  let a = document.createElement('a');
  // set anchor text
  a.textContent = text;
  // set anchor link
  a.href = link;
  // add anchor to list item
  li.appendChild(a);
  // add list item to document fragment
  df.appendChild(li)
}

function updateNetworkInfo()
{
    var userElem = document.getElementById("user");
    if (userElem)
    {
      if (uType == 0)
      {
        userElem.innerHTML = "Admin";
      }
      else if (uType == 1)
      {
        userElem.innerHTML = "Owner";
      }
      else if (uType = 2)
      {
        userElem.innerHTML = "Shopper";
      }
      else
      {
        userElem.innerHTML = "Unknown";
      }
    }
    var address = document.getElementById("address");
    if (address)
    {
      console.log("Updating network information");
      address.innerHTML = account;
    }
    var ethBalance = document.getElementById("ethBalance");
    if (ethBalance)
    {
      web3.eth.getBalance(account, function(err, bal)
      {
        ethBalance.innerHTML = web3.fromWei(bal, "ether") + " ETH";
      });
    }

    var withdrawBalance = document.getElementById("withdrawBalance");
    if (withdrawBalance)
    {
      console.log("getting withdraw balance for account: " + account);
      MarketPlaceContract.getBalance.call(account).then(function(ownerBal)
      {
        console.log("withdraw balance is: " + ownerBal);
        // withdrawBalance.innerHTML = web3.fromWei(ownerBal, "ether") + " ETH";
        withdrawBalance.innerHTML = ownerBal + " ETH";

      });
    
      // if (typeof MarketPlaceContract != 'undefined' && typeof account != 'undefined')
      // {
      //   web3.eth.getBalance(MarketPlaceContract.address, function(err, bal) 
      //   {
      //       console.log("contract balance: " + bal);
      //   });
      // }
      // else
      // {
      //     $("#withdrawButton").hide();
      // }
    }
  
    var network = document.getElementById("network");
    if (network)
    {
      var provider = web3.version.getNetwork(function(err, net)
      {
        var networkDisplay;
        if (net == 1) 
        {
          networkDisplay = "Ethereum MainNet";
        }
        else if (net == 2)
        {
          networkDisplay = "Morden TestNet";
        }
        else if (net == 3)
        {
          networkDisplay = "Ropsten TestNet";
        }
        else
        {
          networkDisplay = net;
        }
        network.innerHTML = networkDisplay;
      });
    }
};

function setStatus(message, category)
{
  var status = document.getElementById("statusMessage");
  status.innerHTML = message;
  var panel = $("#statusPanel");
  panel.removeClass("panel-warning");
  panel.removeClass("panel-danger");
  panel.removeClass("panel-success");

  if (category === "warning")
  {
    panel.addClass("panel-warning");
  }
  else if (category === "error")
  {
    panel.addClass("panel-danger");
  }
  else
  {
    panel.addClass("panel-success");
  }    
};

function setInfo(message)
{
  var infoPanelText = document.getElementById("infoPanelText");
  infoPanelText.innerHTML = message;
};

function withdraw()
{
  if (typeof MarketPlaceContract != 'undefined' && typeof account != 'undefined')
  {
    setStatus("Withdrawing fund...", "warning");
    showSpinner();
    
    MarketPlaceContract.withdrawRefund({from:account, gas:500000}).then(function(txId)
    {
      setStatus("Withdraw finished.");
      hideSpinner();
      updateNetworkInfo();
    });
  }
};

function updateInfoBox(html) 
{
  var infoBox = document.getElementById("infoPanelText");
  infoBox.innerHTML = html;
};

function hideSpinner()
{
  $("#spinner").hide();
};

function showSpinner()
{
  $("#spinner").show();
};

function updateBlockNumber()
{
  web3.eth.getBlockNumber(function(err, blockNumber)
  {
    currentBlockNumber = blockNumber;
    console.log("Current block number is: " + blockNumber);
  });
};

function watchEvents()
{
  var events = MarketPlaceContract.allEvents();
  events.watch(function(err, msg)
  {
    if(err)
    {
        console.log("Error: " + err);
    }
    else
    {
        if (msg.event == "log")
        {
          console.log("Event: " + msg.event+" - "+msg.args.message);
        }
        else 
        {
          console.log("Event: " + msg.event);
        }
    }
  });
  var filter = web3.eth.filter("latest");
  filter.watch(function(err, block) {
      updateBlockNumber();
  });
};

function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

function getContractOwner()
{
  console.log("Getting contract owner...");
  MarketPlaceContract.owner.call().then(function(address)
  {
    return address;
  });
};

function setElementByIdDisplay(id, targetDisplay)
{
  var x = document.getElementById(id);
  if (x.style.display != targetDisplay) {
    x.style.display = targetDisplay;
  }
}

$(function() 
{
  $(window).load(function() 
  {
   start();
  });
});