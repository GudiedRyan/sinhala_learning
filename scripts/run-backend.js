const { spawnSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const backendDir = path.join(__dirname, '..', 'backend')
const venvPython =
  process.platform === 'win32'
    ? path.join(backendDir, '.venv', 'Scripts', 'python.exe')
    : path.join(backendDir, '.venv', 'bin', 'python')

if (!fs.existsSync(venvPython)) {
  console.error(
    `Backend virtualenv not found at ${venvPython}.\n` +
      'Set it up first:\n' +
      '  cd backend\n' +
      '  python -m venv .venv\n' +
      (process.platform === 'win32' ? '  .venv\\Scripts\\activate\n' : '  source .venv/bin/activate\n') +
      '  pip install -r requirements.txt',
  )
  process.exit(1)
}

const result = spawnSync(venvPython, ['run.py'], { cwd: backendDir, stdio: 'inherit' })
process.exit(result.status ?? 1)
