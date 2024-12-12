// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {UlaloDataStore} from "../src/UlaloDataStore.sol";

contract UlaloDataStoreScript is Script {
    UlaloDataStore public datastore;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        datastore = new UlaloDataStore("Hello Ulalo!");

        vm.stopBroadcast();
    }
}
