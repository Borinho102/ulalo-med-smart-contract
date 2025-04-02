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
        bool active;
    }

    // Mapping to store multiple file details for each address
    mapping(address => FileDetails[]) private userFiles;

    // Event emitted whenever a new file is stored
    event FileStored(address indexed user, string cid, string fileName, string fileType, uint256 fileSize, string fileContent, string date, uint256 score);

    // Event emitted when all data is cleared
    event AllDataCleared();


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
            score: score,
            active: true
        }));

        emit FileStored(userAddress, cid, fileName, fileType, fileSize, fileContent, date, score);
    }


    function getFiles(address user) public view returns (
        string[] memory cids,
        string[] memory fileNames,
        string[] memory fileTypes,
        uint256[] memory fileSizes,
        string[] memory fileContents,
        string[] memory dates,
        uint256[] memory scores
    ) {
        uint256 length = userFiles[user].length;
        uint256 validFileCount = 0;

        // First, count valid (active) files
        for (uint256 i = 0; i < length; i++) {
            if (userFiles[user][i].active) {
                validFileCount++;
            }
        }

        // Initialize arrays with only the non-deleted (active) files
        cids = new string[](validFileCount);
        fileNames = new string[](validFileCount);
        fileTypes = new string[](validFileCount);
        fileSizes = new uint256[](validFileCount);
        fileContents = new string[](validFileCount);
        dates = new string[](validFileCount);
        scores = new uint256[](validFileCount);

        uint256 index = 0;
        for (uint256 i = 0; i < length; i++) {
            if (userFiles[user][i].active) {
                FileDetails storage file = userFiles[user][i];
                cids[index] = file.cid;
                fileNames[index] = file.fileName;
                fileTypes[index] = file.fileType;
                fileSizes[index] = file.fileSize;
                fileContents[index] = file.fileContent;
                dates[index] = file.date;
                scores[index] = file.score;
                index++;
            }
        }
        return (cids, fileNames, fileTypes, fileSizes, fileContents, dates, scores);
    }



    function clearAllFiles(address userAddress) public returns (
        string[] memory,
        string[] memory,
        string[] memory,
        uint256[] memory,
        string[] memory,
        string[] memory,
        uint256[] memory
    ) {
        require(msg.sender == userAddress, "Not authorized to clear files");
        require(userFiles[userAddress].length > 0, "No files exist for this user");

        // Set the active flag to false for all files
        uint256 fileCount = userFiles[userAddress].length;
        for (uint256 i = 0; i < fileCount; i++) {
            userFiles[userAddress][i].active = false;
        }

        emit AllFilesCleared(userAddress);

        // Return the updated file details with inactive files
        return getUpdatedFiles(userAddress);
    }

    // Event for logging
    event AllFilesCleared(address indexed userAddress);




    event FileDeleted(address indexed userAddress, string cid, uint256 index);

    function deleteUserFile(address userAddress, uint256 index, string memory cid) public returns (
        string[] memory cids,
        string[] memory fileNames,
        string[] memory fileTypes,
        uint256[] memory fileSizes,
        string[] memory fileContents,
        string[] memory dates,
        uint256[] memory scores
    ) {

        require(msg.sender == userAddress, "Not authorized to delete files");
        uint256 fileCount = userFiles[userAddress].length;
        require(fileCount > 0, "No files exist for this user");
        require(index < fileCount, "Invalid index");

        // Verify the file at the given index matches the CID
        require(
            keccak256(abi.encodePacked(userFiles[userAddress][index].cid)) == keccak256(abi.encodePacked(cid)),
            "File CID does not match"
        );

        // Mark the file as inactive (deleted)
        userFiles[userAddress][index].active = false;

        emit FileDeleted(userAddress, cid, index);

        // ✅ Return updated file list
        return getUpdatedFiles(userAddress);
    }

    function getUpdatedFiles(address userAddress) internal view returns (
        string[] memory cids,
        string[] memory fileNames,
        string[] memory fileTypes,
        uint256[] memory fileSizes,
        string[] memory fileContents,
        string[] memory dates,
        uint256[] memory scores
    ) {
        uint256 length = userFiles[userAddress].length;

        cids = new string[](length);
        fileNames = new string[](length);
        fileTypes = new string[](length);
        fileSizes = new uint256[](length);
        fileContents = new string[](length);
        dates = new string[](length);
        scores = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            FileDetails storage file = userFiles[userAddress][i];
            cids[i] = file.cid;
            fileNames[i] = file.fileName;
            fileTypes[i] = file.fileType;
            fileSizes[i] = file.fileSize;
            fileContents[i] = file.fileContent;
            dates[i] = file.date;
            scores[i] = file.score;
        }

        return (cids, fileNames, fileTypes, fileSizes, fileContents, dates, scores);
    }
}
