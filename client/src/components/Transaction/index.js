import React, { useState, useEffect } from 'react';
// import { PublicAddress, Loader, util } from 'rimble-ui';
import { Box, Form, Input, Field, Button, Flex } from 'rimble-ui';

import styles from './Transaction.module.scss';

// import getTransactionReceipt from '../../utils/getTransactionReceipt';
// import { utils } from '@openzeppelin/gsn-provider';
// const { isRelayHubDeployedForRecipient, getRecipientFunds } = utils;

export default function Transaction(props) {
  const { lib, transfer } = props;
  // const { instance, accounts, lib, networkName, providerName, addresses, balances } = props;
  // const { _address, methods } = instance || {};

  const [formValidated, setFormValidated] = useState(false);
  const [validated, setValidated] = useState(false);
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState(10);

  const handleSender = e => {
    setSender(e.target.value);
    validateInput(e);
  };

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
    if (lib.utils.isAddress(sender) && lib.utils.isAddress(recipient) && amount > 0) {
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
    transfer(sender, recipient, amount);
    console.log('transfer from ' + sender + ' to ' + recipient + ' : ' + amount);
  };
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
      <h3> 合规交易 </h3>
      <Box p={4}>
        <Box>
          <Form onSubmit={handleSubmit} validated={formValidated}>
            <Flex mx={-3} flexWrap={'wrap'}>
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
            </Flex>
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
                <Field label="Amount" validated={validated} width={200}>
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
          </Form>
        </Box>
      </Box>

      {/** 
          {transactionHash && networkName !== 'Private' && renderTransactionHash()}*/}
    </div>
  );
}
