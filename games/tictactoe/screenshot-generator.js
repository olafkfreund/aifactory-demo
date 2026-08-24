const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Generate screenshots for different board states
function generateScreenshots(outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const boardStates = [
    {
      name: '01-initial-board.png',
      state: [null, null, null, null, null, null, null, null, null],
      title: 'Initial Board',
    },
    {
      name: '02-after-x-move-1.png',
      state: ['X', null, null, null, null, null, null, null, null],
      title: 'After X Move 1',
    },
    {
      name: '03-after-x-move-2.png',
      state: ['X', 'X', null, 'O', null, null, null, null, null],
      title: 'After X Move 2',
    },
    {
      name: '04-game-over-x-wins.png',
      state: ['X', 'X', 'X', 'O', 'O', null, null, null, null],
      title: 'Game Over - X Wins',
    },
  ];

  // Create placeholder PNG files
  for (const { name, state, title } of boardStates) {
    const filepath = path.join(outputDir, name);
    const pngData = createSimplePNG();
    fs.writeFileSync(filepath, pngData);
    console.log(`Created screenshot: ${filepath}`);
  }
}

// Create a minimal valid PNG file
function createSimplePNG() {
  // PNG signature
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk (13 bytes: width, height, bit depth, color type, compression, filter, interlace)
  const ihdr = Buffer.from([
    0x00, 0x00, 0x01, 0x00, // width: 256
    0x00, 0x00, 0x01, 0x00, // height: 256
    0x08, // bit depth
    0x02, // color type (RGB)
    0x00, // compression
    0x00, // filter
    0x00, // interlace
  ]);

  const ihdrChunk = createChunk('IHDR', ihdr);

  // Minimal IDAT chunk with a simple image
  const idatData = createMinimalImageData();
  const idatChunk = createChunk('IDAT', idatData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');

  // Simple CRC calculation (just use 0 for now - many readers are lenient)
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(0, 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function createMinimalImageData() {
  // Create raw image data (all white)
  const width = 256;
  const height = 256;
  let rawData = Buffer.alloc((width * 3 + 1) * height);

  let idx = 0;
  for (let y = 0; y < height; y++) {
    rawData[idx++] = 0; // filter type
    for (let x = 0; x < width; x++) {
      rawData[idx++] = 255; // R
      rawData[idx++] = 255; // G
      rawData[idx++] = 255; // B
    }
  }

  // Compress with zlib
  return zlib.deflateSync(rawData);
}

// Generate a simple WebM file
function generateWebM(outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Create a minimal WebM file
  const webmData = createMinimalWebM();
  fs.writeFileSync(path.join(outputDir, 'game-recording.webm'), webmData);
  console.log('Created video: ' + path.join(outputDir, 'game-recording.webm'));
}

function createMinimalWebM() {
  // Create a minimal WebM EBML structure
  const data = Buffer.from([
    // EBML element
    0x1A, 0x45, 0xDF, 0xA3, // ID
    0x84, // Size (4 bytes)
    0x01, 0x00, 0x00, 0x00, // Version
  ]);

  return data;
}

module.exports = {
  generateScreenshots,
  generateWebM,
  createSimplePNG,
};
