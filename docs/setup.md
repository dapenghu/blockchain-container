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
| Index | Name | Address | Private Key |
| --- | --- | --- | --- |
| 0 | Admin | 0xFaA53Ab529168732948508e03c0ab1fDDd3B91B2 | 748053ca7fe5017aad56c8ab7b2af2f92a01e3b3be5f3de7ca2fc44a992685fc |
| 1 | ----- | 0x64cFad30F4E128568742B37b073314E5447D493F | 08e9d80abe835aa97e6491e12fb3a508abec83460f9e39672ee6f1f809928e05 |
| 2 | ----- | 0x92fdA730d5Db6f5FD8811D81a83C1a25A1c07Ab6 | 1a840aa2df473d0359a6963f6c9c63f8079bf0592673840cd56c085366cac815 |
| 3 | ----- | 0x8d53f7e6E1820F53BC647AfC79e8154147C827F1 | 02581a46cb1d95d7803bc0dfcad817e360ab686be8cfa08716cfed05d414d587 |
| 4 | Relayer | 0xB4E22C44eAdcc0e839DF8BA2a70b492564d37F7E | |

- 无币用户账户
| Index | Name | Address | Private Key |
| --- | --- | --- | --- |
| 1 | GGEC  | 0xb5b6baa1df2a7690e106af02cf0365f79838cdb2 | 0x76d58d5efe87b08f34f411008fdaec07f3f359e5c1f743330c7afd601374134e |
| 2 | Alice | 0x774b0a2f952c06bab17f5e4702516ea71e4bffad | 0xafb5a7fff3566348c47a72ece512e8092257673a36709a26e1c26273c8c6897b |
| 3 | Bob   | 0xf731579cd24dffddf5dc34a185f51f9f72b7da1b | 0x91b9041f2cb6bd6e170a84d8299363fac29ed0c4b475b589da469caf762d99be |
| 4 | Caral | 0x6f52868ca81870deb8485023325aa3255bdfef18 | 0x3e38dd502787e8568123cea11ff8e5eb02bc7c55a1ba1f61e69145bad6d0d365 |
| 5 | ICBC  | 0xc30b22232f9a198d67c8ec15ba6d926467f5b3e3 | 0x0a27a96c474ad525fdbda0f4271354bbbe41e3505d68494867b312b5c1130243 |
| 6 | CMBC  | 0xbb87983011137d3881b3ef756d0dd31f164e3747 | 0xbe13cf7b5d3d22a68ef9a769a36f6b90b9769dfe27bf4bd3ffc97048020f592a |
| 7 |  | 0x51ced2e0a9efaf31e710ea330408f3782bbec989 | 0x82e6d6c10027f451194d6f9c520982b00dacf05464b4946b69eb06c4e2054270 |
| 8 |  | 0xa0b59c8d18351f6ea248ca0d5bfed3a67eaed5cb | 0xcb2cf9041f09292aa7c752c6e9236dc519bfcd67cdf4abf6c437998d20cd2255 |


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
  ? name (string): DCEP
  ? symbol (string): DCEP
  ? decimals (uint8): 2
  ? initialSupply (uint256): 1000000
  ? issuer (address): 0xFaA53Ab529168732948508e03c0ab1fDDd3B91B2
  ? relayer (address): 0xb4e22c44eadcc0e839df8ba2a70b492564d37f7e
  ✓ Instance created at 0x0944C74BceF3F237Aa1E0a587644C5D8659dA569
  ```

| Name | Value |
| --- | --- |
| Name         | TutorialToken |
| Symbol       | DCEP |
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
