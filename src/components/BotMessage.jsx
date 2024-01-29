import React from "react";
import ITCLogo from "../assets/ITCLogo.jpeg";

export default function BotMessage({ message }) {
  return (
    <div className="flex w-full text-gray-500">
      <div className="h-6 w-6 flex justify-center items-center self-start rounded-full overflow-hidden border border-gray-500 bg-white">
        <img src={ITCLogo} />
      </div>
      <div className="px-5 flex-1">
        <div className="font-bold text-black">ITC Agent</div>
        <div style={{ fontFamily: "ShareTech" }}>{message}</div>
      </div>
    </div>
  );
}
