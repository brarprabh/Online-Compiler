const axios = require('axios'); // for checking if the server works or not

// The Code we want to send to the server
const payload = {
    language: "cpp",
    code: `
    #include <iostream>
    int main() {
        std::cout << "Hello from the API Server!" << std::endl;
        return 0;
    }
    `
};

const testServer = async () => {
    try {
        console.log("📡 Sending request to http://localhost:5000/run ...");
        
        // We send a POST request with our JSON payload
        const response = await axios.post('http://localhost:5000/run', payload);
        
        console.log("\n✅ Server Responded!");
        console.log("---------------------------------");
        console.log("Output from C++:", response.data.output);
        console.log("---------------------------------");

    } catch (error) {
        console.error("❌ Error:", error.response ? error.response.data : error.message);
    }
};

testServer();