// pages/index.tsx
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { generateRandomAlphanumeric } from "@/lib/util";
import Head from "next/head";

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
      )}?patient=${isPatient}&name=${isPatient ? "Patient" : name}`;
    }
  }, [roomName]);

  return (
    <div className="flex flex-col items-start justify-center min-h-screen container mx-auto px-10 bg-gray-900">
      <Head>
        <title>Persona </title>
      </Head>

      <div className="flex flex-col gap-2">
        <div className="text-white mb-4 text-left">
          <h1 className="text-white font-bold text-6xl">Persona </h1>
          <p>Anonymous conference for mental health care</p>
        </div>

        {!isPatient ? (
          <input
            type="text"
            value={name}
            className="p-2 rounded"
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
          />
        ) : (
          <h2 className="text-gray-200 opacity-20">
            Patient cannot set name to ensure anonymity
          </h2>
        )}

        <h2 className="text-white mt-4 opacity-50">Join an ongoing meeting</h2>

        <div className="flex justify-between gap-1">
          <input
            value={roomNameInput}
            onChange={(e) => setRoomNameInput(e.target.value)}
            placeholder="Enter Code"
            type="text"
            className="px-2 py-2 rounded flex-1"
          />

          {roomNameInput ? (
            <button
              onClick={() => setRoomName(roomNameInput)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Join
            </button>
          ) : (
            <button
              disabled
              className="px-4 py-2 bg-gray-400 opacity-30 text-white rounded"
            >
              Join
            </button>
          )}
        </div>

        <button
          onClick={handleGenerateRoomName}
          className="px-4 py-4 bg-blue-500 hover:bg-blue-700 text-white rounded font-bold flex items-center gap-2 justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="icon icon-tabler icon-tabler-video-plus"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="#ffffff"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4z" />
            <path d="M3 6m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z" />
            <path d="M7 12l4 0" />
            <path d="M9 10l0 4" />
          </svg>
          Start New Meeting
        </button>

        <div className="flex text-white gap-5 ">
          <p className="flex align-middle justify-center">Join as Patient</p>
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
