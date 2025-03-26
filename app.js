// Import required modules
import * as IPFS from 'ipfs-core';
import 'dotenv/config';
import express from 'express';
import { ethers } from 'ethers';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { fromString } from 'uint8arrays/from-string';
import { sha512 } from 'multiformats/hashes/sha2'
import {CID} from "multiformats";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connect to a local IPFS node
const ipfs = await IPFS.create();
// const helia = await createHelia()
// const ipfs = unixfs(helia)

// Load environment variables
const RPC_URL = process.env.API_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// Initialize Express app
const app = express();
const port = 4000;

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

// Set up ethers.js
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

const storage = multer.memoryStorage();
const uploader = multer({ storage });

// API endpoints
app.post("/api/extract-data", async (req, res) => {
    try {
        res.status(200).send({ data: new Date().getFullYear(), category: ["vacine", "vacine"] });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to extract data" });
    }
});

// Store a file for a specific user
app.post('/store', uploader.single('file'), async (req, res) => {
    try {
        const { userAddress, fileType } = req.body;
        const file = req.file;

        if (!userAddress || !fileType || !file) {
            return res.status(400).json({ error: 'userAddress, fileType, and file are required' });
        }

        const key = crypto.createHash('sha256').update(userAddress, 'utf8').digest().slice(0, 32);
        const iv = Buffer.alloc(16, 0);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

        const fileBuffer = file.buffer;
        let encrypted = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);

        const timestamp = Date.now();
        const userDirectory = path.join(__dirname, `./data/${userAddress}`);
        const tempFilePath = path.join(userDirectory, `ulalo-encrypted-file-${timestamp}.enc`);

        fs.mkdirSync(userDirectory, { recursive: true });
        fs.writeFileSync(tempFilePath, encrypted);
        const fileContent = fs.readFileSync(tempFilePath);

        const { cid } = await ipfs.add(fileContent);
        fs.unlinkSync(tempFilePath);

        const cidString = cid.toString();

        const tx = await contract.storeFileForUser(userAddress, cidString, file.originalname, fileType);
        await tx.wait();
        res.json({ transactionHash: tx.hash, userAddress, cid: cidString, fileName: file.originalname, fileType });
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

app.get('/fetch/:userAddress/:cid', async (req, res) => {
    try {
        const { userAddress, cid } = req.params;

        if (!userAddress || !cid) {
            return res.status(400).json({ error: 'userAddress and CID are required' });
        }

        // Fetch file from IPFS
        const stream = ipfs.cat(cid);
        let encryptedData = Buffer.alloc(0);

        for await (const chunk of stream) {
            encryptedData = Buffer.concat([encryptedData, chunk]);
        }

        // Decrypt file
        const key = crypto.createHash('sha256').update(userAddress, 'utf8').digest().slice(0, 32);
        const iv = Buffer.alloc(16, 0);
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

        let decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

        // Set appropriate headers and send the decrypted file
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="decrypted-file-${Date.now()}"`);
        res.send(decrypted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
