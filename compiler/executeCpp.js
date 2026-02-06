const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, 'outputs');

if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

const executeCpp = (filepath) => {
    return new Promise((resolve, reject) => {
        const jobId = path.basename(filepath).split('.')[0];
        
        // FIX 1: Windows needs .exe
        const outPath = path.join(outputPath, `${jobId}.exe`);

        // FIX 2: The Command
        // On Windows, we need to handle paths carefully.
        // We compile, and if successful (&&), we run the executable directly.
        // We wrap paths in quotes \" \" just in case you have spaces in your folder names.
        const command = `g++ "${filepath}" -o "${outPath}" && "${outPath}"`;

        console.log(`RUNNING COMMAND: ${command}`); // Debug log

        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject({ error, stderr });
                return;
            }
            if (stderr) {
                reject(stderr);
                return;
            }
            resolve(stdout);
        });
    });
};

module.exports = {
    executeCpp
};