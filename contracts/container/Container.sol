pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "../RelayerRole.sol";

/* 
 * @dev 联盟容器，负责管理联盟内的合约、账户、交易中继
 */
contract Container is Initializable, RelayerRole{
    using ECDSA for bytes32;

    /**  @dev init: ERC20Detailed.initialize(), RelayerRole.initialize()
     *  called by app deployer
     */
    function initialize(address relayer) public initializer {
        RelayerRole.initialize(relayer);
    }

    event RelayCall(bytes32 metaHash, bytes metaSignature);
    event RelayTransfer(address token, address sender, address recipient, uint256 amount, bytes32 metaHash);
    
    function relayTransfer(
        address tokenAddress,
        address sender,
        address recipient,
        uint256 amount,
        bytes32 metaHash,
        bytes memory metaSign
    ) public onlyRelayer(msg.sender) returns(bool) {
        // verify parameters
        require(tokenAddress != address(0), "token address is invalide");
        require(sender != address(0), "sender address is invalide");
        require(recipient != address(0), "recipient address is invalide");

        // verify sender's signature
        address result = metaHash.recover(metaSign);
        require(result == sender, "sender's signature is invalid");

        // encode transfer argument
        bytes memory encodedTransferWithSender = abi.encodeWithSelector(
            IERC20(tokenAddress).transfer.selector, 
            recipient, 
            amount, 
            sender);

        // call ERC20 token
        (bool success, ) = tokenAddress.call(encodedTransferWithSender);

        // emit event
        if (success) {
            emit RelayTransfer( tokenAddress, sender, recipient, amount, metaHash);
        }
        return success;
    }

    function relayCall (
        address sender,
        address token,
        bytes memory encodedFunctionCall, // transfer(to, amount)
        bytes32 metaHash,
        bytes memory metaSignature
    ) public onlyRelayer(msg.sender) returns (bool) {
        // TODO: verify sender's signature
        // msg.sender is relayer, append sender to encoded function call
        bytes memory encodedFunctionWithFrom = abi.encodePacked(encodedFunctionCall, sender);
        (bool success, ) = token.call(encodedFunctionWithFrom);
        if (success) {
            emit RelayCall(metaHash, metaSignature);
        }
        return success;
        // TODO: Event of meta data
    }
}
