import React, { useState, useEffect } from 'react';
import { Box, Form, Input, Field, Button, Flex, Loader } from 'rimble-ui';

import styles from './Transaction.module.scss';

export default function Transaction(props) {
  const { accounts, networkName, lib, transfer, sending, txHash } = props;

  const [formValidated, setFormValidated] = useState(false);
  const [validated, setValidated] = useState(false);
  // const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState(1);

  const handleRecipeint = e => {
    setRecipient(e.target.value);
    validateInput(e);
  };

  const handleAmount = e => {
    setAmount(e.target.value);
    validateInput(e);
  };

  const validateInput = e => {
    e.target.parentNode.classList.add('was-validated');
  };

  const validateForm = () => {
    // Perform advanced validation here
    if (lib.utils.isAddress(recipient) && amount > 0) {
      setValidated(true);
    } else {
      setValidated(false);
    }
  };

  useEffect(() => {
    validateForm();
  });

  const handleSubmit = e => {
    e.preventDefault();
    if (!sending) {
      console.log(accounts[0]);
      if (!accounts || accounts.length == 0) {
        alert('Please connect Metamask before submit any transaction');
        return;
      }
      transfer(recipient, amount * 100);
    }
  };

  function renderPendingTransactionHash() {
    var txUrl = 'https://' + networkName + '.etherscan.io/tx/' + txHash;
    return (
      <table className={styles.table}>
        <thead>
          <tr>
            <th>
              <Loader />
            </th>
            <th>
              Pending Transaction{' '}
              <a target="_blank" rel="noopener noreferrer" href={txUrl}>
                <small>{txHash.substr(0, 20)}</small>
              </a>
            </th>
          </tr>
        </thead>
      </table>
    );
  }

  function renderMinedTransactionHash() {
    var txUrl = 'https://' + networkName + '.etherscan.io/tx/' + txHash;

    return (
      <div>
        <a target="_blank" rel="noopener noreferrer" href={txUrl}>
          <small>{txHash.substr(0, 20)}</small>
        </a>{' '}
        has been confirmed.
      </div>
    );
  }

  return (
    <div className={styles.counter}>
      <h3> 合规交易 </h3>
      <Box p={4}>
        <Form onSubmit={handleSubmit} validated={formValidated}>
          {/* <Flex mx={-3} flexWrap={'wrap'}>
              <Box width={[1, 1, 1]} px={3}>
                <Field label="Sender Address" validated={validated} width={400}>
                  <Input
                    type="text"
                    required // set required attribute to use brower's HTML5 input validation
                    onChange={handleSender}
                    value={sender}
                    width={1}
                  />
                </Field>
              </Box>
            </Flex> */}
          <Flex mx={-3} flexWrap={'wrap'}>
            <Box width={[1, 1, 1]} px={3}>
              <Field label="Recipient Address" validated={validated} width={400}>
                <Input
                  type="text"
                  required // set required attribute to use brower's HTML5 input validation
                  onChange={handleRecipeint}
                  value={recipient}
                  width={1}
                />
              </Field>
            </Box>
          </Flex>
          <Flex mx={-3} flexWrap={'wrap'}>
            <Box width={[1, 1, 1]} px={3}>
              <Field label="Amount" validated={validated} width={400}>
                <Input
                  type="text"
                  required // set required attribute to use brower's HTML5 input validation
                  onChange={handleAmount}
                  value={amount}
                  width={1}
                />
              </Field>
            </Box>
          </Flex>
          <Box>
            {/* Use the validated state to update UI */}
            <Button type="submit" disabled={!validated}>
              Submit Form
            </Button>
          </Box>
          {sending && txHash && renderPendingTransactionHash()}
          {!sending && txHash && renderMinedTransactionHash()}
        </Form>
      </Box>
    </div>
  );
}
