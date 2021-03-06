pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";

/*
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with GSN meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
contract IContext {
    // Empty internal constructor, to prevent people from mistakenly deploying
    // an instance of this contract, which should be used via inheritance.
    // solhint-disable-previous-line no-empty-blocks

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyContainer() {
        require(isContainer(msg.sender), "ContainerContext: caller is not the container");
        _;
    }

    function isContainer(address addr) public view returns (bool);
    function container() public view returns (address);

    function _msgSender() internal view returns (address payable);
    function _msgData() internal view returns (bytes memory);
}
