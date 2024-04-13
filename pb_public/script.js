// Utility functions for encoding and decoding strings
function str2ab(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str);
}

function ab2str(buf) {
    const decoder = new TextDecoder();
    return decoder.decode(buf);
}


// generate key
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

// encrypt text
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

// export key part out of json
async function exportKey(key) {
    // Export the key in the JWK format
    const exported = await window.crypto.subtle.exportKey("jwk", key);
    return exported.k;
}

// POST data to API
async function postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
}


// import key part and mash together with json to get key object
async function importKey(key_part) {

    let importedKey = {"alg":"A256GCM","ext":true,"k":"","key_ops":["encrypt","decrypt"],"kty":"oct"}
    importedKey.k = key_part;

    // const importedKey = JSON.parse(key_json);
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

// get encrypted text + iv from API
async function fetchData(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json(); // parse JSON from the response

        const encrypted_json = data.encrypted_text;
        const iv_json = data.iv;

        return { encrypted_json,  iv_json };

    } catch (error) {
        console.error('There was a problem with your fetch operation:', error);
    }
}

// decrypt with key 
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



async function encrypt_and_POST(dataToEncrypt = "Hello, world!") {

    let key = await generateKey(); // Generate a key
    const { encrypted, iv } = await encryptString(dataToEncrypt, key); // Encrypt the data

    // https://gist.github.com/nuclearglow/ab251744db0ebddd504eea28153eb279
    const encrypted_json = JSON.stringify(Array.from(new Uint8Array(encrypted)));
    const iv_json = JSON.stringify(Array.from(new Uint8Array(iv)));

    console.log(encrypted_json);
    console.log(iv_json);
    
    const exportedKey = await exportKey(key); // Export the key
    console.log("Exported Key:", exportedKey); // Log the exported key

    const encrypted_data = {
        encrypted_text: encrypted_json,
        iv: iv_json,
    };

    const post_response = await postData('/api/collections/posts/records', encrypted_data);
    let urlOfNewPaste = "http://" + window.location.host + "#" + "i=" + post_response.id + "&k=" + exportedKey;
    console.log(urlOfNewPaste);
    return urlOfNewPaste;
}

async function getTextAndDecrypt() {
    const hash = window.location.hash.substring(1); // Removes the '#' from the hash
    const params = new URLSearchParams(hash);

    let key_of_paste = params.get('k');
    let id_of_paste = params.get('i');

    const apiUrl = 'http://localhost:8090/api/collections/posts/records/' + id_of_paste; // URL of the API you want to access

    const { encrypted_json, iv_json } = await fetchData(apiUrl);

    // console.log(encrypted_json);
    // console.log(iv_json);
    const importedKey = await importKey(key_of_paste); // Import the key

    encrypted_input = new Uint8Array(JSON.parse(encrypted_json)).buffer;
    iv_input = new Uint8Array(JSON.parse(iv_json)).buffer;

    const decrypted = await decryptString(encrypted_input, iv_input, importedKey); // Decrypt the data
    console.log("Decrypted:", decrypted); // Log the decrypted data
    let elem = document.getElementById('text');
    elem.innerText = decrypted;
}

(async () => {

    if (window.location.hash != '') {
        // http://localhost:8090#i=g0fmpbac2lnjdjt&k=9vk93k92Krd_iwjTGNodhUmDwk0IDqN11TbVWf5oO38
        await getTextAndDecrypt();

        var textareaElement = document.getElementById('textarea');
        var hrElement = document.createElement('hr');
        textareaElement.parentNode.insertBefore(hrElement, textareaElement);

    }

})();

let submitButton = document.getElementById('submit-btn');
submitButton.onclick = async function() { 
    let textarea = document.getElementById('textarea');
    // console.log(textarea.value);
    const urlOfNewPaste = await encrypt_and_POST(textarea.value);
    window.location.href = urlOfNewPaste;
    location.reload();
};
