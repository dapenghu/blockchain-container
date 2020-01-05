pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "../container/ContainerContext.sol";
import "./MyERC20Mintable.sol";
import "./MyERC20Detailed.sol";

/** 
 * @title 用户转账无需 Gas 的 ERC20 Token
 * @dev 角色设计:
 * 1. Token Issuer, token 的发行者，初始铸造的 token 都记在 issuer 账户上
 * 2. Token Manager，token contract 的开发、部署、升级、状态管理者
 * 3. Transaction Relayer，负责中继用户的交易，并且代替用户支付 gas
 * 4. Enforcer: 执法者
 * 
 * @dev 需求
 * 1. initialize()：记录所有角色，相关合约(RelayHub)
 * 2. transfer(): 只有白名单内的账户可以直接转账
 * 3. transferFrom(); 由 Relayer 代理转账
 * 4. approve(): do nothing
 * 4. acceptRelayedCall(): 检查 relayer 地址
 * 6. preRelayedCall(): do nothing
 * 7. postRelayedCall(): do nothing
 */

contract ContainerManagedERC20 is Initializable, ContainerContext,
                         MyERC20Detailed, MyERC20Mintable {
    
    /**  @dev init: ERC20Detailed.initialize(), RelayerRole.initialize()
      *  called by app deployer
      */
    function initialize(
        string memory name, string memory symbol, uint8 decimals, 
        uint256 initialSupply, address issuer, address container
        ) public initializer {

        // set relayer role
        ContainerContext.initialize(container);

        // init token detail
        MyERC20Detailed.initialize(name, symbol, decimals);

        // Initialize the minter and pauser roles, and renounce them
        MyERC20Mintable.initialize(issuer);
        // _removeMinter(address(this));

        // Mint the initial supply
        _mint(issuer, initialSupply);

    }

    function _preRelayedCall(bytes memory context) internal returns (bytes32) {
    }

    function _postRelayedCall(bytes memory context, bool, uint256 actualCharge, bytes32) internal {
    }

}