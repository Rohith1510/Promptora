# Promptora - ZK-Powered AI Prompt Marketplace

A decentralized platform where users submit, discover, and vote on AI prompts with zero-knowledge voting, NFT-gated premium access, and on-chain tipping on Base network.

## 🚀 Features

- **ZK-Powered Voting**: Sybil-resistant voting using zero-knowledge proofs
- **NFT-Gated Premium Access**: Premium prompts unlocked with PromptPass NFT
- **On-Chain Tipping**: Earn ETH directly from your prompts
- **AI Moderation**: GPT-based content moderation via Bhindi AI
- **IPFS Storage**: Decentralized image storage
- **Creator Dashboard**: Track your prompts, earnings, and activity

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Web3**: Thirdweb SDK, Ethers.js
- **Blockchain**: Base Network (Goerli testnet)
- **Storage**: IPFS, Google Sheets
- **AI**: OpenAI API (moderation)
- **ZK**: Semaphore Protocol (voting)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask or other Web3 wallet
- Thirdweb account
- OpenAI API key
- Google Cloud project (for Sheets API)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd promptora
npm install
```

### 2. Environment Setup

Copy the example environment file and fill in your values:

```bash
cp env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# Thirdweb Configuration
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id_here

# OpenAI Configuration (for Bhindi moderation)
OPENAI_API_KEY=your_openai_api_key_here

# Google Sheets Configuration (for Bhindi storage)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_google_sheet_id_here

# Discord Webhook (for Bhindi alerts)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_url_here

# Contract Addresses (replace with your deployed contracts)
NEXT_PUBLIC_PROMPT_TIPPING_CONTRACT_ADDRESS=your_tipping_contract_address_here
NEXT_PUBLIC_PROMPT_PASS_CONTRACT_ADDRESS=your_pass_contract_address_here
```

### 3. Deploy Smart Contracts

Deploy the smart contracts to Base Goerli testnet:

1. **PromptPass.sol** - ERC-1155 NFT for premium access
2. **PromptTipping.sol** - Contract for ETH tips

### 4. Setup Google Sheets

Create a Google Sheet with the following structure:

**Prompts Sheet:**
| promptId | title | prompt | wallet | imageUrl | premium | timestamp |

**Votes Sheet:**
| promptId | nullifierHash | timestamp |

**Tips Sheet:**
| promptId | fromWallet | amount | timestamp |

### 5. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see your application!

## 📖 Usage

### For Users
1. **Connect Wallet**: Use MetaMask or any Web3 wallet
2. **Explore Prompts**: Browse and search through submitted prompts
3. **Vote**: Use ZK voting to support your favorite prompts
4. **Tip Creators**: Send ETH tips to prompt creators
5. **Mint PromptPass**: Unlock premium content with NFT

### For Creators
1. **Submit Prompts**: Create and submit AI prompts with images
2. **Set Premium**: Mark prompts as premium (requires NFT)
3. **Track Earnings**: Monitor tips and engagement in dashboard
4. **Manage Content**: View all your submitted prompts

## 🔧 Configuration

### Thirdweb Setup
1. Create account at [thirdweb.com](https://thirdweb.com)
2. Get your client ID from the dashboard
3. Add to `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`

### OpenAI Setup
1. Get API key from [OpenAI](https://platform.openai.com)
2. Add to `OPENAI_API_KEY`

### Google Sheets Setup
1. Create Google Cloud project
2. Enable Google Sheets API
3. Create service account and download credentials
4. Share your Google Sheet with the service account email
5. Add credentials to environment variables

### Discord Webhook (Optional)
1. Create Discord server
2. Add webhook integration
3. Copy webhook URL to `DISCORD_WEBHOOK_URL`

## 🏗️ Project Structure

```
promptora/
├── app/
│   ├── api/                 # API routes
│   │   ├── bhindi-submit/   # Prompt submission & moderation
│   │   ├── prompts/         # Fetch prompts
│   │   └── vote/           # ZK voting
│   ├── components/         # React components
│   ├── dashboard/          # Creator dashboard
│   ├── explore/            # Explore prompts page
│   ├── submit/             # Submit prompt page
│   └── layout.tsx          # Root layout
├── contracts/              # Smart contracts
│   ├── PromptPass.sol      # ERC-1155 NFT
│   └── PromptTipping.sol   # Tipping contract
├── public/                 # Static assets
└── package.json
```

## 🔒 Security Features

- **ZK Voting**: Prevents Sybil attacks without storing wallet addresses
- **Content Moderation**: AI-powered filtering of inappropriate content
- **NFT Gating**: Secure premium content access
- **On-Chain Tips**: Transparent and secure payments

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
- Netlify
- Railway
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Create an issue on GitHub
- Join our Discord community
- Check the documentation

## 🔮 Roadmap

- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Multi-chain support
- [ ] Social features
- [ ] AI-powered prompt suggestions

---

Built with ❤️ on Base network 