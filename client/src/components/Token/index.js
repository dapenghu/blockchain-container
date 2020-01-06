import React, { useState, useEffect, useCallback } from 'react';
// import { PublicAddress, Table, Button, Loader } from 'rimble-ui';

import styles from './Token.module.scss';

// import getTransactionReceipt from '../../utils/getTransactionReceipt';
import { utils } from '@openzeppelin/gsn-provider';
const { isRelayHubDeployedForRecipient, getRecipientFunds } = utils;

export default function Token(props) {
  // const { accounts, networkId, networkName, providerName, lib, connected } = web3Context
  const { instance, lib, providerName, addresses, balances } = props;
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

  const getDeploymentAndFunds = useCallback(async () => {
    if (instance) {
      if (isGSN) {
        // if GSN check how much funds recipient has
        const isDeployed = await isRelayHubDeployedForRecipient(lib, _address);

        setIsDeployed(isDeployed);
        if (isDeployed) {
          const res = await getRecipientFunds(lib, _address);
          setFunds(Number(res));
        }
      }
    }
  }, [_address, instance, isGSN, lib]);

  useEffect(() => {
    getDeploymentAndFunds();
  }, [getDeploymentAndFunds, instance]);

  // function renderNoDeploy() {
  //   return (
  //     <div>
  //       <p>
  //         <strong>Can't Load Deployed Token Instance</strong>
  //       </p>
  //       <p>Please, run `oz create` to deploy an Token instance.</p>
  //     </div>
  //   );
  // }

  function renderNoFunds() {
    return (
      <div>
        <p>
          <strong>The recipient has no funds</strong>
        </p>
        <p>Please, run:</p>
        <div className={styles.code}>
          <code>
            <small>npx oz-gsn fund-recipient --recipient {_address}</small>
          </code>
        </div>
        <p>to fund the recipient on local network.</p>
      </div>
    );
  }

  // function renderNoBalance() {
  //   return (
  //     <div>
  //       <p>
  //         <strong>Fund your Metamask account</strong>
  //       </p>
  //       <p>You need some ETH to be able to send transactions. Please, run:</p>
  //       <div className={styles.code}>
  //         <code>
  //           <small>openzeppelin transfer --to {accounts[0]}</small>
  //         </code>
  //       </div>
  //       <p>to fund your Metamask.</p>
  //     </div>
  //   );
  // }

  // function renderTransactionHash() {
  //   return (
  //     <div>
  //       <p>
  //         Transaction{' '}
  //         <a
  //           target="_blank"
  //           rel="noopener noreferrer"
  //           href={`https://${networkName}.etherscan.io/tx/${transactionHash}`}
  //         >
  //           <small>{transactionHash.substr(0, 6)}</small>
  //         </a>{' '}
  //         has been mined on {networkName} network.
  //       </p>
  //     </div>
  //   );
  // }

  return (
    <div className={styles.counter}>
      <h3> DCEP Contract </h3>
      <h5 text-align="center"> {_address} </h5>
      {isGSN && !funds && renderNoFunds()}

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
