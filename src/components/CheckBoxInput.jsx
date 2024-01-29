import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export default function CheckBoxInput({
  boxClassName,
  label,
  icon,
  name, checked,
  disabled, onChange
}) {

  return (
    <div className={`mt-6 ${boxClassName}`}>
      <label className={`block text-gray-800 text-xs mb-2 capitalize`} for={name}>
        {label || name}
      </label>
      <div
        className="flex items-center px-1 text-gray-700"
      >
        {icon && <FontAwesomeIcon
          className="text-gray-600/80"
          size="lg"
          icon={icon}
        />}
        <input
          name={name}
          type={'checkbox'}
          disabled={disabled}
          checked={checked}
          onChange={onChange}
          className="cursor-pointer focus:outline-none focus:shadow-outline bg-transparent text-gray-800 text-lg"
          id={name}
        />
      </div>
    </div>
  );
}
