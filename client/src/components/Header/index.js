import React from 'react';
import { MetaMaskButton } from 'rimble-ui';
import styles from './header.module.scss';
import logo from './stater-kits-logo.png';

export default function Header(props) {
  const { context } = props;
  const { networkId, accounts, providerName } = context;

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
          <div className={styles.dataPoint}>
            <MetaMaskButton.Outline disabled>MetaMask</MetaMaskButton.Outline>
          </div>
        ) : !!networkId && providerName !== 'infura' ? (
          <div>
            <br />
            <MetaMaskButton.Outline onClick={() => requestAuth(context)}>MetaMask</MetaMaskButton.Outline>
          </div>
        ) : (
          <div></div>
        )}
      </nav>
    </div>
  );
}
