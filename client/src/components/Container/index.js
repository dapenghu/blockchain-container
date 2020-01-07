import React, { useState, useEffect, useCallback } from 'react';
import { Button, Link } from 'rimble-ui';

import styles from './Container.module.scss';

export default function Token(props) {
  // const { accounts, networkId, networkName, providerName, lib, connected } = web3Context
  const { lib: web3, networkName, tokenAddress, containerInstance, containerAddress } = props;

  const getTokenLink = useCallback((networkName, address) => {
    // return  'https://' + networkName + '.etherscan.io/tx/' + txHash;
    return `https://${networkName}.etherscan.io/address/${address}`;
  });

  return (
    <div className={styles.counter}>
      <h2> 联盟容器合约 </h2>
      <h5>
        <center>
          <a target="_blank" href={getTokenLink(networkName, containerAddress)}>
            {containerAddress}
          </a>{' '}
        </center>
      </h5>
    </div>
  );
}
