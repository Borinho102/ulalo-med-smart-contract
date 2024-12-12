// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {UlaloDataStore} from "../src/UlaloDataStore.sol";

contract CounterTest is Test {
    UlaloDataStore public store;

    function setUp() public {
        store = new UlaloDataStore("Hello ulalo Test");
    }

    function test_Storage() public {
        store.storeCID(0xA8F678cF2311e8575cd8b51E709e0B234896d75F, "QmTD9QACHvxBVjNszqWJPgcuGGwfSD681Vk4dCkEhJVH9k");
        store.storeCID(0x34f72592B9B01C724E62eDCdaa251b60A5C4F139, "QmX1xRGbfcPfy44AD1sR3NiE3GQmyNRR4kxmW2jKTMiqQC");
    }

    function test_Message() public {
        store.update("Hi Borix102!");
        assertEq(store.message(), "Hi Borix102!");
    }
}
