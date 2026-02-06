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
        
        // 1. Get the path to the "compiler" folder
        // We need to mount this entire folder so Docker can see both /codes and /outputs
        const currentDir = __dirname; // This is .../algo-arena/compiler

        // 2. The Command
        // Let's break down this beast:
        // docker run       -> Start a container
        // --rm             -> Remove the container immediately after it finishes (save space)
        // -v ...:/app      -> MOUNT: Map your Windows folder to '/app' inside Linux
        // -w /app          -> WORKDIR: Start inside the '/app' folder
        // gcc              -> IMAGE: Use the gcc image we downloaded
        // sh -c "..."      -> SHELL: Run these commands inside Linux
        
        // Note: Inside Docker, we use Linux paths (forward slashes /)
        // We compile the file, output it to 'outputs' folder, and run it.
        const command = `docker run --rm -v "${currentDir}:/app" -w /app gcc sh -c "g++ codes/${jobId}.cpp -o outputs/${jobId}.out && outputs/${jobId}.out"`;

        console.log(`🐳 Docker Command: ${command}`); // Log to see what's happening

        exec(command, (error, stdout, stderr) => {
            // Case A: System Failure (Docker crash, etc.)
            if (error) {
                // Warning: If the code fails to compile, 'g++' returns an error too.
                // We need to check if it's a compilation error or a system error.
                if (stderr) {
                     // Just a compilation error (user's fault)
                     reject(stderr);
                } else {
                     // System error (Docker not running?)
                     reject(error);
                }
                return;
            }
            // Case B: Success
            resolve(stdout);
        });
    });
};

module.exports = {
    executeCpp
};