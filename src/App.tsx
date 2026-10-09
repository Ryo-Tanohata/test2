import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  CheckCircle2,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  Cpu,
  Monitor,
  Clock,
  Layers,
  Palette,
  Plus,
  Trash2,
  Sliders,
  Gauge,
  Github,
  Globe,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Code
} from 'lucide-react';

interface TestLog {
  id: string;
  time: string;
  type: 'info' | 'success' | 'warn';
  message: string;
}

export default function App() {
  // Test states
  const [clickCount, setClickCount] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [logs, setLogs] = useState<TestLog[]>([]);
  const [activeTab, setActiveTab] = useState<'interaction' | 'github' | 'canvas' | 'diagnostics' | 'todo'>('github');
  const [copied, setCopied] = useState(false);
  
  // GitHub Pages Helper State
  const [ghUser, setGhUser] = useState('Ryo-Tanohata');
  const [ghRepo, setGhRepo] = useState('testlow2');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // Benchmark/FPS state
  const [fps, setFps] = useState(60);
  const [latency, setLatency] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  
  // Custom tests
  const [testNotes, setTestNotes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('test_notes');
      return saved ? JSON.parse(saved) : ['GitHub Pages用デプロイワークフロー設定完了', '相対パス (base: "./") 設定完了'];
    } catch {
      return ['初期テスト項目'];
    }
  });
  const [newNote, setNewNote] = useState('');

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Uptime timer
  const [uptime, setUptime] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setUptime(u => u + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio synth for feedback
  const playSound = (freq = 440, type: OscillatorType = 'sine', duration = 0.1) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio might be blocked before first user gesture
    }
  };

  const addLog = (message: string, type: 'info' | 'success' | 'warn' = 'info') => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    setLogs(prev => [
      { id: Math.random().toString(36).substring(2, 9), time: timeStr, type, message },
      ...prev.slice(0, 40)
    ]);
  };

  // FPS tracker
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const checkFps = (now: number) => {
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animationId = requestAnimationFrame(checkFps);
    };

    animationId = requestAnimationFrame(checkFps);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Initialize initial log
  useEffect(() => {
    addLog('システム起動完了: GitHub Pages対応設定を適用しました', 'success');
    addLog('vite.config.ts: base: "./" 設定完了', 'info');
    addLog('.github/workflows/deploy.yml 自動デプロイ設定完了', 'info');
  }, []);

  // Copy helper with feedback
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(label);
    playSound(700, 'triangle', 0.1);
    addLog(`コピー完了: ${label}`, 'success');
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  // Interactive Particle Canvas
  useEffect(() => {
    if (activeTab !== 'canvas') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = 360);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      life: number;
      maxLife: number;
    }> = [];

    const colors = ['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#34d399'];

    const spawnParticles = (x: number, y: number, count = 12) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 4 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 0,
          maxLife: Math.random() * 50 + 40,
        });
      }
    };

    for (let i = 0; i < 20; i++) {
      spawnParticles(Math.random() * width, Math.random() * height, 2);
    }

    const render = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.fillRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        if (p.x < 0 || p.x > width) p.vx *= -0.9;
        if (p.y < 0 || p.y > height) p.vy *= -0.9;

        const alpha = Math.max(0, 1 - p.life / p.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      if (particles.length < 25) {
        spawnParticles(Math.random() * width, Math.random() * height, 3);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      spawnParticles(x, y, 20);
      playSound(520 + Math.random() * 300, 'triangle', 0.12);
      addLog(`キャンバスタップ: (${Math.round(x)}, ${Math.round(y)})`, 'info');
    };

    canvas.addEventListener('mousedown', handleCanvasClick);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = 360;
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousedown', handleCanvasClick);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeTab, soundEnabled]);

  const handleButtonClick = () => {
    const nextCount = clickCount + multiplier;
    setClickCount(nextCount);
    playSound(400 + (nextCount % 10) * 40, 'sine', 0.08);
    addLog(`インタラクション実行: カウント = ${nextCount} (倍率 x${multiplier})`, 'info');
  };

  const handleResetCount = () => {
    setClickCount(0);
    playSound(300, 'sawtooth', 0.15);
    addLog('カウンターをリセットしました', 'warn');
  };

  const testPing = () => {
    setIsPinging(true);
    const start = performance.now();
    setTimeout(() => {
      const timeTaken = Math.round(performance.now() - start);
      setLatency(timeTaken);
      setIsPinging(false);
      playSound(880, 'sine', 0.1);
      addLog(`応答速度レイテンシ計測完了: ${timeTaken} ms`, 'success');
    }, 45 + Math.random() * 35);
  };

  const copyAppUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    playSound(700, 'triangle', 0.1);
    addLog('現在のURLをクリップボードにコピーしました', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const updated = [...testNotes, newNote.trim()];
    setTestNotes(updated);
    localStorage.setItem('test_notes', JSON.stringify(updated));
    playSound(600, 'sine', 0.1);
    addLog(`メモ追加: "${newNote.trim()}"`, 'info');
    setNewNote('');
  };

  const removeNote = (idx: number) => {
    const updated = testNotes.filter((_, i) => i !== idx);
    setTestNotes(updated);
    localStorage.setItem('test_notes', JSON.stringify(updated));
    playSound(350, 'square', 0.08);
    addLog('メモ項目を削除しました', 'warn');
  };

  const formatUptime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}分${s}秒`;
  };

  const targetRepoUrl = `https://github.com/${ghUser || '<ユーザー名>'}/${ghRepo || '<リポジトリ名>'}`;
  const targetPagesUrl = `https://${ghUser || '<ユーザー名>'}.github.io/${ghRepo || '<リポジトリ名>'}/`;

  const pushGitCommands = `# 1. Gitの初期化とファイル追加
git init
git add .
git commit -m "Deploy app to GitHub Pages"

# 2. ブランチ名を main に設定
git branch -M main

# 3. リモートリポジトリの登録
git remote add origin ${targetRepoUrl}.git

# 4. GitHubへプッシュ
git push -u origin main`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation / Status Header */}
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur sticky top-0 z-50 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">テストハブ</h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  GitHub Pages 準備完了
                </span>
              </div>
              <p className="text-xs text-slate-400">AI Studio 開発・GitHub Pages デプロイ対応</p>
            </div>
          </div>

          {/* Quick Action / Metrics Bar */}
          <div className="flex items-center gap-2 sm:gap-4 text-xs text-slate-400">
            <button
              onClick={() => {
                setActiveTab('github');
                playSound(500, 'sine', 0.08);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-medium transition-colors border border-emerald-500/30 shadow-sm"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Pages公開手順</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>稼働:</span>
              <span className="font-mono text-slate-200 font-semibold">{formatUptime(uptime)}</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              <span>FPS:</span>
              <span className="font-mono text-slate-200 font-semibold">{fps}</span>
            </div>

            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                addLog(`サウンド効果: ${!soundEnabled ? 'ON' : 'OFF'} に切り替えました`, 'info');
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
              title="サウンド切り替え"
              aria-label="Sound Toggle"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            <button
              onClick={copyAppUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 transition-colors border border-indigo-500/30"
              title="URLをコピー"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? '完了' : 'URLコピー'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        
        {/* Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/30 p-6 shadow-xl">
          <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                GitHub Pages Ready
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                GitHub Pages で公開するための設定がすべて完了しました！
              </h2>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                リポジトリの相対パス設定 (<code className="text-emerald-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">base: './'</code>) と、GitHub Actions による自動ビルド・デプロイ用ワークフロー (<code className="text-emerald-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">.github/workflows/deploy.yml</code>) を生成しました。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setActiveTab('github')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-600/30"
              >
                <BookOpen className="w-4 h-4" />
                公開ガイド・コマンドを見る
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'github'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Github className="w-4 h-4" />
            GitHub Pages 公開ガイド
          </button>
          <button
            onClick={() => setActiveTab('interaction')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'interaction'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Zap className="w-4 h-4" />
            UI・インタラクション
          </button>
          <button
            onClick={() => setActiveTab('canvas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'canvas'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Palette className="w-4 h-4" />
            グラフィックス (Canvas)
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'diagnostics'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            システム情報・診断
          </button>
          <button
            onClick={() => setActiveTab('todo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'todo'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            メモ・チェックリスト
          </button>
        </div>

        {/* Content Section by Tab */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Display Area (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">

            {/* TAB: GITHUB PAGES DEPLOYMENT GUIDE */}
            {activeTab === 'github' && (
              <div className="space-y-6">
                
                {/* Status Box */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Github className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">設定済みステータス</h3>
                        <p className="text-xs text-slate-400">リポジトリ側で事前に完了した準備一覧</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      全設定完了
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-slate-200">vite.config.ts の相対パス設定</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          <code className="text-emerald-400">base: './'</code> を追加済み。リポジトリ名配下のURLでもCSS/JSが404にならず正常に読み込まれます。
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-slate-200">GitHub Actions ワークフロー</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          <code className="text-emerald-400">.github/workflows/deploy.yml</code> を作成済み。mainブランチへのプッシュで自動ビルド＆公開されます。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Generator: Repository Name Config */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code className="w-5 h-5 text-indigo-400" />
                      <h3 className="font-semibold text-white">GitHub アカウント・リポジトリ情報の入力</h3>
                    </div>
                    <span className="text-xs text-slate-400">コマンドがリアルタイム更新されます</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    ご自身のGitHubユーザー名と、公開予定のリポジトリ名を入力してください（コマンドや公開後URLが自動反映されます）。
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        GitHub ユーザー名 (または Organization 名)
                      </label>
                      <input
                        type="text"
                        value={ghUser}
                        onChange={e => setGhUser(e.target.value.trim())}
                        placeholder="例: tan0ry0"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        リポジトリ名
                      </label>
                      <input
                        type="text"
                        value={ghRepo}
                        onChange={e => setGhRepo(e.target.value.trim())}
                        placeholder="例: my-test-app"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Expected URL Box */}
                  <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs text-slate-400">公開後のGitHub Pages URL:</span>
                      <a
                        href={targetPagesUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono font-semibold text-indigo-300 hover:text-indigo-200 underline flex items-center gap-1"
                      >
                        {targetPagesUrl}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <button
                      onClick={() => copyToClipboard(targetPagesUrl, 'GitHub Pages URL')}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-medium transition-colors"
                    >
                      {copiedCmd === 'GitHub Pages URL' ? 'コピー完了' : 'URLをコピー'}
                    </button>
                  </div>
                </div>

                {/* Step-by-Step Procedure */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-mono">
                      01
                    </span>
                    公開までの 3ステップ手順
                  </h3>

                  {/* Step 1 */}
                  <div className="space-y-2 border-l-2 border-slate-800 pl-4 ml-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-200">
                        ステップ 1: GitHubで空のリポジトリを作成
                      </span>
                      <a
                        href="https://github.com/new"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                      >
                        github.com/new を開く
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      GitHubで <code className="text-slate-300">{ghRepo || 'リポジトリ名'}</code> という名前で新しいリポジトリを作成します（Public推奨。READMEなどの初期化チェックは外したままでOKです）。
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="space-y-3 border-l-2 border-slate-800 pl-4 ml-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-200">
                        ステップ 2: ローカルからGitでプッシュ
                      </span>
                      <button
                        onClick={() => copyToClipboard(pushGitCommands, 'Gitプッシュコマンド')}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium transition-colors border border-emerald-500/30"
                      >
                        {copiedCmd === 'Gitプッシュコマンド' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCmd === 'Gitプッシュコマンド' ? 'コピー完了' : 'コマンド一括コピー'}</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">
                      ターミナルで以下のコマンドを実行し、GitHubにコードをプッシュします：
                    </p>
                    <div className="relative">
                      <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
                        {pushGitCommands}
                      </pre>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="space-y-2 border-l-2 border-emerald-500/50 pl-4 ml-3">
                    <span className="text-sm font-semibold text-emerald-300">
                      ステップ 3: GitHubリポジトリ設定で「GitHub Actions」を選択
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      GitHubのリポジトリページを開き、以下の設定を1箇所だけ切り替えます：
                    </p>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                      <p className="font-semibold text-white">
                        リポジトリ画面 → <span className="text-emerald-400">[Settings]</span> → 左メニューの <span className="text-emerald-400">[Pages]</span>
                      </p>
                      <p>
                        「Build and deployment」セクションの <strong>Source</strong> ドロップダウンを、
                        <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded ml-1 border border-slate-700 font-semibold">GitHub Actions</code> に変更します。
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 pt-1">
                      設定後、自動的に <code className="text-slate-300">.github/workflows/deploy.yml</code> が実行され、1〜2分程度で公開されます！
                    </p>
                  </div>

                </div>

                {/* Workflow Content Preview */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-sm font-bold text-white">自動生成済みワークフロー (.github/workflows/deploy.yml)</h4>
                    </div>
                    <span className="text-xs text-slate-400">作成済み</span>
                  </div>
                  <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-400 overflow-x-auto max-h-48 leading-relaxed">
{`name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - uses: actions/deploy-pages@v4`}
                  </pre>
                </div>

              </div>
            )}

            {/* TAB: INTERACTION */}
            {activeTab === 'interaction' && (
              <div className="space-y-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-400" />
                      <h3 className="font-semibold text-white">状態変化 & リアクティビティ テスト</h3>
                    </div>
                    <span className="text-xs text-slate-400">useState + Web Audio</span>
                  </div>

                  <div className="bg-slate-950 rounded-xl p-8 border border-slate-800/80 text-center space-y-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">現在のカウント値</p>
                    <div className="text-6xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                      {clickCount}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        onClick={handleButtonClick}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        カウントアップ (+{multiplier})
                      </button>
                      <button
                        onClick={handleResetCount}
                        className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 text-sm font-medium transition-all border border-slate-700"
                      >
                        リセット
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Sliders className="w-4 h-4 text-indigo-400" />
                      <span>加算倍率の変更:</span>
                    </div>
                    <div className="flex gap-2">
                      {[1, 5, 10, 50].map(val => (
                        <button
                          key={val}
                          onClick={() => {
                            setMultiplier(val);
                            playSound(500, 'sine', 0.05);
                            addLog(`加算倍率を x${val} に変更しました`, 'info');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            multiplier === val
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                          }`}
                        >
                          x{val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold">
                      <Activity className="w-4 h-4" />
                      <span>ボタンスタイル検証</span>
                    </div>
                    <p className="text-xs text-slate-400">ホバーおよびフィードバックの確認</p>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          playSound(660, 'sine', 0.1);
                          addLog('プライマリボタンプッシュ', 'success');
                        }}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                      >
                        プライマリアクション
                      </button>
                      <button
                        onClick={() => {
                          playSound(440, 'triangle', 0.1);
                          addLog('アウトラインボタンプッシュ', 'info');
                        }}
                        className="w-full py-2.5 rounded-xl border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 text-xs font-semibold transition-colors"
                      >
                        アウトラインアクション
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold">
                      <Sparkles className="w-4 h-4" />
                      <span>シグナル音テスト</span>
                    </div>
                    <p className="text-xs text-slate-400">Web Audio API 周波数別サウンド</p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => playSound(330, 'sine', 0.15)}
                        className="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
                      >
                        Low (330Hz)
                      </button>
                      <button
                        onClick={() => playSound(660, 'sine', 0.15)}
                        className="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
                      >
                        Mid (660Hz)
                      </button>
                      <button
                        onClick={() => playSound(1320, 'sine', 0.15)}
                        className="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
                      >
                        High (1.3kHz)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CANVAS */}
            {activeTab === 'canvas' && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-semibold text-white">リアルタイム パーティクル キャンバス</h3>
                  </div>
                  <span className="text-xs text-slate-400">クリックしてパーティクルを生成</span>
                </div>
                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-[360px] cursor-crosshair block"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-md text-xs text-slate-300 border border-slate-700/50 pointer-events-none">
                    マウス操作で波紋エフェクト
                  </div>
                </div>
              </div>
            )}

            {/* TAB: DIAGNOSTICS */}
            {activeTab === 'diagnostics' && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-semibold text-white">クライアント環境・診断データ</h3>
                  </div>
                  <button
                    onClick={testPing}
                    disabled={isPinging}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                    レイテンシ計測
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-500 font-medium">画面解像度 / 表示領域</span>
                    <p className="text-sm font-mono text-slate-200">
                      {window.innerWidth} x {window.innerHeight} px (Ratio: {window.devicePixelRatio}x)
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-500 font-medium">ユーザーエージェント</span>
                    <p className="text-xs font-mono text-slate-300 truncate" title={navigator.userAgent}>
                      {navigator.userAgent}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-500 font-medium">言語 / タイムゾーン</span>
                    <p className="text-sm font-mono text-slate-200">
                      {navigator.language} / {Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-500 font-medium">応答時間 (レイテンシ)</span>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-sm font-mono text-emerald-400 font-medium">
                        {latency !== null ? `${latency} ms` : '未計測 (ボタンで測定)'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>ビルドモード: Vite Single Page App</span>
                  <span className="font-mono text-emerald-400">GitHub Pages 互換</span>
                </div>
              </div>
            )}

            {/* TAB: TODO */}
            {activeTab === 'todo' && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-semibold text-white">検証メモ & ToDoチェックリスト</h3>
                  </div>
                  <span className="text-xs text-slate-400">LocalStorage自動保存</span>
                </div>

                <form onSubmit={addNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="新しいタスクやチェック項目を入力..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    追加
                  </button>
                </form>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {testNotes.map((note, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-sm text-slate-200">{note}</span>
                      </div>
                      <button
                        onClick={() => removeNote(index)}
                        className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-900 transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Side Panel: Live Event Log (1 Col) */}
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col h-[520px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-semibold text-sm text-white">リアルタイム ログ</h3>
                </div>
                <button
                  onClick={() => {
                    setLogs([]);
                    playSound(300, 'sine', 0.05);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  クリア
                </button>
              </div>

              {/* Log List */}
              <div className="flex-1 overflow-y-auto font-mono text-xs space-y-2 pt-3 pr-1">
                {logs.length === 0 ? (
                  <div className="text-center py-12 text-slate-600">ログは空です</div>
                ) : (
                  logs.map(log => (
                    <div
                      key={log.id}
                      className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/60 flex items-start gap-2"
                    >
                      <span className="text-slate-500 text-[10px] select-none">{log.time}</span>
                      <span
                        className={`font-semibold ${
                          log.type === 'success'
                            ? 'text-emerald-400'
                            : log.type === 'warn'
                            ? 'text-amber-400'
                            : 'text-indigo-400'
                        }`}
                      >
                        [{log.type.toUpperCase()}]
                      </span>
                      <span className="text-slate-300 break-words flex-1">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Action Guide Card */}
            <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                <Github className="w-4 h-4" />
                GitHub Pages Tips
              </div>
              <h4 className="text-sm font-bold text-white">プッシュするだけで自動公開</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                作成済みの GitHub Actions ワークフローにより、今後コードを変更して main ブランチに <code className="text-emerald-300">git push</code> するたびに、自動的にビルドとデプロイが実行されます。
              </p>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500">
        <p>テストハブ • GitHub Pages 対応 Vite + React 19 アプリケーション</p>
      </footer>
    </div>
  );
}
