// pages/index.tsx
import type { NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { generateRandomAlphanumeric } from "@/lib/util";

const HomePage: NextPage = () => {
  const [roomName, setRoomName] = useState("");
  const [roomNameInput, setRoomNameInput] = useState("");
  const [name, setName] = useState("");
  const [isPatient, setPatient] = useState(false);

  const handleGenerateRoomName = () => {
    const newRoomName = [
      generateRandomAlphanumeric(4),
      generateRandomAlphanumeric(4),
    ].join("-");
    setRoomName(newRoomName);
  };

  useEffect(() => {
    if (roomName) {
      window.location.href = `/room/${encodeURIComponent(
        roomName
      )}?patient=${isPatient}&name=${name}`;
    }
  }, [roomName]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-col gap-5">
        <input
          type="text"
          value={name}
          className="p-2 rounded"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />
        <hr />
        <div className="flex gap-5">
          <input
            value={roomNameInput}
            onChange={(e) => setRoomNameInput(e.target.value)}
            placeholder="room-id"
            type="text"
            className="px-2 rounded"
          />
          <button
            onClick={() => setRoomName(roomNameInput)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Join
          </button>
        </div>
        <button
          onClick={handleGenerateRoomName}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Create Room
        </button>

        <div className="flex text-white gap-5">
          <p>Patient: {isPatient ? "Patient" : "Doctor"}</p>
          <input
            checked={isPatient}
            onChange={(e) => setPatient(e.target.checked)}
            type="checkbox"
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
