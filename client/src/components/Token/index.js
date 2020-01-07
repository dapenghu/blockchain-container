import React, { useState, useEffect, useCallback } from 'react';
import { Button, Link } from 'rimble-ui';

import styles from './Token.module.scss';

export default function Token(props) {
  // const { accounts, networkId, networkName, providerName, lib, connected } = web3Context
  const { instance, lib: web3, networkName, tokenAddress, addresses, balances } = props;
  const { _address } = instance || {};

  const getTransactionLink = useCallback((networkName, address) => {
    // return  'https://' + networkName + '.etherscan.io/tx/' + txHash;
    return `https://${networkName}.etherscan.io/tokens?q=${address}`;
  });

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
      <h2> DCEP 智能合约 </h2>
      <h5>
        <center>
          <a target="_blank" href={getTransactionLink(networkName, tokenAddress)}>
            {tokenAddress}
          </a>{' '}
        </center>
      </h5>
      <h5>
        {' '}
        <Button onClick={() => registerToken()}>Register DCEP to MetaMask</Button>
      </h5>
      <table>
        {/**<caption>Token Balance Sheet</caption>*/}
        <thead>
          <tr>
            <th>Addresses of Members</th>
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
