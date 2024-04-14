# An ecrypted alternative to Pastebin

The main purpose of this service is a text pasting service similar to pastebin, but only someone with the key can read it. The server never knows what is being posted.
Similar to MEGA, the key is appended to the URL like so: `https://paste.michaelscrypt.com/#i=bcvro2kgvp843q6&k=mXIjpGhzv7QZlxMGGKyjSDsSgdG0AJpvCz07yH99b7s` where the `k=` part after the `#` is the key to decrypt the text and the `i=` is the ID of the posted text. 

Disclaimer: This is not very secure since anyone with the key can read the text. It mainly protects the server and it can give the users the possibility to share the link and the key seperately.

## Tech stack
 - [Pocketbase](https://pocketbase.io) version 0.22.8
 - Vanilla Javascript

## How it works

The text is encrypted client-side in the browser using AES-GCM 256bit. The key is generated in the browser using the native JavaScript function `window.crypto.subtle.generateKey`.

The encrypted text then gets sent to the API and is saved in the database. The API and the database are built using Pocketbase.

To retrieve and decrypt a paste the ID and the key are in the fragment identifier part of the URL. The fragment identifier does not get sent to the server. The `k=` part after the `#` is the key to decrypt the text and the `i=` is the ID of the posted text.

The encryption and decryption happens completely client-side. Only the encrypted text gets sent to the server.

This is only secure as long as the full URL (including the key) is kept private. Everyone that has the full URL can read and decrypt the text. It mainly protects the server and it can give the users the possibility to share the link and the key separately.
