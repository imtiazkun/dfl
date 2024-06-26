"use client";

import { LoadingSVG } from "@/components/button/LoadingSVG";
import { ChatMessageType, ChatTile } from "@/components/chat/ChatTile";
import { ColorPicker } from "@/components/colorPicker/ColorPicker";
import { AudioInputTile } from "@/components/config/AudioInputTile";
import { ConfigurationPanelItem } from "@/components/config/ConfigurationPanelItem";
import { NameValueRow } from "@/components/config/NameValueRow";
import { PlaygroundHeader } from "@/components/playground/PlaygroundHeader";
import {
  PlaygroundTab,
  PlaygroundTabbedTile,
  PlaygroundTile,
} from "@/components/playground/PlaygroundTile";
import { AgentMultibandAudioVisualizer } from "@/components/visualization/AgentMultibandAudioVisualizer";
import { useMultibandTrackVolume } from "@/hooks/useTrackVolume";
import { AgentState } from "@/lib/types";
import {
  VideoTrack,
  useChat,
  useConnectionState,
  useDataChannel,
  useLocalParticipant,
  useParticipantInfo,
  useRemoteParticipant,
  useRemoteParticipants,
  useTracks,
} from "@livekit/components-react";
import {
  ConnectionState,
  LocalParticipant,
  RoomEvent,
  Track,
} from "livekit-client";
import { QRCodeSVG } from "qrcode.react";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";

export enum PlaygroundOutputs {
  Video,
  Audio,
  Chat,
}

export interface PlaygroundMeta {
  name: string;
  value: string;
}

export interface PlaygroundProps {
  logo?: ReactNode;
  title?: string;
  githubLink?: string;
  description?: ReactNode;
  themeColors: string[];
  defaultColor: string;
  outputs?: PlaygroundOutputs[];
  showQR?: boolean;
  onConnect: (connect: boolean, opts?: { token: string; url: string }) => void;
  metadata?: PlaygroundMeta[];
  videoFit?: "contain" | "cover";
}

const headerHeight = 56;

export default function Playground({
  logo,
  title,
  githubLink,
  description,
  outputs,
  showQR,
  themeColors,
  defaultColor,
  onConnect,
  metadata,
  videoFit,
}: PlaygroundProps) {
  const [agentState, setAgentState] = useState<AgentState>("offline");
  const [themeColor, setThemeColor] = useState(defaultColor);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [transcripts, setTranscripts] = useState<ChatMessageType[]>([]);
  const { localParticipant } = useLocalParticipant();

  const [showChat, setShowChat] = useState(false);

  const participants = useRemoteParticipants({
    updateOnlyOn: [RoomEvent.ParticipantMetadataChanged],
  });
  const agentParticipant = participants.find((p) => p.isAgent);

  const { send: sendChat, chatMessages } = useChat();
  const visualizerState = useMemo(() => {
    if (agentState === "thinking") {
      return "thinking";
    } else if (agentState === "speaking") {
      return "talking";
    }
    return "idle";
  }, [agentState]);

  const roomState = useConnectionState();
  const tracks = useTracks();

  const agentAudioTrack = tracks.find(
    (trackRef) =>
      trackRef.publication.kind === Track.Kind.Audio &&
      trackRef.participant.isAgent
  );

  const agentVideoTrack = tracks.find(
    (trackRef) =>
      trackRef.publication.kind === Track.Kind.Video &&
      trackRef.participant.isAgent
  );

  const subscribedVolumes = useMultibandTrackVolume(
    agentAudioTrack?.publication.track
  );

  const localTracks = tracks.filter(
    ({ participant }) => participant instanceof LocalParticipant
  );
  const localVideoTrack = localTracks.find(
    ({ source }) => source === Track.Source.Camera
  );
  const localMicTrack = localTracks.find(
    ({ source }) => source === Track.Source.Microphone
  );

  const localMultibandVolume = useMultibandTrackVolume(
    localMicTrack?.publication.track,
    20
  );

  useEffect(() => {
    if (!agentParticipant) {
      setAgentState("offline");
      return;
    }
    let agentMd: any = {};
    if (agentParticipant.metadata) {
      agentMd = JSON.parse(agentParticipant.metadata);
    }
    if (agentMd.agent_state) {
      setAgentState(agentMd.agent_state);
    } else {
      setAgentState("starting");
    }
  }, [agentParticipant, agentParticipant?.metadata]);

  const isAgentConnected = agentState !== "offline";

  const onDataReceived = useCallback(
    (msg: any) => {
      if (msg.topic === "transcription") {
        const decoded = JSON.parse(
          new TextDecoder("utf-8").decode(msg.payload)
        );
        let timestamp = new Date().getTime();
        if ("timestamp" in decoded && decoded.timestamp > 0) {
          timestamp = decoded.timestamp;
        }
        setTranscripts([
          ...transcripts,
          {
            name: "You",
            message: decoded.text,
            timestamp: timestamp,
            isSelf: true,
          },
        ]);
      }
    },
    [transcripts]
  );

  // combine transcripts and chat together
  useEffect(() => {
    const allMessages = [...transcripts];
    for (const msg of chatMessages) {
      const isAgent = msg.from?.identity === agentParticipant?.isAgent;
      const isSelf = msg.from?.identity === localParticipant?.identity;
      let name = msg.from?.name;
      if (!name) {
        if (isAgent) {
          name = "Agent";
        } else if (isSelf) {
          name = "You";
        } else {
          name = "Unknown";
        }
      }
      allMessages.push({
        name,
        message: msg.message,
        timestamp: msg?.timestamp,
        isSelf: isSelf,
      });
    }
    allMessages.sort((a, b) => a.timestamp - b.timestamp);
    setMessages(allMessages);
  }, [transcripts, chatMessages, localParticipant, agentParticipant]);

  useDataChannel(onDataReceived);

  const videoTileContent = useMemo(() => {
    const videoFitClassName = `object-${videoFit}`;
    return (
      <div className="flex flex-col grow text-gray-950 bg-black rounded-sm border border-gray-800 fixed top-0 left-0 w-1/2 h-screen items-center justify-center">
        {agentVideoTrack ? (
          <VideoTrack
            trackRef={agentVideoTrack}
            className={`absolute top-1/2 -translate-y-1/2 ${videoFitClassName} object-position-center w-full h-screen`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-gray-700 text-center h-48 w-full">
            <LoadingSVG />
            Waiting for video track
          </div>
        )}
      </div>
    );
  }, [agentVideoTrack, videoFit]);

  const chatTileContent = useMemo(() => {
    return (
      <ChatTile
        messages={messages}
        accentColor={themeColor}
        onSend={sendChat}
      />
    );
  }, [messages, themeColor, sendChat]);

  // const settingsTileContent = useMemo(() => {
  //   return (
  //     <div className="flex flex-col gap-4 h-full w-full items-start overflow-y-auto">
  //       {/* {description && (
  //         <ConfigurationPanelItem title="Description">
  //           {description}
  //         </ConfigurationPanelItem>
  //       )} */}

  //       {/* <ConfigurationPanelItem title="Settings">
  //         <div className="flex flex-col gap-2">
  //           {metadata?.map((data, index) => (
  //             <NameValueRow
  //               key={data.name + index}
  //               name={data.name}
  //               value={data.value}
  //             />
  //           ))}
  //         </div>
  //       </ConfigurationPanelItem> */}
  //       {/* <ConfigurationPanelItem title="Status">
  //         <div className="flex flex-col gap-2">
  //           <NameValueRow
  //             name="Room connected"
  //             value={
  //               roomState === ConnectionState.Connecting ? (
  //                 <LoadingSVG diameter={16} strokeWidth={2} />
  //               ) : (
  //                 roomState
  //               )
  //             }
  //             valueColor={
  //               roomState === ConnectionState.Connected
  //                 ? `${themeColor}-500`
  //                 : "gray-500"
  //             }
  //           />
  //           <NameValueRow
  //             name="Agent connected"
  //             value={
  //               isAgentConnected ? (
  //                 "true"
  //               ) : roomState === ConnectionState.Connected ? (
  //                 <LoadingSVG diameter={12} strokeWidth={2} />
  //               ) : (
  //                 "false"
  //               )
  //             }
  //             valueColor={isAgentConnected ? `${themeColor}-500` : "gray-500"}
  //           />
  //           <NameValueRow
  //             name="Agent status"
  //             value={
  //               agentState !== "offline" && agentState !== "speaking" ? (
  //                 <div className="flex gap-2 items-center">
  //                   <LoadingSVG diameter={12} strokeWidth={2} />
  //                   {agentState}
  //                 </div>
  //               ) : (
  //                 agentState
  //               )
  //             }
  //             valueColor={
  //               agentState === "speaking" ? `${themeColor}-500` : "gray-500"
  //             }
  //           />
  //         </div>
  //       </ConfigurationPanelItem> */}
  //       {/* {localVideoTrack && (
  //         <ConfigurationPanelItem
  //           title="Camera"
  //           deviceSelectorKind="videoinput"
  //         >
  //           <div className="relative">
  //             <VideoTrack
  //               className="rounded-sm border border-gray-800 opacity-70 w-full"
  //               trackRef={localVideoTrack}
  //             />
  //           </div>
  //         </ConfigurationPanelItem>
  //       )}
  //       {localMicTrack && (
  //         <ConfigurationPanelItem
  //           title="Microphone"
  //           deviceSelectorKind="audioinput"
  //         >
  //           <AudioInputTile frequencies={localMultibandVolume} />
  //         </ConfigurationPanelItem>
  //       )} */}
  //       <div className="w-full">
  //         {/* <ConfigurationPanelItem title="Color">
  //           <ColorPicker
  //             colors={themeColors}
  //             selectedColor={themeColor}
  //             onSelect={(color) => {
  //               setThemeColor(color);
  //             }}
  //           />
  //         </ConfigurationPanelItem> */}
  //       </div>

  //     </div>
  //   );
  // }, [
  //   agentState,
  //   description,
  //   isAgentConnected,
  //   localMicTrack,
  //   localMultibandVolume,
  //   localVideoTrack,
  //   metadata,
  //   roomState,
  //   themeColor,
  //   themeColors,

  // ]);

  let mobileTabs: PlaygroundTab[] = [];
  if (outputs?.includes(PlaygroundOutputs.Video)) {
    mobileTabs.push({
      title: "Video",
      content: (
        <PlaygroundTile
          className="w-full h-full"
          childrenClassName="justify-center"
        >
          {videoTileContent}
        </PlaygroundTile>
      ),
    });
  }

  // mobileTabs.push({
  //   title: "Settings",
  //   content: (
  //     <PlaygroundTile
  //       padding={false}
  //       backgroundColor="gray-950"
  //       className="h-full w-full basis-1/4 items-start overflow-y-auto flex"
  //       childrenClassName="h-full grow items-start"
  //     >
  //       {settingsTileContent}
  //     </PlaygroundTile>
  //   ),
  // });

  return (
    <>
      {/* <PlaygroundHeader
        title={title}
        logo={logo}
        githubLink={githubLink}
        height={headerHeight}
        accentColor={themeColor}
        connectionState={roomState}
        onConnectClicked={() =>
          onConnect(roomState === ConnectionState.Disconnected)
        }
      /> */}
      <div
        className={`flex gap-4 py-4 grow w-full selection:bg-${themeColor}-900`}
        style={{ height: `calc(100% - ${headerHeight}px)` }}
      >
        <div
          className={`flex-col grow basis-1/2 gap-4 h-full hidden lg:${
            !outputs?.includes(PlaygroundOutputs.Audio) &&
            !outputs?.includes(PlaygroundOutputs.Video)
              ? "hidden"
              : "flex"
          }`}
        >
          {outputs?.includes(PlaygroundOutputs.Video) && (
            <PlaygroundTile
              title="Video"
              className="w-full h-full grow"
              childrenClassName="justify-center"
            >
              {videoTileContent}
            </PlaygroundTile>
          )}
        </div>

        {outputs?.includes(PlaygroundOutputs.Chat) && (
          <PlaygroundTile
            title="Chat"
            className="h-full grow basis-1/4 hidden lg:flex"
          >
            {showChat ? chatTileContent : ""}
          </PlaygroundTile>
        )}
        {/* <PlaygroundTile
          padding={false}
          backgroundColor="gray-950"
          className="h-full w-full basis-1/4 items-start overflow-y-auto hidden max-w-[480px] lg:flex"
          childrenClassName="h-full grow items-start"
        >
          {settingsTileContent}
        </PlaygroundTile> */}
        <button
          onClick={() => setShowChat(!showChat)}
          className="fixed bottom-5 right-5 z-50 bg-black p-3 rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="icon icon-tabler icon-tabler-messages"
            width="44"
            height="44"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="#ffffff"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M21 14l-3 -3h-7a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1h9a1 1 0 0 1 1 1v10" />
            <path d="M14 15v2a1 1 0 0 1 -1 1h-7l-3 3v-10a1 1 0 0 1 1 -1h2" />
          </svg>
        </button>
      </div>
    </>
  );
}
