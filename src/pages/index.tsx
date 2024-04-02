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
      <div>
        {isPatient ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="icon icon-tabler icon-tabler-heart-broken"
            width="56"
            height="56"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="#ffffff"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
            <path d="M12 6l-2 4l4 3l-2 4v3" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="icon icon-tabler icon-tabler-stethoscope"
            width="56"
            height="56"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="#ffffff"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M6 4h-1a2 2 0 0 0 -2 2v3.5h0a5.5 5.5 0 0 0 11 0v-3.5a2 2 0 0 0 -2 -2h-1" />
            <path d="M8 15a6 6 0 1 0 12 0v-3" />
            <path d="M11 3v2" />
            <path d="M6 3v2" />
            <path d="M20 10m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
          </svg>
        )}
      </div>
      <div className="text-white gap-5 my-5">
        <p className="flex align-middle justify-center">
          Join as {isPatient ? "Patient" : "Doctor"}
        </p>
        <p
          className="flex items-center justify-center my-5 w-full"
          onClick={() => setPatient(!isPatient)}
        >
          {isPatient ? (
            <div className="flex items-center justify-center gap-2">
              Switch
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-toggle-left"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="#ffffff"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M8 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                <path d="M2 6m0 6a6 6 0 0 1 6 -6h8a6 6 0 0 1 6 6v0a6 6 0 0 1 -6 6h-8a6 6 0 0 1 -6 -6z" />
              </svg>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              Switch
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-toggle-right"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="#ffffff"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M16 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                <path d="M2 6m0 6a6 6 0 0 1 6 -6h8a6 6 0 0 1 6 6v0a6 6 0 0 1 -6 6h-8a6 6 0 0 1 -6 -6z" />
              </svg>
            </div>
          )}
        </p>
      </div>
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
      </div>
    </div>
  );
};

export default HomePage;
