import React from "react";
import ITCLogo from "../assets/ITCLogo.jpeg";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MarkdownParser from "./MarkDownParser";

export default function BotMessage({ message, onChunksClick }) {
  return (
    <div className="flex w-full text-gray-500">
      <div className="h-6 w-6 flex justify-center items-center self-start rounded-full overflow-hidden border border-gray-500 bg-white">
        <img src={ITCLogo} />
      </div>
      <div className="px-5 flex-1">
        <div className="font-bold text-black">ITC Agent</div>
        {/* <div style={{ fontFamily: "ShareTech" }}>{message}</div> */}
        <div style={{ fontFamily: "Ubuntu" }}>
          {/* <Markdown remarkPlugins={[remarkGfm]}>{message}</Markdown> */}
          <MarkdownParser text={message} />
          {/* <Markdown remarkPlugins={[remarkGfm]}>{message}</Markdown> */}
        </div>
        <div className="flex mt-2 cursor-pointer">
          <div onClick={onChunksClick} className="font-bold text-xs bg-teal-100 text-gray-700 hover:bg-teal-600 hover:text-white p-1 rounded-lg">
            chunks
          </div>
        </div>
      </div>
    </div>
  );
}
