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
  AudioTrack,
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

  return (
    <>
      <GridLayout tracks={filteredTracks}>
        <ParticipantTile />
      </GridLayout>
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
      name: name as string,
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

      <div className="fixed z-50 top-5 left-5  px-5 py-2 rounded-lg font-bold text-white bg-black">
        {roomName}
      </div>

      <div className="fixed z-50 bottom-5 left-5  px-5 py-2 rounded-lg font-bold text-white bg-black">
        <button
          title="Leave call"
          className="leaveRoomBtn bg-red-500 rounded-full hover:shadow-rose"
          onClick={() => {
            setShouldConnect(false);
            window.location.href = "/";
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="icon icon-tabler icon-tabler-phone-off"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="#ffffff"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M3 21l18 -18" />
            <path d="M5.831 14.161a15.946 15.946 0 0 1 -2.831 -8.161a2 2 0 0 1 2 -2h4l2 5l-2.5 1.5c.108 .22 .223 .435 .345 .645m1.751 2.277c.843 .84 1.822 1.544 2.904 2.078l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a15.963 15.963 0 0 1 -10.344 -4.657" />
          </svg>
        </button>{" "}
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
                  </div>
                  <div className="w-full md:w-1/2 h-screen">
                    <Conf />
                  </div>
                </div>
              </LiveKitRoom>
            </div>
          )}
        </main>
      ) : (
        <div>
          <div className="flex flex-col items-center justify-center h-screen">
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => setShouldConnect(true)}
                className="px-16 text-white bg-blue-500 text-2xl py-3 rounded-lg hover:bg-blue-300 transition-all"
              >
                Ready
              </button>
              <h2 className="text-gray-400">Join whenever you are ready</h2>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoomPage;
