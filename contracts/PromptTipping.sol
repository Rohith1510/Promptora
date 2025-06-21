// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PromptTipping is ReentrancyGuard, Ownable {
    struct Tip {
        string promptId;
        address from;
        address creator;
        uint256 amount;
        uint256 timestamp;
    }
    
    mapping(string => Tip[]) public promptTips;
    mapping(address => uint256) public creatorEarnings;
    mapping(string => uint256) public promptTotalTips;
    
    uint256 public totalTipsReceived;
    uint256 public platformFee = 250; // 2.5% in basis points
    uint256 public constant BASIS_POINTS = 10000;
    
    event TipReceived(
        string indexed promptId,
        address indexed from,
        address indexed creator,
        uint256 amount,
        uint256 timestamp
    );
    
    event CreatorWithdrawn(address indexed creator, uint256 amount);
    event PlatformFeeUpdated(uint256 newFee);
    
    constructor() Ownable(msg.sender) {}
    
    function tipPrompt(
        string memory promptId,
        address creator
    ) external payable nonReentrant {
        require(msg.value > 0, "Tip amount must be greater than 0");
        require(creator != address(0), "Invalid creator address");
        require(creator != msg.sender, "Cannot tip yourself");
        
        uint256 platformFeeAmount = (msg.value * platformFee) / BASIS_POINTS;
        uint256 creatorAmount = msg.value - platformFeeAmount;
        
        // Store tip data
        Tip memory newTip = Tip({
            promptId: promptId,
            from: msg.sender,
            creator: creator,
            amount: creatorAmount,
            timestamp: block.timestamp
        });
        
        promptTips[promptId].push(newTip);
        creatorEarnings[creator] += creatorAmount;
        promptTotalTips[promptId] += creatorAmount;
        totalTipsReceived += msg.value;
        
        // Transfer ETH to creator
        (bool success, ) = creator.call{value: creatorAmount}("");
        require(success, "Failed to transfer tip to creator");
        
        emit TipReceived(promptId, msg.sender, creator, creatorAmount, block.timestamp);
    }
    
    function getPromptTips(string memory promptId) external view returns (Tip[] memory) {
        return promptTips[promptId];
    }
    
    function getCreatorEarnings(address creator) external view returns (uint256) {
        return creatorEarnings[creator];
    }
    
    function getPromptTotalTips(string memory promptId) external view returns (uint256) {
        return promptTotalTips[promptId];
    }
    
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%");
        platformFee = newFee;
        emit PlatformFeeUpdated(newFee);
    }
    
    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Failed to withdraw platform fees");
    }
    
    receive() external payable {
        revert("Direct payments not allowed");
    }
} 