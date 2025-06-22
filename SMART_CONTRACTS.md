# Smart Contracts for Promptora

This document explains how to deploy and use the smart contracts for tipping and voting functionality in Promptora.

## Contracts Overview

### 1. PromptTipping.sol
Handles tipping functionality where users can send ETH to prompt creators.

**Key Features:**
- Users can tip prompt creators with ETH
- Platform takes a 2.5% fee on all tips
- Creators receive tips directly to their wallet
- Tracks total earnings per creator and per prompt

**Main Functions:**
- `tipPrompt(string promptId, address creator)` - Send a tip to a creator
- `getCreatorEarnings(address creator)` - Get total earnings for a creator
- `getPromptTotalTips(string promptId)` - Get total tips for a specific prompt

### 2. PromptVoting.sol
Handles voting functionality with ZK-proof integration capabilities.

**Key Features:**
- Users can upvote prompts
- Prevents double voting on the same prompt
- Includes ZK-proof parameter for future privacy features
- Rewards voters with small amounts of ETH

**Main Functions:**
- `votePrompt(string promptId, bool isUpvote, bytes32 zkProof)` - Vote on a prompt
- `getPromptStats(string promptId)` - Get voting statistics for a prompt
- `hasVoted(string promptId, address voter)` - Check if user has voted

### 3. PromptPass.sol
ERC-1155 token for premium content access.

**Key Features:**
- NFT-based access control for premium prompts
- Limited supply (10,000 tokens)
- One token per wallet

**Main Functions:**
- `mintPromptPass()` - Mint a prompt pass NFT
- `hasPromptPass(address user)` - Check if user has access

## Deployment Instructions

### Prerequisites
1. Install Hardhat:
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

2. Initialize Hardhat:
```bash
npx hardhat init
```

3. Configure your network in `hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    // For local development
    hardhat: {},
    
    // For testnet deployment
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [process.env.PRIVATE_KEY]
    },
    
    // For mainnet deployment
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

### Deploy Contracts

1. Add your private key and Infura project ID to `.env`:
```
PRIVATE_KEY=your_wallet_private_key
INFURA_PROJECT_ID=your_infura_project_id
```

2. Deploy to testnet:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

3. Deploy to mainnet:
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

### Update Environment Variables

After deployment, update your `.env` file with the contract addresses:

```env
NEXT_PUBLIC_PROMPT_TIPPING_ADDRESS=0x...
NEXT_PUBLIC_PROMPT_VOTING_ADDRESS=0x...
NEXT_PUBLIC_PROMPT_PASS_ADDRESS=0x...
```

## Usage in Frontend

### Tipping a Creator

```typescript
import { tipPrompt } from '../utils/contracts'

// Tip a creator
const tx = await tipPrompt(
  "prompt_123", 
  "0xCreatorAddress", 
  "0.001" // Amount in ETH
)
console.log("Tip sent:", tx)
```

### Voting on a Prompt

```typescript
import { votePrompt } from '../utils/contracts'

// Vote on a prompt
const tx = await votePrompt("prompt_123", true) // true for upvote
console.log("Vote submitted:", tx)
```

### Checking Creator Earnings

```typescript
import { getCreatorEarnings, formatEth } from '../utils/contracts'

// Get creator's total earnings
const earnings = await getCreatorEarnings("0xCreatorAddress")
const earningsEth = formatEth(earnings)
console.log("Creator earnings:", earningsEth, "ETH")
```

### Premium Content Access

```typescript
import { hasPromptPass } from '../utils/contracts'

// Check if user has premium access
const hasAccess = await hasPromptPass("0xUserAddress")
if (hasAccess) {
  // Show premium content
}
```

## Contract Security Features

### Reentrancy Protection
All contracts use OpenZeppelin's `ReentrancyGuard` to prevent reentrancy attacks.

### Access Control
- `PromptTipping` and `PromptVoting` use `Ownable` for admin functions
- `PromptPass` uses `AccessControl` for minting permissions

### Input Validation
- All functions validate input parameters
- Address validation prevents zero-address usage
- Amount validation ensures positive values

## Gas Optimization

### Tips for Gas Efficiency:
1. Use `uint256` for amounts (no overflow in Solidity 0.8+)
2. Pack structs efficiently
3. Use events for off-chain data
4. Batch operations where possible

### Estimated Gas Costs:
- `tipPrompt`: ~50,000 gas
- `votePrompt`: ~30,000 gas
- `mintPromptPass`: ~80,000 gas

## Testing

### Run Tests:
```bash
npx hardhat test
```

### Test Coverage:
```bash
npx hardhat coverage
```

## Monitoring and Analytics

### Events to Monitor:
- `TipReceived` - Track all tips
- `VoteCast` - Track all votes
- `PromptPassMinted` - Track NFT mints

### Example Event Listener:
```typescript
contract.on("TipReceived", (promptId, from, creator, amount, timestamp) => {
  console.log(`Tip received: ${amount} ETH from ${from} to ${creator}`)
})
```

## Future Enhancements

### Planned Features:
1. **ZK-Proof Integration**: Implement real zero-knowledge proofs for private voting
2. **Batch Operations**: Allow multiple votes/tips in single transaction
3. **Governance**: Add DAO governance for platform parameters
4. **Staking**: Implement staking mechanism for creators
5. **Curator Rewards**: Reward users who discover quality content

### Upgrade Strategy:
- Use proxy contracts for upgradeable functionality
- Implement timelock for critical parameter changes
- Multi-sig governance for admin functions

## Support

For questions or issues with the smart contracts:
1. Check the contract code comments
2. Review the test files for usage examples
3. Open an issue in the repository
4. Join the community Discord for help 