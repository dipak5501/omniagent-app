// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title DAOActionExecutor - Executes proposals created by OmniAgent
contract DAOActionExecutor {
    event ExecutedProposal(address indexed target, uint256 value, bytes data, bytes response);

    function execute(
        address target,
        uint256 value,
        bytes calldata data
    ) external returns (bytes memory) {
        require(target != address(0), "Invalid target");

        (bool success, bytes memory response) = target.call{value: value}(data);
        require(success, "Call failed");

        emit ExecutedProposal(target, value, data, response);
        return response;
    }

    receive() external payable {}
}
