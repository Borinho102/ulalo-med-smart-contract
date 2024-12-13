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

    // Struct to store file details
    struct FileDetails {
        string cid;
        string fileName;
        string fileType;
    }

    // Mapping to store multiple file details for each address
    mapping(address => FileDetails[]) private userFiles;

    // Event emitted whenever a new file is stored
    event FileStored(address indexed user, string cid, string fileName, string fileType);

    /**
     * @dev Stores the given CID for the sender's address.
     * @param cid The IPFS CID to store.
     * @param fileName The name of the file.
     * @param fileType The type of the file (e.g., PDF, JPEG).
     */
    function storeFile(string memory cid, string memory fileName, string memory fileType) public {
        require(bytes(cid).length > 0, "CID cannot be empty");
        require(bytes(fileName).length > 0, "File name cannot be empty");
        require(bytes(fileType).length > 0, "File type cannot be empty");

        userFiles[msg.sender].push(FileDetails({
            cid: cid,
            fileName: fileName,
            fileType: fileType
        }));

        emit FileStored(msg.sender, cid, fileName, fileType);
    }

    /**
     * @dev Stores the given CID for a specific user address.
     * @param userAddress The address of the user.
     * @param cid The IPFS CID to store.
     * @param fileName The name of the file.
     * @param fileType The type of the file (e.g., PDF, JPEG).
     */
    function storeFileForUser(address userAddress, string memory cid, string memory fileName, string memory fileType) public {
        require(bytes(cid).length > 0, "CID cannot be empty");
        require(bytes(fileName).length > 0, "File name cannot be empty");
        require(bytes(fileType).length > 0, "File type cannot be empty");

        userFiles[userAddress].push(FileDetails({
            cid: cid,
            fileName: fileName,
            fileType: fileType
        }));

        emit FileStored(userAddress, cid, fileName, fileType);
    }

    /**
     * @dev Retrieves all file details associated with the given address.
     * @param user The address of the user whose files are to be retrieved.
     * @return An array of FileDetails stored by the user.
     */
    function getFiles(address user) public view returns (FileDetails[] memory) {
        return userFiles[user];
    }
}
