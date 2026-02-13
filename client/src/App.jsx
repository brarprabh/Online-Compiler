import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  Play,
  Terminal,
  Code,
  CheckCircle,
  XCircle,
  Save,
  History,
  LogOut,
  User,
  Lock,
  Mail,
  Trophy, // <-- Added Trophy icon for the Leaderboard
} from "lucide-react";

// --- AUTHENTICATION COMPONENT ---
const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const endpoint = isLogin ? "/login" : "/register";

    try {
      const { data } = await axios.post(
        `http://localhost:5000${endpoint}`,
        formData,
      );
      localStorage.setItem("token", data.token);
      onLogin(data.token);
    } catch (err) {
      setError(err.response?.data?.error || "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center text-white font-sans">
      <div className="w-full max-w-md p-8 bg-[#252526] rounded-lg shadow-lg border border-[#3e3e42]">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tight">
            <Code className="text-blue-500 w-8 h-8" />
            <span>
              Code<span className="text-blue-500">Corps</span>
            </span>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-6 text-center">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm border border-red-500/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Username"
                className="w-full bg-[#3c3c3c] border border-gray-600 rounded p-2.5 pl-10 focus:border-blue-500 outline-none text-white"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-[#3c3c3c] border border-gray-600 rounded p-2.5 pl-10 focus:border-blue-500 outline-none text-white"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-[#3c3c3c] border border-gray-600 rounded p-2.5 pl-10 focus:border-blue-500 outline-none text-white"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded transition-all"
          >
            {isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-400 hover:underline"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </p>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [code, setCode] = useState("");
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  // NEW: State to hold the leaderboard data
  const [leaderboard, setLeaderboard] = useState([]);

  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("output");

  if (!token) {
    return <AuthPage onLogin={(t) => setToken(t)} />;
  }

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // 1. Fetch Problems
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(
          "http://localhost:5000/problems",
          config,
        );
        setProblems(data);
        if (data.length > 0) setSelectedProblem(data[0]);
      } catch (err) {
        console.error("Failed to fetch problems:", err);
        if (err.response?.status === 401) logout();
      }
    };
    fetchProblems();
  }, [token]);

  // 2. Fetch User History
  useEffect(() => {
    if (selectedProblem && activeTab === "history") {
      const fetchHistory = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const { data } = await axios.get(
            `http://localhost:5000/submissions/${selectedProblem._id}`,
            config,
          );
          setSubmissions(data);
        } catch (err) {
          console.error("Failed to fetch history:", err);
        }
      };
      fetchHistory();
    }
  }, [selectedProblem, activeTab, token]);

  // 3. NEW: Fetch Leaderboard when tab is clicked
  useEffect(() => {
    if (activeTab === "leaderboard") {
      const fetchLeaderboard = async () => {
        try {
          const { data } = await axios.get("http://localhost:5000/leaderboard");
          setLeaderboard(data);
        } catch (err) {
          console.error("Failed to fetch leaderboard:", err);
        }
      };
      fetchLeaderboard();
    }
  }, [activeTab]);

  const runTestCase = async (testCase) => {
    try {
      const payload = {
        language: "cpp",
        code,
        input: testCase.input,
        expectedOutput: testCase.output,
      };
      const { data } = await axios.post("http://localhost:5000/run", payload);
      return {
        input: testCase.input,
        expected: testCase.output,
        actual: data.output,
        verdict: data.verdict,
      };
    } catch (err) {
      return { verdict: "Error", actual: "Server Connection Failed" };
    }
  };

  const executeCode = async () => {
    if (!selectedProblem) return;
    setIsRunning(true);
    setTestResults([]);
    setActiveTab("output");
    const results = [];

    for (const testCase of selectedProblem.testCases) {
      const result = await runTestCase(testCase);
      results.push(result);
    }

    setTestResults(results);
    setIsRunning(false);
    return results;
  };

  const handleSubmit = async () => {
    if (!selectedProblem) return;
    const results = await executeCode();
    const isSuccess = results.every((r) => r.verdict === "Accepted");
    const verdict = isSuccess ? "Accepted" : "Wrong Answer";

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(
        "http://localhost:5000/submit",
        {
          problemId: selectedProblem._id,
          code,
          language: "cpp",
          verdict,
        },
        config,
      );

      setActiveTab("history");
      const { data } = await axios.get(
        `http://localhost:5000/submissions/${selectedProblem._id}`,
        config,
      );
      setSubmissions(data);

      alert(isSuccess ? "🎉 Accepted!" : "❌ Wrong Answer");
    } catch (err) {
      alert("Error saving submission.");
    }
  };

  if (!selectedProblem) {
    return (
      <div className="h-screen bg-[#1e1e1e] text-white flex flex-col items-center justify-center font-mono">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <p>Initializing CodeCorps...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-[#cccccc] font-sans overflow-hidden">
      {/* HEADER */}
      <header className="h-12 bg-[#252526] border-b border-[#3e3e42] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-white">
          <Code className="text-blue-500 w-5 h-5" />
          <span>
            Code<span className="text-blue-500">Corps</span>
          </span>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={executeCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 rounded text-sm font-semibold bg-[#333333] hover:bg-[#444444] text-white border border-[#454545]"
          >
            <Play size={14} className="text-green-500" /> Run
          </button>
          <button
            onClick={handleSubmit}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 rounded text-sm font-semibold bg-[#007acc] hover:bg-[#118ad4] text-white"
          >
            <Save size={14} /> Submit
          </button>
          <button
            onClick={logout}
            className="ml-2 text-gray-400 hover:text-white"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        <div className="w-1/3 bg-[#1e1e1e] border-r border-[#3e3e42] flex flex-col">
          <div className="p-4 border-b border-[#3e3e42] bg-[#252526]">
            <select
              className="w-full bg-[#3c3c3c] text-white border border-[#3e3e42] rounded p-2 text-sm outline-none"
              value={selectedProblem._id}
              onChange={(e) => {
                setSelectedProblem(
                  problems.find((p) => p._id === e.target.value),
                );
                setTestResults([]);
                setCode("");
              }}
            >
              {problems.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <h1 className="text-2xl font-bold text-white mb-4">
              {selectedProblem.title}
            </h1>
            <div className="flex gap-2 mb-4">
              <span className="text-xs px-2 py-1 rounded bg-[#333333] text-green-400 border border-[#454545] uppercase tracking-wider">
                {selectedProblem.difficulty}
              </span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              {selectedProblem.description}
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-2/3 flex flex-col">
          <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e]">
            <textarea
              className="flex-1 bg-[#1e1e1e] p-4 font-mono text-sm text-[#d4d4d4] outline-none resize-none leading-relaxed"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Write your C++ solution here..."
              spellCheck="false"
            ></textarea>
          </div>

          <div className="h-64 bg-[#181818] border-t border-[#3e3e42] flex flex-col">
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
              {/* NEW LEADERBOARD TAB */}
              <button
                onClick={() => setActiveTab("leaderboard")}
                className={`text-xs px-3 py-1 flex items-center gap-2 uppercase tracking-wide font-semibold ${activeTab === "leaderboard" ? "text-white border-b-2 border-yellow-500" : "text-gray-500"}`}
              >
                <Trophy size={12} /> Leaderboard
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm text-[#cccccc]">
              {/* TAB CONTENT: OUTPUT */}
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

              {/* TAB CONTENT: HISTORY */}
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

              {/* TAB CONTENT: LEADERBOARD */}
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
                        <th className="pb-2 uppercase text-right pr-4">
                          Problems Solved
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((user, i) => (
                        <tr
                          key={i}
                          className="border-b border-[#2d2d2d] hover:bg-[#252526] transition-colors"
                        >
                          <td className="py-2 font-bold text-[#007acc]">
                            #{i + 1}
                          </td>
                          <td className="py-2 flex items-center gap-2">
                            <User size={12} className="text-gray-500" />
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
        </div>
      </div>
    </div>
  );
}

export default App;
