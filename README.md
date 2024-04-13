# An ecrypted alternative to Pastebin

The main purpose of this service is a text pasting service similar to pastebin, but only someone with the key can read it. The server never knows what is being posted.
Similar to MEGA, the key is appended to the URL like so: `http://paste.michaelscrypt.com#i=g0fmpbac2lnjdjt&k=9vk93k92Krd_iwjTGNodhUmDwk0IDqN11TbVWf5oO38` where the `k=` part after the `#` is the key to decrypt the text and the `i=` is the ID of the posted text. 

Disclaimer: This is not very secure since anyone with the key can read the text. It mainly protects the server and it can give the users the possibility to share the link and the key seperately.

## Tech stack
 - [Pocketbase](https://pocketbase.io) version 0.22.8
 - Vanilla Javascript
