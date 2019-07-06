function callFunctions()
{
  if (uType == 1)
  {
    loadStoresForOwner();
    loadProducts2();
    }
  else
  {
    alert("This function is reserved for Store Owners");
    window.location.replace ("/");
  }

};