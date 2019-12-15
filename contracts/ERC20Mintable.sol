pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "./ERC20.sol";

/**
 * @dev Extension of {ERC20} that adds a set of accounts with the {MinterRole},
 * which have permission to mint (create) new tokens as they see fit.
 *
 * At construction, the deployer of the contract is the only minter.
 */
contract ERC20Mintable is Initializable, ERC20 {
    address private _minter;
    
    function initialize(address minter) public initializer {
        ERC20.initialize();
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
