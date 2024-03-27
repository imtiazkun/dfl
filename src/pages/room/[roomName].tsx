// pages/room/[roomName].tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useToken } from "@livekit/components-react";
import { generateRandomAlphanumeric } from "@/lib/util";
import Playground, {
  PlaygroundMeta,
  PlaygroundOutputs,
} from "@/components/playground/Playground";
import { useAppConfig } from "@/hooks/useAppConfig";

const themeColors = [
  "cyan",
  "green",
  "amber",
  "blue",
  "violet",
  "rose",
  "pink",
  "teal",
];

// Dynamically import LiveKit components to avoid SSR issues
const LiveKitRoom = dynamic(
  () => import("@livekit/components-react").then((mod) => mod.LiveKitRoom),
  { ssr: false }
);
const RoomAudioRenderer = dynamic(
  () =>
    import("@livekit/components-react").then((mod) => mod.RoomAudioRenderer),
  { ssr: false }
);
const StartAudio = dynamic(
  () => import("@livekit/components-react").then((mod) => mod.StartAudio),
  { ssr: false }
);

const RoomPage = () => {
  const router = useRouter();
  const { roomName } = router.query;
  const [shouldConnect, setShouldConnect] = useState(false);
  const [metadata, setMetadata] = useState<PlaygroundMeta[]>([]);

  // Assume you have an endpoint to fetch or generate a token based on roomName
  // For simplicity, using a mocked function here
  const token = useToken("/api/token", roomName as string, {
    userInfo: { identity: generateRandomAlphanumeric(16) },
  });

  useEffect(() => {
    // You might want to auto-connect based on certain conditions or leave it to user action
    // setShouldConnect(true);
  }, []);

  const appConfig = useAppConfig();
  const outputs = [
    appConfig?.outputs.audio && PlaygroundOutputs.Audio,
    appConfig?.outputs.video && PlaygroundOutputs.Video,
    appConfig?.outputs.chat && PlaygroundOutputs.Chat,
  ].filter((item) => typeof item !== "boolean") as PlaygroundOutputs[];

  // const handleConnect = useCallback(
  //   (connect: boolean, opts?: { url: string; token: string }) => {
  //     if (connect && opts) {
  //       setLiveKitUrl(opts.url);
  //       setCustomToken(opts.token);
  //     }
  //     setShouldConnect(connect);
  //   },
  //   []
  // );

  return (
    <>
      <Head>
        <title>LiveKit Room: {roomName}</title>
      </Head>
      <main className="h-screen bg-gray-100">
        <button
          onClick={() => setShouldConnect(true)}
          className="p-2 bg-blue-500 text-white rounded"
        >
          Connect to LiveKit Room
        </button>
        {shouldConnect && token && (
          <LiveKitRoom
            className="flex-1"
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || ""}
            token={token}
            audio={true}
            video={true}
            connect={shouldConnect}
            onError={(e) => console.error(e)}
          >
            {/* Additional components like VideoConference could be added here */}
            <RoomAudioRenderer />
            <StartAudio label="Click to enable audio playback" />
            <Playground
              title={appConfig?.title}
              githubLink={appConfig?.github_link}
              outputs={outputs}
              showQR={appConfig?.show_qr}
              description={appConfig?.description}
              themeColors={themeColors}
              defaultColor={appConfig?.theme_color ?? "cyan"}
              onConnect={handleConnect}
              metadata={metadata}
              videoFit={appConfig?.video_fit ?? "cover"}
            />
          </LiveKitRoom>
        )}
      </main>
    </>
  );
};

export default RoomPage;
