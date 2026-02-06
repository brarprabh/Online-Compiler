const express = require('express');
const cors = require('cors'); // Middleware to handle Cross-Origin Resource Sharing
const { generateFile } = require('./compiler/generateFile');
const { executeCpp } = require('./compiler/executeCpp');

const app = express();

// 1. Middleware
// This parses incoming requests with JSON payloads (e.g., { "language": "cpp", "code": "..." })
// Without this, req.body would be undefined.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// 2. The Main Route
// Endpoint: POST /run
app.post('/run', async (req, res) => {
    // Extract the data from the request body
    const { language = 'cpp', code } = req.body;

    // Validation: Did the user actually send code?
    if (code === undefined) {
        return res.status(400).json({ success: false, error: "Empty code body!" });
    }

    try {
        // Step A: Generate the File
        const filePath = await generateFile(language, code);
        
        // Step B: Run the File
        const output = await executeCpp(filePath);

        // Step C: Send the response back to the user
        // We return 200 OK because the "execution" succeeded (even if the code output is wrong)
        return res.json({ filePath, output });

    } catch (err) {
        // If compilation fails, we send a 500 error
        res.status(500).json({ err });
    }
});

// 3. Start the Server
app.listen(5000, () => {
    console.log('Listening on port 5000!');
});