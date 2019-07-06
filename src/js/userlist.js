function callFunctions()
{
  if (uType == 0)
  {
    loadUsers();
  }
  else
  {
    alert("This function is reserved for Admin");
    window.location.replace ("/");
  }
};