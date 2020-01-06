import React, { useState, useEffect, useCallback } from 'react';
import { Button } from 'rimble-ui';

import styles from './Token.module.scss';

// import getTransactionReceipt from '../../utils/getTransactionReceipt';
import { utils } from '@openzeppelin/gsn-provider';
const { isRelayHubDeployedForRecipient, getRecipientFunds } = utils;

export default function Token(props) {
  // const { accounts, networkId, networkName, providerName, lib, connected } = web3Context
  const { instance, lib: web3, providerName, tokenAddress, addresses, balances } = props;
  const { _address } = instance || {};

  // state: address book of the wallet
  // const addresses = useMemo(() => {
  //   return wallet.map(item => item.address);
  //   console.log(addresses);
  // }, [wallet]);

  // GSN provider has only one key pair
  const isGSN = providerName === 'GSN';
  // const totalSupply = 10000;

  // state: recipient fund
  const [, setIsDeployed] = useState(false);
  const [funds, setFunds] = useState(0);

  const registerToken = useCallback(() => {
    web3.currentProvider.sendAsync(
      {
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: 'DCEP',
            decimals: 2,
            // "image": tokenImage,
          },
        },
        id: Math.round(Math.random() * 100000),
      },
      (err, added) => {
        if (added) {
          console.log('Thanks for your interest!');
        } else {
          console.log('Your loss!');
        }
      },
    );
  }, [tokenAddress, web3.currentProvider]);

  return (
    <div className={styles.counter}>
      <h2> DCEP Contract </h2>
      <h5 text-align="center"> {_address} </h5>
      <h5>
        {' '}
        <Button onClick={() => registerToken()}>Register DCEP to MetaMask</Button>
      </h5>
      <table>
        {/**<caption>Token Balance Sheet</caption>*/}
        <thead>
          <tr>
            <th>Account Address</th>
            <th>Account Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td width={400}>{addresses[0]}</td>
            <td>{balances[0]} CNY</td>
          </tr>
          <tr>
            <td width={400}>{addresses[1]}</td>
            <td>{balances[1]} CNY</td>
          </tr>
          <tr>
            <td width={400}>{addresses[2]}</td>
            <td>{balances[2]} CNY</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
