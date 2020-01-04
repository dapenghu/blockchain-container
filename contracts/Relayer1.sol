pragma solidity ^0.5.0;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";

contract Relayer1 {

  event TransactionMeta(bytes metaHash, bytes metaSignature);

  function relayCall (
        address sender,
        address token,
        bytes memory encodedFunctionCall, // transfer(to, amount)
        bytes memory metaHash,
        bytes memory metaSignature
    ) public returns (bool) {
        // TODO: verify sender's signature
        // msg.sender is relayer, append sender to encoded function call
        bytes memory encodedFunctionWithFrom = abi.encodePacked(encodedFunctionCall, sender);
        (bool success, ) = token.call(encodedFunctionWithFrom);
        if (success) {
            emit TransactionMeta(metaHash, metaSignature);
        }
        return success;
        // TODO: Event of meta data
    }
}
