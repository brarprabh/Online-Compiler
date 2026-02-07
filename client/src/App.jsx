import axios from "axios";
import React, { useState } from "react";
import "./App.css";

function App() {
  const [code, setCode] = useState("");
  const [input, setInput] = useState(""); // New State for Input
  const [output, setOutput] = useState("");

  const handleSubmit = async () => {
    const payload = {
      language: "cpp",
      code,
      input, // Send the input to the backend
    };

    try {
      const { data } = await axios.post("http://localhost:5000/run", payload);
      setOutput(data.output);
    } catch (err) {
      console.log(err.response);
      // If there is an error (compilation failed), show it!
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

  return (
    <div className="container">
      <h1>AlgoArena Compiler</h1>

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

          <br />

          <h3>Input (stdin)</h3>
          <textarea
            rows="5"
            cols="75"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter input here (e.g., 10 20)"
          ></textarea>
        </div>

        <div className="output-section">
          <h3>Output</h3>
          <p>{output}</p>
        </div>
      </div>

      <button onClick={handleSubmit}>Run Code</button>
    </div>
  );
}

export default App;
