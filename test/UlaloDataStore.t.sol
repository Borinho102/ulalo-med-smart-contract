// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {UlaloDataStore} from "../src/UlaloDataStore.sol";

contract UlaloDataStoreTest is Test {
    UlaloDataStore public store;

    function setUp() public {
        store = new UlaloDataStore("Hello ulalo Test");
    }

    function test_StoreFile() public {
        store.storeFileForUser(
            0x34f72592B9B01C724E62eDCdaa251b60A5C4F139,
            "QmX1xRGbfcPfy44AD1sR3NiE3GQmyNRR4kxmW2jKTMiqQC",
            "vaccin-2024.pdf",
            "Vaccination", 1024, "This is a Test", "12-03-2025", 10**18
        );

        // Validate that files are stored correctly
        UlaloDataStore.FileDetails[] memory userFiles = store.getFiles(0x34f72592B9B01C724E62eDCdaa251b60A5C4F139);
        assertEq(userFiles.length, 1);
        assertEq(userFiles[0].cid, "QmX1xRGbfcPfy44AD1sR3NiE3GQmyNRR4kxmW2jKTMiqQC");
        assertEq(userFiles[0].fileName, "vaccin-2024.pdf");
        assertEq(userFiles[0].fileType, "Vaccination");
        assertEq(userFiles[0].fileSize, 1024);
        assertEq(userFiles[0].date, "12-03-2025");
        assertEq(userFiles[0].score, 10**18);
        assertEq(userFiles[0].fileContent, "This is a Test");
    }

    function test_UpdateMessage() public {
        store.update("Hi Ulalo!");
        assertEq(store.message(), "Hi Ulalo!");
    }
}
