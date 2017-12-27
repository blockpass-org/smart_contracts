var Pass1 = artifacts.require('./Pass1.sol');
var Pass15 = artifacts.require('./Pass1_5.sol');

module.exports = function(deployer) {
  deployer.deploy(Pass1);
  deployer.deploy(Pass15);
}