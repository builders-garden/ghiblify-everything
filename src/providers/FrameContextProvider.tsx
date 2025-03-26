import sdk, { FrameContext, SafeAreaInsets } from "@farcaster/frame-sdk";
import React from "react";

import { Loading } from "@/components/ui/loading";

const FAKE_FRAME_CONTEXT: FrameContext | undefined =
  process.env.NODE_ENV === "development"
    ? {
        user: {
          fid: 1287,
          pfpUrl:
            "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/d6abc7f9-2073-4a23-84a1-d6f13ac44500/original",
          username: "test",
        },
        client: {
          clientFid: 9152,
          added: false,
          safeAreaInsets: {
            bottom: 0,
            top: 0,
            left: 0,
            right: 0,
          },
        },
        // @ts-ignore-next-line
        fakePayload: true,
      }
    : undefined;

type FrameContextProviderContextValue = {
  fid: number;
  pfpUrl: string | undefined;
  frameAdded: boolean;
  username: string | undefined;
  safeAreaInsets?: SafeAreaInsets;
};

const FrameContextProviderContext =
  React.createContext<FrameContextProviderContextValue>([] as never);

function FrameContextProvider({ children }: React.PropsWithChildren) {
  const [noFrameContextFound, setNoFrameContextFound] =
    React.useState<boolean>(false);

  const [frameContext, setFrameContext] = React.useState<
    FrameContext | undefined
  >(FAKE_FRAME_CONTEXT);

  const checkFrameContext = React.useCallback(async () => {
    const ctx: FrameContext = await sdk.context;

    if (
      typeof ctx !== "undefined" &&
      ctx !== null &&
      typeof frameContext === "undefined"
    ) {
      setFrameContext(ctx);
    } else {
      setNoFrameContextFound(true);
    }
  }, [frameContext]);

  React.useEffect(() => {
    if (typeof frameContext === "undefined") {
      checkFrameContext();
    }
  }, [checkFrameContext, frameContext]);

  if (noFrameContextFound) {
    return <Loading />;
  }

  if (typeof frameContext === "undefined") {
    return <Loading />;
  }

  return (
    <FrameContextProviderContext.Provider
      value={{
        fid: frameContext.user.fid,
        pfpUrl: frameContext.user.pfpUrl,
        username: frameContext.user.username,
        frameAdded: frameContext.client.added,
        safeAreaInsets: frameContext.client.safeAreaInsets,
      }}
    >
      {children}
    </FrameContextProviderContext.Provider>
  );
}

export const useViewer = () => {
  const { fid, pfpUrl, frameAdded, username } = React.useContext(
    FrameContextProviderContext
  );
  return { fid, pfpUrl, frameAdded, username };
};

export const useSafeArea = () => {
  const { safeAreaInsets } = React.useContext(FrameContextProviderContext);
  return { safeAreaInsets };
};

export { FrameContextProvider };
