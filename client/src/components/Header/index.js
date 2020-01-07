import React from 'react';
import { PublicAddress, MetaMaskButton, Button } from 'rimble-ui';
import styles from './header.module.scss';
import logo from './stater-kits-logo.png';

export default function Header(props) {
  const { context, networkName, account } = props;

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

        {!!account ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <MetaMaskButton.Outline width="300px">Connected with {networkName}</MetaMaskButton.Outline>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <PublicAddress address={account.substr(0, 40) + '...'} width="300px" />
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <MetaMaskButton.Outline width="300px" onClick={() => requestAuth(context)}>
                    Sign in MetaMask
                  </MetaMaskButton.Outline>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <PublicAddress address="0x0000000000000000..." width="300px" />
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </nav>
    </div>
  );
}
