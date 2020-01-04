var Web3 = require('Web3');
var web3 = new Web3();
var abi = web3.eth.abi;

// encode transfer(to, amount)
var to = '0x774b0a2f952c06bab17f5e4702516ea71e4bffad';
var amount = 10;
var encodedFunctionCall = abi.encodeFunctionCall(
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      {
        name: 'recipient',
        type: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
      },
    ],
  },
  [to, amount],
);

console.log(encodedFunctionCall);
