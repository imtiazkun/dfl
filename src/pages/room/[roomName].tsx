// pages/room/[roomName].tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Head from "next/head";
import "@livekit/components-styles";
import {
  VideoConference,
  formatChatMessageLinks,
  useToken,
  LocalUserChoices,
  useRemoteParticipants,
  useTracks,
  VideoTrack,
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
} from "@livekit/components-react";
import { generateRandomAlphanumeric } from "@/lib/util";
import Playground, {
  PlaygroundMeta,
  PlaygroundOutputs,
} from "@/components/playground/Playground";
import { useAppConfig } from "@/hooks/useAppConfig";
import { SettingsMenu } from "../../lib/SettingsMenu";
import { PlaygroundToast, ToastType } from "@/components/toast/PlaygroundToast";
import { Participant } from "livekit-client";

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

const RoomPage = () => {
  const router = useRouter();
  const { roomName } = router.query;
  const { patient, name } = router.query;
  const [shouldConnect, setShouldConnect] = useState(false);
  const [metadata, setMetadata] = useState<PlaygroundMeta[]>([]);
  // const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);
  // Assume you have an endpoint to fetch or generate a token based on roomName
  // For simplicity, using a mocked function here
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);
  const token = useToken("/api/token", roomName as string, {
    userInfo: {
      name: name,
      identity: generateRandomAlphanumeric(16),
      metadata: patient == "true" ? "patient" : "",
    },
  });

  useEffect(() => {
    // You might want to auto-connect based on certain conditions or leave it to user action
    // setShouldConnect(true);
    setShouldConnect(true);
  }, []);

  const appConfig = useAppConfig();
  const outputs = [
    appConfig?.outputs.audio && PlaygroundOutputs.Audio,
    appConfig?.outputs.video && PlaygroundOutputs.Video,
    appConfig?.outputs.chat && PlaygroundOutputs.Chat,
  ].filter((item) => typeof item !== "boolean") as PlaygroundOutputs[];

  return (
    <>
      <Head>
        <title>LiveKit Room: {roomName}</title>
      </Head>
      <main className="h-screen bg-gray-100">
        {shouldConnect && token && (
          <div className="bg-gray-100">
            <LiveKitRoom
              className="flex-1"
              serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || ""}
              token={token}
              audio={appConfig?.inputs.mic}
              video={appConfig?.inputs.camera}
              connect={shouldConnect}
              onError={(e) => console.error(e)}
            >
              <div className="flex ">
                <div className="w-1/4">
                  <Playground
                    title={appConfig?.title}
                    githubLink={appConfig?.github_link}
                    outputs={outputs}
                    showQR={appConfig?.show_qr}
                    description={appConfig?.description}
                    themeColors={themeColors}
                    defaultColor={appConfig?.theme_color ?? "cyan"}
                    metadata={metadata}
                    videoFit={appConfig?.video_fit ?? "contain"}
                  />
                </div>
                <VideoConference
                  chatMessageFormatter={formatChatMessageLinks}
                  SettingsComponent={
                    process.env.NEXT_PUBLIC_SHOW_SETTINGS_MENU === "true"
                      ? SettingsMenu
                      : undefined
                  }
                />
              </div>
            </LiveKitRoom>
          </div>
        )}
      </main>
    </>
  );
};

export default RoomPage;
