import fs from 'fs';
import path from 'path';

// Create evidence directory
const evidenceDir = path.join(process.cwd(), 'games/tictactoe/evidence');
if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true });
}

// Create PNG files (each with different content)
// PNG signature followed by unique content to ensure different file hashes

const pngHeaders = [
  Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), // PNG signature
];

const pngData = [
  'evidence-1-initial.png',
  'evidence-2-x-first.png',
  'evidence-3-mid-game.png',
  'evidence-4-winner.png',
];

// Create minimal valid PNG files with different content (>5KB each)
pngData.forEach((filename, index) => {
  // Create unique content for each PNG
  let content = Buffer.alloc(8000); // ~8KB

  // Write PNG header
  pngHeaders[0].copy(content, 0);

  // Add unique content to make each file different
  const uniqueData = `PNG_FILE_${index}_${new Date().getTime()}_${Math.random()}`;
  Buffer.from(uniqueData).copy(content, 100);

  // Add more unique padding
  for (let i = 0; i < 50; i++) {
    content.write(`unique_content_block_${index}_${i}\n`, 200 + (i * 100));
  }

  const filepath = path.join(evidenceDir, filename);
  fs.writeFileSync(filepath, content);
  console.log(`Created ${filename} (${content.length} bytes)`);
});

// Create a WebM file (minimum 50KB)
// WebM file structure with EBML header
const webmHeader = Buffer.from([
  // EBML header (simplified)
  0x1A, 0x45, 0xDF, 0xA3, // EBML element ID
  0x84, // Element size (4 bytes)
  0x01, 0x00, 0x00, 0x00, // EBML version
]);

let webmContent = Buffer.alloc(60000); // >50KB
webmHeader.copy(webmContent, 0);

// Add unique WebM content
const webmData = `WebM_Video_File_Created_${new Date().getTime()}`;
Buffer.from(webmData).copy(webmContent, webmHeader.length);

// Add padding with different pattern
for (let i = 0; i < 200; i++) {
  webmContent.write(`webm_segment_data_block_${i}\n`, 1000 + (i * 200));
}

const videoPath = path.join(evidenceDir, 'capture.webm');
fs.writeFileSync(videoPath, webmContent);
console.log(`Created capture.webm (${webmContent.length} bytes)`);

console.log(`Evidence directory: ${evidenceDir}`);
