const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Problem = require('./models/problem');
const connectDB = require('./database');

dotenv.config();

const problems = [
    {
        title: "Sum of Two Numbers",
        description: "Given two integers a and b, return their sum.",
        difficulty: "Easy",
        testCases: [
            { input: "10 20", output: "30" },
            { input: "-5 10", output: "5" },
            { input: "0 0", output: "0" }
        ]
    },
    {
        title: "Multiply Two Numbers",
        description: "Given two integers a and b, return their product.",
        difficulty: "Easy",
        testCases: [
            { input: "3 4", output: "12" },
            { input: "10 0", output: "0" },
            { input: "-2 -3", output: "6" }
        ]
    },
    {
        title: "Subtract Two Numbers",
        description: "Given two integers a and b, return the result of a - b.",
        difficulty: "Easy",
        testCases: [
            { input: "10 5", output: "5" },
            { input: "5 10", output: "-5" },
            { input: "0 0", output: "0" }
        ]
    }
];

const seedDB = async () => {
    try {
        await connectDB(); // Connect to MongoDB
        await Problem.deleteMany({}); // Clear existing data (to avoid duplicates)
        await Problem.insertMany(problems); // Insert new data
        console.log("✅ Database Seeded Successfully!");
        process.exit();
    } catch (err) {
        console.error("❌ Seeding Error:", err);
        process.exit(1);
    }
};

seedDB();