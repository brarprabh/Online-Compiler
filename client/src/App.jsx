import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  Play,
  Terminal,
  Code,
  CheckCircle,
  XCircle,
  Save,
  Clock,
  History,
} from "lucide-react"; // Added icons

function App() {
  const [code, setCode] = useState("");
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [submissions, setSubmissions] = useState([]); // Store history
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("output"); // 'output' or 'history'

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/problems");
        setProblems(data);
        if (data.length > 0) setSelectedProblem(data[0]);
      } catch (err) {
        console.error("Failed to fetch problems:", err);
      }
    };
    fetchProblems();
  }, []);

  // Fetch submissions whenever the user selects a problem OR clicks the tab
  useEffect(() => {
    if (selectedProblem && activeTab === "history") {
      const fetchHistory = async () => {
        try {
          const { data } = await axios.get(
            `http://localhost:5000/submissions/${selectedProblem._id}`,
          );
          setSubmissions(data);
        } catch (err) {
          console.error("Failed to fetch history:", err);
        }
      };
      fetchHistory();
    }
  }, [selectedProblem, activeTab]);

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
    setIsRunning(true);
    setTestResults([]);
    setActiveTab("output"); // Force switch to output to see progress
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
      await axios.post("http://localhost:5000/submit", {
        problemId: selectedProblem._id,
        code,
        language: "cpp",
        verdict,
      });

      // Auto-switch to history tab to show the new submission
      setActiveTab("history");
      // Re-fetch history immediately
      const { data } = await axios.get(
        `http://localhost:5000/submissions/${selectedProblem._id}`,
      );
      setSubmissions(data);

      alert(isSuccess ? "🎉 Accepted!" : "❌ Wrong Answer");
    } catch (err) {
      alert("Error saving submission.");
    }
  };

  if (!selectedProblem) {
    return (
      <div className="h-screen bg-vs-bg text-white flex items-center justify-center">
        Loading Problems...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-vs-bg text-vs-text font-sans overflow-hidden">
      {/* HEADER */}
      <header className="h-12 bg-vs-sidebar border-b border-vs-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <Code className="text-vs-accent w-5 h-5" />
          <span>
            Code<span className="text-vs-accent">Corps</span>
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={executeCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 rounded text-sm font-semibold bg-gray-700 hover:bg-gray-600 text-white"
          >
            <Play size={14} /> Run
          </button>
          <button
            onClick={handleSubmit}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 rounded text-sm font-semibold bg-green-700 hover:bg-green-600 text-white"
          >
            <Save size={14} /> Submit
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        <div className="w-1/3 bg-vs-bg border-r border-vs-border flex flex-col">
          <div className="p-4 border-b border-vs-border bg-vs-sidebar">
            <select
              className="w-full bg-[#3c3c3c] text-white border border-vs-border rounded p-2 text-sm outline-none"
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
              <span
                className={`text-xs px-2 py-1 rounded bg-gray-700 text-${selectedProblem.difficulty === "Easy" ? "green" : "yellow"}-400`}
              >
                {selectedProblem.difficulty}
              </span>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              {selectedProblem.description}
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-2/3 flex flex-col">
          <div className="flex-1 flex flex-col min-h-0">
            <textarea
              className="flex-1 bg-vs-bg p-4 font-mono text-sm text-gray-300 outline-none resize-none leading-relaxed"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Write your C++ solution here..."
              spellCheck="false"
            ></textarea>
          </div>

          <div className="h-64 bg-[#181818] border-t border-vs-border flex flex-col">
            {/* TABS */}
            <div className="h-9 bg-vs-sidebar border-b border-vs-border flex items-center px-2 gap-2">
              <button
                onClick={() => setActiveTab("output")}
                className={`text-xs px-3 py-1 flex items-center gap-2 uppercase tracking-wide font-semibold ${activeTab === "output" ? "text-white border-b-2 border-vs-accent" : "text-vs-muted"}`}
              >
                <Terminal size={12} /> Output
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`text-xs px-3 py-1 flex items-center gap-2 uppercase tracking-wide font-semibold ${activeTab === "history" ? "text-white border-b-2 border-vs-accent" : "text-vs-muted"}`}
              >
                <History size={12} /> Submissions
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
              {activeTab === "output" ? (
                // OUTPUT VIEW
                testResults.length === 0 ? (
                  <div className="text-vs-muted opacity-50">
                    Run code to see output...
                  </div>
                ) : (
                  testResults.map((res, index) => (
                    <div
                      key={index}
                      className="mb-2 p-2 rounded bg-vs-sidebar border border-vs-border flex items-center gap-3"
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
                        Case {index + 1}: {res.verdict}
                      </span>
                    </div>
                  ))
                )
              ) : // HISTORY VIEW
              submissions.length === 0 ? (
                <div className="text-vs-muted opacity-50">
                  No submissions yet.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-vs-muted border-b border-vs-border">
                      <th className="pb-2">Verdict</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Language</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub, i) => (
                      <tr key={i} className="border-b border-vs-border/50">
                        <td
                          className={`py-2 font-bold ${sub.verdict === "Accepted" ? "text-green-500" : "text-red-500"}`}
                        >
                          {sub.verdict}
                        </td>
                        <td className="py-2 text-gray-400">
                          {new Date(sub.submittedAt).toLocaleString()}
                        </td>
                        <td className="py-2 text-blue-400">{sub.language}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
