var sigUtil = require('eth-sig-util');
const ethUtil = require('ethereumjs-util');

var from = '0x3E88578846d48475C7864C29585509F75F875857';
var fromSK = '0x768A5A8973CEAA33EBFB346EC62CBA6A3377F8EEE260C5DAD19C96C7F45CA72E';
var recipient = '0x774b0a2f952c06bab17f5e4702516ea71e4bffad';
var amount = 10;

// sign the message
var typedMsg = [
  {
    type: 'address',
    name: 'recipient',
    value: recipient,
  },
  {
    type: 'uint256',
    name: 'amount',
    value: amount,
  },
];
var msgParams = {
  data: typedMsg,
  sign: undefined,
};

const msgHash = sigUtil.typedSignatureHash(typedMsg);
console.log('message hash :' + msgHash);

const hashBuffer = ethUtil.toBuffer(msgHash);
var privateKey = ethUtil.toBuffer(fromSK);

const sig = ethUtil.ecsign(hashBuffer, privateKey);

const sigHex = ethUtil.bufferToHex(sigUtil.concatSig(sig.v, sig.r, sig.s));
console.log(sigHex);

var sign = sigUtil.signTypedDataLegacy(privateKey, msgParams);
console.log(sign);
