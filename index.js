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
    // 1. Get code AND input from the user
    const { language = "cpp", code, input } = req.body;

    if (!code) {
        return res.status(400).json({ success: false, error: "Empty code body!" });
    }

    try {
        // 2. Generate the C++ File
        const filepath = await generateFile(language, code);

        // 3. Generate the Input File (even if empty, we create an empty file)
        const inputPath = await generateInputFile(input || "");

        // 4. Run with Docker (passing both paths)
        const output = await executeCpp(filepath, inputPath);

        res.json({ filepath, output });
    } catch (err) {
        res.status(500).json({ err });
    }
});

// 3. Start the Server
app.listen(5000, () => {
    console.log('Listening on port 5000!');
});