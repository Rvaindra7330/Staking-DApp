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
      {!account?
       <div className="flex flex-col justify-center h-screen items-center bg-slate-200">
        <button type="button" onClick={connectWallet} className="text-white text-xl font-bold font-serif bg-slate-500 hover:bg-slate-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
           {isLoading ? (
        <>
        <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3  text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
        </svg>
        <span className="pr-1"></span>connecting..
        </>
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
        <>
        <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3  text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
        </svg>
        <span className="pr-1"></span>staking..
        </>
      ) : (
      "stake"
      )}
          </button>
        </div>
        <div className="flex justify-between mt-3 mb-5">
          <input type="text" value={withdrawAmount} onChange={(e)=>{setWithdrawAmount(e.target.value)}} className="bg-gray-50 border w-xs outline-none border-gray-300 text-gray-900 text-sm rounded-lg p-2.5" placeholder="Enter DMN to withdraw" required />
          <button type="button" onClick={withdrawTokens} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4  font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ml-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
            {isWithdrawLoading ? (
        <>
        <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3  text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
        </svg>
        <span className="pr-1"></span>withdrawing..
        </>
      ) : (
      "withdraw"
      )}
          </button>
        </div>
        </div>
        <button type="button" onClick={claimRewards} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4  font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ml-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
             {isClaimLoading ? (
        <>
        <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3  text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
        </svg>
        <span className="pr-1"></span>claiming..
        </>
      ) : (
      "claiming rewards"
      )}
          </button>
          <span>
            <button type="button" title={isPaused ? "Already paused" : "click to pause the contract"} disabled={isPaused} onClick={pauseContract} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4  font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ml-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
             {isPauseLoading ? (
        <>
        <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3  text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
        </svg>
        <span className="pr-1"></span>pausing..
        </>
      ) : (
      "pause"
      )}
          </button>
           <button type="button" title={!isPaused ? "Already Unpaused" : "click to unpause the contract"}  onClick={unpauseContract} className="text-white bg-blue-700  hover:bg-blue-800 focus:ring-4  font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ml-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
             {isUnpauseLoading ? (
        <>
        <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3  text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
        </svg>
        <span className="pr-1"></span>unpausing..
        </>
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