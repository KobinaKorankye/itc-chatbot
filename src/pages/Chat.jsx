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
  faClose,
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

const SIDE_MENUS = {
  FILES: "files",
  HISTORY: "history",
};

function Chat() {
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedMsgChunks, setSelectedMessageChunks] = useState({});
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);

  const [uploading, setUpLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(true);
  const [taskId, setTaskId] = useState("");
  const [showErrorIndicator, setShowErrorIndicator] = useState(false);
  const [showCSRFButton, setShowCSRFButton] = useState(false);

  const { user } = useContext(AppContext);

  const [csrfToken, setCSRFToken] = useState("");
  const [uploadedFileNames, setUploadedFileNames] = useState([]);
  const [visibleSideMenu, setVisibleSideMenu] = useState(SIDE_MENUS.HISTORY);
  const [socket, setSocket] = useState(null);
  const [models, setModels] = useState(["athropic", "gpt3.5", "gpt4"]);
  const [chunks, setChunks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [taskProgressDisplay, setTaskProgressDisplay] = useState([]);
  const [typingIndicator, setTypingIndicator] = useState(false);

  const bottomRef = useRef(null);
  const bottomRefMobile = useRef(null);

  useEffect(() => {
    // Scroll to the bottom of the div
    bottomRefMobile.current?.scrollIntoView({ behavior: "smooth" });
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingIndicator]);

  useEffect(() => {
    if (taskId) {
      const sse = new EventSource(`${SOCKET_SERVER_URL}/task-status/${taskId}`);
      function getRealtimeData(data) {
        if (data.status == "Processing") {
          setTaskProgressDisplay(
            "Processing: " + parseInt((data.current * 100) / data.total) + "%"
          );
        } else if (data.status == "Task completed") {
          setTaskProgressDisplay("Done");
          sse.close()
          setTaskId("");
        } else {
          setTaskProgressDisplay(data.status);
        }
        console.log(data);
      }
      sse.onmessage = (e) => {
        getRealtimeData(JSON.parse(e.data));
      };
      sse.onerror = (e) => {
        // error log here
        console.log('Test phrase for error: ',e);
        sse.close();
      };
      return () => {
        sse.close();
      };
    }
  }, [taskId]);

  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket = io(SOCKET_SERVER_URL);
    try {
      newSocket.on("connect", (data) => {
        console.log("Connected to socket server");
        setConnected(true);
      });

      newSocket.on("typing_indicator", () => {
        setTypingIndicator(true);
        console.log("typing");
      });

      newSocket.on("model_response", (message) => {
        const msg = {
          text: message.content,
          incoming: true,
          model: message.model,
        };
        setMessages((prevMessages) => [msg, ...prevMessages]);
        console.log("Message from llm: ", message);
        setTypingIndicator(false);
      });

      newSocket.on("chunks_retrieved", (chunks) => {
        setChunks((prevChunks) => [chunks, ...prevChunks]);
        console.log(chunks);
      });

      newSocket.on("error", (message) => {
        console.log("Error Event: ", message);
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

  const sendMessage = (message, index, size) => {
    if (socket) {
      const msg = {
        text: message,
        incoming: false,
      };
      setMessages((prevMessages) => [msg, ...prevMessages]);
      socket.emit("chat", {
        message,
        index: index || "search-chatbot",
        models: ["gpt4"],
        size: size || 3,
      });
      setMessage("");
    }
  };

  const onFileSelectUploadIndexOnly = async (event) => {
    const file = event.target.files[0];

    console.log("Trying to upload");
    if (file) {
      console.log("Trying to upload file");
      const formData = new FormData();
      formData.append("csrf_token", csrfToken);
      formData.append("index", `${Date.now()}`);
      formData.append("data", file);
      // formData.append("split_size", 3);

      setUpLoading(true);
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
      setUpLoading(false);
    }
  };

  const onFileSelectUploadAndStoreAndIndex = async (event) => {
    const file = event.target.files[0];

    console.log("Trying to upload");
    if (file) {
      console.log("Trying to upload file");
      let formData = new FormData();
      formData.append("data", file);
      formData.append("csrf_token", csrfToken);

      setUpLoading(true);
      try {
        const response = await axios.post(
          `${SOCKET_SERVER_URL}/upload-s3`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("File uploaded successfully", response.data);
        getAllUploadedFileNames();

        // formData = new FormData();
        // formData.append("file", file.name);
        // formData.append("index", `${Date.now()}`);
        // formData.append("csrf_token", csrfToken);
        const { data } = await axios.post(`${SOCKET_SERVER_URL}/index`, {
          file: file.name,
          index: `${Date.now()}`,
          split_size: 3,
        });

        setTaskId(data.task_id);

        console.log("File indexed successfully", data);
        setUploadSuccess(true);
      } catch (error) {
        alert("Error");
        console.error("Error: ", error);
        setUploadSuccess(false);
      }
      setUpLoading(false);
    }
  };

  const getAllUploadedFileNames = async () => {
    try {
      const { data } = await axios.get(`${SOCKET_SERVER_URL}/get-files`);
      setUploadedFileNames(data.files);
      console.log("Files: ", data.files);
    } catch (error) {
      alert("Error getting file list");
      console.error("Error getting file list: ", error);
    }
  };

  useEffect(() => {
    getAllUploadedFileNames();
  }, [uploadSuccess]);

  return (
    <div className="flex flex-col h-[100vh] bg-white text-black items-center">
      {Object.keys(selectedMsgChunks).length > 0 && (
        <div className="bg-black/50 border border-gray-600 rounded absolute h-[100vh] w-full flex justify-center items-center">
          <div className="bg-white rounded-lg w-[80%] md:w-[60%] p-10 pt-0">
            <div className="flex w-full my-5 justify-end">
              <FontAwesomeIcon
                onClick={() => setSelectedMessageChunks({})}
                className="cursor-pointer"
                size="lg"
                icon={faClose}
              />
            </div>
            <div className="flex items-center gap-2">
              <div style={{ fontFamily: "PoorStory" }}>Prompt</div>
              <div className="py-1 px-4 bg-gray-200 border border-gray-300 border border-gray-300 flex-1 rounded-lg max-h-[10vh] text-wrap text-sm overflow-y-scroll">
                {selectedMsgChunks.chunks[0].Question}
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div style={{ fontFamily: "PoorStory" }}>Chunks Retrieved</div>
              <div className="flex gap-1">
                {selectedMsgChunks.chunks.map((chunk, index) => (
                  <div
                    onClick={() => {
                      setCurrentChunkIndex(index);
                    }}
                    className={`${
                      index == currentChunkIndex
                        ? "text-white bg-sky-600"
                        : "text-black bg-sky-100"
                    } flex cursor-pointer justify-center items-center w-5 h-5 text-sm rounded`}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-200 border border-gray-300 w-full rounded max-h-[40vh] py-1 px-4 text-wrap text-sm overflow-y-scroll">
              <div>
                {selectedMsgChunks.chunks[currentChunkIndex]["Passage 1"]}
              </div>
            </div>
            <div className="flex items-center gap-1 mt-5 justify-end font-semibold">
              <div style={{ fontFamily: "PoorStory" }} className="text-base">
                Relevance Score:
              </div>
              <div className="bg-green-700 text-white text-xs px-2 py-1 rounded">
                <div>
                  {
                    selectedMsgChunks.chunks[currentChunkIndex][
                      "Relevance Score 1"
                    ]
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

          <div className="flex m-3 items-center text-sky-100 cursor-pointer bg-sky-800 rounded-lg">
            <div
              onClick={() => setVisibleSideMenu(SIDE_MENUS.FILES)}
              className={`text-white ${
                visibleSideMenu == SIDE_MENUS.FILES ? "bg-sky-500/80" : ""
              } rounded-lg text-center p-2 uppercase text-xs flex-1`}
            >
              Files
            </div>
            <div
              onClick={() => setVisibleSideMenu(SIDE_MENUS.HISTORY)}
              className={`text-white ${
                visibleSideMenu == SIDE_MENUS.HISTORY ? "bg-sky-500/80" : ""
              } rounded-lg text-center p-2 uppercase text-xs flex-1`}
            >
              History
            </div>
          </div>

          {visibleSideMenu == SIDE_MENUS.HISTORY && (
            <div>
              <div className="text-xs font-semibold ml-4 text-gray-300 mt-5">
                Today
              </div>

              <div className="flex m-3 p-2 items-center text-sky-100 cursor-pointer bg-sky-800 hover:bg-sky-700 rounded-lg">
                <div className="text-white ml-2 text-sm">
                  First Agent Test Chat
                </div>
              </div>
            </div>
          )}

          {visibleSideMenu == SIDE_MENUS.FILES && (
            <div>
              <div className="text-xs font-semibold ml-4 mb-5 text-gray-300 mt-5">
                Files in S3
              </div>
              {uploadedFileNames.map((file, index) => (
                <div className="text-white mx-2 p-2 py-1 rounded text-sm truncate">
                  {index + 1}. {file}
                </div>
              ))}
            </div>
          )}

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
            <div className="flex flex-col w-[77%] h-[78vh] overflow-y-scroll py-2">
              <div className="flex flex-col-reverse gap-2 flex-grow">
                <div ref={bottomRefMobile}></div>
                {typingIndicator && (
                  <div className="flex items-center ml-8">
                    <Loader height={80} width={80} />
                  </div>
                )}
                {messages.map((message, index) => {
                  if (message.incoming) {
                    return (
                      <BotMessage
                        onChunksClick={() =>
                          setSelectedMessageChunks(chunks[parseInt(index / 2)])
                        }
                        key={index}
                        message={message}
                      />
                    );
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
                sendMessage(message);
              }}
              onFileSelect={onFileSelectUploadAndStoreAndIndex}
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
            <div
              style={{ fontFamily: "BlackOps" }}
              className="text-[20px] text-gray-700 font-semibold mt-10"
            >
              ITC Agent
            </div>
            <div
              className={`flex m-5 p-2 items-center border ${
                connected ? "border-teal-500" : "border-amber-500"
              } rounded`}
            >
              <div
                className={`${
                  connected ? "text-teal-700" : "text-amber-700"
                } ml-2 text-xs`}
              >
                {connected ? "connected" : "connecting..."}
              </div>
              {connected ? (
                <FontAwesomeIcon
                  className="text-teal-600 ml-5"
                  size="1x"
                  icon={faCheck}
                />
              ) : (
                <FontAwesomeIcon
                  className="text-amber-600 ml-5"
                  size="1x"
                  icon={faEllipsis}
                />
              )}
            </div>

            {uploading && (
              <div
                className={`flex font-semibold m-5 p-2 px-6 items-center border text-xs mt-20 ${
                  uploading
                    ? "border-amber-600 text-amber-600"
                    : uploadSuccess
                    ? "border-teal-700 text-teal-700"
                    : "border-red-600 text-red-600"
                } rounded`}
              >
                <div
                  className={`${
                    uploading ? "opacity-100" : "opacity-0"
                  } duration-500`}
                >
                  {uploading
                    ? "uploading..."
                    : uploadSuccess
                    ? "upload successful"
                    : "upload failed"}
                </div>
              </div>
            )}

            {(taskId || taskProgressDisplay == "Done") && (
              <div
                className={`${
                  taskProgressDisplay == "Done" ? "opacity-0" : "opacity-100"
                } duration-500 flex font-semibold m-5 p-2 px-6 items-center border text-xs mt-20 rounded`}
              >
                <div>{taskProgressDisplay}</div>
              </div>
            )}

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
                    return (
                      <BotMessage
                        key={index}
                        onChunksClick={() =>
                          setSelectedMessageChunks(chunks[parseInt(index / 2)])
                        }
                        message={message}
                      />
                    );
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
                sendMessage(message);
              }}
              onFileSelect={onFileSelectUploadAndStoreAndIndex}
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
