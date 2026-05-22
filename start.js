import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(`
╔═══════════════════════════════════════════════╗
║       🎮 MIDOS QUEST - Starting...            ║
╚═══════════════════════════════════════════════╝
`);

const vite = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

process.on('SIGINT', () => {
  console.log('\n\nShutting down...');
  vite.kill();
  server.kill();
  process.exit();
});

vite.on('error', (err) => {
  console.error('Vite error:', err);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
