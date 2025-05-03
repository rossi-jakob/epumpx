import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAccount, useBalance } from "wagmi";
import { X } from "lucide-react";
import Spinner from "@/components/ui/spinner";

const CreateTokenDailog = ({
  isOpen,
  setIsOpen,
  setAmount,
  handleFirstBuy,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setAmount: React.Dispatch<React.SetStateAction<number>>;
  handleFirstBuy: Function
}) => {

  const { address, isConnected } = useAccount();
  const { data, isLoading, isError } = useBalance({
    address: isConnected ? address : undefined,
    chainId: 1917
  });

  console.log("useBalance hook==========", data, isError, isConnected)

  const [tokenCreated, setTokenCreated] = useState(false)
  const handleCreateToken = () => {
    setTokenCreated(false)
    handleFirstBuy()
    setTokenCreated(true);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-[#191C2F] border-gray-700 text-white max-w-md rounded-4xl">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader>
          <DialogTitle className="text-md font-bold bg-gradient-to-r from-[#0CA1B7] to-[#AB9003] bg-clip-text text-transparent">
            Launch with Buy
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            It is optional but buying a small amount of coins helps protect your
            coin from snipers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">
              Enter {data?.symbol} amount (optional):
            </label>
            <div className="text-xs text-gray-400">Balance: {Number(data?.formatted).toFixed(3)} {data?.symbol}</div>
            <div className="relative">
              <Input
                type="number" // changed from number
                placeholder={`Amount of ${data?.symbol}`}
                //value={amount}
                onChange={(e: any) => setAmount(e.target.value)}
                className="w-full bg-[#22221D87]/53 border border-gray-400 rounded-full px-4 py-3 text-white focus:border-yellow-400 h-8 select-text cursor-text"
              />
              <div className="absolute inset-y-0 right-3 flex items-center">
                <span className="text-gray-400 flex items-center">
                  {data?.symbol}
                  <img
                    src="/token-icon.svg"
                    className="w-4 h-4 ml-1"
                    alt="EPIX"
                  />
                </span>
              </div>
            </div>
          </div>
          {
            tokenCreated && <Spinner />
          }
          <Button className="w-full font-bold text-md" onClick={() => handleCreateToken()}>Create Token</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTokenDailog;
