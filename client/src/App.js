import React, { useState } from 'react';

// eslint-disable-next-line no-unused-vars
import { useWeb3Network, useEphemeralKey, useWeb3Injected } from '@openzeppelin/network/react';
// https://github.com/OpenZeppelin/openzeppelin-network.js

import Header from './components/Header/index.js';
import Footer from './components/Footer/index.js';
import Hero from './components/Hero/index.js';
import Web3Info from './components/Web3Info/index.js';
import Counter from './components/Counter/index.js';
import Token from './components/Token/index.js';
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
    gsn: {
      dev: true,
      signKey,
    },
  });
  var wallet = gsnContext.lib.eth.accounts.wallet;
  wallet.decrypt(walletJSON, 'test');

  const injectedContext = useWeb3Injected();
  var injectedWallet = injectedContext.lib.eth.accounts.wallet;
  injectedWallet.decrypt(walletJSON, 'test');
  // console.dir(injectedContext,{depth: 0});

  // load Counter json artifact
  const [counterJSON, setCounterJSON] = useState(undefined);
  if (!counterJSON) {
    try {
      // see https://github.com/OpenZeppelin/solidity-loader
      let json = require('../../contracts/Counter.sol');
      console.dir(json);
      setCounterJSON(json);
    } catch (e) {
      console.log(e);
    }
  }

  // load Counter instance
  const [counterInstance, setCounterInstance] = useState(undefined);
  let networkId = undefined;
  if (!counterInstance && gsnContext && counterJSON && counterJSON.networks && gsnContext.networkId) {
    networkId = counterJSON.networks[gsnContext.networkId.toString()];
    if (networkId) {
      setCounterInstance(new gsnContext.lib.eth.Contract(counterJSON.abi, networkId.address));
    }
  }

  // load Token Contract json artifact
  const [tokenJson, setTokenJson] = useState(undefined);
  if (!tokenJson) {
    try {
      let json = require('../../contracts/GaslessToken.sol');
      setTokenJson(json);
      console.dir(json);
    } catch (e) {}
  }

  // load Token instance
  const [tokenInstance, setTokenInstance] = useState(undefined);
  if (!tokenInstance && gsnContext && tokenJson && tokenJson.networks && gsnContext.networkId) {
    networkId = tokenJson.networks[gsnContext.networkId.toString()];
    if (networkId) {
      setTokenInstance(new gsnContext.lib.eth.Contract(tokenJson.abi, networkId.address));
    }
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
      <Header />
      <Hero />
      <div className={styles.wrapper}>
        {!gsnContext.lib && renderNoWeb3()}
        <div className={styles.contracts}>
          <h1>断直连交易</h1>
          <div className={styles.widgets}>
            <Web3Info title="Web3 Information" context={injectedContext} />
            {/**<Counter {...context} JSON={counterJSON} instance={counterInstance} networkId={networkId} />*/}
            <Token {...gsnContext} JSON={tokenJson} instance={tokenInstance} wallet={walletJSON} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
