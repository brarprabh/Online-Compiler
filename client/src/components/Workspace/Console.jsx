import React from "react";
import {
  Terminal,
  History,
  Trophy,
  CheckCircle,
  XCircle,
  User,
} from "lucide-react";

const Console = ({
  activeTab,
  setActiveTab,
  testResults,
  submissions,
  leaderboard,
}) => {
  return (
    <div className="h-64 bg-[#181818] border-t border-[#3e3e42] flex flex-col">
      {/* TABS */}
      <div className="h-9 bg-[#252526] border-b border-[#3e3e42] flex items-center px-2 gap-2">
        <button
          onClick={() => setActiveTab("output")}
          className={`text-xs px-3 py-1 flex items-center gap-2 uppercase tracking-wide font-semibold ${activeTab === "output" ? "text-white border-b-2 border-[#007acc]" : "text-gray-500"}`}
        >
          <Terminal size={12} /> Output
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`text-xs px-3 py-1 flex items-center gap-2 uppercase tracking-wide font-semibold ${activeTab === "history" ? "text-white border-b-2 border-[#007acc]" : "text-gray-500"}`}
        >
          <History size={12} /> Submissions
        </button>
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`text-xs px-3 py-1 flex items-center gap-2 uppercase tracking-wide font-semibold ${activeTab === "leaderboard" ? "text-white border-b-2 border-yellow-500" : "text-gray-500"}`}
        >
          <Trophy size={12} /> Leaderboard
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-sm text-[#cccccc]">
        {/* OUTPUT */}
        {activeTab === "output" &&
          (testResults.length === 0 ? (
            <div className="text-gray-600 opacity-50 italic">
              Run code to see output...
            </div>
          ) : (
            testResults.map((res, i) => (
              <div
                key={i}
                className="mb-2 p-2 rounded bg-[#252526] border border-[#3e3e42] flex items-center gap-3"
              >
                {res.verdict === "Accepted" ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : (
                  <XCircle size={16} className="text-red-500" />
                )}
                <span
                  className={
                    res.verdict === "Accepted"
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  Case {i + 1}: {res.verdict}
                </span>
              </div>
            ))
          ))}

        {/* HISTORY */}
        {activeTab === "history" &&
          (submissions.length === 0 ? (
            <div className="text-gray-600 opacity-50 italic">
              No submissions yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-[#3e3e42]">
                  <th className="pb-2 uppercase">Verdict</th>
                  <th className="pb-2 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, i) => (
                  <tr key={i} className="border-b border-[#2d2d2d]">
                    <td
                      className={`py-2 font-bold ${sub.verdict === "Accepted" ? "text-green-500" : "text-red-500"}`}
                    >
                      {sub.verdict}
                    </td>
                    <td className="py-2 text-gray-400">
                      {new Date(sub.submittedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}

        {/* LEADERBOARD */}
        {activeTab === "leaderboard" &&
          (leaderboard.length === 0 ? (
            <div className="text-gray-600 opacity-50 italic">
              Loading Leaderboard...
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-[#3e3e42]">
                  <th className="pb-2 uppercase w-16">Rank</th>
                  <th className="pb-2 uppercase">User</th>
                  <th className="pb-2 uppercase text-right pr-4">Solved</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user, i) => (
                  <tr
                    key={i}
                    className="border-b border-[#2d2d2d] hover:bg-[#252526] transition-colors"
                  >
                    <td className="py-2 font-bold text-[#007acc]">#{i + 1}</td>
                    <td className="py-2 flex items-center gap-2">
                      <User size={12} className="text-gray-500" />{" "}
                      {user.username}
                    </td>
                    <td className="py-2 text-green-500 font-bold text-right pr-4">
                      {user.totalSolved}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
      </div>
    </div>
  );
};

export default Console;
