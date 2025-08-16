// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title DAOActionExecutor - Executes proposals created by OmniAgent
contract DAOActionExecutor {
    address public owner;

    event ExecutedProposal(address indexed target, uint256 value, bytes data, bytes response);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function execute(
        address target,
        uint256 value,
        bytes calldata data
    ) external onlyOwner returns (bytes memory) {
        require(target != address(0), "Invalid target");

        (bool success, bytes memory response) = target.call{value: value}(data);
        require(success, "Call failed");

        emit ExecutedProposal(target, value, data, response);
        return response;
    }

    receive() external payable {}
}
