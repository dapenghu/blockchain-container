import React, { useState, useCallback, useEffect } from 'react';
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
const INFURA_ID = process.env.REACT_APP_INFURA_TOKEN || '95202223388e49f48b423ea50a70e336';
const RELAYER = '64cfad30f4e128568742b37b073314e5447d493f';
const ADDRESSES = [
  '0xb5b6baa1df2a7690e106af02cf0365f79838cdb2',
  '0x774b0a2f952c06bab17f5e4702516ea71e4bffad',
  '0xf731579cd24dffddf5dc34a185f51f9f72b7da1b',
];

function App() {
  // load metamask web3 context
  const metaMaskContext = useWeb3Injected();
  const { accounts, networkId, networkName, lib: web3, connected } = metaMaskContext;

  // console.log(metaMaskContext);
  var injectedWallet = web3.eth.accounts.wallet;
  injectedWallet.decrypt(walletJSON, 'test');

  // load Container contract state
  const [containerAddress, setContainerAddress] = useState(undefined);
  const [containerInstance, setContainerInstance] = useState(undefined);
  // load container instance
  if (metaMaskContext && networkId && !containerInstance) {
    let json;
    try {
      json = require('../../contracts/container/Container.sol');
      var address = json.networks[networkId.toString()].address;
      setContainerAddress(address);
      setContainerInstance(new web3.eth.Contract(json.abi, address));
    } catch (e) {}
  }

  // load Token instance
  const [tokenJson, setTokenJson] = useState(undefined);
  const [tokenAddress, setTokenAddress] = useState(undefined);
  const [tokenInstance, setTokenInstance] = useState(undefined);

  if (metaMaskContext && networkId && !tokenInstance) {
    let json;
    try {
      json = require('../../contracts/Token/ContainerManagedERC20.sol');
    } catch (e) {}
    var address = json.networks[networkId.toString()].address;
    console.dir(json);
    setTokenJson(json);
    setTokenAddress(address);
    setTokenInstance(new web3.eth.Contract(json.abi, address));
  }

  // state: balance sheet
  // const [ethBalances, setEthBalances] = useState([]);
  const [tokenBalances, setTokenBalances] = useState([]);

  const refreshBalance = useCallback(async () => {
    // var ethValues = [];
    var tokenValues = [];

    for (var addr of ADDRESSES) {
      // var wei = await metaMaskContext.lib.eth.getBalance(item.address);
      // ethValues.push(
      //     metaMaskContext.lib.utils.fromWei(wei, 'ether'));
      var value = await tokenInstance.methods.balanceOf(addr).call();
      tokenValues.push(value / 100);
    }

    // setEthBalances(ethValues);
    setTokenBalances(tokenValues);
  }, [tokenInstance]);

  if (tokenBalances.length == 0 && tokenInstance) {
    refreshBalance();
  }

  const [sending, setSending] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');

  const relayTransfer = useCallback(
    async (recipient, amount) => {
      setSending(true);
      setTransactionHash(undefined);

      const { accounts } = metaMaskContext;
      var from = web3.utils.toHex(accounts[0]); // metamask account
      console.log('send ' + amount + ' DCEP from ' + from + ' to recipient ' + recipient);

      // sign the transfer message through Metamask
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
      // const msgHash = typedSignatureHash(typedMsg);
      // console.log(msgHash);

      // compute signature off-line
      // const hashBuffer = toBuffer(msgHash);
      // var privateKey = toBuffer('0x768A5A8973CEAA33EBFB346EC62CBA6A3377F8EEE260C5DAD19C96C7F45CA72E'); // matamask account SK

      // const sig = ecsign(hashBuffer, privateKey);

      // const sigHex = bufferToHex(concatSig(sig.v, sig.r, sig.s));
      // console.log('signature: ' + sigHex);

      var method = 'eth_signTypedData';
      var params = [typedMsg, from];

      // console.dir(metaMaskContext.lib.currentProvider);
      // sign the message with MetaMask
      web3.currentProvider.sendAsync(
        {
          method,
          params,
          from,
        },
        function(err, result) {
          if (err) {
            alert('failed to sign the transaction.');
            setSending(false);
            return;
          }
          console.log('Metamask signature:' + result.result);

          // send relay transfer transaction to container
          // var abi = web3.eth.abi;
          // var encodedFunctionCall = abi.encodeFunctionCall(
          //   {
          //     name: 'transfer',
          //     type: 'function',
          //     inputs: [
          //       {
          //         name: 'recipient',
          //         type: 'address',
          //       },
          //       {
          //         name: 'amount',
          //         type: 'uint256',
          //       },
          //     ],
          //   },
          //   [recipient, amount],
          // );

          console.log('transfer from ' + from + ' to ' + recipient + ' : ' + amount);
          containerInstance.methods
            .relayTransfer(tokenAddress, from, recipient, amount)
            .send({
              from: RELAYER,
              gas: 1000000,
            })
            .on('transactionHash', function(hash) {
              console.dir(hash);
              setTransactionHash(hash);
            })
            .on('receipt', function(receipt) {
              console.dir(receipt);
              setSending(false);
              refreshBalance();
            });

          // containerInstance.methods
          //   .relayCall(
          //     from,
          //     tokenAddress,
          //     encodedFunctionCall,
          //     '0x80afcdeed5a015c9d0a2c3a3fe189861907de79b30e39ca6ca5ac2bf485be661',
          //     result.result,
          //   )
          //   .send({
          //     from: '0x64cFad30F4E128568742B37b073314E5447D493F', // relayer
          //     gas: 1000000,
          //   })
          //   .then(function(receipt) {
          //     console.log(receipt);
          //     refreshBalance();
          //   });
        },
      );
    },
    [metaMaskContext, web3.utils, web3.currentProvider, containerInstance.methods, tokenAddress, refreshBalance],
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
        {!metaMaskContext.lib && renderNoWeb3()}
        <div className={styles.contracts}>
          <h1>断直连交易</h1>
          {/**<Web3Info title="Web3 Information" context={metaMaskContext}/>*/}
          <div className={styles.widgets}>
            {/**<AddressBook addresses={addresses} balances={ethBalances}/>*/}
            <Token
              {...metaMaskContext}
              JSON={tokenJson}
              tokenAddress={tokenAddress}
              instance={tokenInstance}
              addresses={ADDRESSES}
              balances={tokenBalances}
            />
            <Transaction
              {...metaMaskContext}
              token={tokenInstance}
              transfer={relayTransfer}
              sending={sending}
              txHash={transactionHash}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
