const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, 'outputs');

if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

// NOTE: We now accept 'inputId' as a second argument!
const executeCpp = (filepath, inputPath) => {
    return new Promise((resolve, reject) => {
        const jobId = path.basename(filepath).split('.')[0];
        const inputId = path.basename(inputPath).split('.')[0];
        const currentDir = __dirname; 

        // THE UPGRADE:
        // 1. We keep the same mounts.
        // 2. We add "< inputs/inputId.txt" at the very end.
        // This tells Linux: "Read standard input from this file."
        
        const command = `docker run --rm -v "${currentDir}:/app" -w /app gcc sh -c "g++ codes/${jobId}.cpp -o outputs/${jobId}.out && outputs/${jobId}.out < inputs/${inputId}.txt"`;

        console.log(`🐳 Docker Command: ${command}`);

        exec(command, (error, stdout, stderr) => {
            if (error) {
                if (stderr) {
                     reject(stderr);
                } else {
                     reject(error);
                }
                return;
            }
            resolve(stdout);
        });
    });
};

module.exports = {
    executeCpp
};