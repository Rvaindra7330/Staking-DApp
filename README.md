# DMN Token Staking DApp (Sepolia Testnet)

A decentralized staking application that allows users to stake a custom **ERC-20 token (DMN)** and earn rewards through on-chain smart contract interactions. The DApp is deployed on the **Ethereum Sepolia testnet** and is designed as a **learning and demo DeFi project**.

Users can connect their wallet, stake DMN tokens, track earned rewards, and withdraw their stake securely using a simple and intuitive interface.

---

## 🚀 Features

- Wallet connection using MetaMask  
- Stake **DMN ERC-20 tokens**  
- Earn staking rewards based on stake duration/amount  
- View staked balance and pending rewards  
- Withdraw staked tokens and rewards  
- Real-time transaction status feedback  
- Clean and responsive UI  

> ⚠️ Only the **DMN token** can be staked in this DApp.

---

## 🛠 Tech Stack

- **Frontend:**  Reactjs, Tailwind CSS  
- **Web3:** ethers.js  
- **Blockchain:** Ethereum (Sepolia Testnet)  
- **Smart Contracts:** Solidity (ERC-20 Token + Staking Contract)  
- **Wallet:** MetaMask  
- **Deployment:** Vercel  

---

## 📦 Smart Contracts

- **DMN ERC-20 Token** deployed on Sepolia  
- **Staking Contract** that accepts only DMN tokens  
- Reward logic implemented directly in the staking contract  
- Frontend interacts with contracts using `ethers.js`

> ⚠️ This project uses **testnet tokens only**. No real funds are involved.

---

## 🔗 Links

- **GitHub Repository:** https://github.com/Rvaindra7330/Staking-DApp  
- **Live Demo:** https://staking-d-app-ten.vercel.app/  
- **Network:** Sepolia Testnet  

---

## 🧠 Learning Outcomes

- Understanding ERC-20 token standards
- Implementing staking and reward mechanisms
- Frontend ↔ smart contract integration
- Handling approvals, staking, and withdrawals
- Building DeFi-focused Web3 user experiences
- Working with testnet deployments

---

## ⚙️ Getting Started Locally

### Prerequisites
- Node.js (v18+ recommended)
- MetaMask browser extension
- Sepolia testnet ETH
- DMN test tokens

### Installation

```bash
git clone https://github.com/Rvaindra7330/Staking-DApp.git
cd Staking-DApp
npm install
npm run dev
