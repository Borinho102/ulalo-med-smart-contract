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
        uint256 fileSize;
        string fileContent;
        string date;
        uint256 score;
    }

    // Mapping to store multiple file details for each address
    mapping(address => FileDetails[]) private userFiles;

    // Event emitted whenever a new file is stored
    event FileStored(address indexed user, string cid, string fileName, string fileType, uint256 fileSize, string fileContent, string date, uint256 score);

    // Event emitted when all data is cleared
    event AllDataCleared();

    /**
     * @dev Stores the given CID for a specific user address.
     * @param userAddress The address of the user.
     * @param cid The IPFS CID to store.
     * @param fileName The name of the file.
     * @param fileType The type of the file (e.g., PDF, JPEG).
     */
    function storeFileForUser(address userAddress, string memory cid, string memory fileName, string memory fileType, uint256 fileSize, string memory fileContent, string memory date, uint256 score) public {
        require(bytes(cid).length > 0, "CID cannot be empty");
        require(bytes(fileName).length > 0, "File name cannot be empty");
        require(bytes(fileType).length > 0, "File type cannot be empty");

        userFiles[userAddress].push(FileDetails({
            cid: cid,
            fileName: fileName,
            fileType: fileType,
            fileSize: fileSize,
            fileContent: fileContent,
            date: date,
            score: score
        }));

        emit FileStored(userAddress, cid, fileName, fileType, fileSize, fileContent, date, score);
    }

    /**
     * @dev Retrieves all file details associated with the given address.
     * @param user The address of the user whose files are to be retrieved.
     * @return An array of FileDetails stored by the user.
     */
    function getFiles(address user) public view returns (FileDetails[] memory) {
        return userFiles[user];
    }

    /**
     * @dev Clear all user data from the database.
     * @param userAddress The address of the user whose files are to be retrieved.
     * @return An array of FileDetails stored by the user.
     */
    function clearUserFiles(address userAddress) public returns (FileDetails[] memory) {
        // Check if the user has any files to clear
        require(userFiles[userAddress].length > 0, "No files to clear for this user");

        // Delete the entire array of files for the user
        delete userFiles[userAddress];

        // Emit an event to log the file clearing action
        emit UserFilesCleared(userAddress);

        return userFiles[userAddress];
    }

    event UserFilesCleared(address indexed userAddress);


    /**
     * @dev Clear all user data from the database.
     * @param userAddress The address of the user whose files are to be retrieved.
     * @param cid The IPFS CID to store.
     * @return An array of FileDetails stored by the user.
     */
    function deleteUserFile(address userAddress, string memory cid) public returns (FileDetails[] memory) {
        // Optional: Add access control
        require(msg.sender == userAddress, "Not authorized to delete files");

        // Check if the user has any files
        require(userFiles[userAddress].length > 0, "No files exist for this user");

        // Track whether a file was deleted
        bool fileDeleted = false;

        // Find and remove the specific file by CID
        for (uint256 i = 0; i < userFiles[userAddress].length; i++) {
            if (keccak256(abi.encodePacked(userFiles[userAddress][i].cid)) == keccak256(abi.encodePacked(cid))) {
                // Remove the file by replacing it with the last element and then reducing the array length
                userFiles[userAddress][i] = userFiles[userAddress][userFiles[userAddress].length - 1];
                userFiles[userAddress].pop();
                fileDeleted = true;
                break;
            }
        }

        // Ensure the file was actually deleted
        require(fileDeleted, "File with specified CID not found");

        // Emit an event to log the file deletion
        emit FileDeleted(userAddress, cid);

        return userFiles[userAddress];
    }

    event FileDeleted(address indexed userAddress, string cid);
}
