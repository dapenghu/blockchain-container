pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "./RelayerRole.sol";
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

contract GaslessToken is Initializable, RelayerRole,
                         MyERC20Detailed, MyERC20Mintable {
    
    /**  @dev init: ERC20Detailed.initialize(), RelayerRole.initialize()
      *  called by app deployer
      */
    function initialize(
        string memory name, string memory symbol, uint8 decimals, 
        uint256 initialSupply, address issuer, address relayer
        ) public initializer {

        // set relayer role
        RelayerRole.initialize(relayer);

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
        public returns (bool) {
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
        public returns (bool) {
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
        public returns (bool) {
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
        public returns (bool) {
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
        public returns (bool) {
        return MyERC20.decreaseAllowance(spender, subtractedValue);
    }

    /**
     * @dev Replacement for msg.sender. Returns the actual sender of a transaction: msg.sender for regular transactions,
     * and the end-user for GSN relayed calls (where msg.sender is actually `RelayHub`).
     *
     * IMPORTANT: Contracts derived from {GSNRecipient} should never use `msg.sender`, and use {_msgSender} instead.
     */
    function _msgSender() internal view returns (address payable) {
        if (isRelayer(msg.sender)) {
            return _getRelayedCallSender();
        } else {
            return msg.sender;
        }
    }

    /**
     * @dev Replacement for msg.data. Returns the actual calldata of a transaction: msg.data for regular transactions,
     * and a reduced version for GSN relayed calls (where msg.data contains additional information).
     *
     * IMPORTANT: Contracts derived from {GSNRecipient} should never use `msg.data`, and use {_msgData} instead.
     */
    function _msgData() internal view returns (bytes memory) {
        if (isRelayer(msg.sender)) {
            return _getRelayedCallData();
        } else {
            return msg.data;
        }
    }

    function _getRelayedCallSender() private pure returns (address payable result) {
        // We need to read 20 bytes (an address) located at array index msg.data.length - 20. In memory, the array
        // is prefixed with a 32-byte length value, so we first add 32 to get the memory read index. However, doing
        // so would leave the address in the upper 20 bytes of the 32-byte word, which is inconvenient and would
        // require bit shifting. We therefore subtract 12 from the read index so the address lands on the lower 20
        // bytes. This can always be done due to the 32-byte prefix.

        // The final memory read index is msg.data.length - 20 + 32 - 12 = msg.data.length. Using inline assembly is the
        // easiest/most-efficient way to perform this operation.

        // These fields are not accessible from assembly
        bytes memory array = msg.data;
        uint256 index = msg.data.length;

        // solhint-disable-next-line no-inline-assembly
        assembly {
            // Load the 32 bytes word from memory with the address on the lower 20 bytes, and mask those.
            result := and(mload(add(array, index)), 0xffffffffffffffffffffffffffffffffffffffff)
        }
        return result;
    }

    function _getRelayedCallData() private pure returns (bytes memory) {
        // RelayHub appends the sender address at the end of the calldata, so in order to retrieve the actual msg.data,
        // we must strip the last 20 bytes (length of an address type) from it.

        uint256 actualDataLength = msg.data.length - 20;
        bytes memory actualData = new bytes(actualDataLength);

        for (uint256 i = 0; i < actualDataLength; ++i) {
            actualData[i] = msg.data[i];
        }

        return actualData;
    }

}