import React from 'react'
import { assets } from '../assets/assets'

const Navbar = ({ setToken }) => {
  return (
    <div className="flex justify-between items-center py-2 px-[4%] bg-white shadow-sm border-b border-gray-100">
      <div className="flex items-center gap-3">
        <img className="w-[max(12%,70px)]" src={assets.harrys_logo} alt="Harry's Boutique" />
        <span className="hidden sm:block text-sm text-gray-500 font-medium">Admin</span>
      </div>
      <button
        onClick={() => setToken('')}
        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-full text-xs sm:text-sm transition-colors duration-150"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
          />
        </svg>
        <span>Cerrar sesión</span>
      </button>
    </div>
  )
}

export default Navbar
