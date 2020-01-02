import React, { useState, useCallback } from 'react';

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
  //   pollInterval: 15 * 1000,
  //   gsn: {
  //     signKey,
  //   },
  // });

  // get GSN web3 against ganache-cli network
  // const { accounts, networkId, networkName, providerName, lib, connected } = web3Context
  const gsnContext = useWeb3Network('http://127.0.0.1:8545', {
    pollInterval: 50000,
    gsn: {
      dev: true,
      useGSN: true,
      verbose: true,
      preferredRelayer: {
        RelayServerAddress: '0xB4E22C44eAdcc0e839DF8BA2a70b492564d37F7E',
        relayUrl: 'http://localhost:8090',
        transactionFee: '70',
      },
      // signKey: "08e9d80abe835aa97e6491e12fb3a508abec83460f9e39672ee6f1f809928e05"
    },
  });

  // console.log(gsnContext.lib.currentProvider);
  var wallet = gsnContext.lib.eth.accounts.wallet;
  wallet.decrypt(walletJSON, 'test');

  const injectedContext = useWeb3Injected();
  // console.log(injectedContext);
  // var injectedWallet = injectedContext.lib.eth.accounts.wallet;
  // injectedWallet.decrypt(walletJSON, 'test');

  // define token contract state
  const [tokenJson, setTokenJson] = useState(undefined);
  const [tokenAddress, setTokenAddress] = useState(undefined);
  const [tokenInstance, setTokenInstance] = useState(undefined);

  // load Token instance
  if (gsnContext && gsnContext.networkId && !tokenJson) {
    let json;
    try {
      json = require('../../contracts/GaslessToken.sol');
      console.dir(json);
    } catch (e) {}
    var networkId = gsnContext.networkId.toString();
    var address = json.networks[networkId].address;
    setTokenJson(json);
    setTokenAddress(address);
    setTokenInstance(new gsnContext.lib.eth.Contract(json.abi, address));
  }

  // state: balance sheet
  const [addresses, setAddresses] = useState([]);
  // const [ethBalances, setEthBalances] = useState([]);
  const [tokenBalances, setTokenBalances] = useState([]);

  const transfer = useCallback(
    async (sender, recipient, amount) => {
      var method = tokenInstance.methods.transfer(recipient, amount);
      console.log(tokenInstance.methods);
      console.log(method);
      console.log(typeof method.send + ' : ' + method.send);
      var res = await method.send({ from: sender, gas: 1000000 });

      console.log(res);
    },
    [tokenInstance],
  );

  const refreshBalance = useCallback(async () => {
    var addrs = [];
    // var ethValues = [];
    var tokenValues = [];

    for (var item of walletJSON) {
      addrs.push('0x' + item.address);
      // var wei = await gsnContext.lib.eth.getBalance(item.address);
      // ethValues.push(
      //     gsnContext.lib.utils.fromWei(wei, 'ether'));
      tokenValues.push(await tokenInstance.methods.balanceOf(item.address).call());
    }

    setAddresses(addrs);
    // setEthBalances(ethValues);
    setTokenBalances(tokenValues);
  }, [tokenInstance]);

  if (addresses.length == 0 && tokenInstance) {
    refreshBalance();
  }

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
      <Header context={injectedContext} />
      {/**<Hero />*/}
      <div className={styles.wrapper}>
        {!gsnContext.lib && renderNoWeb3()}
        <div className={styles.contracts}>
          <h1>断直连交易</h1>
          {/**<Web3Info title="Web3 Information" context={injectedContext}/>*/}
          <div className={styles.widgets}>
            {/**<AddressBook addresses={addresses} balances={ethBalances}/>*/}
            <Token
              {...gsnContext}
              JSON={tokenJson}
              tokenAddress={tokenAddress}
              instance={tokenInstance}
              addresses={addresses}
              balances={tokenBalances}
            />
            <Transaction {...gsnContext} token={tokenInstance} transfer={transfer} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
