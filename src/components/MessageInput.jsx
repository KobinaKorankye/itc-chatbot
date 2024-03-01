import { faEllipsis, faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export default function MessageInput({
  boxClassName,
  value,
  icon,
  type,
  onChange,
  placeholder,
  disabled,
  onIconClick,
  onFileSelect,
  onAttachClick,
}) {
  return (
    <div className={`${boxClassName}`}>
      <div
        className="flex w-full mt-10 items-center shadow appearance-none rounded-2xl border border-gray-500 w-full py-2 px-3 h-[3.4rem] text-gray-700 
                leading-tight "
      >
        <div
          onClick={onAttachClick}
          className="flex cursor-pointer justify-center items-center w-8 h-8 rounded-lg mr-3"
        >
          {/* <input
            style={{ display: "none" }}
            type={"file"}
            id="file"
            onChange={onFileSelect}
            disabled={true}
            accept="application/zip application/msword application/pdf application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            placeholder="No zip file selected"
          /> */}
          <label htmlFor="file">
            <FontAwesomeIcon
              className="text-black cursor-pointer"
              size="lg"
              icon={faPaperclip}
            />
          </label>
        </div>
        <input
          type={type}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onIconClick();
              // Perform your action on Enter key press here
            }
          }}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={onChange}
          className="w-full focus:outline-none focus:shadow-outline bg-transparent text-black text-base"
        />
        {icon && (
          <div
            onClick={onIconClick}
            className="bg-gray-100 cursor-pointer hover:scale-[1.1] hover:bg-gray-200 duration-200 border border-gray-400/50 flex justify-center items-center w-[40px] h-[40px] rounded-lg"
          >
            <FontAwesomeIcon
              className="text-gray-800"
              size="1x"
              icon={disabled ? faEllipsis : icon}
            />
          </div>
        )}
      </div>
    </div>
  );
}
