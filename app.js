// Import required modules
require("dotenv").config();
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require("multer");
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

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

const storage = multer.memoryStorage();
const uploader = multer({ dest: 'data/' });

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
        const { cid, file, fileName, fileType } = req.body;
        if (!cid || !fileName || !fileType) {
            return res.status(400).json({ error: 'cid, file, fileName, and fileType are required' });
        }

        // const tx = await contract.storeFile(cid, fileName, fileType);
        // await tx.wait();
        // res.json({ transactionHash: tx.hash });
        res.json({ status: "OK" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Store a file for a specific user
app.post('/store', uploader.single('file'), async (req, res) => {
    try {
        const { userAddress, fileType } = req.body;
        const file = req.file;

        console.log(req.body, file);

        const key = crypto.createHash('sha256').update(userAddress, 'utf8').digest().slice(0, 32);
        const iv = Buffer.alloc(16, 0);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

        if (!userAddress || !fileType) {
            return res.status(400).json({ error: 'userAddress and fileType are required' });
        }
        if (!file) {
            return res.status(400).json({ error: 'File are required' });
        }

        const fileBuffer = file.buffer;

        let encrypted = cipher.update(fileBuffer);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        const timestamp = Date.now();
        const userDirectory = path.join(__dirname, `./data/${userAddress}`);
        const tempFilePath = path.join(userDirectory, `ulalo-encrypted-file-${timestamp}.enc`);

        fs.mkdirSync(userDirectory, { recursive: true });
        fs.writeFileSync(tempFilePath, encrypted);

        const formData = new FormData();
        formData.append('path', fs.createReadStream(tempFilePath));

        const response = await axios.post(`${process.env.IPFS_HOST}/api/v0/add`, formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Basic ${process.env.IPFS_AUTH}`,
            },
        });
        fs.unlinkSync(tempFilePath);

        const tx = await contract.storeFileForUser(userAddress, response.data.Hash, file.originalname, fileType);
        await tx.wait();
        res.json({ transactionHash: tx.hash, userAddress, cid: response.data.Hash, fileName: file.originalname, fileType });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Get a file for a specific user
app.get('/fetch/:userAddress/:cid', async (req, res) => {
    try {
        const { userAddress, cid } = req.params;

        const key = crypto.createHash('sha256').update(userAddress, 'utf8').digest().slice(0, 32);
        const iv = Buffer.alloc(16, 0);
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

        if (!userAddress || !cid) {
            return res.status(400).json({ error: 'userAddress and CID are required' });
        }

        const response = await axios.post(`${process.env.IPFS_HOST}/api/v0/cat/${cid}`, {}, {
            responseType: 'arraybuffer',
            headers: {
                Authorization: `Basic ${process.env.IPFS_AUTH}`,
            },
        });

        let decrypted = decipher.update(response.data);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        res.setHeader('Content-Type', 'application/pdf'); // Adjust Content-Type for your file type
        res.setHeader('Content-Disposition', `attachment; filename="decrypted-file-${Date.now()}.pdf"`);
        res.send(decrypted);
    } catch (err) {
        console.error(err);
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
