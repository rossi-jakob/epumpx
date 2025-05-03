"use client"
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { encodeFunctionData, parseUnits, formatUnits } from "viem";
import { useAccount, useConfig } from "wagmi";

import { useRouter } from "next/navigation";

import {
  multicall,
  estimateGas,
  writeContract,
  waitForTransactionReceipt,
} from "@wagmi/core";

import { toastConfig, isValidAddress } from "../../utils/util";

import { FaGear } from "react-icons/fa6";
import Image from "next/image";
import { toast } from "react-toastify";

import { FaCopy } from "react-icons/fa";
import { BsGlobe2 } from "react-icons/bs";
import { FaTelegramPlane } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { MdOutlineSwapVert } from "react-icons/md";

import curveABI from "../../../abi/curve.json";
import erc20ABI from "../../../abi/erc20.json";
import Config from "../../config/config";

function TokenBuySell({
  tokenAddr,
  tokenInfo,
  curveInfo,
  refresh,
  setRefresh,
  tradeInfo,
  otherInfo
}: {
  tokenAddr: any;
  tokenInfo: any;
  curveInfo: any;
  refresh: any;
  setRefresh: any;
  tradeInfo: any;
  otherInfo: any;
}) {
  const account = useAccount();
  const config = useConfig();

  const router = useRouter(); 
  
  const goBack = () => {
    router.back();
  };

  const [swapToggle, setSwapToggle] = useState(false);
  const [slippage, setSlippage] = useState("0.5");
  const [deadline, setDeadline] = useState("20");
  const [openSlippageModal, setOpenSlippageModal] = useState(false);
  const [frontRunning, setFrontRunning] = useState(false);
  const [epixAmount, setEpixAmount] = useState("0");
  const [tokenAmount, setTokenAmount] = useState("0");

  const [pending, setPending] = useState(false);
  const [btnMsg, setBtnMsg] = useState("Swap");
  const [errMsg, setErrMsg] = useState("");
  const [mevProtect, setMEVProtect] = useState(false);

  useEffect(() => {
    if (pending) {
      setBtnMsg("Pending...");
      setErrMsg("Pending... Please wait a second.");
      return;
    }
  }, [pending]);

  const getAmountOutEPIX = async (inputTokenAmount : any) => {
    if (inputTokenAmount === 0 || inputTokenAmount > tokenInfo.balance) return;
    setBtnMsg("Calculating...");
    setErrMsg("Calculating... Please wait a second");
    let _epixAmount = 0;
    try {
      if (swapToggle) {
        // sell
        const contracts = [
          {
            address: Config.CURVE,
            abi: curveABI,
            functionName: "getAmountOutETH",
            args: [
              parseUnits(inputTokenAmount.toString(), Config.CURVE_DEC),
              tokenAddr,
            ],
          },
        ];
        const _data = await multicall(Config.config, { contracts } as any);
        _epixAmount =
          _data[0].status === "success"
            ? parseFloat(formatUnits((_data[0] as any).result[0], Config.WETH_DEC))
            : 0;
            
        setEpixAmount(_epixAmount > 0.000005 ? (_epixAmount - 0.000005).toFixed(5) : '0');
      }
    } catch (err) {
      console.log(err);
    }
    if (inputTokenAmount > tokenInfo.balance) {
      setBtnMsg("Insufficient funds");
      setErrMsg("Insufficient funds");
    } else {
      setBtnMsg("Swap");
      setErrMsg("");
    }
  };

  const setBtnMsgInEpixAmount = (_epixAmount: any) => {
    if (!swapToggle) {
      if (_epixAmount > tokenInfo.epixBal) {
        setBtnMsg("Insufficient funds");
        setErrMsg("Insufficient funds");
      } else if (_epixAmount === 0) {
        setBtnMsg("Enter the value");
        setErrMsg("Enter the value");
      }
    }
  };

  const setBtnMsgInBepeAmount = (_tokenAmount : any) => {
    if (swapToggle) {
      if (_tokenAmount > tokenInfo.balance) {
        setBtnMsg("Insufficient funds");
        setErrMsg("Insufficient funds");
      } else if (_tokenAmount === 0) {
        setBtnMsg("Enter the value");
        setErrMsg("Enter the value");
      }
    }
  };

  const getTokenAmountMin = async (inputEpixAmount : any) => {
    if (inputEpixAmount === 0 || inputEpixAmount > tokenInfo.epixBal) return;
    setBtnMsg("Calculating...");
    setErrMsg("Calculating... Please wait a second");
    let _tokenAmount = 0;
    let _epixAmount = 0;
    if (!swapToggle) {
      // buy
      _epixAmount = inputEpixAmount;
      const _curFunds = curveInfo?.funds >= 0 ? curveInfo?.funds : 0;
      if (_epixAmount + _curFunds > Config.CURVE_HARDCAP) {
        _epixAmount = Config.CURVE_HARDCAP - _curFunds;
      }
      const contracts = [
        {
          address: Config.CURVE,
          abi: curveABI,
          functionName: "getAmountOutToken",
          args: [
            parseUnits(_epixAmount.toString(), 18),
            tokenAddr
          ],
        },
      ];
      const _data = await multicall(Config.config, { contracts } as any);
      _tokenAmount =
        _data[0].status === "success"
          ? parseFloat(formatUnits(_data[0].result as any, Config.CURVE_DEC))
          : 0;
      setTokenAmount(_tokenAmount > 0.005 ? (_tokenAmount - 0.005).toFixed(2) : '0');
    }
    if (inputEpixAmount > tokenInfo.epixBal) {
      setBtnMsg("Insufficient funds");
      setErrMsg("Insufficient funds");
    } else {
      setBtnMsg("Swap");
      setErrMsg("");
    }
  };

  // if (Number(e.target.value) >= 0) setAmount(e.target.value)
  const handleChangeAmount = async (e : any, fromTo:boolean) => {
    if (Number(e.target.value) >= 0) {
      if (!fromTo) {
        setTokenAmount(e.target.value);
        getAmountOutEPIX(Number(e.target.value));
        setBtnMsgInBepeAmount(Number(e.target.value));
      } else {
        setEpixAmount(e.target.value);
        getTokenAmountMin(Number(e.target.value));
        setBtnMsgInEpixAmount(Number(e.target.value));
      }
    } else {
      if (!fromTo) {
        setTokenAmount("0");
        setBtnMsgInBepeAmount(0);
      } else {
        setEpixAmount("0");
        setBtnMsgInEpixAmount(0);
      }
    }
  };

  const handleMax = async () => {
    if (swapToggle) {
      // sell
      setTokenAmount(tokenInfo?.balance ? tokenInfo?.balance : "0.00");
      getAmountOutEPIX(Number(tokenInfo?.balance ? tokenInfo?.balance : "0.00"));
      setBtnMsgInBepeAmount(
        Number(tokenInfo?.balance ? tokenInfo?.balance : "0.00")
      );
    } else {
      // buy
      const maxEpixVal =
        Number(tokenInfo?.epixBal ? tokenInfo?.epixBal : "0.0000") -
        Config.DEFAULT_GAS;
      if (maxEpixVal > 0) {
        const maxEpixValStr = maxEpixVal.toFixed(4);
        setEpixAmount(maxEpixValStr);
        getTokenAmountMin(Number(maxEpixValStr));
        setBtnMsgInEpixAmount(Number(maxEpixValStr));
      }
    }
  };

  const handleSwap = async () => {
    if (curveInfo?.status !== 0) {
      window?.open(`https://app.uniswap.org/swap?inputCurrency=ETH&outputCurrency=${curveInfo?.token}&chain=base`)
      return
    }
    if (curveInfo?.status === undefined || Number(curveInfo?.status) !== 0) {
      toast.warn("Curve is inactive.", toastConfig as any);
      return;
    }
    if (!account.isConnected || !account.address || !account.connector) {
      toast.warn("Please connect wallet!", toastConfig as any);
      return;
    }
    if (account.chainId !== Config.CHAIN.id) {
      toast.warn("Wrong Network, Please switch to Base Mainnet!", toastConfig as any);
      return;
    }
    if (pending) {
      toast.warn("Please wait for pending..", toastConfig as any);
      return;
    }
    if (errMsg && errMsg.length > 0) {
      toast.warn(errMsg, toastConfig as any);
      return;
    }
    
    setPending(true);
    try {
      const _deadline = Math.floor(Date.now() / 1000) + Number(deadline) * 60;      
      let data = {};
      if (!swapToggle) {        
        
        if (Number(epixAmount) <= 0) {
          setPending(false);
          toast.warn(
            `Please input ETH amount to buy ${curveInfo?.symbol ? curveInfo?.symbol : "token"
            }!`,
            toastConfig as any
          );
          return;
        }
        const requiredEpixBal = Number(epixAmount) * (1 + Config.CURVE_SWAP_FEE);
        const tokenMin = (Number(tokenAmount) * (100 - parseFloat(slippage))) / 100;

        const referrer = window.localStorage.getItem("alpha_ref");
        data = {
          address: Config.CURVE,
          abi: curveABI,
          functionName: "buy",
          args: [
            tokenAddr,
            parseUnits(tokenMin.toFixed(8), Config.CURVE_DEC),
            _deadline,
            isValidAddress(referrer) ? referrer : "0x0000000000000000000000000000000000000000"
          ],
          value: parseUnits(requiredEpixBal.toFixed(8), Config.WETH_DEC),
        };
        const encodedData = encodeFunctionData(data as any);
        await estimateGas(config, {
          ...account,
          data: encodedData,
          to: (data as any).address,
          value: (data as any).value,
        });

        const txHash = await writeContract(config, {
          ...account,
          ...data,
        } as any);

        const txPendingData = waitForTransactionReceipt(config, {
          hash: txHash,
        });
        toast.promise(
          txPendingData,
          {
            pending: "Waiting for pending... 👌",
          },
          toastConfig as any
        );

        const txData = await txPendingData;
        if (txData && txData.status === "success") {
          setEpixAmount("0");
          setTokenAmount("0");
          toast.success(`Successfully swapped token! 👍`, toastConfig as any);
          setRefresh(!refresh);
        } else {
          toast.error("Error! Transaction is failed.", toastConfig as any);
        }
      } else {
        if (Number(tokenAmount) <= 0) {
          setPending(false);
          toast.warn(
            `Please input ${curveInfo?.symbol ? curveInfo?.symbol : "token"
            } amount to sell!`,
            toastConfig as any
          );
          return;
        }
        const _data = await multicall(Config.config, {
          contracts: [
            {
              address: tokenAddr,
              abi: erc20ABI as any,
              functionName: "allowance",
              args: [
                account.address,
                Config.CURVE
              ],
            },
          ],
        });
        const allowance =
          _data[0].status === "success"
            ? parseFloat(formatUnits((_data[0] as any).result, Config.CURVE_DEC))
            : 0;

        let encodedData;
        let txHash;
        let txPendingData;
        let txData;
        if (allowance < Number(tokenAmount)) {
          data = {
            address: tokenAddr,
            abi: erc20ABI,
            functionName: "approve",
            args: [
              Config.CURVE,
              Config.MAX_UINT256
            ],
            value: 0,
          };
          encodedData = encodeFunctionData(data as any);
          await estimateGas(config, {
            ...account,
            data: encodedData,
            to: (data as any).address,
            value: (data as any).value,
          });
          txHash = await writeContract(config, {
            ...account,
            ...data,
          } as any);

          txPendingData = waitForTransactionReceipt(config, {
            hash: txHash,
          });
          toast.promise(
            txPendingData,
            {
              pending: "Waiting for pending... 👌",
            },
            toastConfig as any
          );

          txData = await txPendingData;
          if (txData && txData.status === "success") {
            toast.success(`Successfully enabled token! 👍`, toastConfig as any);
          } else {
            setPending(false);
            toast.error("Error! Transaction is failed.", toastConfig as any);
            return;
          }
        }

        const epixMin = (Number(epixAmount) * (100 - parseFloat(slippage))) / 100;
        data = {
          address: Config.CURVE,
          abi: curveABI,
          functionName: "sell",
          args: [
            tokenAddr,
            parseUnits(Number(tokenAmount).toFixed(8), Config.CURVE_DEC),
            parseUnits(epixMin.toFixed(8), Config.WETH_DEC),
            _deadline,
          ],
        };
        encodedData = encodeFunctionData(data as any);
        await estimateGas(config, {
          ...account,
          data: encodedData,
          to: (data as any).address,
        });
        txHash = await writeContract(config, {
          ...account,
          ...data,
        } as any);

        txPendingData = waitForTransactionReceipt(config, {
          hash: txHash,
        });
        toast.promise(
          txPendingData,
          {
            pending: "Waiting for pending... 👌",
          },
          toastConfig as any
        );

        txData = await txPendingData;
        if (txData && txData.status === "success") {
          setEpixAmount("0");
          setTokenAmount("0");
          setRefresh(!refresh);
          toast.success(`Successfully swapped token! 👍`, toastConfig as any);
        } else {
          toast.error("Error! Transaction is failed.", toastConfig as any);
        }
      }
    } catch (err) {
      console.log(err);
      toast.error("Error! Something went wrong.", toastConfig as any);
    }
    setPending(false);
    setBtnMsg("Swap");
    setErrMsg("");
  };

  useEffect(() => {
    // const script = document.createElement("script");
    // script.src = "/charting_library/charting_library.js";
    // script.type = "text/javascript";
    // script.async = true;
    // container.current.appendChild(script);
  }, []);

  return (
    <div className="bg-[#161616] rounded-4xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Label className="text-white font-bold">MEV Protection?</Label>
          <button
            onClick={() => setMEVProtect(!mevProtect)}
            className={`w-12 h-6 rounded-full transition-colors relative bg-gray-700
             `}
          >
            {
              !mevProtect ? <div className={`absolute w-5 h-5 rounded-full bg-linear-to-r from-[#FDD700] to-[#AB9003] top-0.5 transition-transform`} /> :
                <div className={`absolute w-5 h-5 rounded-full bg-linear-to-r from-[#FDD700] to-[#AB9003] top-0.5 left-7 transition-transform`} />
            }
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {
          !swapToggle ? <Button className="font-bold text-md" onClick={() => setSwapToggle(false)}>Buy</Button> :
            <Button variant="outline" className="font-bold text-md" onClick={() => setSwapToggle(false)}>Buy</Button>
        }
        {
          !swapToggle ? <Button variant="outline" className=" text-white font0-bold text-md" onClick={() => setSwapToggle(true)}>Sell</Button> :
            <Button className=" text-white font0-bold text-md" onClick={() => setSwapToggle(true)}>Sell</Button>
        }
      </div>

      {
        !swapToggle && <div className="text-sm bg-gradient-to-r from-[#FDD700] to-[#AB9003] bg-clip-text text-transparent mb-2 flex flex-1 justify-between">
          <span>Switch to {curveInfo.name}</span>
          <span onClick={()=>handleMax()}>MAX</span>
        </div>
      }
      <div className="text-sm text-white mb-4">Balance: {!swapToggle? tokenInfo.epixBal : tokenInfo.balance} EPIX</div>

      <div className="flex items-center space-x-2 mb-4 bg-[#232321] p-3 rounded-4xl">
        {
          !swapToggle ? <img
            src="/token-icon.svg"
            className="w-6 h-6 rounded-full"
            alt="Token"
          /> :
            <img
              src={curveInfo.logo}
              className="w-6 h-6 rounded-full"
              alt="Token"
            />
        }
        <span className="text-white font-bold">{!swapToggle ? 'EPIX' : curveInfo.name}</span>
        <input className="w-full pl-4 focus:outline-none focus:border-none caret-white text-white" onChange={(e: any) => handleChangeAmount(e, !swapToggle)} value={!swapToggle? epixAmount : tokenAmount}></input>
      </div>

      <div className={`grid ${!swapToggle? "grid-cols-3" : "grid-cols-4"} gap-2 mb-6`}>
        {!swapToggle? (["0.1 EPIX", "0.5 EPIX", "1 EPIX"].map((amount) => (
          <Button
            key={amount}
            variant="ghost"
            className="bg-[#232321] text-white font-bold hover:bg-[#2C2C2C] hover:text-white cursor-pointer"
            onClick={()=>setEpixAmount(amount.split(" ")[0])}
          >
            {amount}
          </Button>
        ))) : (["25%", "50%", "75%", "100%"].map((amount) => (
          <Button
            key={amount}
            variant="ghost"
            className="bg-[#232321] text-white font-bold hover:bg-[#2C2C2C] hover:text-white cursor-pointer"
            onClick={()=>setTokenAmount((Number(amount.slice(0, -1))*tokenInfo.balance / 100).toString())}
          >
            {amount}
          </Button>
        )))}
      </div>

      <Button className="w-full bg-yellow-500 text-md hover:bg-yellow-400 font-bold" onClick={handleSwap}>
        Trade
      </Button>
      <span className="text-white mt-5 px-2 block text-sm font-bold">
        There are <b className="text-md">799,923,555.0 Shahid</b> still
        available for sale in the bonding curve and there is{" "}
        <b className="text-md">0.000585 EPIX </b>(
        <b className="text-md">Raised amount: 0 EPIX</b>)in the bonding curve.
        When the market cap reaches <b className="text-md">$72,895.20</b> all
        the liquidity from the bonding curve will be deposited into PancakeSwap
        and locked. Progression increases as the price goes up.
      </span>
    </div>
  );
};

export default memo(TokenBuySell);