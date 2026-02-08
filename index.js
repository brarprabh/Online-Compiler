const express = require('express');
const cors = require('cors'); // Middleware to handle Cross-Origin Resource Sharing
const { generateFile } = require('./compiler/generateFile');
const { executeCpp } = require('./compiler/executeCpp');
const { generateInputFile } = require('./compiler/generateInputFile');
const app = express();

// 1. Middleware
// This parses incoming requests with JSON payloads (e.g., { "language": "cpp", "code": "..." })
// Without this, req.body would be undefined.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// 2. The Main Route
// Endpoint: POST /run
app.post("/run", async (req, res) => {
    // 1. Extract 'expectedOutput' from the request
    const { language = "cpp", code, input, expectedOutput } = req.body;

    if (!code) {
        return res.status(400).json({ success: false, error: "Empty code body!" });
    }

    try {
        const filepath = await generateFile(language, code);
        const inputPath = await generateInputFile(input); 

        // 2. Run the Code
        const output = await executeCpp(filepath, inputPath); 

        // 3. The Judge Logic (Verdict)
        let verdict = null;
        if (expectedOutput) {
            // "Normalize" the strings: Remove extra spaces and newlines
            const cleanOutput = output.trim().replace(/\r\n/g, "\n"); 
            const cleanExpected = expectedOutput.trim().replace(/\r\n/g, "\n");

            if (cleanOutput === cleanExpected) {
                verdict = "Accepted"; // ✅
            } else {
                verdict = "Wrong Answer"; // ❌
            }
        }

        // 4. Return Output + Verdict
        res.json({ output, verdict });

    } catch (err) {
        res.status(500).json({ err });
    }
});

// 3. Start the Server
app.listen(5000, () => {
    console.log('Listening on port 5000!');
});