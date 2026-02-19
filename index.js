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

connectDB().then(() => {
     initializeTags(); // <--- Uncomment this line, save, and run your server ONCE.
});


// 1. Middleware
// This parses incoming requests with JSON payloads (e.g., { "language": "cpp", "code": "..." })
// Without this, req.body would be undefined.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// --- AUTHENTICATION MIDDLEWARE (THE BOUNCER) ---
const verifyToken = (req, res, next) => {
    // 1. Check if the frontend sent the token in the headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    // 2. Extract the token
    const token = authHeader.split(" ")[1];

    try {
        // 3. Verify the token using your secret key
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Attach the user's ID to the request so the next function can use it
        req.user = verified; 
        next(); // Let them pass
    } catch (err) {
        res.status(400).json({ error: "Invalid token" });
    }
};

// GET Route to fetch all problems
app.get('/problems', async (req, res) => {
    try {
        // This line fetches the problems
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
            const cleanOutput = output.trim().replace(/\r\n/g, "\n"); 
            const cleanExpected = expectedOutput.trim().replace(/\r\n/g, "\n");

            if (cleanOutput === cleanExpected) {
                verdict = "Accepted"; 
            } else {
                verdict = "Wrong Answer"; 
            }
        }

        res.json({ output, verdict });

    } catch (err) {
        // 🟢 CATCH TLE ERROR SPECIFICALLY
        if (err === "Time Limit Exceeded (TLE)") {
            return res.status(408).json({ 
                success: false, 
                error: "Time Limit Exceeded", 
                verdict: "TLE" 
            });
        }

        // Generic Error (Syntax error, Docker error, etc.)
        res.status(500).json({ 
            success: false, 
            error: err.message || err, 
            verdict: "Runtime Error" 
        });
    }
});

// SECURE SUBMIT ROUTE (Notice we added 'verifyToken' in the middle)
app.post('/submit', verifyToken, async (req, res) => {
    try {
        const { problemId, code, language, verdict } = req.body;

        const newSubmission = new Submission({
            userId: req.user.id,     // <--- THIS IS THE MAGIC LINE WE WERE MISSING!
            problemId,
            code,
            language,
            verdict
        });

        await newSubmission.save();
        res.status(201).json({ message: "Submission saved successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SECURE HISTORY ROUTE (Only get history for the logged-in user)
app.get('/submissions/:id', verifyToken, async (req, res) => {
    try {
        const problemId = req.params.id;
        
        // Find submissions that match BOTH the problem AND the user
        const history = await Submission.find({ 
            problemId: problemId,
            userId: req.user.id      // <--- Only show MY history!
        }).sort({ submittedAt: -1 });

        res.json(history);
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

// GET GLOBAL LEADERBOARD (Bulletproof Version)
app.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = await Submission.aggregate([
            // 1. Only count successful solutions
            { $match: { verdict: "Accepted" } },
            
            // 2. Group by User and count unique problems
            {
                $group: {
                    _id: "$userId",
                    solvedCount: { $addToSet: "$problemId" } 
                }
            },
            
            // 3. Convert that set of problems into a number
            {
                $project: {
                    userId: "$_id",
                    totalSolved: { $size: "$solvedCount" }
                }
            },

            // 4. FIX: Safely convert userId string to ObjectId (just in case)
            {
                $addFields: {
                    userIdObj: { $toObjectId: "$userId" }
                }
            },

            // 5. Join with the Users collection
            {
                $lookup: {
                    from: "users",           
                    localField: "userIdObj", // Use the converted ID
                    foreignField: "_id",     
                    as: "userDetails"        
                }
            },

            // 6. FIX: Use preserveNullAndEmptyArrays so data doesn't vanish if lookup fails
            { 
                $unwind: {
                    path: "$userDetails",
                    preserveNullAndEmptyArrays: true 
                }
            },

            // 7. Sort by highest solved count
            { $sort: { totalSolved: -1 } },

            // 8. Limit to Top 10
            { $limit: 10 },

            // 9. Clean up the output
            {
                $project: {
                    _id: 0,
                    // FIX: If username is missing, show "Unknown User" instead of blank
                    username: { $ifNull: ["$userDetails.username", "Unknown User"] },
                    totalSolved: 1
                }
            }
        ]);

        console.log("DEBUG Leaderboard Data:", leaderboard); // <--- This will print to your terminal!
        res.json(leaderboard);

    } catch (err) {
        console.error("Leaderboard Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET USER PROFILE DATA
app.get('/profile', verifyToken, async (req, res) => {
    try {
        // 1. Get User Basic Info (excluding password)
        const user = await User.findById(req.user.id).select('-password');
        
        // 2. Get All Unique Problems Solved by this user
        const solvedProblems = await Submission.distinct('problemId', { 
            userId: req.user.id, 
            verdict: "Accepted" 
        });

        // 3. Get Total Attempt Count
        const totalAttempts = await Submission.countDocuments({ userId: req.user.id });

        res.json({
            username: user.username,
            email: user.email,
            solvedCount: solvedProblems.length,
            totalAttempts: totalAttempts,
            solvedProblems: solvedProblems // Array of IDs
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// This function will add tags to your existing database entries
const initializeTags = async () => {
  try {
    const updates = [
      { title: "Two Sum", tags: ["Array", "Hash Table", "Easy"] },
      { title: "Reverse Linked List", tags: ["Linked List", "Easy"] },
      { title: "Binary Search", tags: ["Array", "Binary Search", "Easy"] }
    ];

    for (let item of updates) {
      // It looks for the title and adds the tags array to it
      await Problem.updateOne({ title: item.title }, { $set: { tags: item.tags } });
    }
    console.log("✅ Existing problems tagged successfully!");
  } catch (err) {
    console.error("Error tagging problems:", err);
  }
};
// 3. Start the Server
app.listen(5000, () => {
    console.log('Listening on port 5000!');
});