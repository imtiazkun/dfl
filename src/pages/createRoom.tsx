import { useState } from "react";
import { useRouter } from "next/router";

export default function CreateRoom() {
  const [roomName, setRoomName] = useState("");
  const router = useRouter();

  const handleCreateRoom = async () => {
    const identity = "User_" + Math.random().toString(36).substr(2, 9); // Example identity
    try {
      const response = await fetch("/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomName, identity }),
      });
      if (!response.ok) throw new Error("Token generation failed");
      const { token } = await response.json();
      // Redirect to the Playground page with room details
      router.push(
        `/playground?roomName=${roomName}&token=${token}&identity=${identity}`
      );
    } catch (error) {
      console.error("Failed to generate token:", error);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Room Name"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
      />
      <button onClick={handleCreateRoom}>Create Room</button>
    </div>
  );
}
