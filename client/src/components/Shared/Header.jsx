import React from "react";
import { Code, Play, Save, LogOut, User } from "lucide-react";

const Header = ({
  executeCode,
  handleSubmit,
  isRunning,
  logout,
  fetchProfile,
}) => {
  return (
    <header className="h-12 bg-[#252526] border-b border-[#3e3e42] flex items-center justify-between px-4 shrink-0">
      {/* Branding */}
      <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-white">
        <Code className="text-blue-500 w-5 h-5" />
        <span>
          Code<span className="text-blue-500">Corps</span>
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-3 items-center">
        <button
          onClick={executeCode}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-1.5 rounded text-sm font-semibold bg-[#333333] hover:bg-[#444444] text-white border border-[#454545] transition-colors"
        >
          <Play size={14} className="text-green-500" /> Run
        </button>
        <button
          onClick={handleSubmit}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-1.5 rounded text-sm font-semibold bg-[#007acc] hover:bg-[#118ad4] text-white transition-colors"
        >
          <Save size={14} /> Submit
        </button>

        <div className="h-6 w-[1px] bg-[#3e3e42] mx-1"></div>

        <button
          onClick={fetchProfile}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
          title="My Profile"
        >
          <User size={18} /> Profile
        </button>

        <button
          onClick={logout}
          className="ml-2 text-gray-400 hover:text-red-400 transition-colors"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
