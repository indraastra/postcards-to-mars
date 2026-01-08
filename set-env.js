import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to read .env file locally
const envPath = path.resolve(__dirname, '.env');
let envContent = '';

try {
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }
} catch (err) {
    // Ignore error if .env doesn't exist (e.g. in production)
}

// Parse .env content manually to avoid external dependencies like 'dotenv'
const envVars = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
    if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
        }
        envVars[key] = value;
    }
});

// Priority: Process Environment (Cloud Run) > .env file (Local)
const apiKey = process.env.GEMINI_API_KEY || envVars.GEMINI_API_KEY || '';

// Ensure directory exists
const assetsDir = path.resolve(__dirname, 'src/assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// Write to env.js
const targetPath = path.resolve(assetsDir, 'env.js');
const fileContent = `(function(window) {
  window.env = window.env || {};
  window.env.apiKey = "${apiKey}";
})(this);`;

fs.writeFileSync(targetPath, fileContent);
console.log(`Generated src/assets/env.js with API Key length: ${apiKey.length}`);
