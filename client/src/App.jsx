import React, { useState, useEffect } from "react";
import axios from "axios";

// COMPONENTS
import Header from "./components/Shared/Header";
import Console from "./components/Workspace/Console";
import ProfileDashboard from "./components/Profile/ProfileDashboard";
import AuthPage from "./components/Auth/AuthPage";
import ProblemFilter from "./components/ProblemFilter";

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

  // FILTER STATE
  const [activeFilter, setActiveFilter] = useState("All");

  const allTags = [
    "All",
    "Array",
    "String",
    "Linked List",
    "Stack",
    "Binary Search",
  ];

  // 2. SYNC LOGIC: Filter and Auto-Select
  const filteredProblems =
    activeFilter === "All"
      ? problems
      : problems.filter((p) => p.tags && p.tags.includes(activeFilter));

  // Function to handle filter changes and keep UI in sync
  const handleFilterChange = (tag) => {
    setActiveFilter(tag);

    // Calculate new filtered list immediately to pick the first problem
    const newList =
      tag === "All"
        ? problems
        : problems.filter((p) => p.tags && p.tags.includes(tag));

    if (newList.length > 0) {
      setSelectedProblem(newList[0]); // Auto-select the first problem of the new tag
    } else {
      setSelectedProblem(null); // Show "Empty" state if no problems found
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // 3. DATA FETCHING
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
            { headers: { Authorization: `Bearer ${token}` } },
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

  if (!selectedProblem && activeFilter === "All")
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
        {/* LEFT PANEL */}
        <div className="w-1/3 bg-[#1e1e1e] border-r border-[#3e3e42] flex flex-col">
          {/* Tag Filter Bar */}
          <ProblemFilter
            activeFilter={activeFilter}
            setActiveFilter={handleFilterChange} // Note: Uses sync function
            allTags={allTags}
          />

          <div className="p-4 border-b border-[#3e3e42] bg-[#252526]">
            <select
              className="w-full bg-[#3c3c3c] text-white border border-[#3e3e42] rounded p-2 text-sm outline-none"
              value={selectedProblem?._id || ""}
              onChange={(e) => {
                setSelectedProblem(
                  problems.find((p) => p._id === e.target.value),
                );
                setTestResults([]);
                setCode("");
              }}
            >
              {filteredProblems.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="p-6 overflow-y-auto">
            {selectedProblem ? (
              <>
                <h1 className="text-2xl font-bold text-white mb-2">
                  {selectedProblem.title}
                </h1>

                {/* Visual Tags and Difficulty */}
                <div className="flex gap-2 flex-wrap mb-4">
                  <span className="text-[10px] px-2 py-1 rounded bg-[#333333] text-green-400 border border-[#454545] uppercase font-bold">
                    {selectedProblem.difficulty}
                  </span>
                  {selectedProblem.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase font-bold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-gray-300 leading-relaxed">
                  {selectedProblem.description}
                </p>
              </>
            ) : (
              <div className="text-center mt-20 italic text-gray-500">
                No problems found for this category.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
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
