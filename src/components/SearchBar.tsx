import React from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}: SearchBarProps) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="pl-10 bg-[#2a2a5a] border-[#2a2a5a] text-white placeholder:text-gray-400 focus-visible:ring-[#3a8cff]"
      />
    </div>
  );
};

export default SearchBar;
