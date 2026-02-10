import axios from "axios";
import React, { useState, useEffect } from "react";
import { Play, Terminal, Code, CheckCircle, XCircle, Save } from "lucide-react"; // Added Save icon

function App() {
  const [code, setCode] = useState("");
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("output");

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
    const results = [];

    // Run against ALL test cases
    for (const testCase of selectedProblem.testCases) {
      const result = await runTestCase(testCase);
      results.push(result);
    }

    setTestResults(results);
    setIsRunning(false);
    setActiveTab("output");
    return results; // Return results so handleSubmit can use them
  };

  const handleSubmit = async () => {
    if (!selectedProblem) return;

    // 1. Run the code first to check correctness
    const results = await executeCode();

    // 2. Determine if passed (Every test case must be "Accepted")
    const isSuccess = results.every((r) => r.verdict === "Accepted");
    const verdict = isSuccess ? "Accepted" : "Wrong Answer";

    // 3. Save to Database
    try {
      await axios.post("http://localhost:5000/submit", {
        problemId: selectedProblem._id,
        code,
        language: "cpp",
        verdict,
      });

      if (isSuccess) {
        alert("🎉 Accepted! Submission Saved.");
      } else {
        alert("❌ Wrong Answer. Keep trying!");
      }
    } catch (err) {
      console.error("Submission failed:", err);
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
            className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-semibold transition-all
                ${isRunning ? "bg-gray-600 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
          >
            <Play size={14} />
            Run
          </button>

          <button
            onClick={handleSubmit}
            disabled={isRunning}
            className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-semibold transition-all
                ${isRunning ? "bg-gray-600 cursor-not-allowed" : "bg-green-700 hover:bg-green-600 text-white"}`}
          >
            <Save size={14} />
            Submit
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        <div className="w-1/3 bg-vs-bg border-r border-vs-border flex flex-col">
          <div className="p-4 border-b border-vs-border bg-vs-sidebar">
            <select
              className="w-full bg-[#3c3c3c] text-white border border-vs-border rounded p-2 text-sm outline-none focus:border-vs-accent"
              value={selectedProblem._id}
              onChange={(e) => {
                const problem = problems.find((p) => p._id === e.target.value);
                setSelectedProblem(problem);
                setTestResults([]);
                setCode(""); // Optional: Clear code on switch
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
            {selectedProblem.testCases.length > 0 && (
              <div className="bg-[#2d2d2d] rounded p-4 border border-vs-border font-mono text-sm">
                <div className="mb-2">
                  <span className="text-gray-500">Input:</span>
                  <div className="text-white mt-1">
                    {selectedProblem.testCases[0].input}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Output:</span>
                  <div className="text-white mt-1">
                    {selectedProblem.testCases[0].output}
                  </div>
                </div>
              </div>
            )}
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
            <div className="h-9 bg-vs-sidebar border-b border-vs-border flex items-center px-4">
              <span className="text-xs text-vs-muted uppercase tracking-wide font-semibold flex items-center gap-2">
                <Terminal size={12} /> Test Results
              </span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
              {testResults.map((res, index) => (
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
