// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PromptPass is ERC1155, AccessControl {
    using Counters for Counters.Counter;
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    uint256 public constant PROMPT_PASS_ID = 1;
    uint256 public constant MAX_SUPPLY = 10000;
    
    mapping(address => bool) public hasMinted;
    Counters.Counter private _tokenIds;
    
    event PromptPassMinted(address indexed to, uint256 tokenId, uint256 amount);
    
    constructor() ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
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
        return 0; // ERC1155 doesn't have totalSupply, implement if needed
    }
    
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 