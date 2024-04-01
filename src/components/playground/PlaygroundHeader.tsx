import { Button } from "@/components/button/Button";
import { ConnectionState } from "livekit-client";
import { LoadingSVG } from "@/components/button/LoadingSVG";
import { ReactNode } from "react";

type PlaygroundHeader = {
  logo?: ReactNode;
  title?: ReactNode;
  githubLink?: string;
  height: number;
  accentColor: string;
  connectionState: ConnectionState;
  onConnectClicked: () => void;
};

export const PlaygroundHeader = ({
  logo,
  title,
  githubLink,
  accentColor,
  height,
  // onConnectClicked,
  connectionState,
}: PlaygroundHeader) => {
  return (
    <div
      className={`flex gap-4 pt-4 text-${accentColor}-500 justify-between items-center shrink-0`}
      style={{
        height: height + "px",
      }}
    >
      <div className="flex items-center gap-3 basis-2/3">
        <div className="flex lg:basis-1/2">
          <a href="https://livekit.io">{logo ?? <LKLogo />}</a>
        </div>
        <div className="lg:basis-1/2 lg:text-center text-xs lg:text-base lg:font-semibold text-black">
          {title}
        </div>
      </div>
      <div className="flex basis-1/3 justify-end items-center gap-4">
        {/* <Button
          accentColor={
            connectionState === ConnectionState.Connected ? "red" : accentColor
          }
          disabled={connectionState === ConnectionState.Connecting}
        >
          {connectionState === ConnectionState.Connecting ? (
            <LoadingSVG />
          ) : connectionState === ConnectionState.Connected ? (
            "Disconnect"
          ) : (
            "Connect"
          )}
        </Button> */}
      </div>
    </div>
  );
};

const LKLogo = () => (
  <svg
    version="1.0"
    xmlns="http://www.w3.org/2000/svg"
    width="16.000000pt"
    height="16.000000pt"
    viewBox="0 0 16.000000 16.000000"
    preserveAspectRatio="xMidYMid meet"
  >
    <g
      transform="translate(0.000000,16.000000) scale(0.100000,-0.100000)"
      fill="#000000"
      stroke="none"
    >
      <path
        d="M66 153 c-14 -15 -5 -33 17 -30 18 2 23 -4 27 -35 6 -42 22 -40 39 5
16 41 14 47 -15 47 -14 0 -33 4 -43 10 -10 5 -21 6 -25 3z"
      />
      <path
        d="M38 103 c-42 -5 -43 -6 -27 -52 25 -71 89 -56 89 21 0 25 -4 37 -12
36 -7 -1 -30 -3 -50 -5z m2 -33 c0 -5 -4 -10 -10 -10 -5 0 -10 5 -10 10 0 6 5
10 10 10 6 0 10 -4 10 -10z m47 4 c-3 -3 -12 -4 -19 -1 -8 3 -5 6 6 6 11 1 17
-2 13 -5z m-17 -38 c0 -11 -19 -15 -25 -6 -3 5 1 10 9 10 9 0 16 -2 16 -4z"
      />
    </g>
  </svg>
);
