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
  faFileAlt,
  faFileCirclePlus,
  faFileUpload,
  faFolder,
  faNoteSticky,
  faPenClip,
  faPenToSquare,
  faStickyNote,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { useContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AppContext from "../contexts/AppContext";
import axios from "axios";
import { Tooltip } from "react-tooltip";
import FileItem from "../components/FileItem";
import FolderItem from "../components/FolderItem";
import Button from "../components/Button";
import DropDown from "../components/Dropdown";

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

  const [selectedFile, setSelectedFile] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");

  const [uploading, setUpLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(true);
  const [taskId, setTaskId] = useState("");
  const [showErrorIndicator, setShowErrorIndicator] = useState(false);
  const [showCSRFButton, setShowCSRFButton] = useState(false);

  const { user, toastShow } = useContext(AppContext);

  const [csrfToken, setCSRFToken] = useState("");
  const [uploadedFileNames, setUploadedFileNames] = useState([]);
  const [visibleSideMenu, setVisibleSideMenu] = useState(SIDE_MENUS.HISTORY);
  const [socket, setSocket] = useState(null);
  const [models, setModels] = useState(["athropic", "gpt3.5", "gpt4"]);
  const [selectedModel, setSelectedModel] = useState("gpt4");
  const [chunks, setChunks] = useState([]);
  const chunkEventHandledRef = useRef(false);
  const typingEventHandledRef = useRef(false);
  const [messages, setMessages] = useState({
    athropic: [],
    "gpt3.5": [],
    gpt4: [],
  });
  const [taskProgressDisplay, setTaskProgressDisplay] = useState([]);
  const [typingIndicators, setTypingIndicators] = useState({
    athropic: false,
    "gpt3.5": false,
    gpt4: false,
  });
  const [showDocuments, setShowDocuments] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [yesPressed, setYesPressed] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalFunction, setModalFunction] = useState(() => {
    () => {};
  });

  const bottomRef = useRef(null);
  const bottomRefMobile = useRef(null);

  const [folderFiles, setFolderFiles] = useState({});
  const [folderForUpload, setFolderForUpload] = useState("chatbot-files");

  const [talkingTo, setTalkingTo] = useState("");

  useEffect(() => {
    if (Object.keys(folderFiles).length == 0) {
      setTalkingTo("");
    }
  }, [folderFiles]);

  useEffect(() => {
    // Scroll to the bottom of the div
    bottomRefMobile.current?.scrollIntoView({ behavior: "smooth" });
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingIndicators]);

  useEffect(() => {
    if (taskId) {
      const sse = new EventSource(`${SOCKET_SERVER_URL}/task-status/${taskId}`);
      function getRealtimeData(data) {
        if (data.status == "Processing") {
          toastShow(
            "Indexing: " + parseInt((data.current * 100) / data.total) + "%",
            "bg-blue-800/70 text-white font-semibold",
            false
          );
          setTaskProgressDisplay(
            "Indexing: " + parseInt((data.current * 100) / data.total) + "%"
          );
        } else if (data.status == "Task completed") {
          toastShow(
            "Indexing: 100% (Complete)",
            "bg-green-600 text-white font-semibold"
          );
          setTaskProgressDisplay("Done");
          sse.close();
          setTaskId("");
        } else {
          toastShow(
            "Preparing document for indexing...",
            "bg-amber-500 text-white font-semibold",
            false
          );
          setTaskProgressDisplay(data.status);
        }
        console.log(data);
      }
      sse.onmessage = (e) => {
        getRealtimeData(JSON.parse(e.data));
      };
      sse.onerror = (e) => {
        // error log here
        console.log("Test phrase for error: ", e);
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
        if (!typingEventHandledRef.current) {
          setTypingIndicators({
            athropic: true,
            "gpt3.5": true,
            gpt4: true,
          });

          typingEventHandledRef.current = true;
        }
        console.log("typing");
      });

      newSocket.on("model_response", (message) => {
        const msg = {
          text: message.content,
          incoming: true,
          model: message.model,
        };
        console.log("MR:: : ", message.model);
        setMessages((prevModelMessages) => {
          const newModelMessages = { ...prevModelMessages };
          newModelMessages[message.model] = [
            msg,
            ...newModelMessages[message.model],
          ];
          return newModelMessages;
        });
        setTypingIndicators((prevIndicators) => {
          const newIndicators = { ...prevIndicators };
          newIndicators[message.model] = false;
          console.log("MR:: : ", message.model, newIndicators);
          return newIndicators;
        });
      });

      newSocket.on("chunks_retrieved", (chunks) => {
        if (!chunkEventHandledRef.current) {
          setChunks((prevChunks) => [chunks, ...prevChunks]);
          console.log(chunks);
          chunkEventHandledRef.current = true;
        }
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
      chunkEventHandledRef.current = false;
      typingEventHandledRef.current = false;
      const msg = {
        text: message,
        incoming: false,
      };
      setMessages((prevModelMessages) => {
        const newModelMessages = { ...prevModelMessages };
        for (let model in messages) {
          newModelMessages[model] = [msg, ...newModelMessages[model]];
        }
        return newModelMessages;
      });
      socket.emit("chat", {
        message,
        index: talkingTo,
        models: models,
        size: size || 3,
      });
      setMessage("");
    }
  };

  const indexDoc = async (docName) => {
    try {
      const { data } = await axios.post(`${SOCKET_SERVER_URL}/index`, {
        file: docName,
        split_size: 3,
      });

      setTaskId(data.task_id);
      setUploadSuccess(true);
      console.log("File indexed successfully", data);
    } catch (error) {
      console.error("Error indexing file", error);
    }
  };

  const onFileUpload = async () => {
    const file = selectedFile;

    if (
      folderForUpload == "Create a new folder" &&
      newFolderName.trim() == ""
    ) {
      toastShow(
        "Cannot create a new folder without specifying a name",
        "bg-red-600 text-white font-semibold"
      );
      return;
    } else if (newFolderName.trim() == "chatbot-files") {
      toastShow(
        "Cannot use reserved folder name: 'chatbot-files'",
        "bg-red-600 text-white font-semibold"
      );
      return;
    }

    console.log("Trying to upload");
    if (file) {
      console.log("Trying to upload file");
      let formData = new FormData();
      formData.append("data", file);

      let foldername = null;

      if (
        newFolderName ||
        (folderForUpload && folderForUpload !== "chatbot-files")
      ) {
        foldername = newFolderName ? newFolderName.trim() : folderForUpload;
        formData.append("folder_name", foldername);
      }

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
        toastShow(
          "Successfully uploaded document",
          "bg-green-600 text-white font-semibold"
        );
        getAllUploadedFileNames();

        const body =
          folderForUpload !== "chatbot-files"
            ? {
                file: foldername,
                split_size: 3,
              }
            : {
                file: "chatbot-files/" + file.name,
                split_size: 3,
              };

        const { data } = await axios.post(`${SOCKET_SERVER_URL}/index`, body);

        setTaskId(data.task_id);

        setFolderForUpload("chatbot-files");
        setNewFolderName("");
        setUploadSuccess(true);
      } catch (error) {
        toastShow("Upload failed", "bg-red-600 text-white font-semibold");
        console.error("Error: ", error);
      }
      setUpLoading(false);
      setSelectedFile(null);
    }
  };

  const getAllUploadedFileNames = async () => {
    try {
      const { data } = await axios.get(`${SOCKET_SERVER_URL}/files`);
      setUploadedFileNames(data.files);
      groupFolderFiles(data.files);
      // console.log("Files: ", data.files);
    } catch (error) {
      alert("Error getting file list");
      console.error("Error getting file list: ", error);
    }
  };

  const showConfirmatoryModal = (func, title, message, funcArgument) => {
    setYesPressed(false);
    setShowModal(true);
    setModalFunction(() => () => {
      func(funcArgument);
    });
    setModalTitle(title);
    setModalMessage(message);
  };

  const deleteDoc = async (name) => {
    const firstIndex = name.indexOf("/");
    const foldername = name.substring(0, firstIndex);
    const willBeEmptyAfterDelete = folderFiles[foldername].length == 1;
    try {
      if (willBeEmptyAfterDelete) {
        const { data } = await axios.delete(`${SOCKET_SERVER_URL}/files`, {
          data: { file: `${foldername}/*` },
        });
        getAllUploadedFileNames();
        toastShow(
          "Successfully deleted document",
          "bg-green-600 text-white font-semibold"
        );
      } else if (foldername !== "chatbot-files") {
        const response = await axios.delete(`${SOCKET_SERVER_URL}/files`, {
          data: { file: name },
        });
        getAllUploadedFileNames();
        toastShow(
          "Successfully deleted document",
          "bg-green-600 text-white font-semibold"
        );

        const body = {
          file: foldername,
          split_size: 3,
        };

        const { data } = await axios.post(`${SOCKET_SERVER_URL}/index`, body);

        setTaskId(data.task_id);
      } else {
        const { data } = await axios.delete(`${SOCKET_SERVER_URL}/files`, {
          data: { file: name },
        });
        getAllUploadedFileNames();
        toastShow(
          "Successfully deleted document",
          "bg-green-600 text-white font-semibold"
        );
      }
    } catch (error) {
      console.error("Error deleting: ", error);
      toastShow(
        "Failed to delete document",
        "bg-red-600 text-white font-semibold"
      );
    }

    setTalkingTo("");
  };

  const groupFolderFiles = (filenames) => {
    const groupings = {};

    filenames.forEach((filename) => {
      const firstIndex = filename.indexOf("/");

      if (firstIndex === -1) {
        if ("no-folder" in groupings) {
          groupings["no-folder"].push(filename);
        } else {
          groupings["no-folder"] = [filename];
        }
      } else {
        const foldername = filename.substring(0, firstIndex);
        const actualname = filename.substring(firstIndex + 1, filename.length);
        if (foldername in groupings) {
          groupings[foldername].push(actualname);
        } else {
          groupings[foldername] = [actualname];
        }
      }
    });

    setFolderFiles(groupings);
  };

  useEffect(() => {
    getAllUploadedFileNames();
  }, [uploadSuccess]);

  useEffect(() => {
    if (!showDocuments) {
      setSelectedFile(null);
      setFolderForUpload("chatbot-files");
      setNewFolderName("");
    }
  }, [showDocuments]);

  useEffect(() => {
    // indexDoc("chatbot-files/extracted_pages.zip");
  }, []);

  return (
    <div className="flex flex-col h-[100vh] bg-white text-black items-center">
      {showDocuments && (
        <div className="bg-black/50 border border-gray-600 rounded absolute z-[5] h-[100vh] w-full flex justify-center items-start p-10">
          <div className="flex flex-col bg-white rounded w-[80%] md:w-[60%] h-[80vh] p-10 pt-0">
            <div className="flex w-full my-5 justify-end">
              <FontAwesomeIcon
                onClick={() => {
                  setShowDocuments(false);
                }}
                className="cursor-pointer"
                size="lg"
                icon={faClose}
              />
            </div>
            <div className="text-2xl font-semibold mt-10 mb-5">Documents</div>
            <div className="flex border-b-2 border-gray-500 mb-8 py-2">
              <div
                className="ml-5"
                data-tooltip-content={"Upload document"}
                data-tooltip-id="add"
              >
                <input
                  style={{ display: "none" }}
                  type={"file"}
                  id="file"
                  onChange={(e) => {
                    setSelectedFile(e.target.files[0]);
                  }}
                  accept=".txt,.zip,.pdf,.doc,.docx"
                  placeholder="No file selected"
                />
                <label className="rounded shadow-lg border-gray-100" htmlFor="file">
                  <FontAwesomeIcon
                    className="cursor-pointer text-[25px] text-gray-500"
                    icon={faFileUpload}
                  />
                </label>
              </div>
            </div>
            <Tooltip
              style={{
                fontSize: 12,
                padding: "5px 10px",
                backgroundColor: "rgb(0,0,0)",
              }}
              id="add"
              place="right"
            />
            <div className="flex-1 overflow-y-scroll">
              {Object.keys(folderFiles).map(
                (key) =>
                  key !== "chatbot-files" && (
                    <FolderItem
                      onDelete={() => {
                        showConfirmatoryModal(
                          () => deleteDoc(`${key}/*`),
                          "Delete Folder",
                          "This cannot be reversed. Are you sure about this?"
                        );
                      }}
                      name={key}
                      yesPressed={yesPressed}
                      showConfModal={showConfirmatoryModal}
                      deleteDoc={deleteDoc}
                      talkingTo={talkingTo}
                      setTalkingTo={setTalkingTo}
                      files={folderFiles[key]}
                      key={key}
                    />
                  )
              )}
              {folderFiles["chatbot-files"]?.map((filename) => (
                <FileItem
                  name={filename}
                  fullname={"chatbot-files/" + filename}
                  key={filename}
                  yesPressed={yesPressed}
                  talkingTo={talkingTo}
                  setTalkingTo={setTalkingTo}
                  onDelete={() => {
                    showConfirmatoryModal(
                      () => deleteDoc("chatbot-files/" + filename),
                      "Delete File",
                      "This cannot be reversed. Are you sure about this?"
                    );
                  }}
                />
              ))}
            </div>
            {!selectedFile && (
              <div className="flex">
                <div className="text-xs border-b border-gray-600">
                  NB: Checked folders or documents indicate the agent's data
                  source. Click a check box to select
                </div>
              </div>
            )}
            {selectedFile && (
              <div className="flex justify-end items-center">
                {!uploading ? (
                  <>
                    <div className="text-[13px] truncate">
                      Folder to save to:
                    </div>
                    <DropDown
                      label={"Select a Folder to upload to"}
                      value={folderForUpload}
                      onChange={(e) => {
                        setFolderForUpload(e.target.value);
                      }}
                      options={[
                        "Create a new folder",
                        ...Object.keys(folderFiles),
                      ]}
                    />
                    {folderForUpload == "Create a new folder" && (
                      <input
                        value={newFolderName}
                        onChange={(e) => {
                          const text = e.target.value;
                          const folderNameRegex = /^$|^[a-zA-Z0-9 _-]*$/;
                          if (folderNameRegex.test(text)) {
                            setNewFolderName(text);
                          }
                        }}
                        placeholder="Enter folder name"
                        className="text-sm border border-gray-400 py-2 px-4 rounded scale-90"
                      />
                    )}
                    <div className="flex truncate text-sm border border-gray-400 py-2 px-4 rounded scale-90">
                      {newFolderName
                        ? `${newFolderName}/${selectedFile.name}`
                        : selectedFile?.name}
                    </div>
                    <button
                      onClick={onFileUpload}
                      style={{ fontFamily: "Ubuntu" }}
                      className="flex text-sm border border-gray-600 hover:text-white hover:bg-gray-900 py-2 px-4 rounded focus:outline-none focus:shadow-outline scale-90"
                    >
                      <div className="mr-4">upload</div>
                      <div className="">
                        <FontAwesomeIcon icon={faUpload} />
                      </div>
                    </button>
                  </>
                ) : (
                  <div
                    data-tooltip-id="up"
                    data-tooltip-content={"uploading..."}
                  >
                    <Loader
                      animationName={"uploading"}
                      width={60}
                      height={60}
                    />
                    <Tooltip id="up" place={"left"} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="bg-black/50 border border-gray-600 rounded absolute z-[10] h-[100vh] w-full flex justify-center items-center">
          <div className="bg-white rounded-lg w-[75%] md:w-[55%] lg:w-[35%] xl:w-[30%] px-5">
            <div className="my-5 text-lg font-semibold">{modalTitle}</div>
            <div className="w-full h-[1px] bg-gray-400" />
            <div className="my-5 text-base">{modalMessage}</div>
            <div className="flex justify-end items-center mb-5">
              <Button
                onClick={() => {
                  modalFunction();
                  setYesPressed(true);
                  setShowModal(false);
                }}
                className={"bg-red-700/90 text-white"}
                text={"Yes"}
              />
              <Button
                onClick={() => {
                  setShowModal(false);
                }}
                className={"bg-white text-black ml-2"}
                text={"No"}
              />
            </div>
          </div>
        </div>
      )}
      {Object.keys(selectedMsgChunks).length > 0 && (
        <div className="bg-black/50 border border-gray-600 rounded absolute h-[100vh] w-full flex justify-center items-center">
          <div className="bg-white rounded-lg w-[60%] md:w-[40%] p-10 pt-0">
            <div className="flex w-full my-5 justify-end">
              <FontAwesomeIcon
                onClick={() => setSelectedMessageChunks({})}
                className="cursor-pointer"
                size="lg"
                icon={faClose}
              />
            </div>
            {selectedMsgChunks?.chunks ? (
              <>
                <div className="flex items-center gap-2">
                  <div style={{ fontFamily: "PoorStory" }}>Prompt</div>
                  <div className="py-1 px-4 bg-gray-100 border border-gray-300 border border-gray-300 flex-1 rounded-lg max-h-[10vh] text-wrap text-sm overflow-y-scroll">
                    {selectedMsgChunks?.chunks[0]?.Question}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 mb-2">
                  <div style={{ fontFamily: "PoorStory" }}>
                    Chunks Retrieved
                  </div>
                  <div className="flex gap-1">
                    {selectedMsgChunks?.chunks?.map((chunk, index) => (
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
                <div className="bg-gray-100 border border-gray-300 w-full rounded max-h-[40vh] py-1 px-4 text-wrap text-sm overflow-y-scroll">
                  <div>
                    {selectedMsgChunks?.chunks[currentChunkIndex]["Passage 1"]}
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-5 justify-end font-semibold">
                  <div
                    style={{ fontFamily: "PoorStory" }}
                    className="text-base"
                  >
                    Relevance Score:
                  </div>
                  <div className="bg-green-700 text-white text-xs px-2 py-1 rounded">
                    <div>
                      {parseFloat(
                        selectedMsgChunks?.chunks[currentChunkIndex][
                          "Relevance Score 1"
                        ]
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              "No chunks retrieved"
            )}
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
            <div className="text-[24px] text-gray-700 ml-5 font-semibold">
              iTC Agent
            </div>
          </div>
          <div className="flex flex-col items-center h-[85vh] w-full">
            <div className="flex flex-col w-[77%] h-[78vh] overflow-y-scroll py-2">
              <div className="flex flex-col-reverse gap-2 flex-grow">
                <div ref={bottomRefMobile}></div>
                {typingIndicators[selectedModel] && (
                  <div className="flex items-center ml-8">
                    <Loader height={80} width={80} />
                  </div>
                )}
                {messages[selectedModel].length ? (
                  messages[selectedModel].map((message, index) => {
                    if (message.incoming) {
                      return (
                        <BotMessage
                          onChunksClick={() => {
                            console.log(chunks[parseInt(index / 2)]);
                            setSelectedMessageChunks(
                              chunks[parseInt(index / 2)]
                            );
                          }}
                          chunks={chunks[parseInt(index / 2)].chunks}
                          key={index}
                          message={message}
                        />
                      );
                    } else {
                      return <UserMessage key={index} message={message.text} />;
                    }
                  })
                ) : (
                  <div className="flex-1">
                    <Loader
                      width={315}
                      height={400}
                      animationName={"itc_bot"}
                    />
                  </div>
                )}
              </div>
            </div>
            <MessageInput
              onAttachClick={() => setShowDocuments(true)}
              icon={faArrowUp}
              value={message}
              disabled={typingIndicators[selectedModel]}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              onIconClick={() => {
                sendMessage(message);
              }}
              onFileSelect={null}
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
          <div className="w-[15%] flex flex-col items-center">
            <div
              // style={{ fontFamily: "BlackOps" }}
              className="text-[24px] text-gray-700 font-bold mt-10 mb-4"
            >
              iTC agent
            </div>

            <div className={`flex m-5 mt-auto mb-10 p-2 items-center`}>
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
          </div>
          <div className="flex flex-col items-center h-full w-[70%]">
            <div className="flex flex-col w-[80%] h-full overflow-y-scroll py-2">
              <div className="flex gap-4 flex-col-reverse flex-grow">
                <div ref={bottomRef}></div>
                {typingIndicators[selectedModel] && (
                  <div className="flex items-center ml-8">
                    <Loader height={80} width={80} />
                  </div>
                )}
                {messages[selectedModel].length ? (
                  messages[selectedModel].map((message, index) => {
                    if (message.incoming) {
                      return (
                        <BotMessage
                          onChunksClick={() =>
                            setSelectedMessageChunks(
                              chunks[parseInt(index / 2)]
                            )
                          }
                          chunks={chunks[parseInt(index / 2)].chunks}
                          key={index}
                          message={message}
                        />
                      );
                    } else {
                      return <UserMessage key={index} message={message.text} />;
                    }
                  })
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader
                      width={252}
                      height={320}
                      animationName={"itc_bot"}
                    />
                  </div>
                )}
              </div>
            </div>
            <MessageInput
              onAttachClick={() => setShowDocuments(true)}
              icon={faArrowUp}
              value={message}
              disabled={typingIndicators[selectedModel]}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              onIconClick={() => {
                sendMessage(message);
              }}
              onFileSelect={null}
              boxClassName={"w-[80%]"}
              placeholder={"Message ITC Agent"}
            />
            <div className="text-gray-400 my-2 text-xs">
              ITC Agent might make errors; cross-check vital information
            </div>
          </div>
          <div className="flex flex-col items-center h-full w-[15%]">
            <div className="text-[20px] text-gray-700 font-semibold mt-10 mb-4">
              Engine
            </div>

            <DropDown
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
              }}
              options={models}
            />

            <div className="text-[20px] text-gray-700 font-semibold mt-10 mb-4">
              Docs
            </div>

            <div
              data-tooltip-content={"open docs"}
              data-tooltip-id="docs"
              onClick={() => {
                setShowDocuments(true);
              }}
              className="px-5 py-2 border border-gray-400 rounded cursor-pointer hover:bg-gray-100"
            >
              <FontAwesomeIcon className="text-gray-600" icon={faFileAlt} />
              <Tooltip
                style={{
                  fontSize: 12,
                  padding: "5px 10px",
                  backgroundColor: "rgb(0,0,0)",
                }}
                id="docs"
                place="right"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
