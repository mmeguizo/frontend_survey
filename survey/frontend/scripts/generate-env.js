const fs = require('fs');
const path = require('path');

function loadEnv(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (match) {
      env[match[1]] = match[2].replace(/^["']|["']$/g, '').trim();
    }
  }
  return env;
}

const root = path.join(__dirname, '..');
const env = loadEnv(path.join(root, '.env'));
const apiUrl = env.NG_APP_API_URL || 'http://localhost:3004/api';
const production = env.NODE_ENV === 'production';

const content = `// AUTO-GENERATED from .env by scripts/generate-env.js - do not edit directly.
export const environment = {
  production: ${production},
  apiUrl: ${JSON.stringify(apiUrl)},
};
`;

const outDir = path.join(root, 'src', 'environments');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'environment.ts'), content);
console.log(`environment.ts generated with apiUrl = ${apiUrl}`);
