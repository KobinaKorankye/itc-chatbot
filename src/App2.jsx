import "./App.css";
import ITCLogo from "./assets/ITCLogo.jpeg";
import ChangoLogo from "./assets/Chango.png";
import TransflowLogo from "./assets/Transflow.png";
import MessageInput from "./components/MessageInput";
import Loader from "./loader/Loader";
import UserMessage from "./components/UserMessage";
import BotMessage from "./components/BotMessage";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";

function App2() {
  return (
    <div className="flex flex-col h-[100vh] bg-zinc-700 items-center">
      {/* <div className="text-6xl text-blue-700">ITC BOT</div> */}
      <div className="w-full h-full flex">
        <div className="-md:hidden h-full bg-zinc-900 w-[20%]"></div>
        <div className="-md:w-full w-[60%]">
          <div className="w-full h-[15vh] flex items-center pl-10">
           
            <div className="ml-5 bg-white p-2 rounded-xl">
              <img
                src={ITCLogo}
                className="h-10 rounded-xl"
              />
            </div>
            {/* <div className="bg-white ml-5 p-2 rounded-xl">
              <img
                src={ChangoLogo}
                className="h-10"
              />
            </div> */}
            <div
              style={{ fontFamily: "RubikScribble" }}
              className="text-3xl text-white ml-5 font-semibold"
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
              <div className="flex flex-col-reverse flex-grow">
                <div className="flex items-center ml-5">
                  <Loader height={80} width={80} />
                </div>
                <UserMessage message={"I'm good, how about you?"} />
                <BotMessage message={"Hi, How's it going?"} />
                <UserMessage message={"Hello"} />
              </div>
            </div>
            <MessageInput
            icon={faArrowUp}
              boxClassName={"w-[85%]"}
              placeholder={"Message ITC Agent"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
