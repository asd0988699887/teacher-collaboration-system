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
    <div className="w-[300px] h-[35px]">
      <div className="relative w-full h-full">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="
            w-full h-full
            px-4 py-2
            bg-white
            border border-[#E5E7EB]
            rounded-xl
            text-[14px] font-medium text-gray-900
            placeholder:text-[#6B7280] placeholder:text-center
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

