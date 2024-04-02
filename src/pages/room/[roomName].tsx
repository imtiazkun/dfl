// pages/room/[roomName].tsx
import {
  HTMLAttributeAnchorTarget,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Head from "next/head";
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
  TrackLoop,
} from "@livekit/components-react";
import { generateRandomAlphanumeric } from "@/lib/util";
import Playground, {
  PlaygroundMeta,
  PlaygroundOutputs,
} from "@/components/playground/Playground";
import { useAppConfig } from "@/hooks/useAppConfig";
import { SettingsMenu } from "../../lib/SettingsMenu";
import { PlaygroundToast, ToastType } from "@/components/toast/PlaygroundToast";
import { Participant, RoomEvent, Track } from "livekit-client";
import { jwtDecode } from "jwt-decode";

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

const AgentFeed = () => {
  const participants = useRemoteParticipants({
    updateOnlyOn: [RoomEvent.ParticipantMetadataChanged],
  });

  const agentParticipant = participants.find((p) => p.isAgent);

  return (
    <>
      {/* <TrackLoop tracks={filteredTracks}>
        <ParticipantTile />
      </TrackLoop> */}
    </>
  );
};

const Conf = () => {
  const trackRefs = useTracks([Track.Source.Camera]);

  const filteredTracks = trackRefs.filter(
    (item) => item.participant.metadata != "patient"
  );

  useEffect(() => {
    // alert(JSON.stringify(trackRefs));
  }, [trackRefs]);

  return (
    <>
      <TrackLoop tracks={filteredTracks}>
        <ParticipantTile />
      </TrackLoop>
    </>
  );
};

const RoomPage = () => {
  const router = useRouter();
  const { roomName } = router.query;
  const { patient, name } = router.query;
  const [shouldConnect, setShouldConnect] = useState(false);
  const [metadata, setMetadata] = useState<PlaygroundMeta[]>([]);
  const [isPatient, setIsPatient] = useState(false);
  const videoContainer = useRef(null);
  const [videoElements, setVideoElement] = useState<HTMLVideoElement[]>();
  // const tracks = useTracks([Track.Source.Camera]);
  // Assume you have an endpoint to fetch or generate a token based on roomName
  // For simplicity, using a mocked function here
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const token = useToken("/api/token", roomName as string, {
    userInfo: {
      identity: generateRandomAlphanumeric(16),
      metadata: patient == "true" ? "patient" : "",
    },
  });

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token) as any;
      setIsPatient(decoded == "patient");
    }
  }, []);

  // useEffect(() => {
  //   if (videoContainer.current) {
  //     const videoElements = (
  //       videoContainer.current as HTMLElement
  //     ).querySelectorAll("video");
  //     setVideoElement(Array.from(videoElements));
  //   }
  // }, [videoContainer.current]);

  const appConfig = useAppConfig();
  const outputs = [
    appConfig?.outputs.audio && PlaygroundOutputs.Audio,
    appConfig?.outputs.video && PlaygroundOutputs.Video,
    appConfig?.outputs.chat && PlaygroundOutputs.Chat,
  ].filter((item) => typeof item !== "boolean") as PlaygroundOutputs[];

  return (
    <>
      <Head>
        <title>DFL Meet</title>
      </Head>

      <div className="fixed z-50 top-5 left-5 bg-blue-600 px-5 py-2 rounded-lg font-bold text-white bg-black">
        {roomName}
      </div>

      {shouldConnect ? (
        <main ref={videoContainer} className="h-screen bg-gray-100">
          {token && (
            <div className="bg-gray-800">
              <LiveKitRoom
                className="flex-1"
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || ""}
                token={token}
                audio={appConfig?.inputs.mic}
                video={appConfig?.inputs.camera}
                connect={shouldConnect}
                onError={(e) => console.error(e)}
              >
                <div className="flex  flex-col  md:flex-row h-screen">
                  <div className="w-full  gap-4 md:gap-4 md:w-1/2 h-screen">
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
                      onConnect={function (
                        connect: boolean,
                        opts?: { token: string; url: string } | undefined
                      ): void {
                        throw new Error("Function not implemented.");
                      }}
                    />
                    {/* <AgentFeed /> */}
                  </div>
                  <div className="w-full md:w-1/2 h-screen">
                    <Conf />
                  </div>
                </div>
              </LiveKitRoom>

              <button
                className="leaveRoomBtn"
                onClick={() => {
                  setShouldConnect(false);
                  window.location.href = "/";
                }}
              >
                Leave
              </button>
            </div>
          )}
        </main>
      ) : (
        <div>
          <div className="flex flex-col items-center justify-center h-screen">
            <div className="flex flex-col items-center">
              <button
                onClick={() => setShouldConnect(true)}
                className="px-16 text-white bg-blue-500 text-3xl py-6 hover:bg-blue-300 transition-all"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoomPage;
