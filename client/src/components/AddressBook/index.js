import React from 'react';
import { PublicAddress, Table, Button, Loader } from 'rimble-ui';

import styles from './AddressBook.module.scss';

export default function AddressBook(props) {
  const { addresses, balances } = props;

  return (
    <div className={styles.counter}>
      <h3> ETH Address Book </h3>
      <table>
        <thead>
          <tr>
            <th>Account Address</th>
            <th>ETH Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td width={400}>{addresses[0]}</td>
            <td>{balances[0]} ETH </td>
          </tr>
          <tr>
            <td width={400}>{addresses[1]}</td>
            <td>{balances[1]} ETH </td>
          </tr>
          <tr>
            <td width={400}>{addresses[2]}</td>
            <td>{balances[2]} ETH </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
