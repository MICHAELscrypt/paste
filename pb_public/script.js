// Utility functions for encoding and decoding strings
function str2ab(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str);
}

function ab2str(buf) {
    const decoder = new TextDecoder();
    return decoder.decode(buf);
}

// Generate a static key for AES-GCM (For demonstration purposes. In real applications, generate and manage keys securely)
async function generateKey() {
    return window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
}

// Encrypt a string
async function encryptString(str, key) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        str2ab(str)
    );
    return { encrypted, iv };
}

// Decrypt an encrypted ArrayBuffer
async function decryptString(encrypted, iv, key) {
    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        encrypted
    );
    return ab2str(decrypted);
}

// export key to base64
// only export part of the JWK key, to make whole thing shorter
// reuse everything of JWK that stays the same
async function exportKey(key) {
    // Export the key in the JWK format
    const exported = await window.crypto.subtle.exportKey("jwk", key);
    console.log(exported.k);
    // Convert the exported key to a string (e.g., JSON)
    const exportedAsString = JSON.stringify(exported);
    console.log(exportedAsString);
    // Encode the string to base64
    const encoded = btoa(exportedAsString);
    console.log(encoded);
    return encoded;
}

// import key from base64
async function importKey(encoded) {
    // Decode the base64 string to JSON
    const decoded = atob(encoded);
    const importedKey = JSON.parse(decoded);
    // Import the key in the JWK format
    const key = await window.crypto.subtle.importKey(
        "jwk",
        importedKey,
        {
            name: "AES-GCM",
            length: 128,
        },
        true,
        ["encrypt", "decrypt"]
    );
    return key;
}


// Example usage
// (async () => {
//     const key = await generateKey(); // Generate a key
//     console.log("Key: ",key);
//     const dataToEncrypt = "Hello, world!"; // Data to encrypt
//     const { encrypted, iv } = await encryptString(dataToEncrypt, key); // Encrypt the data
//     console.log("Encrypted data: ", encrypted);
//     console.log("IV: ", iv);
//     const decrypted = await decryptString(encrypted, iv, key); // Decrypt the data
//     console.log("Decrypted:", decrypted); // Log the decrypted data
// })();


// Use the previously defined `encryptString` and `decryptString` functions

(async () => {
    let key = await generateKey(); // Generate a key
    const exportedKey = await exportKey(key); // Export the key
    console.log("Exported Key:", exportedKey); // Log the exported key

    const importedKey = await importKey(exportedKey); // Import the key
    const dataToEncrypt = "Hello, world!"; // Data to encrypt
    const { encrypted, iv } = await encryptString(dataToEncrypt, importedKey); // Encrypt the data

    const decrypted = await decryptString(encrypted, iv, importedKey); // Decrypt the data
    console.log("Decrypted:", decrypted); // Log the decrypted data
})();


async function exampleFunc(dataToEncrypt, keyBase64) {

}

const userInput = "Hello, world!"; // This should be replaced with actual user input retrieval logic, e.g., from an HTML form or other input methods
exampleFunc(userInput);

// Return the querystring part of a URL:
let keyBase64 = location.search;
