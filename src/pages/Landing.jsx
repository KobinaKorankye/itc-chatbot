import React, { useContext, useEffect, useState } from "react";
import ITCLogo from "../assets/ITCLogo.jpeg";
import ChangoLogo from "../assets/Chango.png";
import Loader from "../loader/Loader";
import TextInput from "../components/TextInput";
import { useNavigate } from "react-router-dom";
import AppContext from "../contexts/AppContext";

export default function Landing() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otherLoginClicked, setOtherLoginClicked] = useState(false);
  const [loginClicked, setLoginClicked] = useState(false);
  const [signupClicked, setSignupClicked] = useState(false);
  const [otherSignupClicked, setOtherSignupClicked] = useState(false);
  const { setUser } = useContext(AppContext);
  const navigate = useNavigate();

  const onLoginSubmit = () => {
    if (username && password=='bottest1') {
      setUser(username);
      navigate("/chat");
    } else {
      alert("Invalid Credentials");
    }
  };
  useEffect(() => {
    if (loginClicked) {
      setSignupClicked(false);
    }
    if (signupClicked) {
      setLoginClicked(false);
    }
  }, [loginClicked, signupClicked]);

  return (
    <div className="w-full h-[100vh] flex">
      <div className="w-3/5 h-[100vh] flex flex-col bg-sky-900">
        <div className="mt-5 ml-8 flex items-center gap-3">
          <div className="h-10 w-10 flex justify-center items-center rounded-full overflow-hidden border border-gray-500 bg-white">
            <img src={ITCLogo} />
          </div>
          <div className="text-2xl text-slate-200 font-bold">ITC Agent</div>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <Loader animationName={"itc_agent"} width={315} height={400} />
        </div>
      </div>

      <div className={`relative w-2/5 h-[100vh] overflow-hidden`}>
        {/* GET STARTED SECTION */}
        <div
          className={`absolute ${
            loginClicked
              ? "top-[100vh]"
              : signupClicked
              ? "-top-[100vh]"
              : "top-0"
          } duration-500 flex flex-col w-full h-full justify-center items-center`}
        >
          <div className="text-3xl font-bold">Get Started</div>
          <div className="flex justify-center">
            <button
              onClick={() => setLoginClicked(true)}
              style={{ fontFamily: "Ubuntu" }}
              className="bg-sky-800 mt-8 text-white text-base py-2 px-4 rounded focus:outline-none focus:shadow-outline transform transition scale-90 hover:scale-100 duration-500 ease-in-out"
            >
              Log in
            </button>
            <button
              onClick={() => setSignupClicked(true)}
              style={{ fontFamily: "Ubuntu" }}
              className="bg-white mt-8 text-black border border-gray-900/40 text-base py-2 px-4 rounded focus:outline-none focus:shadow-outline transform transition scale-90 hover:scale-100 duration-500 ease-in-out"
            >
              Sign up
            </button>
          </div>
        </div>

        <div
          className={`absolute ${
            loginClicked ? "top-0" : "-top-[100vh]"
          } duration-500 flex flex-col w-full h-full items-center py-10`}
        >
          <div className="h-10 w-10 flex justify-center mb-36 items-center rounded-full overflow-hidden border border-gray-500 bg-white">
            <img src={ITCLogo} />
          </div>
          <div className="text-3xl font-bold mb-6">Welcome Back</div>
          <div className="flex flex-col justify-center w-[55%]">
            <TextInput
              placeholder={"username"}
              value={username}
              onEnterPress={onLoginSubmit}
              onChange={(e) => setUsername(e.target.value)}
              />
            <TextInput
              placeholder={"password"}
              type={"password"}
              value={password}
              onEnterPress={onLoginSubmit}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={onLoginSubmit}
              style={{ fontFamily: "Ubuntu" }}
              className="bg-sky-700 text-white mt-6 border border-sky-900/40 text-base py-4 px-6 mx-3 rounded focus:outline-none focus:shadow-outline transform transition hover:bg-sky-600 duration-500 ease-in-out"
            >
              Submit
            </button>
            <div
              style={{ fontFamily: "Ubuntu" }}
              className="text-sm text-center mt-1"
            >
              Don't have an account?{" "}
              <span
                onClick={() => {
                  setSignupClicked(true);
                }}
                className="text-sky-800 cursor-pointer hover:text-sky-600"
              >
                Sign up
              </span>
            </div>
          </div>
        </div>

        <div
          className={`absolute ${
            signupClicked ? "top-0" : "top-[100vh]"
          } duration-200 flex flex-col w-full h-full justify-center items-center`}
        >
          <div className="text-3xl font-bold">Sign up</div>
          <div className="flex justify-center"></div>
        </div>
      </div>
    </div>
  );
}
