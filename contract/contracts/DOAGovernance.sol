// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title DAOGovernance - On-chain governance with real voting mechanism
contract DAOGovernance is Ownable, ReentrancyGuard {
    // Events
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

    // Structs
    struct Proposal {
        uint256 id;
        address creator;
        string title;
        string description;
        address target;
        bytes data;
        uint256 value;
        uint256 expiryTime;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        bool expired;
        mapping(address => bool) hasVoted;
        mapping(address => Vote) votes;
    }

    struct Vote {
        bool support;
        uint256 weight;
        uint256 timestamp;
    }

    // State variables
    uint256 private _proposalIds = 0;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => bool) public isVoter;
    uint256 public quorum = 3; // Minimum 3 votes required
    uint256 public votingPeriod = 7 days; // Default voting period
    uint256 public proposalThreshold = 1; // Minimum proposals to create

    // Modifiers
    modifier onlyVoter() {
        require(isVoter[msg.sender], "Governance: caller is not a voter");
        _;
    }

    modifier proposalExists(uint256 proposalId) {
        require(proposalId <= _proposalIds && proposalId > 0, "Governance: proposal does not exist");
        _;
    }

    modifier proposalActive(uint256 proposalId) {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Governance: proposal already executed");
        require(!proposal.expired, "Governance: proposal already expired");
        require(block.timestamp < proposal.expiryTime, "Governance: proposal expired");
        _;
    }

    modifier proposalNotVoted(uint256 proposalId) {
        require(!proposals[proposalId].hasVoted[msg.sender], "Governance: already voted");
        _;
    }

    constructor() Ownable(msg.sender) {
        // Add deployer as initial voter
        isVoter[msg.sender] = true;
    }

    // Governance functions
    function addVoter(address voter) external onlyOwner {
        require(voter != address(0), "Governance: invalid voter address");
        isVoter[voter] = true;
    }

    function removeVoter(address voter) external onlyOwner {
        require(voter != owner(), "Governance: cannot remove owner");
        isVoter[voter] = false;
    }

    function setQuorum(uint256 newQuorum) external onlyOwner {
        require(newQuorum > 0, "Governance: quorum must be greater than 0");
        quorum = newQuorum;
        emit QuorumUpdated(newQuorum);
    }

    function setVotingPeriod(uint256 newPeriod) external onlyOwner {
        require(newPeriod > 0, "Governance: voting period must be greater than 0");
        votingPeriod = newPeriod;
    }

    // Proposal functions
    function createProposal(
        string memory title,
        string memory description,
        address target,
        bytes memory data,
        uint256 value,
        uint256 customExpiryTime
    ) external onlyVoter returns (uint256) {
        require(target != address(0), "Governance: invalid target address");
        
        uint256 expiryTime = customExpiryTime > 0 ? customExpiryTime : block.timestamp + votingPeriod;
        require(expiryTime > block.timestamp, "Governance: expiry time must be in the future");

        _proposalIds++;
        uint256 proposalId = _proposalIds;

        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.creator = msg.sender;
        proposal.title = title;
        proposal.description = description;
        proposal.target = target;
        proposal.data = data;
        proposal.value = value;
        proposal.expiryTime = expiryTime;
        proposal.executed = false;
        proposal.expired = false;

        emit ProposalCreated(
            proposalId,
            msg.sender,
            title,
            description,
            target,
            data,
            value,
            expiryTime
        );

        return proposalId;
    }

    function vote(uint256 proposalId, bool support) 
        external 
        onlyVoter 
        proposalExists(proposalId) 
        proposalActive(proposalId) 
        proposalNotVoted(proposalId) 
        nonReentrant 
    {
        Proposal storage proposal = proposals[proposalId];
        
        // Check if proposal has expired
        if (block.timestamp >= proposal.expiryTime) {
            proposal.expired = true;
            emit ProposalExpired(proposalId);
            return;
        }

        proposal.hasVoted[msg.sender] = true;
        proposal.votes[msg.sender] = Vote({
            support: support,
            weight: 1, // Each voter has weight 1
            timestamp: block.timestamp
        });

        if (support) {
            proposal.forVotes += 1;
        } else {
            proposal.againstVotes += 1;
        }

        emit VoteCast(proposalId, msg.sender, support, 1);
    }

    function executeProposal(uint256 proposalId) 
        external 
        onlyVoter 
        proposalExists(proposalId) 
        nonReentrant 
    {
        Proposal storage proposal = proposals[proposalId];
        
        require(!proposal.executed, "Governance: proposal already executed");
        require(!proposal.expired, "Governance: proposal already expired");
        require(block.timestamp >= proposal.expiryTime, "Governance: proposal not expired yet");
        require(proposal.forVotes >= quorum, "Governance: quorum not reached");
        require(proposal.forVotes > proposal.againstVotes, "Governance: proposal not passed");

        proposal.executed = true;

        // Execute the proposal
        (bool success, bytes memory result) = proposal.target.call{value: proposal.value}(proposal.data);
        require(success, "Governance: execution failed");

        emit ProposalExecuted(proposalId, msg.sender, result);
    }

    function expireProposal(uint256 proposalId) 
        external 
        onlyVoter 
        proposalExists(proposalId) 
    {
        Proposal storage proposal = proposals[proposalId];
        
        require(!proposal.executed, "Governance: proposal already executed");
        require(!proposal.expired, "Governance: proposal already expired");
        require(block.timestamp >= proposal.expiryTime, "Governance: proposal not expired yet");

        proposal.expired = true;
        emit ProposalExpired(proposalId);
    }

    // View functions
    function getProposal(uint256 proposalId) 
        external 
        view 
        proposalExists(proposalId) 
        returns (
            uint256 id,
            address creator,
            string memory title,
            string memory description,
            address target,
            bytes memory data,
            uint256 value,
            uint256 expiryTime,
            uint256 forVotes,
            uint256 againstVotes,
            bool executed,
            bool expired
        ) 
    {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.id,
            proposal.creator,
            proposal.title,
            proposal.description,
            proposal.target,
            proposal.data,
            proposal.value,
            proposal.expiryTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.executed,
            proposal.expired
        );
    }

    function getProposalBasic(uint256 proposalId) 
        external 
        view 
        proposalExists(proposalId) 
        returns (
            uint256 id,
            address creator,
            string memory title,
            string memory description,
            address target,
            bytes memory data,
            uint256 value,
            uint256 expiryTime
        ) 
    {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.id,
            proposal.creator,
            proposal.title,
            proposal.description,
            proposal.target,
            proposal.data,
            proposal.value,
            proposal.expiryTime
        );
    }

    function getProposalVotes(uint256 proposalId) 
        external 
        view 
        proposalExists(proposalId) 
        returns (
            uint256 forVotes,
            uint256 againstVotes
        ) 
    {
        Proposal storage proposal = proposals[proposalId];
        return (proposal.forVotes, proposal.againstVotes);
    }

    function getProposalStatus(uint256 proposalId) 
        external 
        view 
        proposalExists(proposalId) 
        returns (
            bool executed,
            bool expired
        ) 
    {
        Proposal storage proposal = proposals[proposalId];
        return (proposal.executed, proposal.expired);
    }

    function getVote(uint256 proposalId, address voter) 
        external 
        view 
        proposalExists(proposalId) 
        returns (bool support, uint256 weight, uint256 timestamp) 
    {
        Vote memory voterVote = proposals[proposalId].votes[voter];
        return (voterVote.support, voterVote.weight, voterVote.timestamp);
    }

    function hasVoted(uint256 proposalId, address voter) 
        external 
        view 
        proposalExists(proposalId) 
        returns (bool) 
    {
        return proposals[proposalId].hasVoted[voter];
    }

    function canExecute(uint256 proposalId) 
        external 
        view 
        proposalExists(proposalId) 
        returns (bool) 
    {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.executed || proposal.expired) {
            return false;
        }
        
        if (block.timestamp < proposal.expiryTime) {
            return false;
        }
        
        if (proposal.forVotes < quorum) {
            return false;
        }
        
        if (proposal.forVotes <= proposal.againstVotes) {
            return false;
        }
        
        return true;
    }

    function getProposalState(uint256 proposalId) 
        external 
        view 
        proposalExists(proposalId) 
        returns (string memory) 
    {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.executed) {
            return "Executed";
        }
        
        if (proposal.expired) {
            return "Expired";
        }
        
        if (block.timestamp >= proposal.expiryTime) {
            return "Expired";
        }
        
        if (proposal.forVotes >= quorum && proposal.forVotes > proposal.againstVotes) {
            return "Passed";
        }
        
        if (proposal.forVotes + proposal.againstVotes > 0) {
            return "Active";
        }
        
        return "Pending";
    }

    function getTotalProposals() external view returns (uint256) {
        return _proposalIds;
    }

    // Emergency functions
    function emergencyExecute(uint256 proposalId) external onlyOwner proposalExists(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Governance: already executed");
        
        proposal.executed = true;
        (bool success, bytes memory result) = proposal.target.call{value: proposal.value}(proposal.data);
        require(success, "Governance: execution failed");
        
        emit ProposalExecuted(proposalId, msg.sender, result);
    }

    // Receive function
    receive() external payable {}
} 
