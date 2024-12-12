// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract UlaloDataStore {

    string public message;

    constructor(string memory initMessage) {
        message = initMessage;
    }

    function update(string memory newMessage) public {
        string memory oldMsg = message;
        message = newMessage;
        emit UpdatedMessages(oldMsg, newMessage);
    }

    event UpdatedMessages(string oldStr, string newStr);

    // Mapping to store multiple CIDs for each address
    mapping(address => string[]) private userCIDs;

    // Event emitted whenever a new CID is stored
    event CIDStored(address indexed user, string cid);

    /**
     * @dev Stores the given CID for the sender's address.
     * @param cid The IPFS CID to store.
     */
    function store(string memory cid) public {
        require(bytes(cid).length > 0, "CID cannot be empty");
        userCIDs[msg.sender].push(cid);
        emit CIDStored(msg.sender, cid);
    }

    /**
     * @dev Stores the given CID for the sender's address and user address.
     * @param userAddress The address of the user.
     * @param cid The IPFS CID to store.
     */
    function storeCID(address userAddress, string memory cid) public {
        require(bytes(cid).length > 0, "CID cannot be empty");
        userCIDs[userAddress].push(cid);
        emit CIDStored(userAddress, cid);
    }


    /**
     * @dev Retrieves all CIDs associated with the given address.
     * @param user The address of the user whose CIDs are to be retrieved.
     * @return An array of CIDs stored by the user.
     */
    function getCIDs(address user) public view returns (string[] memory) {
        return userCIDs[user];
    }

}
