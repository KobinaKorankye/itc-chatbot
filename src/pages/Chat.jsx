import ITCLogo from "../assets/ITCLogo.jpeg";
import ChangoLogo from "../assets/Chango.png";
import TransflowLogo from "../assets/Transflow.png";
import MessageInput from "../components/MessageInput";
import Loader from "../loader/Loader";
import UserMessage from "../components/UserMessage";
import BotMessage from "../components/BotMessage";
import {
  faArrowUp,
  faFile,
  faNoteSticky,
  faPenClip,
  faPenToSquare,
  faStickyNote,
} from "@fortawesome/free-solid-svg-icons";
import { useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AppContext from "../contexts/AppContext";

const SOCKET_SERVER_URL = "https://itc-bot-backend.onrender.com";

function Chat() {
  const [message, setMessage] = useState("");
  const {user} = useContext(AppContext);

  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingIndicator, setTypingIndicator] = useState(false);

  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket = io(SOCKET_SERVER_URL, { path: "/connect" });

    newSocket.on("connection", (data) => {
      console.log("Connected to socket server");
      console.log(data);
    });

    newSocket.on("typing_indicator", () => {
      setTypingIndicator(true);
    });

    newSocket.on("message_from_llm", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      setTypingIndicator(false);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  const sendMessage = (message, connectionId, index, size) => {
    if (socket) {
      socket.emit("chat", {
        message,
        connection_id: connectionId,
        index: index || "search-chatbot-final",
        size: size || 2,
      });
    }
  };

  return (
    <div className="flex flex-col h-[100vh] bg-white text-black items-center">
      <div className="w-full h-full flex">
        <div className="-md:hidden flex flex-col h-full bg-sky-900 w-[20%]">
          <div className="flex m-3 p-2 items-center text-sky-100 cursor-pointer bg-sky-800 hover:bg-sky-700 rounded-lg">
            <div className="bg-white p-1 rounded-full">
              <img src={ITCLogo} className="h-5 rounded-full" />
            </div>
            <div
              // style={{ fontFamily: "Ubuntu" }}
              className="text-white font-semibold ml-2 text-sm"
            >
              ITC Agent
            </div>

            <FontAwesomeIcon
              className="cursor-pointer ml-auto text-white"
              size="1x"
              icon={faPenToSquare}
            />
          </div>

          <div className="text-xs font-semibold ml-4 text-gray-300 mt-5">
            Today
          </div>

          <div className="flex m-3 p-2 items-center text-sky-100 cursor-pointer bg-sky-800 hover:bg-sky-700 rounded-lg">
            <div className="text-white ml-2 text-sm">First Agent Test Chat</div>
          </div>

          <div className="flex mt-auto p-5 items-center text-sky-100 cursor-pointer hover:bg-sky-700 rounded-lg">
            <div className="h-[35px] w-[35px] uppercase flex font-semibold text-white text-lg justify-center items-center rounded-full overflow-hidden border border-gray-700 bg-zinc-500">
              {user[0]}
            </div>
            <div className="ml-2 text-gray-200 text-sm font-semibold">{user}</div>
          </div>
        </div>

        {/* MOBILE */}
        <div className="md:hidden w-full">
          <div className="w-full h-[15vh] flex items-center pl-10">
            <div className="ml-5 bg-white p-2 rounded-full">
              <img src={ITCLogo} className="h-10 rounded-full" />
            </div>
            {/* <div className="bg-white ml-5 p-2 rounded-xl">
              <img
                src={ChangoLogo}
                className="h-10"
              />
            </div> */}
            <div
              style={{ fontFamily: "BlackOps" }}
              className="text-[24px] text-gray-700 ml-5 font-semibold"
            >
              ITC Agent
            </div>
            {/* <div className="bg-white ml-5 p-2 rounded-xl">
              <img
                src={TransflowLogo}
                className="h-10"
              />
            </div> */}
          </div>
          <div className="flex flex-col items-center h-[85vh] w-full">
            <div className="flex flex-col w-[80%] h-[78vh] overflow-y-scroll py-2">
              <div className="flex flex-col-reverse gap-2 flex-grow">
                <div className="flex items-center ml-5">
                  <Loader height={80} width={80} />
                </div>
                <UserMessage message={"I'm good, how about you?"} />
                <BotMessage
                  message={
                    "Hi, How's it going? Hi, How's it going? Hi, How's it going? Hi, How's it going? Hi, How's it going? Hi, How's it going? Hi, How's it going?"
                  }
                />
                <UserMessage message={"Hello"} />
              </div>
            </div>
            <MessageInput
              icon={faArrowUp}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              boxClassName={"w-[85%]"}
              placeholder={"Message ITC Agent"}
            />
          </div>
        </div>

        {/* WEB */}
        <div className="-md:hidden flex h-full w-full">
          <div className="w-[20%] h-[15vh] flex items-center pl-10">
            {/* <div className="ml-1 bg-white p-2 rounded-xl">
              <img src={ITCLogo} className="h-10 rounded-xl" />
            </div> */}
            {/* <div className="bg-white ml-5 p-2 rounded-xl">
              <img
                src={ChangoLogo}
                className="h-10"
              />
            </div> */}
            <div
              style={{ fontFamily: "BlackOps" }}
              className="text-[24px] text-gray-700 ml-5 font-semibold"
            >
              ITC Agent
            </div>
            {/* <div className="bg-white ml-5 p-2 rounded-xl">
              <img
                src={TransflowLogo}
                className="h-10"
              />
            </div> */}
          </div>
          <div className="flex flex-col items-center h-full w-[70%]">
            <div className="flex flex-col w-[80%] h-full overflow-y-scroll py-2">
              <div className="flex gap-4 flex-col-reverse flex-grow">
                <div className="flex items-center ml-5">
                  <Loader height={80} width={80} />
                </div>
                <UserMessage message={"I'm good, how about you?"} />
                <BotMessage message={"Hi, How's it going?"} />
                <UserMessage message={"I'm good, how about you?"} />
                <BotMessage message={"Hi, How's it going?"} />
                <UserMessage message={"Hello"} />
              </div>
            </div>
            <MessageInput
              icon={faArrowUp}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              boxClassName={"w-[80%]"}
              placeholder={"Message ITC Agent"}
            />
            <div className="text-gray-400 my-2 text-xs">
              ITC Agent might make errors; cross-check vital information
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
