const { spawn } = require('child_process');
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

require(path.join(__dirname, 'scripts', 'generate-env.js'));

const env = loadEnv(path.join(__dirname, '.env'));
const port = env.NG_SERVE_PORT || '4201';
const host = env.NG_SERVE_HOST || '0.0.0.0';

console.log(`Starting Angular dev server on http://${host}:${port}`);
const child = spawn('npx', ['ng', 'serve', '--port', port, '--host', host], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
child.on('close', (code) => process.exit(code ?? 0));
