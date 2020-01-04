pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "./MyERC20Mintable.sol";
import "./MyERC20Detailed.sol";
import "./ContainerManaged.sol";

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

contract GaslessToken is Initializable, ContainerManaged,
                         MyERC20Detailed, MyERC20Mintable {
    
    /**  @dev init: ERC20Detailed.initialize(), RelayerRole.initialize()
      *  called by app deployer
      */
    function initialize(
        string memory name, string memory symbol, uint8 decimals, 
        uint256 initialSupply, address issuer, address container
        ) public initializer {

        // set relayer role
        ContainerManaged.initialize(container);

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

    // override ERC20 methods
    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `recipient` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     */
    function transfer(address recipient, uint256 amount) 
        public onlyContainer() returns (bool) {
        return MyERC20.transfer(recipient, amount);
    }

    /**
     * @dev See {IERC20-approve}.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function approve(address spender, uint256 amount) 
        public onlyContainer() returns (bool) {
        return MyERC20.approve(spender, amount);
    }

    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Emits an {Approval} event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of {ERC20};
     *
     * Requirements:
     * - `sender` and `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `amount`.
     * - the caller must have allowance for `sender`'s tokens of at least
     * `amount`.
     */
    function transferFrom(address sender, address recipient, uint256 amount) 
        public onlyContainer() returns (bool) {
        return MyERC20.transferFrom(sender, recipient, amount);
    }

    /**
     * @dev Atomically increases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function increaseAllowance(address spender, uint256 addedValue) 
        public onlyContainer() returns (bool) {
        return MyERC20.increaseAllowance(spender, addedValue);
    }

    /**
     * @dev Atomically decreases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `spender` must have allowance for the caller of at least
     * `subtractedValue`.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) 
        public onlyContainer() returns (bool) {
        return MyERC20.decreaseAllowance(spender, subtractedValue);
    }

}