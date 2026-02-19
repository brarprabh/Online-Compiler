const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, 'outputs');

if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

const executeCpp = (filepath, inputPath) => {
    return new Promise((resolve, reject) => {
        const jobId = path.basename(filepath).split('.')[0];
        const inputId = path.basename(inputPath).split('.')[0];
        const currentDir = __dirname; 

        const command = `docker run --rm -v "${currentDir}:/app" -w /app gcc sh -c "g++ codes/${jobId}.cpp -o outputs/${jobId}.out && outputs/${jobId}.out < inputs/${inputId}.txt"`;

        console.log(`🐳 Docker Command: ${command}`);

        // 🟢 ADDED: { timeout: 5000 } kills the Docker process if it runs for > 5 seconds
        exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
            if (error) {
                // 🟢 CHECK: Was the process killed by our timeout?
                if (error.killed || error.signal === 'SIGTERM') {
                    return reject("Time Limit Exceeded (TLE)");
                }

                if (stderr) {
                    reject(stderr);
                } else {
                    reject(error.message);
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