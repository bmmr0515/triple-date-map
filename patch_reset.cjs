const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  const cleanContent = execSync('git show HEAD:src/App.tsx', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  const filePath = path.join(__dirname, 'src/App.tsx');
  fs.writeFileSync(filePath, cleanContent, 'utf8');
  console.log('Successfully restored src/App.tsx to perfectly clean committed state!');
} catch (error) {
  console.error('Failed to restore file:', error);
}
