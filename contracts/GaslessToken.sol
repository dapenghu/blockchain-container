pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "./RelayerRole.sol";
import "./MyERC20Mintable.sol";
import "./MyERC20Detailed.sol";
import "./MyGSNRecipient.sol";

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
                         MyERC20Detailed, MyERC20Mintable, 
                         MyGSNRecipient {
    
    /**  @dev init: ERC20Detailed.initialize(), GSNRecipient.initialize(), RelayerRole.initialize()
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

        // set default relayHub 
        MyGSNRecipient.initialize();

        // Mint the initial supply
        _mint(issuer, initialSupply);

    }

    // GSNRecipient
    // accept all requests
    /**
     * @dev Called by {IRelayHub} to validate if this recipient accepts being charged for a relayed call. Note that the
     * recipient will be charged regardless of the execution result of the relayed call (i.e. if it reverts or not).
     *
     * The relay request was originated by `from` and will be served by `relay`. `encodedFunction` is the relayed call
     * calldata, so its first four bytes are the function selector. The relayed call will be forwarded `gasLimit` gas,
     * and the transaction executed with a gas price of at least `gasPrice`. `relay`'s fee is `transactionFee`, and the
     * recipient will be charged at most `maxPossibleCharge` (in wei). `nonce` is the sender's (`from`) nonce for
     * replay attack protection in {IRelayHub}, and `approvalData` is a optional parameter that can be used to hold a signature
     * over all or some of the previous values.
     *
     * Returns a tuple, where the first value is used to indicate approval (0) or rejection (custom non-zero error code,
     * values 1 to 10 are reserved) and the second one is data to be passed to the other {IRelayRecipient} functions.
     *
     * {acceptRelayedCall} is called with 50k gas: if it runs out during execution, the request will be considered
     * rejected. A regular revert will also trigger a rejection.
     */
    function acceptRelayedCall(
        address relay,
        address,        // from,
        bytes calldata, // encodedFunction,
        uint256,        // transactionFee,
        uint256,        // gasPrice,
        uint256,        // gasLimit,
        uint256,        // nonce,
        bytes calldata, // approvalData,
        uint256         // maxPossibleCharge
    ) external view onlyRelayer(relay) returns (uint256, bytes memory) {
        return _approveRelayedCall();
    }

    function _preRelayedCall(bytes memory context) internal returns (bytes32) {
    }

    function _postRelayedCall(bytes memory context, bool, uint256 actualCharge, bytes32) internal {
    }

    function getRecipientBalance() public view returns (uint) {
        return IRelayHub(getHubAddr()).balanceOf(address(this));
    }

    /**
     * @dev Throws if called by any account other than the Relay Hub.
     */
    modifier onlyRelayHub() {
        require(msg.sender != getHubAddr(), "GaslessToken: caller is not the Relay Hub");
        _;
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
        public onlyRelayHub() returns (bool) {
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
        public onlyRelayHub() returns (bool) {
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
        public onlyRelayHub() returns (bool) {
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
        public onlyRelayHub() returns (bool) {
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
        public onlyRelayHub() returns (bool) {
        return MyERC20.decreaseAllowance(spender, subtractedValue);
    }

}