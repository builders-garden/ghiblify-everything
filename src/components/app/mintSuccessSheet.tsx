import sdk from "@farcaster/frame-sdk";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerTitle,
} from "@/components/ui/drawer";
import WowowImage from "@/img/wowow.png";
import { getShareUrl } from "@/lib/share";
import { useViewer } from "@/providers/FrameContextProvider";

interface MintSuccessSheetProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  imageUrl: string;
}

export function MintSuccessSheet({
  isOpen,
  onClose,
  name,
  imageUrl,
}: MintSuccessSheetProps) {
  const handleAdd = useCallback(() => {
    onClose();
    sdk.actions.addFrame();
  }, [onClose]);

  const { frameAdded } = useViewer();

  const handleShare = useCallback(() => {
    const url = getShareUrl({ name });
    sdk.actions.openUrl(url);
  }, [name]);

  return (
    <Drawer open={isOpen} onClose={onClose}>
      <DrawerOverlay className="!bg-black/30 backdrop-blur-[7.5px]" />
      <DrawerContent className="bg-card [&>svg]:hidden">
        <DrawerTitle className="sr-only">Collection Successful</DrawerTitle>

        <div className="flex flex-col items-center pt-4 pb-8">
          <div className="flex items-center gap-1">
            <CheckCircle2
              className="text-[#43B748]"
              strokeWidth={2}
              size={24}
            />
            <span className="text-2xl font-semibold">Collected</span>
          </div>
        </div>

        <div className="max-w-[272px] mx-auto w-full">
          <div className="bg-mat rounded-xl p-2 shadow mb-4">
            <div className="relative aspect-square w-full rounded-lg overflow-hidden">
              <Image src={imageUrl} alt={name} fill className="object-cover" />
            </div>
          </div>
        </div>

        {frameAdded ? (
          <div className="mb-8 px-4">
            <Button className="w-full" onClick={handleShare}>Share</Button>
          </div>
        ) : (
          <div className="relative w-[365px] mx-auto">
            <div className="absolute inset-4 pb-4">
              <Image
                src={WowowImage}
                alt="Background pattern"
                fill
                className="object-cover"
              />
            </div>

            <div className="relative px-8 flex flex-col items-center justify-center h-[230px]">
              <h2 className="text-xl font-semibold text-foreground text-center">
                Never miss featured mints!
              </h2>

              <Button
                onClick={handleAdd}
                variant="secondary"
                className="flex items-center w-full max-w-[354px] h-[60px] bg-[#f7f7f7] hover:bg-[#f0f0f0] transition-colors rounded-[8px] p-2 gap-1 mb-4"
              >
                <div className="h-[42px] w-[42px] relative rounded-[8px] overflow-hidden">
                  <Image
                    src="/app.png"
                    alt="Warpcast app icon"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col flex-1 -space-y-1 text-left ml-1">
                  <span className="font-sm text-black font-medium">Mints</span>
                  <span className="text-sm text-[#8B99A4]">by Warpcast</span>
                </div>

                <div className="rounded-full bg-[#5336E2] hover:bg-[5336E2]/90 w-[58px] h-[30px] text-white text-sm flex items-center justify-center">
                  Add
                </div>
              </Button>
            </div>
          </div>
        )}

        <div className="pb-[env(safe-area-inset-bottom)]" />
      </DrawerContent>
    </Drawer>
  );
}
