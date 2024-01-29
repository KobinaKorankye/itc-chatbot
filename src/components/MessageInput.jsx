import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export default function MessageInput({
  boxClassName,
  value,
  icon,
  type,
  onChange,
  placeholder,
  onIconClick,
  onAttachClick
}) {
  return (
    <div className={`${boxClassName}`}>
      <div
        className="flex w-full items-center shadow appearance-none rounded-2xl border border-gray-500 w-full py-2 px-3 h-[3.4rem] text-gray-700 
                leading-tight "
      >
        <div
          onClick={onAttachClick}
          className="flex justify-center items-center w-8 h-8 rounded-lg mr-3"
        >
          <FontAwesomeIcon className="text-black" size="lg" icon={faPaperclip} />
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full focus:outline-none focus:shadow-outline bg-transparent text-black text-base"
        />
        {icon && (
          <div
            onClick={onIconClick}
            className="bg-gray-100 flex justify-center items-center w-8 h-8 rounded-lg"
          >
            <FontAwesomeIcon className="text-gray-800" size="1x" icon={icon} />
          </div>
        )}
      </div>
    </div>
  );
}
