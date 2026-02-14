import React from "react";
import { User, History, X, Trophy, CheckCircle2 } from "lucide-react";

const ProfileDashboard = ({ data, onClose }) => {
  // Calculate success rate safely
  const successRate =
    data.totalAttempts > 0
      ? Math.round((data.solvedCount / data.totalAttempts) * 100)
      : 0;

  return (
    <div className="absolute inset-0 z-50 bg-[#1e1e1e] flex flex-col p-8 animate-in fade-in zoom-in-95 duration-200">
      {/* Header Area */}
      <div className="flex justify-between items-center mb-8 border-b border-[#3e3e42] pb-4">
        <div className="flex items-center gap-4">
          <div className="bg-[#007acc] p-3 rounded-full">
            <User size={32} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{data.username}</h2>
            <p className="text-gray-500 text-sm">{data.email}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-[#333333] rounded-full text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#252526] p-6 rounded border border-[#3e3e42] flex flex-col items-center">
          <Trophy className="text-yellow-500 mb-2" size={24} />
          <div className="text-gray-500 text-xs uppercase font-bold">
            Problems Solved
          </div>
          <div className="text-4xl font-bold text-white mt-1">
            {data.solvedCount}
          </div>
        </div>

        <div className="bg-[#252526] p-6 rounded border border-[#3e3e42] flex flex-col items-center">
          <History className="text-blue-400 mb-2" size={24} />
          <div className="text-gray-500 text-xs uppercase font-bold">
            Total Attempts
          </div>
          <div className="text-4xl font-bold text-white mt-1">
            {data.totalAttempts}
          </div>
        </div>

        <div className="bg-[#252526] p-6 rounded border border-[#3e3e42] flex flex-col items-center">
          <CheckCircle2 className="text-green-500 mb-2" size={24} />
          <div className="text-gray-500 text-xs uppercase font-bold">
            Success Rate
          </div>
          <div className="text-4xl font-bold text-white mt-1">
            {successRate}%
          </div>
        </div>
      </div>

      {/* Detail Section */}
      <div className="bg-[#252526] flex-1 rounded border border-[#3e3e42] p-6 overflow-y-auto">
        <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b border-[#3e3e42] pb-2">
          Platform Activity
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-[#1e1e1e] rounded border border-[#333333]">
            <span className="text-gray-300">Account Status</span>
            <span className="text-green-500 text-xs font-bold uppercase tracking-widest px-2 py-1 bg-green-500/10 rounded">
              Active
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-[#1e1e1e] rounded border border-[#333333]">
            <span className="text-gray-300">Engineering Level</span>
            <span className="text-[#007acc] text-xs font-bold uppercase tracking-widest px-2 py-1 bg-blue-500/10 rounded">
              Undergraduate Student
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
