import axios from "axios";
import React, { useState, useEffect } from "react"; // Added useEffect
import { Play, Terminal, Code, CheckCircle, XCircle } from "lucide-react";

function App() {
  const [code, setCode] = useState("");
  const [problems, setProblems] = useState([]); // Store fetched problems
  const [selectedProblem, setSelectedProblem] = useState(null); // Allow null initially
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("output");

  // 1. Fetch Problems from Backend on Load
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/problems");
        setProblems(data);
        if (data.length > 0) setSelectedProblem(data[0]); // Select first problem automatically
      } catch (err) {
        console.error("Failed to fetch problems:", err);
      }
    };
    fetchProblems();
  }, []);

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

  const handleRun = async () => {
    if (!selectedProblem) return;
    setIsRunning(true);
    setTestResults([]);
    const results = [];

    for (const testCase of selectedProblem.testCases) {
      const result = await runTestCase(testCase);
      results.push(result);
    }

    setTestResults(results);
    setIsRunning(false);
    setActiveTab("output");
  };

  // Render Loading State if no problems yet
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

        <button
          onClick={handleRun}
          disabled={isRunning}
          className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-semibold transition-all
            ${isRunning ? "bg-gray-600 cursor-not-allowed" : "bg-green-700 hover:bg-green-600 text-white"}`}
        >
          <Play size={14} />
          {isRunning ? "Running..." : "Run Code"}
        </button>
      </header>

      {/* MAIN WORKSPACE */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL: Problem Description */}
        <div className="w-1/3 bg-vs-bg border-r border-vs-border flex flex-col">
          <div className="p-4 border-b border-vs-border bg-vs-sidebar">
            <label className="text-xs text-vs-muted font-bold uppercase tracking-wider block mb-2">
              Select Problem
            </label>
            <select
              className="w-full bg-[#3c3c3c] text-white border border-vs-border rounded p-2 text-sm outline-none focus:border-vs-accent"
              value={selectedProblem._id}
              onChange={(e) => {
                const problem = problems.find((p) => p._id === e.target.value);
                setSelectedProblem(problem);
                setTestResults([]);
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
            <div className="prose prose-invert prose-sm max-w-none text-gray-300">
              <p className="mb-4 leading-relaxed">
                {selectedProblem.description}
              </p>

              {selectedProblem.testCases.length > 0 && (
                <div className="bg-[#2d2d2d] rounded-md p-4 mb-4 border border-vs-border">
                  <span className="text-xs text-vs-muted font-mono block mb-1">
                    Example Input:
                  </span>
                  <code className="font-mono text-sm text-green-400 block mb-3">
                    {selectedProblem.testCases[0].input}
                  </code>
                  <span className="text-xs text-vs-muted font-mono block mb-1">
                    Expected Output:
                  </span>
                  <code className="font-mono text-sm text-blue-400 block">
                    {selectedProblem.testCases[0].output}
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Editor & Terminal */}
        <div className="w-2/3 flex flex-col">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="h-9 bg-vs-sidebar border-b border-vs-border flex items-center px-4 text-xs text-vs-muted select-none">
              <span className="flex items-center gap-2 bg-vs-bg px-3 py-1.5 border-t-2 border-vs-accent text-white rounded-t-sm">
                <Code size={12} className="text-blue-400" /> main.cpp
              </span>
            </div>
            <textarea
              className="flex-1 bg-vs-bg p-4 font-mono text-sm text-gray-300 outline-none resize-none leading-relaxed selection:bg-blue-900"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Write your C++ solution here..."
              spellCheck="false"
            ></textarea>
          </div>

          <div className="h-64 bg-[#181818] border-t border-vs-border flex flex-col">
            <div className="h-9 bg-vs-sidebar border-b border-vs-border flex items-center px-2 gap-4">
              <button
                onClick={() => setActiveTab("output")}
                className={`text-xs px-3 py-1 hover:text-white transition-colors flex items-center gap-2 uppercase tracking-wide font-semibold ${activeTab === "output" ? "text-white border-b-2 border-vs-accent" : "text-vs-muted"}`}
              >
                <Terminal size={12} /> Terminal
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
              {testResults.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-vs-muted opacity-50">
                  <Terminal size={48} strokeWidth={1} className="mb-2" />
                  <p>Ready to compile...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {testResults.map((res, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded bg-vs-sidebar border border-vs-border"
                    >
                      <div className="mt-0.5">
                        {res.verdict === "Accepted" ? (
                          <CheckCircle size={16} className="text-vs-green" />
                        ) : (
                          <XCircle size={16} className="text-vs-red" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`font-bold ${res.verdict === "Accepted" ? "text-vs-green" : "text-vs-red"}`}
                          >
                            Test Case {index + 1}: {res.verdict}
                          </span>
                        </div>

                        {res.verdict !== "Accepted" && (
                          <div className="grid grid-cols-2 gap-4 mt-2 text-xs bg-black/30 p-2 rounded">
                            <div>
                              <span className="text-vs-muted block mb-0.5">
                                Input
                              </span>
                              <code className="text-gray-300">{res.input}</code>
                            </div>
                            <div>
                              <span className="text-vs-muted block mb-0.5">
                                Expected
                              </span>
                              <code className="text-blue-300">
                                {res.expected}
                              </code>
                            </div>
                            <div className="col-span-2 border-t border-white/10 pt-2 mt-1">
                              <span className="text-vs-muted block mb-0.5">
                                Actual Output
                              </span>
                              <code className="text-vs-red">{res.actual}</code>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
