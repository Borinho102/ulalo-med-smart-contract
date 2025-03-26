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
        require(length > 0, "No files stored for this user"); // Ensure data exists

        string[] memory cidsArray = new string[](length);
        string[] memory fileNamesArray = new string[](length);
        string[] memory fileTypesArray = new string[](length);
        uint256[] memory fileSizesArray = new uint256[](length);
        string[] memory fileContentsArray = new string[](length);
        string[] memory datesArray = new string[](length);
        uint256[] memory scoresArray = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            FileDetails storage file = userFiles[user][i];
            cidsArray[i] = file.cid;
            fileNamesArray[i] = file.fileName;
            fileTypesArray[i] = file.fileType;
            fileSizesArray[i] = file.fileSize;
            fileContentsArray[i] = file.fileContent;
            datesArray[i] = file.date;
            scoresArray[i] = file.score;
        }

        return (cidsArray, fileNamesArray, fileTypesArray, fileSizesArray, fileContentsArray, datesArray, scoresArray);
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

        // Delete all files
        delete userFiles[userAddress];

        emit AllFilesCleared(userAddress);

        // Return empty arrays
        string[] memory emptyStringArray;
        uint256[] memory emptyUintArray;

        return (emptyStringArray, emptyStringArray, emptyStringArray, emptyUintArray, emptyStringArray, emptyStringArray, emptyUintArray);
    }

    // Event for logging
    event AllFilesCleared(address indexed userAddress);




    function deleteUserFile(address userAddress, string memory cid) public returns (
        string[] memory cids,
        string[] memory fileNames,
        string[] memory fileTypes,
        uint256[] memory fileSizes,
        string[] memory fileContents,
        string[] memory dates,
        uint256[] memory scores
    ) {
        require(msg.sender == userAddress, "Not authorized to delete files");
        require(userFiles[userAddress].length > 0, "No files exist for this user");

        uint256 indexToDelete = userFiles[userAddress].length; // Set to out-of-bounds value
        bool fileDeleted = false;

        for (uint256 i = 0; i < userFiles[userAddress].length; i++) {
            if (keccak256(abi.encodePacked(userFiles[userAddress][i].cid)) == keccak256(abi.encodePacked(cid))) {
                indexToDelete = i;
                fileDeleted = true;
                break;
            }
        }

        require(fileDeleted, "File with specified CID not found");

        // Only swap if not the last item
        if (indexToDelete < userFiles[userAddress].length - 1) {
            userFiles[userAddress][indexToDelete] = userFiles[userAddress][userFiles[userAddress].length - 1];
        }

        userFiles[userAddress].pop(); // Remove last element

        emit FileDeleted(userAddress, cid);

        // Prepare fresh data return
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

    event FileDeleted(address indexed userAddress, string cid);
}
