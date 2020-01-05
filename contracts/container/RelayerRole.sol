pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Roles.sol";
import "../access/Ownable.sol";

contract RelayerRole is Initializable, Ownable {
    using Roles for Roles.Role;

    event RelayerAdded(address indexed account);
    event RelayerRemoved(address indexed account);

    Roles.Role private _relayers;

    function initialize(address relayer) public initializer {
        Ownable.initialize(msg.sender);

        if (!isRelayer(relayer)) {
            _addRelayer(relayer);
        }
    }

    modifier onlyRelayer(address addr) {
        require(isRelayer(addr), "RelayerRole: caller does not have the Relayer role");
        _;
    }

    function isRelayer(address account) public view returns (bool) {
        return _relayers.has(account);
    }

    function addRelayer(address account) public onlyOwner() {
        _addRelayer(account);
    }

    function renounceRelayer(address relayer) public  onlyOwner() {
        _removeRelayer(relayer);
    }

    function _addRelayer(address account) internal {
        _relayers.add(account);
        emit RelayerAdded(account);
    }

    function _removeRelayer(address account) internal {
        _relayers.remove(account);
        emit RelayerRemoved(account);
    }

    uint256[10] private ______gap;
}
