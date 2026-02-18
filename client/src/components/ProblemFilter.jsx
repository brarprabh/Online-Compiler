import React from "react";

const ProblemFilter = ({ activeFilter, setActiveFilter, allTags }) => {
  return (
    <div className="flex gap-2 overflow-x-auto p-4 border-b border-[#3e3e42] bg-[#1e1e1e] no-scrollbar">
      {allTags.map((tag) => (
        <button
          key={tag}
          onClick={() => setActiveFilter(tag)}
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
            activeFilter === tag
              ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
              : "bg-[#2d2d2d] border-[#3e3e42] text-gray-400 hover:border-gray-500"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

export default ProblemFilter;
