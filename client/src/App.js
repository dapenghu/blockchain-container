import React, { useState, useCallback } from 'react';
import { typedSignatureHash, concatSig, signTypedDataLegacy } from 'eth-sig-util';
import { toBuffer, ecsign, bufferToHex } from 'ethereumjs-util';

// eslint-disable-next-line no-unused-vars
import { useWeb3Network, useEphemeralKey, useWeb3Injected } from '@openzeppelin/network/react';
// https://github.com/OpenZeppelin/openzeppelin-network.js

import Header from './components/Header/index.js';
import Footer from './components/Footer/index.js';
// import Hero from './components/Hero/index.js';
// import Web3Info from './components/Web3Info/index.js';
// import AddressBook from './components/AddressBook/index.js';
import Token from './components/Token/index.js';
import Transaction from './components/Transaction';
import styles from './App.module.scss';
import walletJSON from '../config/wallet_cipher.json';

// eslint-disable-next-line no-unused-vars
const infuraToken = process.env.REACT_APP_INFURA_TOKEN || '95202223388e49f48b423ea50a70e336';

// const Logger = prop => (
//   console[Object.keys(prop)[0]](...Object.values(prop)),null // ➜ React components must return something
// )

function App() {
  // get ephemeralKey
  // eslint-disable-next-line no-unused-vars
  const signKey = useEphemeralKey();

  // get GSN web3 against rinkeby network
  // const gsnContext = useWeb3Network(`wss://rinkeby.infura.io/ws/v3/${infuraToken}`, {
  const web3Context = useWeb3Network(`http://127.0.0.1:8545`, {
    pollInterval: 15 * 1000,
  });

  const metaMaskContext = useWeb3Injected();
  const [metamaskAccount, setMetamaskAccount] = useState(undefined);
  if (!metamaskAccount) {
    if (metaMaskContext.accounts && metaMaskContext.accounts.length > 0) {
      setMetamaskAccount(metaMaskContext.accounts[0]);
    }
  }

  // console.log(metaMaskContext);
  var injectedWallet = metaMaskContext.lib.eth.accounts.wallet;
  injectedWallet.decrypt(walletJSON, 'test');

  // define token contract state
  const [tokenJson, setTokenJson] = useState(undefined);
  const [tokenAddress, setTokenAddress] = useState(undefined);
  const [tokenInstance, setTokenInstance] = useState(undefined);

  // load Token instance
  if (web3Context && web3Context.networkId && !tokenJson) {
    let json;
    try {
      json = require('../../contracts/GaslessToken.sol');
    } catch (e) {}
    var address = json.networks[web3Context.networkId.toString()].address;
    setTokenJson(json);
    setTokenAddress(address);
    setTokenInstance(new web3Context.lib.eth.Contract(json.abi, address));
  }

  // state: balance sheet
  const [addresses, setAddresses] = useState([]);
  // const [ethBalances, setEthBalances] = useState([]);
  const [tokenBalances, setTokenBalances] = useState([]);

  const refreshBalance = useCallback(async () => {
    var addrs = [];
    // var ethValues = [];
    var tokenValues = [];

    for (var item of walletJSON) {
      addrs.push('0x' + item.address);
      // var wei = await web3Context.lib.eth.getBalance(item.address);
      // ethValues.push(
      //     web3Context.lib.utils.fromWei(wei, 'ether'));
      tokenValues.push(await tokenInstance.methods.balanceOf(item.address).call());
    }

    setAddresses(addrs);
    // setEthBalances(ethValues);
    setTokenBalances(tokenValues);
  }, [tokenInstance]);

  if (addresses.length == 0 && tokenInstance) {
    refreshBalance();
  }

  // define relayer contract state
  const [relayerAddress, setRelayerAddress] = useState(undefined);
  const [relayerInstance, setRelayerInstance] = useState(undefined);
  // load relayer instance
  if (web3Context && web3Context.networkId && !relayerInstance) {
    let json;
    try {
      json = require('../../contracts/Relayer1.sol');
      var address = json.networks[web3Context.networkId.toString()].address;
      setRelayerAddress(address);
      setRelayerInstance(new web3Context.lib.eth.Contract(json.abi, address));
    } catch (e) {}
  }

  const transfer = useCallback(
    async (sender, recipient, amount) => {
      var from = '0x3E88578846d48475C7864C29585509F75F875857';
      // console.log("account : " + from);

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
      // compute message hash
      const msgHash = typedSignatureHash(typedMsg);
      console.log(msgHash);

      // compute signature
      const hashBuffer = toBuffer(msgHash);
      var privateKey = toBuffer('0x768A5A8973CEAA33EBFB346EC62CBA6A3377F8EEE260C5DAD19C96C7F45CA72E');

      const sig = ecsign(hashBuffer, privateKey);

      const sigHex = bufferToHex(concatSig(sig.v, sig.r, sig.s));
      console.log('signature: ' + sigHex);

      var method = 'eth_signTypedData';
      var params = [typedMsg, from];

      console.dir(metaMaskContext.lib.currentProvider);
      // sign the message
      metaMaskContext.lib.currentProvider.sendAsync(
        {
          method,
          params,
          from,
        },
        function(err, result) {
          if (err) {
            alert('failed to sign the transaction.');
            return;
          }
          console.log('Metamask signature:' + result.result);

          // send relay transaction
          var abi = web3Context.lib.eth.abi;
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
            [recipient, amount],
          );

          relayerInstance.methods
            .relayCall(
              sender,
              tokenAddress,
              encodedFunctionCall,
              '0x80afcdeed5a015c9d0a2c3a3fe189861907de79b30e39ca6ca5ac2bf485be661',
              result.result,
            )
            .send({
              from: '0xFaA53Ab529168732948508e03c0ab1fDDd3B91B2',
              gas: 1000000,
            })
            .then(function(receipt) {
              console.log(receipt);
              refreshBalance();
            });
        },
      );
    },
    [
      metaMaskContext.lib.currentProvider,
      web3Context.lib.eth.abi,
      relayerInstance.methods,
      tokenAddress,
      refreshBalance,
    ],
  );

  function renderNoWeb3() {
    return (
      <div className={styles.loader}>
        <h3>Web3 Provider Not Found</h3>
        <p>Please, install and run Ganache.</p>
      </div>
    );
  }

  return (
    <div className={styles.App}>
      <Header context={metaMaskContext} />
      {/**<Hero />*/}
      <div className={styles.wrapper}>
        {!web3Context.lib && renderNoWeb3()}
        <div className={styles.contracts}>
          <h1>断直连交易</h1>
          {/**<Web3Info title="Web3 Information" context={web3Context}/>*/}
          <div className={styles.widgets}>
            {/**<AddressBook addresses={addresses} balances={ethBalances}/>*/}
            <Token
              {...web3Context}
              JSON={tokenJson}
              tokenAddress={tokenAddress}
              instance={tokenInstance}
              addresses={addresses}
              balances={tokenBalances}
            />
            <Transaction {...web3Context} token={tokenInstance} transfer={transfer} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
