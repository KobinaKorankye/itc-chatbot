import {
  faArchive,
  faFileAlt,
  faFileZipper,
  faFolder,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { Tooltip } from "react-tooltip";
import Loader from "../loader/Loader";

function getFilenameWithoutExtension(filename) {
  const lastIndex = filename.lastIndexOf(".");

  // Check if there is a dot in the filename. If not, return the original filename.
  if (lastIndex === -1) return filename;

  // Extract and return the part of the filename before the last dot.
  return filename.substring(0, lastIndex);
}

const EXT_COLOR = {
  txt: "text-gray-500",
  pdf: "text-red-700/70",
  docx: "text-sky-500",
  doc: "text-sky-500",
};

export default function FileItem({
  name,
  fullname,
  onDelete,
  yesPressed,
  talkingTo,
  setTalkingTo, 
}) {
  const extension = name.split(".").pop().toLowerCase();
  const [deleting, setDeleting] = useState(false);

  const onItemDelete = () => {
    setDeleting(true);
    onDelete();
  };

  return (
    <div className="group flex hover:bg-gray-100 cursor-pointer items-center h-[40px] border-b-2 border-gray-600/20">
      {(talkingTo || talkingTo==="")  && (
        <input
          className="cursor-pointer"
          checked={talkingTo == fullname}
          onChange={(e) => {
            if(talkingTo == fullname){
              setTalkingTo("");
            }else{
              setTalkingTo(fullname);
            }
          }}
          type="checkbox"
        />
      )}
      {extension !== "zip" ? (
        <FontAwesomeIcon
          className={`ml-6 ${EXT_COLOR[extension]} text-sm`}
          icon={faFileAlt}
        />
      ) : (
        <FontAwesomeIcon
          className={`ml-6 text-orange-500/70 text-sm`}
          icon={faArchive}
        />
      )}
      <div style={{ fontFamily: "Ubuntu" }} className="ml-4">
        {getFilenameWithoutExtension(name)}
      </div>
      <div
        onClick={!(deleting && yesPressed) ? onItemDelete : null}
        data-tooltip-content={deleting && yesPressed ? "deleting..." : "delete"}
        data-tooltip-id="del"
        className="hidden group-hover:block text-xs ml-auto mr-5 text-slate-500"
      >
        <FontAwesomeIcon icon={faTrashAlt} />
      </div>
      <Tooltip
        style={{
          fontSize: 12,
          padding: "5px 10px",
          backgroundColor: "rgb(0,0,0)",
        }}
        id="del"
        place="bottom"
      />
      <div className="uppercase group-hover:hidden text-xs ml-auto mr-5">
        {extension}
      </div>
      {deleting && yesPressed && (
        <Loader animationName={"pulse"} height={40} width={40} />
      )}
    </div>
  );
}
