var Contract1 = artifacts.require("./DMPExtra.sol");
var Contract2 = artifacts.require("./MarketPlace.sol");

module.exports = function(deployer) {
  deployer.deploy(Contract1).then(function(){
        return deployer.deploy(Contract2, Contract1.address)
  });
};