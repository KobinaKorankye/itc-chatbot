import React, { useContext } from "react";
import AppContext from "../contexts/AppContext";

export default function UserMessage({message}) {
  const { user } = useContext(AppContext);
  console.log(user);
  return (
    <div className="flex w-full text-gray-600">
      <div className="h-6 w-6 uppercase flex font-semibold text-white text-xs justify-center items-center self-start rounded-full overflow-hidden border border-gray-700 bg-zinc-500">
        {user[0]}
      </div>
      <div className="px-5 flex-1">
        <div className="font-bold text-black">You</div>
        <div style={{ fontFamily: "Ubuntu" }}>{message}</div>
      </div>
    </div>
  );
}
