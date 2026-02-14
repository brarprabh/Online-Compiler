import React, { useState, useEffect } from "react";
import axios from "axios";

// COMPONENTS
import Header from "./components/Shared/Header";
import Console from "./components/Workspace/Console";
import ProfileDashboard from "./components/Profile/ProfileDashboard";
import AuthPage from "./components/Auth/AuthPage";

function App() {
  // 1. STATE
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [code, setCode] = useState("");
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("output");
  const [profileData, setProfileData] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // 2. DATA FETCHING (The Missing Part)
  useEffect(() => {
    if (!token) return;
    const fetchProblems = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/problems", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProblems(data);
        if (data.length > 0) setSelectedProblem(data[0]);
      } catch (err) {
        if (err.response?.status === 401) logout();
      }
    };
    fetchProblems();
  }, [token]);

  useEffect(() => {
    if (selectedProblem && activeTab === "history") {
      const fetchHistory = async () => {
        try {
          const { data } = await axios.get(
            `http://localhost:5000/submissions/${selectedProblem._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          setSubmissions(data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchHistory();
    }
  }, [selectedProblem, activeTab, token]);

  useEffect(() => {
    if (activeTab === "leaderboard") {
      const fetchLeaderboard = async () => {
        try {
          const { data } = await axios.get("http://localhost:5000/leaderboard");
          setLeaderboard(data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchLeaderboard();
    }
  }, [activeTab]);

  // 3. CORE LOGIC
  const fetchProfile = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfileData(data);
      setShowProfile(true);
    } catch (err) {
      console.error(err);
    }
  };

  const executeCode = async () => {
    setIsRunning(true);
    setTestResults([]);
    setActiveTab("output");
    const results = [];
    for (const testCase of selectedProblem.testCases) {
      try {
        const { data } = await axios.post("http://localhost:5000/run", {
          language: "cpp",
          code,
          input: testCase.input,
          expectedOutput: testCase.output,
        });
        results.push({ verdict: data.verdict });
      } catch (err) {
        results.push({ verdict: "Error" });
      }
    }
    setTestResults(results);
    setIsRunning(false);
    return results;
  };

  const handleSubmit = async () => {
    const results = await executeCode();
    const verdict = results.every((r) => r.verdict === "Accepted")
      ? "Accepted"
      : "Wrong Answer";
    try {
      await axios.post(
        "http://localhost:5000/submit",
        {
          problemId: selectedProblem._id,
          code,
          verdict,
          language: "cpp",
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setActiveTab("history");
      alert(verdict);
    } catch (err) {
      alert("Submission failed");
    }
  };

  // 4. RENDERING
  if (!token) return <AuthPage onLogin={setToken} />;

  if (!selectedProblem)
    return (
      <div className="h-screen bg-[#1e1e1e] text-white flex items-center justify-center font-mono">
        Initializing Workspace...
      </div>
    );

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-[#cccccc] font-sans overflow-hidden">
      <Header
        executeCode={executeCode}
        handleSubmit={handleSubmit}
        isRunning={isRunning}
        logout={logout}
        fetchProfile={fetchProfile}
      />

      <div className="flex flex-1 overflow-hidden">
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
          <div className="p-6 overflow-y-auto">
            <h1 className="text-2xl font-bold text-white mb-4">
              {selectedProblem.title}
            </h1>
            <span className="text-xs px-2 py-1 rounded bg-[#333333] text-green-400 border border-[#454545] uppercase">
              {selectedProblem.difficulty}
            </span>
            <p className="text-sm text-gray-300 mt-4 leading-relaxed">
              {selectedProblem.description}
            </p>
          </div>
        </div>

        <div className="w-2/3 flex flex-col">
          <textarea
            className="flex-1 bg-[#1e1e1e] p-4 font-mono text-sm text-[#d4d4d4] outline-none resize-none"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Write your C++ solution here..."
          />
          <Console
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            testResults={testResults}
            submissions={submissions}
            leaderboard={leaderboard}
          />
        </div>
      </div>

      {showProfile && profileData && (
        <ProfileDashboard
          data={profileData}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}

export default App;
