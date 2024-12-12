const Web3 = require('web3');

// Replace with your Infura project ID or other RPC provider
const web3 = new Web3('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID');

// Contract ABI (replace with the actual ABI of your contract)
const contractABI = [
    // ... your contract's ABI
];

// Contract address (replace with the deployed contract address)
const contractAddress = '0xYOUR_CONTRACT_ADDRESS';

const contract = new web3.eth.Contract(contractABI, contractAddress);

// Function to store a CID
async function storeCID(userAddress, cid) {
    const accounts = await web3.eth.getAccounts();
    const senderAddress = accounts[0];

    const transaction = await contract.methods.storeCID(userAddress, cid).send({ from: senderAddress });
    console.log('CID stored:', transaction.transactionHash);
}

// Function to retrieve CIDs for a user
async function getCIDs(userAddress) {
    const cids = await contract.methods.getCIDs(userAddress).call();
    console.log('CIDs:', cids);
}

// Example usage:
storeCID('0xYOUR_USER_ADDRESS', 'Qm...')
    .then(() => getCIDs('0xYOUR_USER_ADDRESS'))
    .catch(error => console.error(error));