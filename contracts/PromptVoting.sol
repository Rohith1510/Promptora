// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PromptVoting is ReentrancyGuard, Ownable {
    struct Vote {
        string promptId;
        address voter;
        bool isUpvote;
        uint256 timestamp;
        bytes32 zkProof; // For future ZK integration
    }
    
    struct PromptStats {
        uint256 upvotes;
        uint256 downvotes;
        uint256 totalVotes;
        mapping(address => bool) hasVoted;
    }
    
    mapping(string => PromptStats) public promptStats;
    mapping(address => uint256) public userVoteCount;
    mapping(string => Vote[]) public promptVotes;
    
    uint256 public totalVotes;
    uint256 public votingReward = 0.001 ether; // Reward for voting
    
    event VoteCast(
        string indexed promptId,
        address indexed voter,
        bool isUpvote,
        uint256 timestamp
    );
    
    event VotingRewardUpdated(uint256 newReward);
    
    constructor() Ownable(msg.sender) {}
    
    function votePrompt(
        string memory promptId,
        bool isUpvote,
        bytes32 zkProof
    ) external nonReentrant {
        require(bytes(promptId).length > 0, "Invalid prompt ID");
        require(!promptStats[promptId].hasVoted[msg.sender], "Already voted on this prompt");
        
        // Update prompt stats
        if (isUpvote) {
            promptStats[promptId].upvotes++;
        } else {
            promptStats[promptId].downvotes++;
        }
        
        promptStats[promptId].totalVotes++;
        promptStats[promptId].hasVoted[msg.sender] = true;
        
        // Store vote
        Vote memory newVote = Vote({
            promptId: promptId,
            voter: msg.sender,
            isUpvote: isUpvote,
            timestamp: block.timestamp,
            zkProof: zkProof
        });
        
        promptVotes[promptId].push(newVote);
        userVoteCount[msg.sender]++;
        totalVotes++;
        
        // Reward voter with small amount of ETH
        if (address(this).balance >= votingReward) {
            (bool success, ) = msg.sender.call{value: votingReward}("");
            if (success) {
                // Reward sent successfully
            }
        }
        
        emit VoteCast(promptId, msg.sender, isUpvote, block.timestamp);
    }
    
    function getPromptStats(string memory promptId) external view returns (
        uint256 upvotes,
        uint256 downvotes,
        uint256 totalVotes
    ) {
        PromptStats storage stats = promptStats[promptId];
        return (stats.upvotes, stats.downvotes, stats.totalVotes);
    }
    
    function hasVoted(string memory promptId, address voter) external view returns (bool) {
        return promptStats[promptId].hasVoted[voter];
    }
    
    function getPromptVotes(string memory promptId) external view returns (Vote[] memory) {
        return promptVotes[promptId];
    }
    
    function getUserVoteCount(address user) external view returns (uint256) {
        return userVoteCount[user];
    }
    
    function updateVotingReward(uint256 newReward) external onlyOwner {
        votingReward = newReward;
        emit VotingRewardUpdated(newReward);
    }
    
    function withdrawContractBalance() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Failed to withdraw balance");
    }
    
    receive() external payable {
        // Allow contract to receive ETH for voting rewards
    }
} 