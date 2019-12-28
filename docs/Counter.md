
## Properties
### Web3Context Properties
```javascript
  // const { accounts, networkId, networkName, providerName, web3, connected } = web3Context
  const context = useWeb3Network('http://127.0.0.1:8545', {
    gsn: {
      dev: true,
      signKey,
    },
  });
```

### Contract JSON
```javascript
  // load Counter json artifact
  let counterJSON = undefined;
  try {
    // see https://github.com/OpenZeppelin/solidity-loader
    counterJSON = require('../../contracts/Counter.sol');
  } catch (e) {
    console.log(e);
  }
```

### Contract Instance

```javascript
  if (!counterInstance && context && counterJSON && counterJSON.networks && context.networkId) {
    deployedNetwork = counterJSON.networks[context.networkId.toString()];
    if (deployedNetwork) {
      setCounterInstance(new context.lib.eth.Contract(counterJSON.abi, deployedNetwork.address));
    }
  }
```

## States
### `balance`: 测试账户余额
```javascript
  const [balance, setBalance] = useState(0);

  const getBalance = useCallback(async () => {
    let balance =
      accounts && accounts.length > 0 ? lib.utils.fromWei(await lib.eth.getBalance(accounts[0]), 'ether') : 'Unknown';
    setBalance(Number(balance));
  }, [accounts, lib.eth, lib.utils]);

  useEffect(() => {
    if (!isGSN) getBalance();
  }, [accounts, getBalance, isGSN, lib.eth, lib.utils, networkId]);
```

### `isDeployed`, `funds`: recipient 合约是否部署，以及锁定资金
```javascript
  const [, setIsDeployed] = useState(false);
  const [funds, setFunds] = useState(0);
  // if GSN check how much funds recipient has
  const isDeployed = await **isRelayHubDeployedForRecipient**(web3, recipientAddress);
  setIsDeployed(isDeployed);

  if (isDeployed) {
      const funds = await **getRecipientFunds**(web3, recipientAddress);
      setFunds(Number(funds));
  }

```

### recipient 合约数据
```javascript
  const [count, setCount] = useState(0);

  const getCount = useCallback(async () => {
    if (instance) {
      // Get the value from the contract to prove it worked.
      const response = await instance.methods.getCounter().call();
      // Update state with the result.
      setCount(response);
    }
  }, [instance]);

  useEffect(() => {
    getCount();
  }, [getCount, instance]);
```

### 合约状态

```javascript
  const [sending, setSending] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');

  const increase = async number => {
    try {
      if (!sending) {
        setSending(true);

        const tx = await instance.methods.increaseCounter(number).send({ from: accounts[0] });
        const receipt = await getTransactionReceipt(web3, tx.transactionHash);
        setTransactionHash(receipt.transactionHash);

        getCount();
        getDeploymentAndFunds();

        setSending(false);
      }
    } catch (e) {
      setSending(false);
      console.log(e);
    }
  };

  const decrease = async number => {
    try {
      if (!sending) {
        setSending(true);

        const receipt = await instance.methods.decreaseCounter(number).send({ from: accounts[0] });
        setTransactionHash(receipt.transactionHash);

        getCount();
        getDeploymentAndFunds();

        setSending(false);
      }
    } catch (e) {
      setSending(false);
      console.log(e);
    }
  };

```

## Effects

## Render
