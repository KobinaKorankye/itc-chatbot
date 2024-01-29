import React from "react";

export default function TextInput({ label, name, placeholder, type, value, onChange, boxClassName, disabled }) {
  return (
    <div class={`w-full px-3 mb-3 ${boxClassName}`}>
      <label
        class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
        for={name}
      >
        {label}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        class="appearance-none block w-full text-gray-700 border border-blue-500 rounded py-4 px-6 leading-tight focus:outline-none focus:bg-white"
        id={name}
        type={type}
        placeholder={placeholder}
      />
    </div>
  );
}