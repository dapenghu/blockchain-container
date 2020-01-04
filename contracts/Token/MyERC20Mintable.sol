pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "./MyERC20.sol";

/**
 * @dev Extension of {ERC20} that adds a set of accounts with the {MinterRole},
 * which have permission to mint (create) new tokens as they see fit.
 *
 * At construction, the deployer of the contract is the only minter.
 */
contract MyERC20Mintable is Initializable, MyERC20 {
    address private _minter;
    
    function initialize(address minter) public initializer {
        MyERC20.initialize();
        _minter = minter;
    }

    modifier onlyMinter() {
        require(msg.sender == _minter, "MinterRole: caller does not have the Minter role");
        _;
    }

    /**
     * @dev See {ERC20-_mint}.
     *
     * Requirements:
     *
     * - the caller must have the {MinterRole}.
     */
    function mint(address account, uint256 amount) public onlyMinter() returns (bool) {
        _mint(account, amount);
        return true;
    }

    uint256[50] private ______gap;
}
