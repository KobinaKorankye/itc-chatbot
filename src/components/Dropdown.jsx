import React from 'react'

export default function DropDown({ value, onChange, options }) {
    return (
        <div className="flex flex-col">
            <select style={{ fontFamily: "Ubuntu" }} value={value} onChange={onChange} className="appearance-none scale-90 block w-full px-4 py-2 text-sm text-gray-700 bg-white border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none">
                {options.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                ))}
            </select>
        </div>
    )
}