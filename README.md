const encodedString = "{xor}SGVsbG8gd29ybGQ="; // Example encoded string
const decodedString = decode(encodedString);
console.log("Decoded:", decodedString);

const reencodedString = encode(decodedString);
console.log("Reencoded:", reencodedString);
