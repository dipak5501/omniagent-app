// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {DAOGovernance} from "./DOAGovernance.sol";

contract MockTarget {
    uint256 public value;
    string public message;
    
    function setValue(uint256 _value) external {
        value = _value;
    }
    
    function setMessage(string memory _message) external {
        message = _message;
    }
    
    function failFunction() external pure {
        revert("This function always fails");
    }
    
    receive() external payable {}
}

contract DOAGovernanceTest is Test {
    DAOGovernance public governance;
    MockTarget public mockTarget;
    
    address public owner = address(this);
    address public voter1 = address(0x1);
    address public voter2 = address(0x2);
    address public voter3 = address(0x3);
    address public nonVoter = address(0x4);
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed creator,
        string title,
        string description,
        address target,
        bytes data,
        uint256 value,
        uint256 expiryTime
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 weight
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId,
        address indexed executor,
        bytes result
    );
    
    event ProposalExpired(uint256 indexed proposalId);
    event QuorumUpdated(uint256 newQuorum);

    function setUp() public {
        governance = new DAOGovernance();
        mockTarget = new MockTarget();
        
        // Add voters
        governance.addVoter(voter1);
        governance.addVoter(voter2);
        governance.addVoter(voter3);
    }

    function test_Constructor() public {
        assertTrue(governance.isVoter(owner));
        assertEq(governance.quorum(), 3);
        assertEq(governance.votingPeriod(), 7 days);
        assertEq(governance.proposalThreshold(), 1);
    }

    function test_AddVoter() public {
        address newVoter = address(0x5);
        governance.addVoter(newVoter);
        assertTrue(governance.isVoter(newVoter));
    }

    function test_AddVoter_RevertIfNotOwner() public {
        vm.prank(nonVoter);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", nonVoter));
        governance.addVoter(address(0x5));
    }

    function test_AddVoter_RevertIfZeroAddress() public {
        vm.expectRevert("Governance: invalid voter address");
        governance.addVoter(address(0));
    }

    function test_RemoveVoter() public {
        governance.removeVoter(voter1);
        assertFalse(governance.isVoter(voter1));
    }

    function test_RemoveVoter_RevertIfNotOwner() public {
        vm.prank(nonVoter);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", nonVoter));
        governance.removeVoter(voter1);
    }

    function test_RemoveVoter_RevertIfOwner() public {
        vm.expectRevert("Governance: cannot remove owner");
        governance.removeVoter(owner);
    }

    function test_SetQuorum() public {
        uint256 newQuorum = 5;
        vm.expectEmit(true, false, false, true);
        emit QuorumUpdated(newQuorum);
        governance.setQuorum(newQuorum);
        assertEq(governance.quorum(), newQuorum);
    }

    function test_SetQuorum_RevertIfNotOwner() public {
        vm.prank(nonVoter);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", nonVoter));
        governance.setQuorum(5);
    }

    function test_SetQuorum_RevertIfZero() public {
        vm.expectRevert("Governance: quorum must be greater than 0");
        governance.setQuorum(0);
    }

    function test_SetVotingPeriod() public {
        uint256 newPeriod = 14 days;
        governance.setVotingPeriod(newPeriod);
        assertEq(governance.votingPeriod(), newPeriod);
    }

    function test_SetVotingPeriod_RevertIfNotOwner() public {
        vm.prank(nonVoter);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", nonVoter));
        governance.setVotingPeriod(14 days);
    }

    function test_SetVotingPeriod_RevertIfZero() public {
        vm.expectRevert("Governance: voting period must be greater than 0");
        governance.setVotingPeriod(0);
    }

    function test_CreateProposal() public {
        string memory title = "Test Proposal";
        string memory description = "Test Description";
        bytes memory data = abi.encodeWithSignature("setValue(uint256)", 42);
        uint256 value = 0;
        
        vm.expectEmit(true, true, false, true);
        emit ProposalCreated(
            1, // proposalId
            owner, // creator
            title,
            description,
            address(mockTarget),
            data,
            value,
            block.timestamp + governance.votingPeriod()
        );
        
        uint256 proposalId = governance.createProposal(
            title,
            description,
            address(mockTarget),
            data,
            value,
            0 // customExpiryTime
        );
        
        assertEq(proposalId, 1);
        
        // Get basic proposal info
        (
            uint256 id,
            address creator,
            string memory retTitle,
            string memory retDescription,
            address target,
            bytes memory retData,
            uint256 retValue,
            uint256 expiryTime
        ) = governance.getProposalBasic(proposalId);
        
        // Get voting info separately
        (uint256 forVotes, uint256 againstVotes) = governance.getProposalVotes(proposalId);
        
        // Get status info separately
        (bool executed, bool expired) = governance.getProposalStatus(proposalId);
        
        assertEq(id, 1);
        assertEq(creator, owner);
        assertEq(retTitle, title);
        assertEq(retDescription, description);
        assertEq(target, address(mockTarget));
        assertEq(retData, data);
        assertEq(retValue, value);
        assertEq(expiryTime, block.timestamp + governance.votingPeriod());
        assertEq(forVotes, 0);
        assertEq(againstVotes, 0);
        assertFalse(executed);
        assertFalse(expired);
    }

    function test_CreateProposal_RevertIfNotVoter() public {
        vm.prank(nonVoter);
        vm.expectRevert("Governance: caller is not a voter");
        governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            "",
            0,
            0
        );
    }

    function test_CreateProposal_RevertIfZeroTarget() public {
        vm.expectRevert("Governance: invalid target address");
        governance.createProposal(
            "Test",
            "Test",
            address(0),
            "",
            0,
            0
        );
    }

    function test_CreateProposal_RevertIfExpiryInPast() public {
        // Warp to a specific time first
        vm.warp(10000);
        
        // Now try to create a proposal with a past timestamp
        uint256 pastTime = 5000; // This is in the past relative to current time (10000)
        vm.expectRevert("Governance: expiry time must be in the future");
        governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            "",
            0,
            pastTime
        );
    }

    function test_CreateProposal_WithCustomExpiry() public {
        uint256 customExpiry = block.timestamp + 1 days;
        uint256 proposalId = governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            "",
            0,
            customExpiry
        );
        
        (,,,,,,, uint256 expiryTime,,,,) = governance.getProposal(proposalId);
        assertEq(expiryTime, customExpiry);
    }

    function test_Vote() public {
        uint256 proposalId = governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            "",
            0,
            0
        );
        
        vm.prank(voter1);
        vm.expectEmit(true, true, false, true);
        emit VoteCast(proposalId, voter1, true, 1);
        governance.vote(proposalId, true);
        
        (bool support, uint256 weight, uint256 timestamp) = governance.getVote(proposalId, voter1);
        assertTrue(support);
        assertEq(weight, 1);
        assertEq(timestamp, block.timestamp);
        assertTrue(governance.hasVoted(proposalId, voter1));
        
        (uint256 forVotes, uint256 againstVotes) = governance.getProposalVotes(proposalId);
        assertEq(forVotes, 1);
        assertEq(againstVotes, 0);
    }

    function test_Vote_Against() public {
        uint256 proposalId = governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            "",
            0,
            0
        );
        
        vm.prank(voter1);
        governance.vote(proposalId, false);
        
        (bool support,,) = governance.getVote(proposalId, voter1);
        assertFalse(support);
        
        (uint256 forVotes, uint256 againstVotes) = governance.getProposalVotes(proposalId);
        assertEq(forVotes, 0);
        assertEq(againstVotes, 1);
    }

    function test_Vote_RevertIfNotVoter() public {
        uint256 proposalId = governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            "",
            0,
            0
        );
        
        vm.prank(nonVoter);
        vm.expectRevert("Governance: caller is not a voter");
        governance.vote(proposalId, true);
    }

    function test_Vote_RevertIfProposalDoesNotExist() public {
        vm.prank(voter1);
        vm.expectRevert("Governance: proposal does not exist");
        governance.vote(999, true);
    }

    function test_Vote_RevertIfProposalIdZero() public {
        vm.prank(voter1);
        vm.expectRevert("Governance: proposal does not exist");
        governance.vote(0, true);
    }

    function test_Vote_RevertIfAlreadyVoted() public {
        uint256 proposalId = governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            "",
            0,
            0
        );
        
        vm.prank(voter1);
        governance.vote(proposalId, true);
        
        vm.prank(voter1);
        vm.expectRevert("Governance: already voted");
        governance.vote(proposalId, false);
    }

    function test_Vote_RevertIfProposalExecuted() public {
        uint256 proposalId = governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            "",
            0,
            0
        );
        
        // Vote to reach quorum first
        vm.prank(voter1);
        governance.vote(proposalId, true);
        vm.prank(voter2);
        governance.vote(proposalId, true);
        vm.prank(voter3);
        governance.vote(proposalId, true);
        
        // Fast forward past expiry
        vm.warp(block.timestamp + governance.votingPeriod() + 1);
        
        // Execute proposal
        governance.executeProposal(proposalId);
        
        // Try to vote on executed proposal
        vm.prank(owner);
        vm.expectRevert("Governance: proposal already executed");
        governance.vote(proposalId, true);
    }

    function test_Vote_ExpiresProposal() public {
        uint256 proposalId = governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            "",
            0,
            0
        );
        
        // Fast forward past expiry
        vm.warp(block.timestamp + governance.votingPeriod() + 1);
        
        // Manually expire the proposal
        governance.expireProposal(proposalId);
        
        (bool executed, bool expired) = governance.getProposalStatus(proposalId);
        assertTrue(expired);
        assertFalse(executed);
    }

    function test_ExecuteProposal() public {
        uint256 proposalId = governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            abi.encodeWithSignature("setValue(uint256)", 42),
            0,
            0
        );
        
        // Vote to reach quorum
        vm.prank(voter1);
        governance.vote(proposalId, true);
        vm.prank(voter2);
        governance.vote(proposalId, true);
        vm.prank(voter3);
        governance.vote(proposalId, true);
        
        // Fast forward past expiry
        vm.warp(block.timestamp + governance.votingPeriod() + 1);
        
        vm.expectEmit(true, true, false, true);
        emit ProposalExecuted(proposalId, owner, "");
        governance.executeProposal(proposalId);
        
        assertEq(mockTarget.value(), 42);
        
        (bool executed, bool expired) = governance.getProposalStatus(proposalId);
        assertTrue(executed);
        assertFalse(expired);
    }

    function test_ExecuteProposal_RevertIfNotVoter() public {
        uint256 proposalId = governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            "",
            0,
            0
        );
        
        vm.prank(nonVoter);
        vm.expectRevert("Governance: caller is not a voter");
        governance.executeProposal(proposalId);
    }

    function test_ExecuteProposal_RevertIfProposalIdZero() public {
        vm.expectRevert("Governance: proposal does not exist");
        governance.executeProposal(0);
    }

    function test_ExecuteProposal_RevertIfAlreadyExecuted() public {
        uint256 proposalId = governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            "",
            0,
            0
        );
        
        // Vote to reach quorum
        vm.prank(voter1);
        governance.vote(proposalId, true);
        vm.prank(voter2);
        governance.vote(proposalId, true);
        vm.prank(voter3);
        governance.vote(proposalId, true);
        
        // Fast forward past expiry
        vm.warp(block.timestamp + governance.votingPeriod() + 1);
        
        governance.executeProposal(proposalId);
        
        vm.expectRevert("Governance: proposal already executed");
        governance.executeProposal(proposalId);
    }

    function test_ExecuteProposal_RevertIfNotExpired() public {
        uint256 proposalId = governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            "",
            0,
            0
        );
        
        vm.expectRevert("Governance: proposal not expired yet");
        governance.executeProposal(proposalId);
    }

    function test_ExecuteProposal_RevertIfQuorumNotReached() public {
        uint256 proposalId = governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            "",
            0,
            0
        );
        
        // Only 2 votes, need 3 for quorum
        vm.prank(voter1);
        governance.vote(proposalId, true);
        vm.prank(voter2);
        governance.vote(proposalId, true);
        
        // Fast forward past expiry
        vm.warp(block.timestamp + governance.votingPeriod() + 1);
        
        vm.expectRevert("Governance: quorum not reached");
        governance.executeProposal(proposalId);
    }

    function test_ExecuteProposal_RevertIfNotPassed() public {
        uint256 proposalId = governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            "",
            0,
            0
        );
        
        // More against votes than for votes
        vm.prank(voter1);
        governance.vote(proposalId, true);
        vm.prank(voter2);
        governance.vote(proposalId, false);
        vm.prank(voter3);
        governance.vote(proposalId, false);
        
        // Fast forward past expiry
        vm.warp(block.timestamp + governance.votingPeriod() + 1);
        
        vm.expectRevert("Governance: quorum not reached");
        governance.executeProposal(proposalId);
    }

    function test_ExecuteProposal_RevertIfExecutionFails() public {
        uint256 proposalId = governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            abi.encodeWithSignature("failFunction()"),
            0,
            0
        );
        
        // Vote to reach quorum
        vm.prank(voter1);
        governance.vote(proposalId, true);
        vm.prank(voter2);
        governance.vote(proposalId, true);
        vm.prank(voter3);
        governance.vote(proposalId, true);
        
        // Fast forward past expiry
        vm.warp(block.timestamp + governance.votingPeriod() + 1);
        
        vm.expectRevert("Governance: execution failed");
        governance.executeProposal(proposalId);
    }

    function test_ExpireProposal() public {
        uint256 proposalId = governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            "",
            0,
            0
        );
        
        // Fast forward past expiry
        vm.warp(block.timestamp + governance.votingPeriod() + 1);
        
        vm.expectEmit(true, false, false, false);
        emit ProposalExpired(proposalId);
        governance.expireProposal(proposalId);
        
        (bool executed, bool expired) = governance.getProposalStatus(proposalId);
        assertTrue(expired);
        assertFalse(executed);
    }

    function test_ExpireProposal_RevertIfNotVoter() public {
        uint256 proposalId = governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            "",
            0,
            0
        );
        
        vm.prank(nonVoter);
        vm.expectRevert("Governance: caller is not a voter");
        governance.expireProposal(proposalId);
    }

    function test_ExpireProposal_RevertIfProposalIdZero() public {
        vm.expectRevert("Governance: proposal does not exist");
        governance.expireProposal(0);
    }

    function test_ExpireProposal_RevertIfAlreadyExecuted() public {
        uint256 proposalId = governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            "",
            0,
            0
        );
        
        // Vote to reach quorum
        vm.prank(voter1);
        governance.vote(proposalId, true);
        vm.prank(voter2);
        governance.vote(proposalId, true);
        vm.prank(voter3);
        governance.vote(proposalId, true);
        
        // Fast forward past expiry
        vm.warp(block.timestamp + governance.votingPeriod() + 1);
        
        governance.executeProposal(proposalId);
        
        vm.expectRevert("Governance: proposal already executed");
        governance.expireProposal(proposalId);
    }

    function test_ExpireProposal_RevertIfNotExpired() public {
        uint256 proposalId = governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            "",
            0,
            0
        );
        
        vm.expectRevert("Governance: proposal not expired yet");
        governance.expireProposal(proposalId);
    }

    function test_CanExecute() public {
        uint256 proposalId = governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            "",
            0,
            0
        );
        
        // Initially cannot execute
        assertFalse(governance.canExecute(proposalId));
        
        // Vote to reach quorum
        vm.prank(voter1);
        governance.vote(proposalId, true);
        vm.prank(voter2);
        governance.vote(proposalId, true);
        vm.prank(voter3);
        governance.vote(proposalId, true);
        
        // Still cannot execute (not expired)
        assertFalse(governance.canExecute(proposalId));
        
        // Fast forward past expiry
        vm.warp(block.timestamp + governance.votingPeriod() + 1);
        
        // Now can execute
        assertTrue(governance.canExecute(proposalId));
        
        // Execute
        governance.executeProposal(proposalId);
        
        // Cannot execute again
        assertFalse(governance.canExecute(proposalId));
    }

    function test_GetProposalState() public {
        uint256 proposalId = governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            "",
            0,
            0
        );
        
        // Initially pending
        assertEq(governance.getProposalState(proposalId), "Pending");
        
        // Vote
        vm.prank(voter1);
        governance.vote(proposalId, true);
        
        // Now active
        assertEq(governance.getProposalState(proposalId), "Active");
        
        // Vote to reach quorum
        vm.prank(voter2);
        governance.vote(proposalId, true);
        vm.prank(voter3);
        governance.vote(proposalId, true);
        
        // Now passed (reached quorum and more for than against)
        assertEq(governance.getProposalState(proposalId), "Passed");
        
        // Fast forward past expiry
        vm.warp(block.timestamp + governance.votingPeriod() + 1);
        
        // Now expired (because timestamp >= expiryTime)
        assertEq(governance.getProposalState(proposalId), "Expired");
        
        // Manually expire the proposal
        governance.expireProposal(proposalId);
        
        // Cannot execute because it's expired
        vm.expectRevert("Governance: proposal already expired");
        governance.executeProposal(proposalId);
    }

    function test_GetProposalState_Expired() public {
        uint256 proposalId = governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            "",
            0,
            0
        );
        
        // Fast forward past expiry
        vm.warp(block.timestamp + governance.votingPeriod() + 1);
        
        // Expired
        assertEq(governance.getProposalState(proposalId), "Expired");
        
        // Manually expire
        governance.expireProposal(proposalId);
        
        // Still expired
        assertEq(governance.getProposalState(proposalId), "Expired");
    }

    function test_GetTotalProposals() public {
        assertEq(governance.getTotalProposals(), 0);
        
        governance.createProposal("Test1", "Test1", address(mockTarget), "", 0, 0);
        assertEq(governance.getTotalProposals(), 1);
        
        governance.createProposal("Test2", "Test2", address(mockTarget), "", 0, 0);
        assertEq(governance.getTotalProposals(), 2);
    }

    function test_GetProposal_RevertIfProposalIdZero() public {
        vm.expectRevert("Governance: proposal does not exist");
        governance.getProposal(0);
    }

    function test_GetVote_RevertIfProposalIdZero() public {
        vm.expectRevert("Governance: proposal does not exist");
        governance.getVote(0, voter1);
    }

    function test_HasVoted_RevertIfProposalIdZero() public {
        vm.expectRevert("Governance: proposal does not exist");
        governance.hasVoted(0, voter1);
    }

    function test_CanExecute_RevertIfProposalIdZero() public {
        vm.expectRevert("Governance: proposal does not exist");
        governance.canExecute(0);
    }

    function test_GetProposalState_RevertIfProposalIdZero() public {
        vm.expectRevert("Governance: proposal does not exist");
        governance.getProposalState(0);
    }

    function test_EmergencyExecute() public {
        uint256 proposalId = governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            abi.encodeWithSignature("setValue(uint256)", 42),
            0,
            0
        );
        
        vm.expectEmit(true, true, false, true);
        emit ProposalExecuted(proposalId, owner, "");
        governance.emergencyExecute(proposalId);
        
        assertEq(mockTarget.value(), 42);
        
        (bool executed, bool expired) = governance.getProposalStatus(proposalId);
        assertTrue(executed);
        assertFalse(expired);
    }

    function test_EmergencyExecute_RevertIfNotOwner() public {
        uint256 proposalId = governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            "",
            0,
            0
        );
        
        vm.prank(nonVoter);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", nonVoter));
        governance.emergencyExecute(proposalId);
    }

    function test_EmergencyExecute_RevertIfProposalIdZero() public {
        vm.expectRevert("Governance: proposal does not exist");
        governance.emergencyExecute(0);
    }

    function test_EmergencyExecute_RevertIfAlreadyExecuted() public {
        uint256 proposalId = governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            "",
            0,
            0
        );
        
        governance.emergencyExecute(proposalId);
        
        vm.expectRevert("Governance: already executed");
        governance.emergencyExecute(proposalId);
    }

    function test_Receive() public {
        uint256 balanceBefore = address(governance).balance;
        
        payable(address(governance)).transfer(1 ether);
        
        assertEq(address(governance).balance, balanceBefore + 1 ether);
    }

    function test_ExecuteProposal_WithValue() public {
        // Send ETH to governance contract
        payable(address(governance)).transfer(1 ether);
        
        uint256 proposalId = governance.createProposal(
            "Test",
            "Test",
            address(mockTarget),
            "",
            0.5 ether,
            0
        );
        
        // Vote to reach quorum
        vm.prank(voter1);
        governance.vote(proposalId, true);
        vm.prank(voter2);
        governance.vote(proposalId, true);
        vm.prank(voter3);
        governance.vote(proposalId, true);
        
        // Fast forward past expiry
        vm.warp(block.timestamp + governance.votingPeriod() + 1);
        
        uint256 targetBalanceBefore = address(mockTarget).balance;
        governance.executeProposal(proposalId);
        
        assertEq(address(mockTarget).balance, targetBalanceBefore + 0.5 ether);
    }
}