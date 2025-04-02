// Import required modules
import * as IPFS from 'ipfs-core';
import 'dotenv/config';
import express from 'express';
import { ethers } from 'ethers';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connect to a local IPFS node
const ipfs = await IPFS.create({ url: "http://40.67.205.233:5001" });

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
    "event AllFilesCleared(address indexed userAddress)",
    "event FileDeleted(address indexed userAddress, string cid)",
    "event AllDataCleared()",
    "event FileStored(address indexed user, string cid, string fileName, string fileType, uint256 fileSize, string fileContent, string date, uint256 score)",
    "function message() view returns (string)",
    "function update(string newMessage)",
    "function storeFileForUser(address userAddress, string memory cid, string memory fileName, string memory fileType, uint256 fileSize, string memory fileContent, string memory date, uint256 score)",
    "function getFiles(address user) public view returns (string[], string[], string[], uint256[], string[], string[], uint256[])",
    "function deleteUserFile(address userAddress, uint256 index) public view returns (string[], string[], string[], uint256[], string[], string[], uint256[])",
    "function clearAllFiles(address userAddress) public view returns (string[], string[], string[], uint256[], string[], string[], uint256[])"
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
        const { userAddress, fileType, content, score } = req.body;
        const file = req.file;

        if (!userAddress || !fileType || !file) {
            return res.status(400).json({ error: 'userAddress, fileType, and file are required' });
        }

        const size = (file.size/(1024*1024)).toFixed(2)

        const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-")

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
        await ipfs.pin.add(cidString)

        const tx = await contract.storeFileForUser(userAddress, cidString, file.originalname, fileType, Math.round(size * 100), content, today, Math.round(score * 100));
        await tx.wait();
        res.json({ transactionHash: tx.hash, userAddress, cid: cidString, fileName: file.originalname, fileType, fileContent: content, score: Number(score), date: today, fileSize: Number(size) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});




// Get files for a user
app.get('/data/:userAddress', async (req, res) => {
    try {
        const { userAddress } = req.params;

        const result = await contract.getFiles(userAddress);

        if (!result || result[0].length === 0) {
            return res.status(404).json({ error: "No files stored for this user" });
        }

        const [cids, fileNames, fileTypes, fileSizes, fileContents, dates, scores] = result;

        let files = cids.map((_, index) => ({
            id: index,
            cid: cids[index],
            fileName: fileNames[index],
            fileType: fileTypes[index],
            fileSize: Number(fileSizes[index]) / 100,
            fileContent: fileContents[index],
            date: dates[index],
            score: Number(scores[index]) / 100,
        }));

        res.json({ files });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


app.get('/fetch/:userAddress/:cid', async (req, res) => {
    try {
        const { userAddress, cid } = req.params;

        if (!userAddress || !cid) {
            return res.status(400).json({ error: 'userAddress and CID are required' });
        }

        const result = await contract.getFiles(userAddress);

        if (!result || result[0].length === 0) {
            return res.status(404).json({ error: "No files stored for this user" });
        }

        const [cids, fileNames, fileTypes, fileSizes, fileContents, dates, scores] = result;
        const index = cids.lastIndexOf(cid);

        if (index === -1) {
            return res.status(404).json({ error: "File not found for this CID" });
        }

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

        // Set response headers for PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileNames[index] ?? `Document-${Date.now()}.pdf`}"`);

        // Send decrypted PDF file
        res.send(decrypted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


app.get('/get/:userAddress/:id/:cid/', async (req, res) => {
    try {
        const { userAddress, id, cid } = req.params;

        const result = await contract.getFiles(userAddress);

        if (!result || result[0].length === 0) {
            return res.status(404).json({ error: "No files stored for this user" });
        }

        const [cids, fileNames, fileTypes, fileSizes, fileContents, dates, scores] = result;

        let files = cids.map((_, index) => ({
            id: index,
            cid: cids[index],
            fileName: fileNames[index],
            fileType: fileTypes[index],
            fileSize: Number(fileSizes[index]) / 100,
            fileContent: fileContents[index],
            date: dates[index],
            score: Number(scores[index]) / 100,
        }));

        let filteredFiles = files.filter(file => file.id === Number(id) && file.cid === cid);
        if(!filteredFiles.length) {
            return res.status(404).json({ error: "No files stored for this user" });
        }
        const data = filteredFiles[0]
        const stream = ipfs.cat(data.cid);
        let encryptedData = Buffer.alloc(0);

        for await (const chunk of stream) {
            encryptedData = Buffer.concat([encryptedData, chunk]);
        }

        // Decrypt file
        const key = crypto.createHash('sha256').update(userAddress, 'utf8').digest().slice(0, 32);
        const iv = Buffer.alloc(16, 0);
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

        let decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

        // Set response headers for PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${data.fileName ?? `Document-${Date.now()}.pdf`}"`);

        // Send decrypted PDF file
        res.send(decrypted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


app.delete('/delete/:userAddress/:id/:cid', async (req, res) => {
    try {
        const { userAddress, id, cid } = req.params;

        const result = await contract.deleteUserFile(userAddress, id);

        if (!result) {
            return res.status(400).json({ error: "Failed to delete user data" });
        }

        const [cids, fileNames, fileTypes, fileSizes, fileContents, dates, scores] = result;

        let files = cids.map((_, index) => ({
            cid: cids[index],
            fileName: fileNames[index],
            fileType: fileTypes[index],
            fileSize: Number(fileSizes[index]),
            fileContent: fileContents[index],
            date: dates[index],
            score: Number(scores[index]),
        }));

        res.json({ length: files.length, files });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


app.delete('/clear/:userAddress/', async (req, res) => {
    try {
        const { userAddress, cid } = req.params;

        const result = await contract.clearAllFiles(userAddress, cid);

        if (!result) {
            return res.status(400).json({ error: "Failed to delete user data" });
        }

        res.json({ result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
