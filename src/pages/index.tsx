// pages/index.tsx
import type { NextPage } from "next";
import Link from "next/link";
import { useState } from "react";
import { generateRandomAlphanumeric } from "@/lib/util";

const HomePage: NextPage = () => {
  const [roomName, setRoomName] = useState("");

  const handleGenerateRoomName = () => {
    const newRoomName = [
      generateRandomAlphanumeric(4),
      generateRandomAlphanumeric(4),
    ].join("-");
    setRoomName(newRoomName);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <button
        onClick={handleGenerateRoomName}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Generate Room Name
      </button>
      {roomName && (
        <Link href={`/room/${encodeURIComponent(roomName)}`} legacyBehavior>
          <a className="mt-4 text-blue-500">Go to Room</a>
        </Link>
      )}
    </div>
  );
};

export default HomePage;
