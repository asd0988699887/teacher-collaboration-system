'use client'

import { useState, ChangeEvent } from 'react'

interface SearchBarProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
}

/**
 * 搜尋框組件
 * 用於搜尋社群名稱
 */
export default function SearchBar({
  placeholder = '搜尋社群名稱',
  value,
  onChange,
}: SearchBarProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="w-full max-w-[300px] h-[35px]">
      <div className="relative w-full h-full flex items-center">
        {/* 放大鏡圖示 */}
        <span className="absolute left-3 md:left-4 flex items-center justify-center pointer-events-none text-[#6B7280]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="
            w-full h-full
            pl-9 md:pl-10 pr-3 md:pr-4 py-2
            bg-white
            border border-[#E5E7EB]
            rounded-xl
            text-sm md:text-[14px] font-medium text-gray-900
            placeholder:text-[#6B7280]
            focus:outline-none
            focus:border-purple-400
            focus:ring-1
            focus:ring-purple-400
            transition-all duration-200
          "
        />
      </div>
    </div>
  )
}

