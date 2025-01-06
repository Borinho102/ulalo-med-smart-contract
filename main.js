// app.js
require("dotenv").config();
const express = require("express");
const { ethers } = require("ethers");

const app = express();
app.use(express.json());

// Load environment variables
const RPC_URL = process.env.API_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// Contract ABI (from compilation output or etherscan)
const CONTRACT_ABI = [
    "event UpdatedMessages(string oldStr, string newStr)",
    "event CIDStored(address user, string cid)",
    "event CIStore(address indexed user, string cid)",
    "function update(string memory newMessage) public",
    "function store(string memory cid) public",
    "function storeCID(address user, string memory cid) public",
    "function getCIDs(address user) public view returns (string[] memory)",
];

// Set up ethers.js
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

// API Routes

// Health Check
app.get("/", (req, res) => {
    res.send("UlaloDataStore API is running.");
});

app.post("/api/extract-data", async (req, res) => {
    try {
        res.status(200).send({ data: new Date().getFullYear(), category: ["vacine", "vacine"] });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to extra data" });
    }
});

// Update Message
app.post("/updateMessage", async (req, res) => {
    const { newMessage } = req.body;
    try {
        const tx = await contract.update(newMessage);
        await tx.wait(); // Wait for confirmation
        res.status(200).send({ message: "Message updated successfully", txHash: tx.hash });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to update message" });
    }
});

// Store CID
app.post("/storeCID", async (req, res) => {
    const { cid, address } = req.body;
    try {
        const tx = await contract.storeCID(address, cid);
        await tx.wait(); // Wait for confirmation
        res.status(200).send({ message: "CID stored successfully", txHash: tx.hash });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to store CID" });
    }
});

// Get CIDs for a user
app.get("/getCIDs/:address", async (req, res) => {
    const { address } = req.params;
    try {
        const cids = await contract.getCIDs(address);
        res.status(200).send({ address, cids });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to retrieve CIDs" });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
