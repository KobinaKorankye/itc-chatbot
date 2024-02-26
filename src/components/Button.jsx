import React from "react";

export default function Button({ onClick, text, className }) {
  return (
    <button
      onClick={onClick}
      style={{ fontFamily: "Ubuntu" }}
      className={className+" font-bold border border-gray-900/40 text-base py-2 px-4 rounded focus:outline-none focus:shadow-outline transform transition scale-90 hover:scale-100 duration-500 ease-in-out"}
    >
      {text}
    </button>
  );
}
