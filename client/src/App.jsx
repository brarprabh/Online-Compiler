import axios from "axios";
import React, { useState } from "react";
import "./App.css";

function App() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");

  const handleSubmit = async () => {
    const payload = {
      language: "cpp",
      code: code,
    };

    try {
      setOutput("Running...");
      const { data } = await axios.post("http://localhost:5000/run", payload);
      setOutput(data.output);
    } catch (error) {
      console.log(error.response);
      setOutput(
        error.response
          ? error.response.data.err.stderr
          : "Error connecting to server!",
      );
    }
  };

  return (
    <div className="App">
      <h1>AlgoArena Compiler</h1>

      <div className="container">
        <textarea
          rows="20"
          cols="75"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="#include <iostream>..."
        ></textarea>
        <br />
        <button onClick={handleSubmit}>Run Code</button>
      </div>

      <div className="output-box">
        <p>Output:</p>
        <pre>{output}</pre>
      </div>
    </div>
  );
}

export default App;
