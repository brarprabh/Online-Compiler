const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

// Create a folder to store input files
const dirInputs = path.join(__dirname, 'inputs');

if (!fs.existsSync(dirInputs)) {
    fs.mkdirSync(dirInputs, { recursive: true });
}

const generateInputFile = async (input) => {
    // Generate a unique name (e.g., "abc-123-xyz.txt")
    const jobId = uuid();
    const input_filename = `${jobId}.txt`;
    const input_filepath = path.join(dirInputs, input_filename);

    // Write the user's input to this file
    await fs.writeFileSync(input_filepath, input);

    return input_filepath;
};

module.exports = {
    generateInputFile
};