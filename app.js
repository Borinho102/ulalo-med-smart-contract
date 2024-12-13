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

// Contract ABI (updated to match the new contract)
const CONTRACT_ABI = [
    "event UpdatedMessages(string oldStr, string newStr)",
    "event FileStored(address indexed user, string cid, string fileName, string fileType)",
    "function update(string memory newMessage) public",
    "function storeFile(string memory cid, string memory fileName, string memory fileType) public",
    "function storeFileForUser(address userAddress, string memory cid, string memory fileName, string memory fileType) public",
    "function getFiles(address user) public view returns (tuple(string cid, string fileName, string fileType)[] memory)",
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

// Store File for Sender
app.post("/save", async (req, res) => {
    const { cid, fileName, fileType } = req.body;
    try {
        const tx = await contract.storeFile(cid, fileName, fileType);
        await tx.wait(); // Wait for confirmation
        res.status(200).send({ message: "File stored successfully", txHash: tx.hash });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to store file" });
    }
});

// Store File for Specific User
app.post("/store", async (req, res) => {
    const { userAddress, cid, fileName, fileType } = req.body;
    try {
        const tx = await contract.storeFileForUser(userAddress, cid, fileName, fileType);
        await tx.wait(); // Wait for confirmation
        res.status(200).send({ message: "File stored successfully for user", txHash: tx.hash });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to store file for user" });
    }
});

// Get Files for a User
app.get("/get/:address", async (req, res) => {
    const { address } = req.params;
    try {
        const files = await contract.getFiles(address);
        const fileDetails = files.map(([cid, fileName, fileType]) => ({
            cid,
            fileName,
            fileType,
        }));
        res.status(200).send({ address, files: fileDetails });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to retrieve files" });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
