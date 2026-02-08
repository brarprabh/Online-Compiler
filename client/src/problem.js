// File: client/src/problems.js
//json object array
export const problems = [
    {
        id: 1,
        title: "Sum of Two Numbers",
        description: "Given two integers a and b, return their sum.",
        testCases: [
            { input: "10 20", output: "30" },  // Test Case 1
            { input: "-5 10", output: "5" },   // Test Case 2
            { input: "0 0", output: "0" }      // Test Case 3
        ]
    },
    {
        id: 2,
        title: "Multiply Two Numbers",
        description: "Given two integers a and b, return their product.",
        testCases: [
            { input: "3 4", output: "12" },    // Test Case 1
            { input: "10 0", output: "0" },    // Test Case 2
            { input: "-2 -3", output: "6" }    // Test Case 3
        ]
    }
];