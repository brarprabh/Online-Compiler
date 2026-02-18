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
    },
    {
    title: "Reverse Linked List",
    description: "Given the head of a singly linked list, reverse the list and return it.",
    difficulty: "Easy",
    tags: ["Linked List"], // <--- This must match your React filter
    testCases: [
      { input: "[1,2,3,4,5]", output: "[5,4,3,2,1]" }
    ]
  },
  {
    title: "Valid Parentheses",
    description: "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    difficulty: "Easy",
    tags: ["Stack", "String"],
    testCases: [
      { input: "()[]{}", output: "true" }
    ]
  },
  {
    title: "Binary Search",
    description: "Given an array of integers nums which is sorted in ascending order, and an integer target, search target in nums.",
    difficulty: "Easy",
    tags: ["Binary Search", "Array"],
    testCases: [
      { input: "[-1,0,3,5,9,12], 9", output: "4" }
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