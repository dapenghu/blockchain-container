import React from 'react';
import { PublicAddress, MetaMaskButton, Button } from 'rimble-ui';
import styles from './header.module.scss';
import logo from './stater-kits-logo.png';

export default function Header(props) {
  const { context } = props;
  const { networkName, accounts } = context;

  const requestAuth = async web3Context => {
    try {
      await web3Context.requestAuth();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={styles.header}>
      <nav id="menu" className="menu">
        <div className={styles.brand}>
          <a href="/" className={styles.link}>
            <img src={logo} alt="logo" />
          </a>
        </div>

        {accounts && accounts.length ? (
          <>
            <div className={styles.brand}>
              <PublicAddress address={accounts[0].substr(0, 20) + '...'}></PublicAddress>
            </div>
            <div className={styles.brand}>
              <MetaMaskButton.Outline>{networkName}</MetaMaskButton.Outline>
            </div>
          </>
        ) : (
          <div>
            <br />
            <MetaMaskButton.Outline onClick={() => requestAuth(context)}>MetaMask</MetaMaskButton.Outline>
          </div>
        )}
      </nav>
    </div>
  );
}
