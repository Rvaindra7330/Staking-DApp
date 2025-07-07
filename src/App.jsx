import { useState, useEffect } from "react";
import { ethers } from "ethers";
import StakingABI from "./abis/Staking.json";
import TokenABI from "./abis/Token.json";
import "./App.css";

const STAKING_ADDRESS = "0xc0ac67ed075bCa3355574D4b7121063815464FF9"; 
const TOKEN_ADDRESS = "0xd944Ea2D846b8d1219f7be9cF64b78220edc8a2c";

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [stakingContract, setStakingContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [pendingRewards, setPendingRewards] = useState("0");
  const [stakedAmount, setStakedAmount] = useState("0");
  const [isPaused, setIsPaused] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();
      const staking = new ethers.Contract(STAKING_ADDRESS, StakingABI, signer);
      const token = new ethers.Contract(TOKEN_ADDRESS, TokenABI, signer);
      setProvider(provider);
      setSigner(signer);
      setAccount(account);
      setStakingContract(staking);
      setTokenContract(token);
    } else {
      alert("Please install MetaMask!");
    }
  };

  const fetchData = async () => {
    if (stakingContract && account) {
      const stake = await stakingContract.stakes(account);
      const rewards = await stakingContract.getPendingRewards(account);
      const paused = await stakingContract.paused();
      setStakedAmount(ethers.formatEther(stake.amount));
      setPendingRewards(ethers.formatEther(rewards));
      setIsPaused(paused);
    }
  };

  const stakeTokens = async () => {
    try {
      if (!stakeAmount || !stakingContract || !tokenContract) return;
      const amount = ethers.parseEther(stakeAmount);
      await tokenContract.approve(STAKING_ADDRESS, amount);
      await stakingContract.stake(amount);
      setStakeAmount("");
      await fetchData();
    } catch (error) {
      console.error("Stake error:", error);
      alert("Error staking: " + error.message);
    }
  };

  const withdrawTokens = async () => {
    try {
      if (!withdrawAmount || !stakingContract) return;
      const amount = ethers.parseEther(withdrawAmount);
      await stakingContract.withdraw(amount);
      setWithdrawAmount("");
      await fetchData();
    } catch (error) {
      console.error("Withdraw error:", error);
      alert("Error withdrawing: " + error.message);
    }
  };

  const claimRewards = async () => {
    try {
      if (!stakingContract) return;
      await stakingContract.claimRewards();
      await fetchData();
    } catch (error) {
      console.error("Claim error:", error);
      alert("Error claiming rewards: " + error.message);
    }
  };

  const pauseContract = async () => {
    try {
      if (!stakingContract) return;
      await stakingContract.pause();
      await fetchData();
    } catch (error) {
      console.error("Pause error:", error);
      alert("Error pausing: " + error.message);
    }
  };

  const unpauseContract = async () => {
    try {
      if (!stakingContract) return;
      await stakingContract.unpause();
      await fetchData();
    } catch (error) {
      console.error("Unpause error:", error);
      alert("Error unpausing: " + error.message);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        connectWallet();
      });
    }
    fetchData();
  }, [stakingContract, account]);

  return (
    <div className="flex justify-between mt-5">
      <div className="text-center text-2xl font-bold">DMN Staking DApp</div>
      {!account ? (
        <button  type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <div>
          <p>Connected: {account}</p>
          <p>Staked Amount: {stakedAmount} DMN</p>
          <p>Pending Rewards: {pendingRewards} DMN</p>
          <p>Contract Paused: {isPaused ? "Yes" : "No"}</p>

          <div className="mt-3">
            <h3>Stake DMN</h3>
            <input
              type="number"
              className="form-control"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="Amount to stake"
            />
            <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"  onClick={stakeTokens}>
              Stake
            </button>
          </div>

          <div className="mt-3">
            <h3 className="font-bold"> Withdraw DMN</h3>
            <input
              type="number"
              className="form-control"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Amount to withdraw"
            />
            <button  type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" onClick={withdrawTokens}>
              Withdraw
            </button>
          </div>

          <div className="mt-3">
            <h3>Claim Rewards</h3>
            <button  type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" onClick={claimRewards}>
              Claim Rewards
            </button>
          </div>

          <div className="mt-3">
            <h3 className="font-bold">Admin Controls</h3>
            <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"  onClick={pauseContract}>
              Pause
            </button>
            <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"  onClick={unpauseContract}>
              Unpause
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;