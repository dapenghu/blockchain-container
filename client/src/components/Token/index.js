import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PublicAddress, Button, Loader } from 'rimble-ui';

import styles from './Token.module.scss';

import getTransactionReceipt from '../../utils/getTransactionReceipt';
import { utils } from '@openzeppelin/gsn-provider';
const { isRelayHubDeployedForRecipient, getRecipientFunds } = utils;

export default function Token(props) {
  // const { accounts, networkId, networkName, providerName, lib, connected } = web3Context
  const { instance, accounts, lib, networkName, providerName, wallet } = props;
  const { _address, methods } = instance || {};

  // state: address book of the wallet
  const addresses = useMemo(() => {
    return wallet.map(item => item.address);
    console.log(addresses);
  }, [wallet]);

  // GSN provider has only one key pair
  const isGSN = providerName === 'GSN';
  const totalSupply = 10000;

  // state: balance sheet
  const [balanceSheet, setBalanceSheet] = useState([]);

  const getBalanceSheet = useCallback(async () => {
    let balanceSheet = [];
    if (instance) {
      for (let item of wallet) {
        const balance = await instance.methods.balanceOf(item.address).call();
        balanceSheet.push({ address: item.address, balance: balance });
      }
    }
    setBalanceSheet(balanceSheet);
    console.log(balanceSheet);
  }, [instance, wallet]);

  useEffect(() => {
    getBalanceSheet();
  }, [getBalanceSheet, lib.eth, lib.utils]);

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
          const funds = await getRecipientFunds(lib, _address);
          setFunds(Number(funds));
        }
      }
    }
  }, [_address, instance, isGSN, lib]);

  useEffect(() => {
    getDeploymentAndFunds();
  }, [getDeploymentAndFunds, instance]);

  // state: Contract value
  const [count, setCount] = useState(0);

  const getCount = useCallback(async () => {
    // if (instance) {
    //   // Get the value from the contract to prove it worked.
    //   const response = await instance.methods.getCounter().call();
    //   // Update state with the result.
    //   setCount(response);
    // }
  }, []);

  useEffect(() => {
    getCount();
  }, [getCount, instance]);

  // state: sending transaction information
  const [sending, setSending] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');

  function renderNoDeploy() {
    return (
      <div>
        <p>
          <strong>Can't Load Deployed Token Instance</strong>
        </p>
        <p>Please, run `oz create` to deploy an Token instance.</p>
      </div>
    );
  }

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

  function renderNoBalance() {
    return (
      <div>
        <p>
          <strong>Fund your Metamask account</strong>
        </p>
        <p>You need some ETH to be able to send transactions. Please, run:</p>
        <div className={styles.code}>
          <code>
            <small>openzeppelin transfer --to {accounts[0]}</small>
          </code>
        </div>
        <p>to fund your Metamask.</p>
      </div>
    );
  }

  function renderTransactionHash() {
    return (
      <div>
        <p>
          Transaction{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://${networkName}.etherscan.io/tx/${transactionHash}`}
          >
            <small>{transactionHash.substr(0, 6)}</small>
          </a>{' '}
          has been mined on {networkName} network.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.counter}>
      <h3> Tutorial Token Contract </h3>

      {lib && !instance && renderNoDeploy()}

      {lib && instance && (
        <React.Fragment>
          <div className={styles.dataPoint}>
            <div className={styles.label}>Contract Proxy address:</div>
            <div className={styles.value}>
              <PublicAddress label="" address={_address} />
            </div>
          </div>
          <div className={styles.dataPoint}>
            <div className={styles.label}>Total Supply: {totalSupply} TTT</div>
          </div>
          {isGSN && (
            <div className={styles.dataPoint}>
              <div className={styles.label}>Recipient Funds: {lib.utils.fromWei(funds.toString(), 'ether')} ETH</div>
            </div>
          )}
          {isGSN && !funds && renderNoFunds()}

          {/** 
          {(!!funds) && (
            <React.Fragment>
              <div className={styles.label}>
                <strong>Token Actions</strong>
              </div>
              <div className={styles.buttons}>
                <Button onClick={() => increase(1)} size="small">
                  {sending ? <Loader className={styles.loader} color="white" /> : <span> Increase Counter by 1</span>}
                </Button>
                <Button onClick={() => decrease(1)} disabled={!(methods && methods.decreaseCounter)} size="small">
                  {sending ? <Loader className={styles.loader} color="white" /> : <span> Decrease Counter by 1</span>}
                </Button>
              </div>
            </React.Fragment>
          )}
          {transactionHash && networkName !== 'Private' && renderTransactionHash()}*/}
        </React.Fragment>
      )}
    </div>
  );
}
