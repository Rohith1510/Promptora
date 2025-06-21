// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@thirdweb-dev/contracts/base/ERC1155Base.sol";
import "@thirdweb-dev/contracts/extension/Permissions.sol";

contract PromptPass is ERC1155Base, Permissions {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    uint256 public constant PROMPT_PASS_ID = 1;
    uint256 public constant MAX_SUPPLY = 10000;
    
    mapping(address => bool) public hasMinted;
    
    event PromptPassMinted(address indexed to, uint256 tokenId, uint256 amount);
    
    constructor(
        string memory _name,
        string memory _symbol,
        address _royaltyRecipient,
        uint128 _royaltyBps
    ) ERC1155Base(_name, _symbol, _royaltyRecipient, _royaltyBps) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
    }
    
    function mintPromptPass() external {
        require(!hasMinted[msg.sender], "Already minted");
        require(totalSupply(PROMPT_PASS_ID) < MAX_SUPPLY, "Max supply reached");
        
        hasMinted[msg.sender] = true;
        _mint(msg.sender, PROMPT_PASS_ID, 1, "");
        
        emit PromptPassMinted(msg.sender, PROMPT_PASS_ID, 1);
    }
    
    function hasPromptPass(address user) external view returns (bool) {
        return balanceOf(user, PROMPT_PASS_ID) > 0;
    }
    
    function totalSupply(uint256 tokenId) public view returns (uint256) {
        return _totalSupply[tokenId];
    }
} 