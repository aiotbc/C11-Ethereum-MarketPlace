function callFunctions()
{
  if (uType == 1)
  {
    loadProducts();
  }
  else
  {
    alert("This function is reserved for Store Owners");
    window.location.replace ("/");
  }
};