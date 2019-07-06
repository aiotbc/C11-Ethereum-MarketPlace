function callFunctions()
{
  if (uType == 1)
  {
    loadStores();
  }
  else
  {
    alert("This function is reserved for Store Owners");
    window.location.replace ("/");
  }
};