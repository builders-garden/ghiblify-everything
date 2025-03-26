/* eslint-disable @typescript-eslint/no-unused-vars */
import { sdk } from "@farcaster/frame-sdk";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import ky from "ky";
import React from "react";
import {
  useAccount,
  useConnect,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";

import { Button } from "@/components/ui/button";
import { isUserRejectionError } from "@/lib/errors";
import { useFeaturedMintTransaction } from "@/lib/queries";
import { useViewer } from "@/providers/FrameContextProvider";
import { GenerateResponse } from "@/types";

interface CollectButtonProps {
  timestamp?: number;
  price: number;
  onCollect: () => void;
  onError: (error: string | undefined) => void;
  isMinting: boolean;
}

export function CollectButton({
  onCollect,
  onError,
  isMinting,
}: CollectButtonProps) {
  const { isConnected, address } = useAccount();
  const { connect } = useConnect();
  const { sendTransactionAsync, isPending: isSending } = useSendTransaction();
  const [hash, setHash] = React.useState<`0x${string}`>();
  const [isLoadingTxData, setIsLoadingTxData] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isGeneratingSuccess, setIsGeneratingSuccess] = React.useState(false);
  const { fid, pfpUrl, username } = useViewer();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const isPending = isLoadingTxData || isSending || isConfirming;

  const successHandled = React.useRef(false);

  const { fetchTransaction } = useFeaturedMintTransaction();

  React.useEffect(() => {
    if (isSuccess && !successHandled.current) {
      successHandled.current = true;
      onCollect();
      setHash(undefined);
      successHandled.current = false;
    }
  }, [isSuccess, onCollect]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const genResponse = await ky
        .post<GenerateResponse>("/api/generate", {
          json: {
            user_pfp: pfpUrl,
            user_username: username,
            user_fid: fid,
            user_address: address,
          },
        })
        .json();
      if (!genResponse.success) {
        onError(genResponse.error);
        setIsGeneratingSuccess(false);
        return;
      }
      setIsGeneratingSuccess(true);
      console.log("Generate response:", genResponse);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Something went wrong.");
      setIsGeneratingSuccess(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClick = async () => {
    try {
      if (!isMinting) {
        sdk.actions.addFrame();
        return;
      }

      setHash(undefined);
      successHandled.current = false;

      if (!isConnected || !address) {
        connect({ connector: farcasterFrame() });
        return;
      }

      setIsLoadingTxData(true);
      const {
        result: { tx },
      } = await fetchTransaction(address);

      const hash = await sendTransactionAsync({
        to: tx.to,
        value: BigInt(tx.value),
        data: tx.data,
        chainId: 8453,
      });

      setHash(hash);
    } catch (error) {
      if (!isUserRejectionError(error)) {
        onError(
          error instanceof Error ? error.message : "Something went wrong."
        );
      }
      setHash(undefined);
      successHandled.current = false;
    } finally {
      setIsLoadingTxData(false);
    }
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom)] bg-card border-t border-border">
      <div className="pb-4 px-4 pt-2">
        <Button
          className="w-full relative bg-active text-active-foreground"
          onClick={handleGenerate}
          disabled={isGenerating || isGeneratingSuccess}
        >
          {isGenerating ? "Generating..." : "Generate"}
        </Button>
        {/* {isMinting && (
          <div className="flex justify-between items-center mb-1 text-sm">
            <span className="text-muted text-sm">Cost</span>
            <span className="text-foreground font-medium">
              {formatUsdPrice(price)}
            </span>
          </div>
        )}
        {isPending ? (
          <AnimatedBorder>
            <Button
              className="w-full relative bg-active text-active-foreground"
              disabled
            >
              {isMinting ? "Collecting..." : "Adding..."}
            </Button>
          </AnimatedBorder>
        ) : (
          <Button
            className="w-full"
            onClick={handleClick}
            disabled={!isMinting && frameAdded}
          >
            {!isConnected && isMinting
              ? "Connect"
              : isMinting
                ? "Collect"
                : frameAdded
                  ? "Added"
                  : "Add Frame"}
          </Button>
        )} */}
      </div>
    </div>
  );
}
