import axios from "axios";
import React, { useState } from "react";
import "./App.css";

function App() {
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [expectedOutput, setExpectedOutput] = useState(""); // New State
  const [output, setOutput] = useState("");
  const [verdict, setVerdict] = useState(null); // New State for Verdict

  const handleSubmit = async () => {
    const payload = {
      language: "cpp",
      code,
      input,
      expectedOutput, // Send this to backend
    };

    try {
      setVerdict(null); // Reset verdict before running
      setOutput("Executing...");

      const { data } = await axios.post("http://localhost:5000/run", payload);

      setOutput(data.output);
      setVerdict(data.verdict); // Set the result (Accepted/Wrong Answer)
    } catch (err) {
      console.log(err.response);
      if (
        err.response &&
        err.response.data.err &&
        err.response.data.err.stderr
      ) {
        setOutput(err.response.data.err.stderr);
      } else {
        setOutput("Error connecting to server!");
      }
    }
  };

  // Helper to color the Verdict
  const getVerdictColor = () => {
    if (verdict === "Accepted") return "green";
    if (verdict === "Wrong Answer") return "red";
    return "gray";
  };

  return (
    <div className="container">
      <h1>CodeCorps</h1>

      <div className="compiler-wrapper">
        <div className="input-section">
          <h3>Source Code</h3>
          <textarea
            rows="10"
            cols="75"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Write your C++ code here"
          ></textarea>

          <div className="io-container">
            <div>
              <h3>Input (stdin)</h3>
              <textarea
                rows="5"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="10 20"
              ></textarea>
            </div>
            <div>
              <h3>Expected Output</h3>
              <textarea
                rows="5"
                value={expectedOutput}
                onChange={(e) => setExpectedOutput(e.target.value)}
                placeholder="30"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="output-section">
          <h3>Output</h3>
          <p>{output}</p>

          {/* Show Verdict only if it exists */}
          {verdict && (
            <div
              className="verdict-box"
              style={{ backgroundColor: getVerdictColor() }}
            >
              {verdict}
            </div>
          )}
        </div>
      </div>

      <button onClick={handleSubmit}>Run Code</button>
    </div>
  );
}

export default App;
