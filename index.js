const path = require('path');
// Force Node to look for .env in the CURRENT folder (__dirname)
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

console.log("DEBUG: JWT_SECRET is:", process.env.JWT_SECRET);

const express = require('express');
const app = express();


const bcrypt = require('bcryptjs'); // Encrypts passwords
const jwt = require('jsonwebtoken'); // Creates the "passport"
const User = require('./models/User');
const generateToken = require('./generateToken');

const cors = require('cors'); // Middleware to handle Cross-Origin Resource Sharing
const { generateFile } = require('./compiler/generateFile');
const { executeCpp } = require('./compiler/executeCpp');
const { generateInputFile } = require('./compiler/generateInputFile');

const connectDB = require("./database"); // Import connection logic
const Problem = require("./models/problem"); // Import the Model
const Submission = require('./models/Submission');

connectDB();


// 1. Middleware
// This parses incoming requests with JSON payloads (e.g., { "language": "cpp", "code": "..." })
// Without this, req.body would be undefined.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// GET Route to fetch all problems
app.get('/problems', async (req, res) => {
    try {
        // Fetch all problems from Mongo, but only return title, difficulty, and id
        const problems = await Problem.find(); 
        res.json(problems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET Route to fetch a single problem (including test cases)
app.get('/problems/:id', async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) return res.status(404).json({ error: "Problem not found" });
        res.json(problem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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

app.post('/submit', async (req, res) => {
    try {
        const { problemId, code, language } = req.body;

        // 1. Find the problem to get its test cases
        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).json({ error: "Problem not found" });

        // 2. Run the code against ALL test cases
        // (For simplicity, we are re-using the logic. In a real app, you'd abstract this into a function)
        let verdict = "Accepted";
        
        // We need to loop through test cases to verify
        // Note: Ideally, you import the 'executeCpp' function logic here to run it internally.
        // For now, let's assume the Frontend sends the "verdict" or we just save the attempt.
        // BETTER APPROACH FOR NOW: Just save what the frontend sends 
        // (We will make this secure in the next "Security" phase).
        
        const submission = new Submission({
            problemId,
            code,
            language,
            verdict: req.body.verdict // The frontend will tell us if it passed or failed for now
        });

        await submission.save(); // Save to MongoDB

        res.json({ message: "Submission Saved", submission });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET Route: Fetch submissions for a specific problem
app.get('/submissions/:problemId', async (req, res) => {
  try {
    const { problemId } = req.params;
    // Find submissions -> Sort by newest first (-1)
    const submissions = await Submission.find({ problemId }).sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// REGISTER ROUTE
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: "User already exists" });
        }

        // 2. Encrypt the password (The most important step!)
        const salt = await bcrypt.genSalt(10); // "Salt" makes the hash random/unique
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create the user
        const user = new User({
            username,
            email,
            password: hashedPassword // Save the ENCRYPTED version, never plain text!
        });

        await user.save();

        // 4. Give them a token immediately so they are logged in
        res.status(201).json({ 
            message: "User registered successfully",
            token: generateToken(user._id) // <--- We need to define this function or import it
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LOGIN ROUTE
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // 2. Compare passwords
        // bcrypt.compare(typedPassword, databaseHash)
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // 3. Send back the token
        res.json({
            message: "Login successful",
            username: user.username,
            token: generateToken(user._id)
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Start the Server
app.listen(5000, () => {
    console.log('Listening on port 5000!');
});