import {unixfs} from "@helia/unixfs";
import {createHelia} from "helia";
import {CID} from "multiformats";
import { fromString } from 'uint8arrays/from-string';

async function retrieveFile(cidString) {
    // Create a Helia node
    const helia = await createHelia();
    const fs = unixfs(helia);

    // Convert CID string to CID object
    const cid = CID.parse(cidString);

    // Retrieve the stored content
    let content = new Uint8Array();
    for await (const chunk of fs.cat(cid)) {
        content = new Uint8Array([...content, ...chunk]);
    }

    console.log("Retrieved Content:", new TextDecoder().decode(content));

}

async function storeFile() {
    // Create a Helia node
    const helia = await createHelia();

    // Create a UnixFS instance for file storage
    const fs = unixfs(helia);

    // File content to store
    const content = fromString("Hello World, IPFS Helia!");

    // Add the file to IPFS
    const cid = await fs.addBytes(content);

    console.log("File stored with CID:", cid.toString());

    await retrieveFile(cid.toString());

}

storeFile();
