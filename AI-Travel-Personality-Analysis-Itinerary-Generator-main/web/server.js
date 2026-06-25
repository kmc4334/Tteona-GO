const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

// Python 실행 경로 (Anaconda go 환경)
const PYTHON_PATH = 'C:\\Users\\pc\\anaconda3\\envs\\go\\python.exe';
const PROJECT_ROOT = path.join(__dirname, '..');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Python 스크립트 실행 헬퍼
function runPython(scriptName, inputData) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'scripts', scriptName);
    const proc = spawn(PYTHON_PATH, [scriptPath], {
      cwd: PROJECT_ROOT,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });

    let output = '';
    let errorOutput = '';

    proc.stdin.write(JSON.stringify(inputData));
    proc.stdin.end();

    proc.stdout.on('data', (data) => { output += data.toString(); });
    proc.stderr.on('data', (data) => { errorOutput += data.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python error: ${errorOutput}`));
        return;
      }
      try {
        resolve(JSON.parse(output));
      } catch (e) {
        reject(new Error(`JSON parse error: ${output}`));
      }
    });
  });
}

// ─── API 라우트 ───────────────────────────────────────────

// 성향 분석 초기화
app.post('/api/preference/init', async (req, res) => {
  try {
    const result = await runPython('preference_init.py', req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 추천 검색
app.post('/api/recommend/search', async (req, res) => {
  try {
    const result = await runPython('recommend_search.py', req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 일정 생성
app.post('/api/plan/generate', async (req, res) => {
  try {
    const result = await runPython('plan_generate.py', req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 루트 → index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 떠나GO 서버 실행 중: http://localhost:${PORT}\n`);
});
