import { useState, useEffect } from "react";
import { ethers } from "ethers";
import StakingABI from "./abis/Staking.json";
import TokenABI from "./abis/Token.json";
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loader } from "./components/Loader";

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
  const [isLoading,setIsLoading] = useState(false);
  const [isStakeLoading,setIsStakeLoading] = useState(false);
  const [isWithdrawLoading,setIsWithdrawLoading] = useState(false);
 const [isClaimLoading,setIsClaimLoading] = useState(false);
  const [isPauseLoading,setIsPauseLoading] = useState(false);
   const [isUnpauseLoading,setIsUnpauseLoading] = useState(false);
  const connectWallet = async () => {
    console.log("inside wallet")
    if (window.ethereum) {
      setIsLoading(true)
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
      setIsLoading(false)
      toast.success("Connected to the account");
    } else {
      alert("Please install MetaMask!");
      setIsLoading(false)
    }
  };

  const fetchData = async () => {
    if (stakingContract && account) {
      const stake = await stakingContract.stakes(account);
      const rewards = await stakingContract.getPendingRewards(account);
      const paused = await stakingContract.paused();
      console.log("paused", paused);
      setStakedAmount(ethers.formatEther(stake.amount));
      setPendingRewards(ethers.formatEther(rewards));
      
    }
  };

  const stakeTokens = async () => {
    try {
      if (!stakeAmount || !stakingContract || !tokenContract) return;
      const amount = ethers.parseEther(stakeAmount);
      const apprTx= await tokenContract.approve(STAKING_ADDRESS, amount);
      await apprTx.wait();
      const stakeTx = await stakingContract.stake(amount);
      setIsStakeLoading(true)
      await stakeTx.wait();
      setIsStakeLoading(false)
      setStakeAmount("");
      toast.success("staked"`${stakeAmount}`)
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
     const tx= await stakingContract.withdraw(amount);
     setIsWithdrawLoading(true);
     await tx.wait();
     setIsWithdrawLoading(false)
      setWithdrawAmount("");
      await fetchData();
      toast.success("withdraw successful");
    } catch (error) {
      console.error("Withdraw error:", error);
      alert("Error withdrawing: " + error.message);
    }
  };

  const claimRewards = async () => {
    try {
      setIsLoading(true)
      if (!stakingContract) return;
      const tx = await stakingContract.claimRewards();
      setIsClaimLoading(true);
      await tx.wait();
      toast.success("successfully claimed!");
      setIsClaimLoading(false)
      setIsLoading(false)
      await fetchData();
    } catch (error) {
      console.error("Claim error:", error);
      alert("Error claiming rewards: " + error.message);
    }
  };

  const pauseContract = async () => {
    try {
      
      if (!stakingContract) return;
      const tx=await stakingContract.pause(); 
      setIsPauseLoading(true)
      await tx.wait()
      toast.success("Contract paused!");
      setIsPauseLoading(false)
      setIsPaused(true)
      await fetchData();
    } catch (error) {
      console.error("Pause error:", error);
      alert("Error pausing: " + error.message);
    }
  };

  const unpauseContract = async () => {
    try {
      if (!stakingContract) return;
     const tx=await stakingContract.unpause();
     setIsUnpauseLoading(true)
     await tx.wait();
     toast.success("Contract Unpaused!");
     setIsUnpauseLoading(false)
      setIsPaused(false)
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
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      {!account?
       <div className="flex flex-col justify-center h-screen items-center bg-slate-200">
        <button type="button" onClick={connectWallet} className="text-white text-xl font-bold font-serif bg-slate-500 hover:bg-slate-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
           {isLoading ? (
       <Loader text="connecting.."></Loader>
      ) : (
      "connect wallet"
      )}</button>
      </div>: 
      <div className="bg-slate-700 h-screen grid grid-cols-12">
        <div className="col-span-6 ">
              <div className="flex flex-col justify-center items-center h-screen text-xl text-white font-bold">
                <div className="items-start">
                  <div>
                     Account: {account}
                </div>
                 <div>
                    Staked Amount: {stakedAmount}
                </div>
                   <div>
                    Pending Rewards: {pendingRewards}
                </div>
                 <div>
                  Contract Paused:{isPaused?" YES":" NO"}
                </div>
                </div>
                 
              </div>
      </div>
      <div className="col-span-6 flex flex-col justify-center items-center ">
        <div className="text-center text-white text-2xl font-serif font-bold pt-3 mb-4">
        Stake DMN at 10% APY !!
      </div>
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col items-start">
          <div className=" flex justify-between">
          <input type="text" value={stakeAmount} onChange={(e)=>{setStakeAmount(e.target.value)}} className="bg-gray-50 border w-xs outline-none border-gray-300 text-gray-900 text-sm rounded-lg p-2.5" placeholder="Enter DMN" required />
          <button type="button"  onClick={stakeTokens} className="text-white ml-2 bg-blue-700 hover:bg-blue-800 focus:ring-4  font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
           {isStakeLoading ? (
        <Loader text="staking.."></Loader>
      ) : (
      "stake"
      )}
          </button>
        </div>
        <div className="flex justify-between mt-3 mb-5">
          <input type="text" value={withdrawAmount} onChange={(e)=>{setWithdrawAmount(e.target.value)}} className="bg-gray-50 border w-xs outline-none border-gray-300 text-gray-900 text-sm rounded-lg p-2.5" placeholder="Enter DMN to withdraw" required />
          <button type="button" onClick={withdrawTokens} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4  font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ml-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
            {isWithdrawLoading ? (
        <Loader text="withdrawing.."></Loader>
      ) : (
      "withdraw"
      )}
          </button>
        </div>
        </div>
        <button type="button" onClick={claimRewards} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4  font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ml-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
             {isClaimLoading ? (
       <Loader text="claiming.."></Loader>
      ) : (
      "claiming rewards"
      )}
          </button>
          <span>
            <button type="button" title={isPaused ? "Already paused" : "click to pause the contract"} disabled={isPaused} onClick={pauseContract} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4  font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ml-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
             {isPauseLoading ? (
        <Loader text="pausing.."/>
      ) : (
      "pause"
      )}
          </button>
           <button type="button" title={!isPaused ? "Already Unpaused" : "click to unpause the contract"} disabled={!isPaused} onClick={unpauseContract} className="text-white bg-blue-700  hover:bg-blue-800 focus:ring-4  font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ml-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
             {isUnpauseLoading ? (
        <Loader text="unpausing.."></Loader>
      ) : (
      "unpause"
      )}
          </button>
          </span>
          
      </div>
      </div>
      </div>

      }
      
    </div>

  );
}

export default App;