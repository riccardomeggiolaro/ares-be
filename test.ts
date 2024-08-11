/* eslint-disable prettier/prettier */
function calculateChunkSize(fileSize) {
    const constant = 10 * 1024 * 1024; // 10 MB as base for the constant
    if (fileSize <= 10 * 1024 * 1024) { // If file size is <= 10 MB
        return 1 * 1024 * 1024; // 1 MB chunk
    }
    return Math.floor(constant / Math.log(fileSize));
}

console.log(calculateChunkSize(130));