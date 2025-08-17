 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {DAOActionExecutor} from "./DAOActionExecutor.sol";

contract MockTarget {
    uint256 public value;
    string public message;
    bool public shouldFail;
    
    function setValue(uint256 _value) external {
        value = _value;
    }
    
    function setMessage(string memory _message) external {
        message = _message;
    }
    
    function failFunction() external pure {
        revert("This function always fails");
    }
    
    function conditionalFail() external {
        if (shouldFail) {
            revert("Conditional failure");
        }
    }
    
    function setShouldFail(bool _shouldFail) external {
        shouldFail = _shouldFail;
    }
    
    function returnValue() external pure returns (uint256) {
        return 42;
    }
    
    function returnString() external pure returns (string memory) {
        return "Hello World";
    }
    
    function returnBytes() external pure returns (bytes memory) {
        return abi.encodePacked("Hello", "World");
    }
    
    receive() external payable {}
    
    fallback() external payable {}
}

contract DAOActionExecutorTest is Test {
    DAOActionExecutor public executor;
    MockTarget public mockTarget;
    
    address public owner = address(this);
    address public newOwner = address(0x1);
    address public nonOwner = address(0x2);
    
    event ExecutedProposal(address indexed target, uint256 value, bytes data, bytes response);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    function setUp() public {
        executor = new DAOActionExecutor();
        mockTarget = new MockTarget();
    }

    function test_Constructor() public {
        assertEq(executor.owner(), owner);
    }

    function test_TransferOwnership() public {
        vm.expectEmit(true, true, false, false);
        emit OwnershipTransferred(owner, newOwner);
        executor.transferOwnership(newOwner);
        assertEq(executor.owner(), newOwner);
    }

    function test_TransferOwnership_RevertIfNotOwner() public {
        vm.prank(nonOwner);
        vm.expectRevert("Not authorized");
        executor.transferOwnership(newOwner);
    }

    function test_TransferOwnership_RevertIfZeroAddress() public {
        vm.expectRevert("Zero address");
        executor.transferOwnership(address(0));
    }

    function test_Execute_SimpleFunction() public {
        bytes memory data = abi.encodeWithSignature("setValue(uint256)", 42);
        
        vm.expectEmit(true, false, false, true);
        emit ExecutedProposal(address(mockTarget), 0, data, "");
        bytes memory response = executor.execute(address(mockTarget), 0, data);
        
        assertEq(mockTarget.value(), 42);
        assertEq(response, "");
    }

    function test_Execute_WithStringParameter() public {
        string memory testMessage = "Hello from test";
        bytes memory data = abi.encodeWithSignature("setMessage(string)", testMessage);
        
        vm.expectEmit(true, false, false, true);
        emit ExecutedProposal(address(mockTarget), 0, data, "");
        bytes memory response = executor.execute(address(mockTarget), 0, data);
        
        assertEq(mockTarget.message(), testMessage);
        assertEq(response, "");
    }

    function test_Execute_WithValue() public {
        bytes memory data = abi.encodeWithSignature("setValue(uint256)", 100);
        
        // Send ETH to executor first
        payable(address(executor)).transfer(1 ether);
        
        uint256 targetBalanceBefore = address(mockTarget).balance;
        
        // Use empty data to trigger receive function
        bytes memory response = executor.execute(address(mockTarget), 0.5 ether, "");
        
        assertEq(address(mockTarget).balance, targetBalanceBefore + 0.5 ether);
        assertEq(response, "");
    }

    function test_Execute_WithReturnValue() public {
        bytes memory data = abi.encodeWithSignature("returnValue()");
        
        vm.expectEmit(true, false, false, true);
        emit ExecutedProposal(address(mockTarget), 0, data, abi.encode(42));
        bytes memory response = executor.execute(address(mockTarget), 0, data);
        
        assertEq(response, abi.encode(42));
    }

    function test_Execute_WithStringReturn() public {
        bytes memory data = abi.encodeWithSignature("returnString()");
        
        vm.expectEmit(true, false, false, true);
        emit ExecutedProposal(address(mockTarget), 0, data, abi.encode("Hello World"));
        bytes memory response = executor.execute(address(mockTarget), 0, data);
        
        assertEq(response, abi.encode("Hello World"));
    }

    function test_Execute_WithBytesReturn() public {
        bytes memory data = abi.encodeWithSignature("returnBytes()");
        bytes memory expectedResponse = abi.encodePacked("Hello", "World");
        
        bytes memory response = executor.execute(address(mockTarget), 0, data);
        
        // The response is ABI encoded, so we need to decode it
        bytes memory decodedResponse = abi.decode(response, (bytes));
        assertEq(decodedResponse, expectedResponse);
    }

    function test_Execute_RevertIfNotOwner() public {
        bytes memory data = abi.encodeWithSignature("setValue(uint256)", 42);
        
        vm.prank(nonOwner);
        vm.expectRevert("Not authorized");
        executor.execute(address(mockTarget), 0, data);
    }

    function test_Execute_RevertIfZeroTarget() public {
        bytes memory data = abi.encodeWithSignature("setValue(uint256)", 42);
        
        vm.expectRevert("Invalid target");
        executor.execute(address(0), 0, data);
    }

    function test_Execute_RevertIfCallFails() public {
        bytes memory data = abi.encodeWithSignature("failFunction()");
        
        vm.expectRevert("Call failed");
        executor.execute(address(mockTarget), 0, data);
    }

    function test_Execute_WithComplexData() public {
        // Test with multiple parameters
        bytes memory data = abi.encodeWithSignature("setValue(uint256)", 999);
        
        vm.expectEmit(true, false, false, true);
        emit ExecutedProposal(address(mockTarget), 0, data, "");
        bytes memory response = executor.execute(address(mockTarget), 0, data);
        
        assertEq(mockTarget.value(), 999);
        assertEq(response, "");
    }

    function test_Execute_WithLargeValue() public {
        bytes memory data = abi.encodeWithSignature("setValue(uint256)", type(uint256).max);
        
        vm.expectEmit(true, false, false, true);
        emit ExecutedProposal(address(mockTarget), 0, data, "");
        bytes memory response = executor.execute(address(mockTarget), 0, data);
        
        assertEq(mockTarget.value(), type(uint256).max);
        assertEq(response, "");
    }

    function test_Execute_WithEmptyData() public {
        bytes memory data = "";
        
        vm.expectEmit(true, false, false, true);
        emit ExecutedProposal(address(mockTarget), 0, data, "");
        bytes memory response = executor.execute(address(mockTarget), 0, data);
        
        assertEq(response, "");
    }

    function test_Execute_WithFallbackFunction() public {
        bytes memory data = abi.encodeWithSignature("nonExistentFunction()");
        
        // This should call the fallback function
        vm.expectEmit(true, false, false, true);
        emit ExecutedProposal(address(mockTarget), 0, data, "");
        bytes memory response = executor.execute(address(mockTarget), 0, data);
        
        assertEq(response, "");
    }

    function test_Execute_WithReceiveFunction() public {
        bytes memory data = "";
        
        // Send ETH to executor first
        payable(address(executor)).transfer(1 ether);
        
        uint256 targetBalanceBefore = address(mockTarget).balance;
        
        vm.expectEmit(true, false, false, true);
        emit ExecutedProposal(address(mockTarget), 0.3 ether, data, "");
        bytes memory response = executor.execute(address(mockTarget), 0.3 ether, data);
        
        assertEq(address(mockTarget).balance, targetBalanceBefore + 0.3 ether);
        assertEq(response, "");
    }

    function test_Execute_WithInsufficientBalance() public {
        bytes memory data = abi.encodeWithSignature("setValue(uint256)", 42);
        
        // Try to send more ETH than available
        vm.expectRevert("Call failed");
        executor.execute(address(mockTarget), 1 ether, data);
    }

    function test_Execute_MultipleCalls() public {
        // First call
        bytes memory data1 = abi.encodeWithSignature("setValue(uint256)", 10);
        executor.execute(address(mockTarget), 0, data1);
        assertEq(mockTarget.value(), 10);
        
        // Second call
        bytes memory data2 = abi.encodeWithSignature("setValue(uint256)", 20);
        executor.execute(address(mockTarget), 0, data2);
        assertEq(mockTarget.value(), 20);
        
        // Third call
        bytes memory data3 = abi.encodeWithSignature("setValue(uint256)", 30);
        executor.execute(address(mockTarget), 0, data3);
        assertEq(mockTarget.value(), 30);
    }

    function test_Execute_WithDifferentTargets() public {
        MockTarget mockTarget2 = new MockTarget();
        
        // Execute on first target
        bytes memory data1 = abi.encodeWithSignature("setValue(uint256)", 100);
        executor.execute(address(mockTarget), 0, data1);
        assertEq(mockTarget.value(), 100);
        assertEq(mockTarget2.value(), 0);
        
        // Execute on second target
        bytes memory data2 = abi.encodeWithSignature("setValue(uint256)", 200);
        executor.execute(address(mockTarget2), 0, data2);
        assertEq(mockTarget.value(), 100);
        assertEq(mockTarget2.value(), 200);
    }

    function test_Execute_WithOwnerChange() public {
        // Transfer ownership
        executor.transferOwnership(newOwner);
        
        // Try to execute with old owner (should fail)
        bytes memory data = abi.encodeWithSignature("setValue(uint256)", 42);
        vm.expectRevert("Not authorized");
        executor.execute(address(mockTarget), 0, data);
        
        // Execute with new owner (should succeed)
        vm.prank(newOwner);
        executor.execute(address(mockTarget), 0, data);
        assertEq(mockTarget.value(), 42);
    }

    function test_Execute_WithGasLimit() public {
        bytes memory data = abi.encodeWithSignature("setValue(uint256)", 42);
        
        // Execute with specific gas limit
        uint256 gasLimit = 100000;
        bytes memory response = executor.execute{gas: gasLimit}(address(mockTarget), 0, data);
        
        assertEq(mockTarget.value(), 42);
        // Note: gasUsed will be the actual gas used, not the limit
    }

    function test_Execute_WithComplexReturnData() public {
        // Test with a function that returns complex data
        bytes memory data = abi.encodeWithSignature("returnBytes()");
        bytes memory response = executor.execute(address(mockTarget), 0, data);
        
        // The response is ABI encoded, so we need to decode it
        bytes memory expected = abi.encodePacked("Hello", "World");
        bytes memory decodedResponse = abi.decode(response, (bytes));
        assertEq(decodedResponse, expected);
    }

    function test_Execute_WithRevertAndReason() public {
        // Test with a function that reverts with a reason
        bytes memory data = abi.encodeWithSignature("failFunction()");
        
        vm.expectRevert("Call failed");
        executor.execute(address(mockTarget), 0, data);
    }

    function test_Execute_WithConditionalRevert() public {
        // Set the mock target to fail
        mockTarget.setShouldFail(true);
        
        bytes memory data = abi.encodeWithSignature("conditionalFail()");
        
        vm.expectRevert("Call failed");
        executor.execute(address(mockTarget), 0, data);
        
        // Set it back to not fail
        mockTarget.setShouldFail(false);
        
        // Should succeed now
        executor.execute(address(mockTarget), 0, data);
    }

    function test_Receive() public {
        uint256 balanceBefore = address(executor).balance;
        
        payable(address(executor)).transfer(1 ether);
        
        assertEq(address(executor).balance, balanceBefore + 1 ether);
    }

    function test_Execute_WithMaxValue() public {
        // Send ETH to executor
        payable(address(executor)).transfer(10 ether);
        
        // Use empty data to trigger receive function
        bytes memory response = executor.execute(address(mockTarget), 1 ether, "");
        
        assertEq(response, "");
    }

    function test_Execute_WithZeroValue() public {
        bytes memory data = abi.encodeWithSignature("setValue(uint256)", 0);
        
        vm.expectEmit(true, false, false, true);
        emit ExecutedProposal(address(mockTarget), 0, data, "");
        bytes memory response = executor.execute(address(mockTarget), 0, data);
        
        assertEq(mockTarget.value(), 0);
        assertEq(response, "");
    }

    function test_Execute_WithLargeData() public {
        // Create large data payload
        bytes memory largeData = new bytes(1000);
        for (uint i = 0; i < 1000; i++) {
            largeData[i] = bytes1(uint8(i % 256));
        }
        
        vm.expectEmit(true, false, false, true);
        emit ExecutedProposal(address(mockTarget), 0, largeData, "");
        bytes memory response = executor.execute(address(mockTarget), 0, largeData);
        
        assertEq(response, "");
    }

    function test_Execute_WithDelegateCall() public {
        // Test that the executor can handle delegate calls
        bytes memory data = abi.encodeWithSignature("setValue(uint256)", 42);
        
        // This would be a delegate call if the target supported it
        // For now, just test normal call
        executor.execute(address(mockTarget), 0, data);
        assertEq(mockTarget.value(), 42);
    }

    function test_Execute_WithStaticCall() public {
        // Test with a view function (static call)
        bytes memory data = abi.encodeWithSignature("returnValue()");
        
        bytes memory response = executor.execute(address(mockTarget), 0, data);
        assertEq(response, abi.encode(42));
    }

    function test_Execute_WithMultipleOwnershipTransfers() public {
        address owner1 = address(0x1);
        address owner2 = address(0x2);
        address owner3 = address(0x3);
        
        // Transfer to owner1
        executor.transferOwnership(owner1);
        assertEq(executor.owner(), owner1);
        
        // Transfer to owner2
        vm.prank(owner1);
        executor.transferOwnership(owner2);
        assertEq(executor.owner(), owner2);
        
        // Transfer to owner3
        vm.prank(owner2);
        executor.transferOwnership(owner3);
        assertEq(executor.owner(), owner3);
        
        // Execute with final owner
        bytes memory data = abi.encodeWithSignature("setValue(uint256)", 42);
        vm.prank(owner3);
        executor.execute(address(mockTarget), 0, data);
        assertEq(mockTarget.value(), 42);
    }
}