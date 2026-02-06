const { generateFile } = require('./compiler/generateFile'); // Import your file generator
const { executeCpp } = require('./compiler/executeCpp');     // Import your executor

// The Code we want to run
const code = `
#include <iostream>
int main() {
    std::cout << "Hello, this is the FINAL TEST!" << std::endl;
    return 0;
}
`;

// The Chain: Generate -> Execute -> Print
const run = async () => {
    try {
        // 1. Create the File
        const filePath = await generateFile('cpp', code);
        console.log(`1. File generated at: ${filePath}`);

        // 2. Run the File
        const output = await executeCpp(filePath);
        console.log(`2. Compilation Successful!`);
        console.log(`3. Output:\n${output}`);

    } catch (error) {
        console.error("Error:", error);
    }
};

run();