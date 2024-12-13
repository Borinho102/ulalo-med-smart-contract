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
        store.storeFile("QmTD9QACHvxBVjNszqWJPgcuGGwfSD681Vk4dCkEhJVH9k", "TestFile1", "PDF");
        store.storeFileForUser(
            0x34f72592B9B01C724E62eDCdaa251b60A5C4F139,
            "QmX1xRGbfcPfy44AD1sR3NiE3GQmyNRR4kxmW2jKTMiqQC",
            "vaccin2023",
            "Vaccination"
        );

        // Validate that files are stored correctly
        UlaloDataStore.FileDetails[] memory files = store.getFiles(address(this));
        assertEq(files.length, 1);
        assertEq(files[0].cid, "QmTD9QACHvxBVjNszqWJPgcuGGwfSD681Vk4dCkEhJVH9k");
        assertEq(files[0].fileName, "TestFile1");
        assertEq(files[0].fileType, "PDF");

        UlaloDataStore.FileDetails[] memory userFiles = store.getFiles(0x34f72592B9B01C724E62eDCdaa251b60A5C4F139);
        assertEq(userFiles.length, 1);
        assertEq(userFiles[0].cid, "QmX1xRGbfcPfy44AD1sR3NiE3GQmyNRR4kxmW2jKTMiqQC");
        assertEq(userFiles[0].fileName, "vaccin2023");
        assertEq(userFiles[0].fileType, "Vaccination");
    }

    function test_UpdateMessage() public {
        store.update("Hi Borix102!");
        assertEq(store.message(), "Hi Borix102!");
    }
}
