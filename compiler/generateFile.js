const fs = require('fs'); // for file system
const path = require('path');
// "uuid" is a library for unique IDs, but for now we will use a simple random number
// to avoid installing extra packages today.

// This folder will store all the temp code files
const dirCodes = path.join(__dirname, 'codes');

// 1. Ensure the 'codes' folder exists.
// If we don't do this, the code will crash saying "Directory not found".
if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
}

const generateFile = async (format, content) => {
    // 2. Create a unique filename.
    // In production, we use UUID. For now, a random number works.
    const jobId = `job-${Math.floor(Math.random() * 10000)}`; 
    const filename = `${jobId}.${format}`; // e.g., job-542.cpp
    
    // 3. Get the full path where the file will sit
    const filePath = path.join(dirCodes, filename);
    
    // 4. Write the file to the hard drive
    // We use 'writeFileSync' for simplicity in Phase 1. 
    await fs.writeFileSync(filePath, content);
    
    return filePath;
};

module.exports = {
    generateFile,
};