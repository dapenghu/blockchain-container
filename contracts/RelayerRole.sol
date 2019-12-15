pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Roles.sol";

contract RelayerRole is Initializable {
    using Roles for Roles.Role;

    event RelayerAdded(address indexed account);
    event RelayerRemoved(address indexed account);

    Roles.Role private _relayers;

    function initialize(address sender) public initializer {
        if (!isRelayer(sender)) {
            _addRelayer(sender);
        }
    }

    modifier onlyRelayer(address relayer) {
        require(isRelayer(relayer), "RelayerRole: caller does not have the Relayer role");
        _;
    }

    function isRelayer(address account) public view returns (bool) {
        return _relayers.has(account);
    }

    function addRelayer(address account) public {
        _addRelayer(account);
    }

    function renounceRelayer(address relayer) public {
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
