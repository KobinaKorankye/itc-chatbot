import {
  faChevronDown,
  faChevronRight,
  faFolder,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import FileItem from "./FileItem";
import { Tooltip } from "react-tooltip";
import Loader from "../loader/Loader";

export default function FolderItem({
  name,
  files,
  onClick,
  onDelete,
  showConfModal,
  deleteDoc,
  yesPressed,
  talkingTo,
  setTalkingTo,
}) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const onFolderNameClick = () => {
    setExpanded(!expanded);
    onClick();
  };

  const onItemDelete = () => {
    setDeleting(true);
    onDelete();
  };

  return (
    <>
      <div className="group flex cursor-pointer items-center h-[40px] border-b-2 border-gray-600/20">
        <input
          className="cursor-pointer"
          checked={talkingTo == name}
          onChange={(e) => {
            if(talkingTo == name){
              setTalkingTo("");
            }else{
              setTalkingTo(name);
            }
          }}
          type="checkbox"
        />
        <div onClick={onFolderNameClick}>
          {expanded ? (
            <FontAwesomeIcon
              className="ml-5 text-gray-600"
              icon={faChevronDown}
            />
          ) : (
            <FontAwesomeIcon
              className="ml-5 text-gray-600"
              icon={faChevronRight}
            />
          )}
        </div>
        <FontAwesomeIcon className="ml-5 text-amber-500" icon={faFolder} />
        <div
          onClick={onFolderNameClick}
          style={{ fontFamily: "Ubuntu" }}
          className="ml-4 hover:text-sky-600"
        >
          {name}
        </div>
        <div
          onClick={!deleting ? onItemDelete : null}
          data-tooltip-content={deleting ? "deleting..." : "delete"}
          data-tooltip-id="del"
          className={`hidden ${
            deleting ? "opacity-0" : ""
          } group-hover:block text-xs ml-auto mr-5 text-slate-500`}
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
          folder
        </div>
        {deleting && yesPressed && (
          <Loader animationName={"pulse"} height={40} width={40} />
        )}
      </div>
      {expanded && (
        <div className="ml-14">
          {files.map((file) => (
            <FileItem
              yesPressed={yesPressed}
              onDelete={() =>
                showConfModal(
                  () => {
                    deleteDoc(name+'/'+file);
                  },
                  "Delete File",
                  "This cannot be reversed. Are you sure about this?"
                )
              }
              fullname={name+'/'+file}
              name={file}
              key={file}
            />
          ))}
        </div>
      )}
    </>
  );
}
