var Blockpass = artifacts.require('./Blockpass.sol');
var Service = artifacts.require('./Services.sol');
var Pass1 = artifacts.require('./Pass1.sol');
var Pass15 = artifacts.require('./Pass1_5.sol');
var BlockpassOwned = artifacts.require('./BlockpassOwned.sol');
module.exports = function(deployer) {
  deployer.deploy(Blockpass);
  deployer.deploy(Service);
  deployer.deploy(Pass1);
  deployer.deploy(Pass15);
  deployer.deploy(BlockpassOwned);
}
// var Blockpass = artifacts.require("./Blockpass.sol");
// var WhiteList = artifacts.require("./WhiteList.sol");
// var Service = artifacts.require("./Service.sol");

// var SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';
// var slack = require('../node_modules/slack-notify')(SLACK_WEBHOOK_URL);

// module.exports = function(deployer) {
//   var blockpassAddress = '';
//   var whitelistAddress = '';
//   var owner = '0xa58c60bb76de883928feecd8f90ff831968270b3';
//   var seed = 0x3c5f4f475e566959004896b9022eda1169957fa8d7437ec14e1ef4679b14b569;

//   var network = deployer.network;
//   var ts = Date.now() / 1000;

//   var message = {
//     text: 'Smart contracts deployed to `' + network + '` network',
//     channel: '#notifications',
//     attachments: [],
//     username: 'ContractBot',
//     icon_emoji: ':japanese_goblin:'
//   }

//   deployer.deploy(WhiteList, seed)
//     .then(function()  {
//       console.log("WhiteList contract deployed");
//       whitelistAddress = WhiteList.address;

//       var contract_name = WhiteList._json.contract_name;
//       var contract_addr = WhiteList.address;
//       var contract_owner = WhiteList.class_defaults.from;
//       var contractInfo = {
//         color: '#36A64F',
//         fallback: '',
//         pretext: contract_name + ' contract',
//         title: contract_name,
//         title_link: 'https://rinkeby.etherscan.io/address/' + contract_addr,
//         fields: [
//           {
//             title: 'Owner',
//             value: contract_owner,
//           },
//           {
//             title: 'Address',
//             value: contract_addr,
//           },
//         ],
//         ts: ts
//       }
//       message.attachments.push(contractInfo);
      
//       return deployer.deploy(Blockpass, whitelistAddress);
//     })
//     .then(function()  {
//       console.log("Blockpass contract deployed");
//       blockpassAddress = Blockpass.address;
      
//       var contract_name = Blockpass._json.contract_name;
//       var contract_addr = Blockpass.address;
//       var contract_owner = Blockpass.class_defaults.from;
//       var contractInfo = {
//         color: '#C93838',
//         fallback: '',
//         pretext: contract_name + ' contract',
//         title: contract_name,
//         title_link: 'https://rinkeby.etherscan.io/address/' + contract_addr,
//         fields: [
//           {
//             title: 'Owner',
//             value: contract_owner,
//           },
//           {
//             title: 'Address',
//             value: contract_addr,
//           },
//         ],
//         ts: ts
//       }
//       message.attachments.push(contractInfo);

//       return deployer.deploy(Service, blockpassAddress);
//     })
//     .then(function()  {
//       console.log("Service contract deployed");
      
//       var contract_name = Service._json.contract_name;
//       var contract_addr = Service.address;
//       var contract_owner = Service.class_defaults.from;
//       var contractInfo = {
//         color: '#2CB9D9',
//         fallback: '',
//         pretext: contract_name + ' contract',
//         title: contract_name,
//         title_link: 'https://rinkeby.etherscan.io/address/' + contract_addr,
//         fields: [
//           {
//             title: 'Owner',
//             value: contract_owner,
//           },
//           {
//             title: 'Address',
//             value: contract_addr,
//           },
//         ],
//         ts: ts
//       }
//       message.attachments.push(contractInfo);
//       slack.send(message);
//     })
// }