import { useFormikContext } from "formik";
import React from "react";

export default function Submit({ text, className }) {
  const { handleSubmit } = useFormikContext();
  return (
    <button
      style={{ fontFamily: "Quicksand" }}
      onClick={handleSubmit}
      type="submit"
      className={`${className} bg-orange-300/50 mt-6 w-full text-md hover:bg-orange-500/50 rounded-lg text-gray-800 font-semibold py-3 px-4 border border-white hover:border-transparent`}
    >
      {text}
    </button>
  );
}
