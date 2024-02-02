import ITCLogo from "../assets/ITCLogo.jpeg";
import ChangoLogo from "../assets/Chango.png";
import TransflowLogo from "../assets/Transflow.png";
import MessageInput from "../components/MessageInput";
import Loader from "../loader/Loader";
import UserMessage from "../components/UserMessage";
import BotMessage from "../components/BotMessage";
import {
  faArrowUp,
  faCheck,
  faEllipsis,
  faFile,
  faNoteSticky,
  faPenClip,
  faPenToSquare,
  faStickyNote,
} from "@fortawesome/free-solid-svg-icons";
import { useContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AppContext from "../contexts/AppContext";
import axios from "axios";

const SOCKET_SERVER_URL = "http://54.246.247.31:8000";

function Chat() {
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const { user } = useContext(AppContext);
  const [connectionId, setConnectionId] = useState("");

  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingIndicator, setTypingIndicator] = useState(false);

  const bottomRef = useRef(null);
  const bottomRefMobile = useRef(null);

  useEffect(() => {
    // Scroll to the bottom of the div
    bottomRefMobile.current?.scrollIntoView({ behavior: "smooth" });
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingIndicator]);

  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket = io(SOCKET_SERVER_URL);
    try {
      newSocket.on("connection", (data) => {
        console.log("Connected to socket server");
        setConnected(true);
        setConnectionId(data.connection_id);
        console.log(data);
      });

      newSocket.on("typing_indicator", () => {
        setTypingIndicator(true);
        console.log("typing");
      });

      newSocket.on("message_from_llm", (message) => {
        const msg = {
          text: message.message,
          incoming: true,
        };
        setMessages((prevMessages) => [msg, ...prevMessages]);
        console.log("Message from llm: ", message);
        setTypingIndicator(false);
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from socket server");
        setConnected(false);
        // Perform any additional actions upon disconnection
      });

      setSocket(newSocket);
    } catch (error) {
      console.log(error);
    }

    return () => newSocket.disconnect();
  }, []);

  const sendMessage = (message, connectionId, index, size) => {
    if (socket) {
      const msg = {
        text: message,
        incoming: false,
      };
      setMessages((prevMessages) => [msg, ...prevMessages]);
      socket.emit("chat", {
        message,
        connection_id: connectionId,
        index: index || "search-chatbot",
        size: size || 3,
      });
      setMessage("");
    }
  };

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  const onFileSelect = async (event) => {
    const file = event.target.files[0];

    console.log('Trying to upload')
    if (file) {
      console.log('Trying to upload file')
      const formData = new FormData();
      formData.append("index", `${Date.now()}`);
      formData.append("data", file); // The key 'file' should be according to your server's expected field.

      try {
        const response = await axios.post(
          `${SOCKET_SERVER_URL}/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert("Upload successful");
        console.log("File uploaded successfully", response.data);
      } catch (error) {
        alert("Error uploading");
        console.error("Error uploading file", error);
      }
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
            <div className="ml-2 text-gray-200 text-sm font-semibold">
              {user}
            </div>
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
                <div ref={bottomRefMobile}></div>
                {typingIndicator && (
                  <div className="flex items-center ml-8">
                    <Loader height={80} width={80} />
                  </div>
                )}
                {messages.map((message, index) => {
                  if (message.incoming) {
                    return <BotMessage key={index} message={message.text} />;
                  } else {
                    return <UserMessage key={index} message={message.text} />;
                  }
                })}
              </div>
            </div>
            <MessageInput
              icon={faArrowUp}
              value={message}
              disabled={typingIndicator}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              onIconClick={() => {
                sendMessage(message, connectionId);
              }}
              onFileSelect={onFileSelect}
              boxClassName={"w-[80%]"}
              placeholder={"Message ITC Agent"}
            />
            <div className="text-gray-400 my-2 text-xs">
              ITC Agent might make errors; cross-check vital information
            </div>
          </div>
        </div>

        {/* WEB */}
        <div className="-md:hidden flex h-full w-full">
          <div className="w-[20%] flex flex-col items-center">
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
              className="text-[24px] text-gray-700 font-semibold mt-10"
            >
              ITC Agent
            </div>
            <div
              className={`flex m-5 p-2 items-center border ${
                connected ? "border-teal-500" : "border-amber-500"
              } rounded-lg`}
            >
              <div
                // style={{ fontFamily: "Ubuntu" }}
                className={`${
                  connected ? "text-teal-700" : "text-amber-700"
                } ml-2 text-xs`}
              >
                {connected ? "connected" : "connecting..."}
              </div>
              {
                connected?
                <FontAwesomeIcon
                  className="text-teal-600 mx-3"
                  size="1x"
                  icon={faCheck}
                />
                :
                <FontAwesomeIcon
                  className="text-amber-600 mx-3"
                  size="1x"
                  icon={faEllipsis}
                />
              }
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
                <div ref={bottomRef}></div>
                {typingIndicator && (
                  <div className="flex items-center ml-8">
                    <Loader height={80} width={80} />
                  </div>
                )}
                {messages.map((message, index) => {
                  if (message.incoming) {
                    return <BotMessage key={index} message={message.text} />;
                  } else {
                    return <UserMessage key={index} message={message.text} />;
                  }
                })}
              </div>
            </div>
            <MessageInput
              icon={faArrowUp}
              value={message}
              disabled={typingIndicator}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              onIconClick={() => {
                sendMessage(message, connectionId);
              }}
              onFileSelect={onFileSelect}
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
