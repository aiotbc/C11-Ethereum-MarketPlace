function createUser() 
{
  console.log("Creating user");
	setStatus("Creating, please wait.", "warning");
  showSpinner();

  // use web3 current account to paying for transaction and set gaslimit for transaction
  account = accounts[0];
  var gaslimit = 500000;

  // gather page fields for contract call
  var username = document.getElementById("username").value;
	var usertype = document.getElementById("usertype").value;
	var amount = web3.toWei(parseFloat(document.getElementById("amount").value), "ether");
	var userstatus = document.getElementById("userstatus").value;
  console.log("New User (account:"+account+", username:"+username+", usertype:"+usertype+", amount:"+amount+", userstatus:"+userstatus+")");

  // call the contract function
  MarketPlaceContract.createUser(account, username, usertype, amount, userstatus, {from: account, gas: gaslimit}).then(function(txId) 
	{
		console.log(txId);
    if (txId["receipt"]["gasUsed"] == gaslimit) 
    {
		  setStatus("User creation failed", "error");
    }
    else
    {
		  setStatus("Created<br>gasUsed: <b>"+txId["receipt"]["gasUsed"]+ "</b><br>tx: <b>" + txId["tx"]+"</b>");
		}
    hideSpinner();
	});

};

function register() 
{
  console.log("Registering user");
	setStatus("Creating, please wait.", "warning");
  showSpinner();

  // use web3 current account to paying for transaction and set gaslimit for transaction
  account = accounts[0];
  var gaslimit = 500000;

  // gather page fields for contract call
  var username = document.getElementById("username").value;
  console.log("New Owner (account:"+account+", username:"+username+")");

  // call the contract function
  MarketPlaceContract.register(account, username, {from: account, gas: gaslimit}).then(function(txId) 
	{
		console.log(txId);
    if (txId["receipt"]["gasUsed"] == gaslimit) 
    {
		  setStatus("Owner creation failed", "error");
    }
    else
    {
		  setStatus("Created Owner<br>gasUsed: <b>"+txId["receipt"]["gasUsed"]+ "</b><br>tx: <b>" + txId["tx"]+"</b>");
		}
    hideSpinner();
	});

};

function loadUsers()
{
  setStatus("Users being fetched...", "warning");
  setInfo("This page shows the current users.");
  showSpinner();

  MarketPlaceContract.getUserCount.call().then(function(count)
  {
    console.log("Number of users " + count);
    if (count <= 0)
    {
      setStatus("No users found", "error");
    }

    for (var i = 0; i < count; i++)
    {
      console.log("Getting user: "+i);
      getUser(i);
    }
    
    waitAndRefreshUsers(count);
  });   

  hideSpinner();
};

function getUser(uid)
{
  MarketPlaceContract.getUser.call(uid).then(function(user)
  {
    console.log("Loading: " + uid);
    user[9] = uid;  // save uid in user
    usersArray.push(user);
  });
};

function waitAndRefreshUsers(count)
{
  if (usersArray.length < count)
  {
    console.log("Sleeping, Count: " + count + " Length: " + usersArray.length);
    setTimeout(waitAndRefreshUsers, 500, count);
  }
  else
  {
    var userSection = document.getElementById("users");
    var res = "";
    for (var j = 0; j < count; j++)
    {
      var usr = usersArray[j];
      res = res + "<tr>";
      res = res + "<td><a href='userupdate.html?userId=" + usr[0] + "'>" + usr[0] + "</a></td>";
      res = res + "<td>" + usr[2] + "</td>";
      res = res + "<td>" + displayUserType(usr[3]) + "</td>";
      res = res + "<td>" + usr[1] + "</td>";
      res = res + "<td>" + usr[4] + "</td>";
      res = res + "<td>" + displayUserStatus(usr[5]) + "</td>";
      res = res + "</tr>";
    }
    userSection.innerHTML = res;
    setStatus("");
  }
};

function displayUserType(p_usertype)
{
  var displayValue = "Unknown";
  var checkValue = Number(p_usertype)

  if (checkValue === 0)
  {
    displayValue = "Admin";
  } else if (checkValue === 1)
  {
    displayValue = "Owner";
  } else
  {
    displayValue = "Shopper";
  }
  return displayValue;
}

function displayUserStatus(p_userstatus)
{
  var displayValue = "Unknown";
  var checkValue = Number(p_userstatus)

  if (checkValue === 0)
  {
    displayValue = "Enabled";
  }
  else
  {
    displayValue = "Disabled";
  }
  return displayValue;
}

function loadUserToForm()
{
  var uid = getUrlParameter("userId")
  console.log("Loading user from contract to form: " + uid);
  setStatus("User being fetched...", "warning");
  setInfo("This page is used to update the user information.");

  // pull user from contract
  MarketPlaceContract.getUser.call(uid).then(function(user)
  {
    user[9] = uid; // save uid in user structure
    var userid   = document.getElementById("user.id");
    var username = document.getElementById("user.name");
    var usertype = document.getElementById("user.type");
    var address  = document.getElementById("user.address");
    var amount   = document.getElementById("user.amount");
    var userstatus = document.getElementById("user.status");
    userid.innerHTML   = user[9];
    username.innerHTML = user[2];
    usertype.value     = user[3];
    address.innerHTML  = user[1];
    amount.innerHTML   = user[4];
    userstatus.value   = user[5];
  });

  setStatus("");
};

function updateUser()
{
  console.log("Updating user");
	setStatus("Updating, please wait.", "warning");
  showSpinner();

  // use web3 current account to paying for transaction and set gaslimit for transaction
  account = accounts[0];
  var gaslimit = 500000;

  // gather page fields for contract call
  var userid   = document.getElementById("user.id").innerHTML;
  var username = document.getElementById("user.name").innerHTML;
  var usertype = document.getElementById("user.type").value;
  var amount = document.getElementById("user.type").innerHTML;
  var userstatus = document.getElementById("user.status").value;
  console.log("Update User (uid:"+userid+", account:"+account+", username:"+username+", usertype:"+usertype+", amount:"+amount+", userstatus:"+userstatus+")");

  // call the contract function
  MarketPlaceContract.updateUser(userid, username, usertype, userstatus, {from: account, gas: gaslimit}).then(function(txId) 
  {
		console.log(txId);
    if (txId["receipt"]["gasUsed"] == gaslimit) 
    {
		  setStatus("User update failed", "error");
    }
    else
    {
		  setStatus("Updated<br>gasUsed: <b>"+txId["receipt"]["gasUsed"]+ "</b><br>tx: <b>" + txId["tx"]+"</b>");
		}
	});

  hideSpinner();
};