# 环境配置
## 启动 Ganache CLI
Ganache Configuration

- mnemonic: "custom below cherry juice dumb pledge picnic mutual jazz copy bundle season"
- port: 8545 
- host: "0.0.0.0" 
- networkId: 5777      链ID
- db: ./data/chain5777 链数据的目录，重启 ganache-cli 不会丢失数据

  >  $./start-ganache.sh

## 账户列表
- 有币账户
| Index | Name | Address |
| --- | --- | --- |
| 0 | Admin | 0xFaA53Ab529168732948508e03c0ab1fDDd3B91B2 |
| 1 | Alice | 0x64cFad30F4E128568742B37b073314E5447D493F |
| 2 | Bob   | 0x92fdA730d5Db6f5FD8811D81a83C1a25A1c07Ab6 |
| 3 | Crace | 0x8d53f7e6E1820F53BC647AfC79e8154147C827F1 |
| 4 | David | 0x64D77De64c80b8d31B8184C18b5F0000C750DEBC |
| 5 | | 0xA4360A6746B8F71c01f8d8758C71B44C395627eB |
| 6 | | 0xA2C1e71325537cf1422136eb1a8Fda622705F9a3 |
| 7 | | 0x04E0Bad6c226E8Bd0CAdD30aB48B05d6d669bE83 |
| 8 | | 0x1d03367A85339636554F818254EE373Ffa8020DD |
| 9 | | 0xe802c67BcDc5202C05dfd976C8eD28B055fF8506 |

- 无币用户账户
| Index | Name | Address |
| --- | --- | --- |
| 1 | Alice | 0x64cFad30F4E128568742B37b073314E5447D493F |
| 2 | Bob   | 0x92fdA730d5Db6f5FD8811D81a83C1a25A1c07Ab6 |
| 3 | Crace | 0x8d53f7e6E1820F53BC647AfC79e8154147C827F1 |
| 4 | David | 0x64D77De64c80b8d31B8184C18b5F0000C750DEBC |
| 5 | Citi  | 0xA4360A6746B8F71c01f8d8758C71B44C395627eB |
| 6 | MG    | 0xA2C1e71325537cf1422136eb1a8Fda622705F9a3 |


# Counter Contract
## 部署 Counter Contract
执行命令:
> $ oz create 

| Name | Address |
| --- | --- |
| Counter 地址 | [Counter JSON](./build/contracts/Counter.json) | 

## Setup ERC1613 环境
- 安装 @openzeppelin/gsn-helpers@0.2.1
- 执行命令 `./start-relayer.sh`
  - 部署 RelayHub 合约
  - 下载并且运行 relayer 
  - 向 RelayHub 注册 relayer
  - 向 RelayRecipient 注入ETH

> relayer 数据文件在 ./data/relayer 目录下 进程每一次启动会从 FS 读取 keystore，并且使用第一个账户作为 relayer address

  ```
  $ npx oz-gsn --help
  Usage: oz-gsn [command]

  Commands:
    deploy-relay-hub  deploy the singleton RelayHub instance
    run-relayer       downloads and runs a relayer binary, and registers it, deploying a hub if needed
    register-relayer  stake for a relayer and fund it
    fund-recipient    fund a recipient contract so that it can receive relayed calls
    help [cmd]        display help for [cmd]
  ```

| Name | Address |
| --- | --- |
| RelayHub 地址 | 0xD216153c06E857cD7f72665E0aF1d7D82172F494 | 
| Relayer 地址 | [keystore 目录](./data/relayer/keystore) | 
| Relayer URL | [http://localhost:8090](http://localhost:8090) |

## 启动App
  ```
  cd client
  npm run start
  ```
# Token Contract
## 部署 Token Contract
  ```
  $ oz create
  ? Pick a contract to instantiate GaslessToken
  Using session with network ganache_cli, sender address 0xFaA53Ab529168732948508e03c0ab1fDDd3B91B2, timeout 3600 seconds
  All contracts are up to date
  ? Do you want to call a function on the instance after creating it? Yes
  ? Select which function * initialize(name: string, symbol: string, decimals: uint8, initialSupply: uint256, issuer: address, relayer: address)
  ? name (string): TutorialToken
  ? symbol (string): TTT
  ? decimals (uint8): 2
  ? initialSupply (uint256): 1000000
  ? issuer (address): 0xFaA53Ab529168732948508e03c0ab1fDDd3B91B2
  ? relayer (address): 0xb4e22c44eadcc0e839df8ba2a70b492564d37f7e
  ✓ Instance created at 0x0944C74BceF3F237Aa1E0a587644C5D8659dA569
  ```

| Name | Value |
| --- | --- |
| Name         | TutorialToken |
| Symbol       | TTT |
| Supply       | 10000 |
| Token Proxy  | 0x0944C74BceF3F237Aa1E0a587644C5D8659dA569 |
| Token Impl   | 0xE3dDa49f85CC4ceF0d573492FE2cd51c7D3BaDf0 |
| Token Issuer | 0xFaA53Ab529168732948508e03c0ab1fDDd3B91B2 |
| Relayer      | 0xb4e22c44eadcc0e839df8ba2a70b492564d37f7e |

## Init token json and instance in <App>
```javascript
  const [tokenJson, setTokenJson] = useState(undefined);
  const [tokenInstance, setTokenInstance] = useState(undefined);
```
