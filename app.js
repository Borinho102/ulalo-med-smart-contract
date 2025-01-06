// Import required modules
require("dotenv").config();
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const bodyParser = require('body-parser');

// Load environment variables
const RPC_URL = process.env.API_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// Initialize Express app
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Contract details
const ABI = [
    "event UpdatedMessages(string oldStr, string newStr)",
    "event FileStored(address indexed user, string cid, string fileName, string fileType)",
    "function message() view returns (string)",
    "function update(string newMessage)",
    "function storeFile(string cid, string fileName, string fileType)",
    "function storeFileForUser(address userAddress, string cid, string fileName, string fileType)",
    "function getFiles(address user) view returns (tuple(string cid, string fileName, string fileType)[])",
];

// Connect to Ethereum network (use Infura, Alchemy, or a local node)
// Set up ethers.js
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

// API endpoints

// Get the current message
app.get('/message', async (req, res) => {
    try {
        const message = await contract.message();
        res.json({ message });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update the message
app.post('/message', async (req, res) => {
    try {
        const { newMessage } = req.body;
        if (!newMessage) {
            return res.status(400).json({ error: 'newMessage is required' });
        }

        const tx = await contract.update(newMessage);
        await tx.wait();
        res.json({ transactionHash: tx.hash });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/extract-data", async (req, res) => {
    try {
        res.status(200).send({ data: new Date().getFullYear(), category: ["vacine", "vacine"] });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to extra data" });
    }
});

// Store a file
app.post('/save', async (req, res) => {
    try {
        const { cid, fileName, fileType } = req.body;
        if (!cid || !fileName || !fileType) {
            return res.status(400).json({ error: 'cid, fileName, and fileType are required' });
        }

        const tx = await contract.storeFile(cid, fileName, fileType);
        await tx.wait();
        res.json({ transactionHash: tx.hash });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Store a file for a specific user
app.post('/store', async (req, res) => {
    try {
        const { userAddress, cid, fileName, fileType } = req.body;
        if (!userAddress || !cid || !fileName || !fileType) {
            return res.status(400).json({ error: 'userAddress, cid, fileName, and fileType are required' });
        }

        const tx = await contract.storeFileForUser(userAddress, cid, fileName, fileType);
        await tx.wait();
        res.json({ transactionHash: tx.hash });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get files for a user
app.get('/data/:userAddress', async (req, res) => {
    try {
        const { userAddress } = req.params;
        const files = await contract.getFiles(userAddress);
        res.json({ files });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
