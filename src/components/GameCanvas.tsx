import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameMode, Language, CharacterDef } from '../types';
import { LF2Engine, GameInput } from '../game/engine';
import { LF2Renderer } from '../game/renderer';
import { VirtualControls } from './VirtualControls';
import { sound } from '../audio';
import confetti from 'canvas-confetti';
import { Trophy, Skull, RotateCcw, Home, Play, Pause, Flame, Shield, Zap } from 'lucide-react';
import { STAGES } from '../game/stages';

interface GameCanvasProps {
  playerCharId: string;
  gameMode: GameMode;
  vsOpponentId?: string;
  lang: Language;
  onBackToMenu: () => void;
  onOpenMoveList: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  playerCharId,
  gameMode,
  vsOpponentId,
  lang,
  onBackToMenu,
  onOpenMoveList
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<LF2Engine | null>(null);
  const rendererRef = useRef<LF2Renderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [hudState, setHudState] = useState<{
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    score: number;
    combo: number;
    kills: number;
    stageIndex: number;
    waveIndex: number;
    bossHp?: number;
    bossMaxHp?: number;
    bossName?: string;
    isGameOver: boolean;
    isVictory: boolean;
    isPaused: boolean;
  }>({
    hp: 500,
    maxHp: 500,
    mp: 200,
    maxMp: 200,
    score: 0,
    combo: 0,
    kills: 0,
    stageIndex: 0,
    waveIndex: 0,
    isGameOver: false,
    isVictory: false,
    isPaused: false
  });

  // Active keyboard & virtual input state
  const inputRef = useRef<GameInput>({
    left: false,
    right: false,
    up: false,
    down: false,
    attack: false,
    jump: false,
    guard: false,
    run: false,
    special1: false,
    special2: false,
    special3: false
  });

  // Initialize engine
  useEffect(() => {
    sound.enableAudio();
    const engine = new LF2Engine(playerCharId, gameMode, vsOpponentId);
    engineRef.current = engine;

    if (canvasRef.current) {
      rendererRef.current = new LF2Renderer(canvasRef.current);
    }

    const handleResize = () => {
      if (canvasRef.current) {
        const parent = canvasRef.current.parentElement;
        if (parent) {
          canvasRef.current.width = parent.clientWidth;
          canvasRef.current.height = Math.max(380, Math.min(640, window.innerHeight * 0.58));
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [playerCharId, gameMode, vsOpponentId]);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      const input = inputRef.current;
      const key = e.key.toLowerCase();

      if (key === 'arrowleft' || key === 'a') input.left = true;
      if (key === 'arrowright' || key === 'd') input.right = true;
      if (key === 'arrowup' || key === 'w') input.up = true;
      if (key === 'arrowdown' || key === 's') input.down = true;

      // Attack (J or Z)
      if (key === 'j' || key === 'z') input.attack = true;
      // Jump (K or X or Space)
      if (key === 'k' || key === 'x' || key === ' ') input.jump = true;
      // Guard (L or C)
      if (key === 'l' || key === 'c') input.guard = true;

      // Run (Shift)
      if (e.shiftKey) input.run = true;

      // Special hotkeys 1, 2, 3
      if (key === '1') input.special1 = true;
      if (key === '2') input.special2 = true;
      if (key === '3') input.special3 = true;

      // Pause (P or Escape)
      if (key === 'p' || key === 'escape') {
        if (engineRef.current) {
          engineRef.current.isPaused = !engineRef.current.isPaused;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const input = inputRef.current;
      const key = e.key.toLowerCase();

      if (key === 'arrowleft' || key === 'a') input.left = false;
      if (key === 'arrowright' || key === 'd') input.right = false;
      if (key === 'arrowup' || key === 'w') input.up = false;
      if (key === 'arrowdown' || key === 's') input.down = false;

      if (key === 'j' || key === 'z') input.attack = false;
      if (key === 'k' || key === 'x' || key === ' ') input.jump = false;
      if (key === 'l' || key === 'c') input.guard = false;

      if (!e.shiftKey) input.run = false;

      if (key === '1') input.special1 = false;
      if (key === '2') input.special2 = false;
      if (key === '3') input.special3 = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Game Loop (~60 FPS)
  useEffect(() => {
    let lastHudUpdate = 0;

    const loop = (timestamp: number) => {
      const engine = engineRef.current;
      const renderer = rendererRef.current;

      if (engine && renderer) {
        engine.update(inputRef.current);
        renderer.render(engine);

        // Update HUD reactively every ~6 frames to preserve max 60FPS canvas performance
        if (timestamp - lastHudUpdate > 95) {
          lastHudUpdate = timestamp;
          const p = engine.player;
          const boss = engine.entities.find(e => e.team === 1 && (e.charDef.id === 'julian' || e.charDef.id === 'mark'));

          setHudState({
            hp: p ? p.hp : 0,
            maxHp: p ? p.maxHp : 500,
            mp: p ? p.mp : 0,
            maxMp: p ? p.maxMp : 200,
            score: engine.score,
            combo: engine.combo,
            kills: engine.kills,
            stageIndex: engine.currentStageIndex,
            waveIndex: engine.currentWaveIndex,
            bossHp: boss ? boss.hp : undefined,
            bossMaxHp: boss ? boss.maxHp : undefined,
            bossName: boss ? boss.charDef.name[lang] : undefined,
            isGameOver: engine.isGameOver,
            isVictory: engine.isVictory,
            isPaused: engine.isPaused
          });

          // Trigger victory celebration confetti
          if (engine.isVictory && !hudState.isVictory) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [lang, hudState.isVictory]);

  // Virtual buttons bridge
  const handleVirtualButtonDown = useCallback((btn: string) => {
    sound.enableAudio();
    if (btn in inputRef.current) {
      (inputRef.current as Record<string, boolean>)[btn] = true;
    }
  }, []);

  const handleVirtualButtonUp = useCallback((btn: string) => {
    if (btn in inputRef.current) {
      (inputRef.current as Record<string, boolean>)[btn] = false;
    }
  }, []);

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.initGame(vsOpponentId);
    }
  };

  const handleTogglePause = () => {
    if (engineRef.current) {
      engineRef.current.isPaused = !engineRef.current.isPaused;
      setHudState(prev => ({ ...prev, isPaused: engineRef.current!.isPaused }));
    }
  };

  const playerChar = engineRef.current?.playerCharDef;
  const currentStage = STAGES[hudState.stageIndex] || STAGES[0];

  const getComboRank = (combo: number) => {
    if (combo >= 15) return { text: lang === 'ar' ? 'أسطوري! (GODLIKE)' : 'GODLIKE!', color: 'text-amber-300' };
    if (combo >= 10) return { text: lang === 'ar' ? 'سوبر كومبو! (SUPER)' : 'SUPER COMBO!', color: 'text-red-400' };
    if (combo >= 6) return { text: lang === 'ar' ? 'رائع! (EXCELLENT)' : 'EXCELLENT!', color: 'text-purple-400' };
    return { text: lang === 'ar' ? 'ضربة متتالية!' : 'GOOD HIT!', color: 'text-blue-400' };
  };

  return (
    <div className="relative w-full flex-1 flex flex-col bg-slate-950 overflow-hidden select-none">
      
      {/* Top Arcade HUD */}
      <div 
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        className="w-full bg-slate-950/90 border-b border-slate-800/80 px-4 py-2 z-20"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          
          {/* Player Life & Mana Gauges */}
          <div className="flex items-center gap-3">
            {/* Fighter Avatar Portrait */}
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg border-2 shadow-md shrink-0"
              style={{
                backgroundColor: playerChar?.color || '#3B82F6',
                borderColor: playerChar?.accentColor || '#60A5FA',
                color: '#FFFFFF'
              }}
            >
              {playerChar?.name.en[0] || 'P'}
            </div>

            <div className="flex flex-col gap-1 w-40 sm:w-56">
              <div className="flex items-center justify-between text-xs font-black text-slate-200">
                <span>{playerChar?.name[lang] || 'Player'}</span>
                <span className="font-mono text-emerald-400">{Math.max(0, Math.round(hudState.hp))} HP</span>
              </div>

              {/* HP Bar */}
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div 
                  className={`h-full rounded-full transition-all duration-100 ${
                    hudState.hp / hudState.maxHp > 0.35 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-red-500 animate-pulse'
                  }`}
                  style={{ width: `${Math.max(0, (hudState.hp / hudState.maxHp) * 100)}%` }}
                />
              </div>

              {/* MP Bar */}
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-100"
                  style={{ width: `${Math.max(0, (hudState.mp / hudState.maxMp) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Center: Stage/Wave / Boss HP / Score */}
          <div className="flex flex-col items-center">
            {hudState.bossHp !== undefined && hudState.bossHp > 0 ? (
              <div className="w-48 sm:w-64 flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-xs font-black text-purple-400 uppercase tracking-wide">
                  <Skull className="w-3.5 h-3.5" />
                  <span>{hudState.bossName || 'BOSS'}</span>
                </div>
                <div className="h-2.5 w-full bg-slate-900 border border-purple-500/50 rounded-full overflow-hidden mt-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-100"
                    style={{ width: `${Math.max(0, (hudState.bossHp / (hudState.bossMaxHp || 1000)) * 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {gameMode === 'stage' 
                    ? `${currentStage.name[lang]} - W${hudState.waveIndex + 1}`
                    : gameMode === 'vs' ? (lang === 'ar' ? 'مبارزة فردية 1v1' : 'VS 1v1 MATCH')
                    : (lang === 'ar' ? `موجة البقاء ${hudState.waveIndex + 1}` : `SURVIVAL W${hudState.waveIndex + 1}`)}
                </div>
                <div className="text-lg font-black font-mono text-white tracking-widest">
                  SCORE: {hudState.score.toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* Right: Pause & Kills Counter */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end text-xs font-mono">
              <span className="text-slate-400">{lang === 'ar' ? 'الضحايا:' : 'KILLS:'}</span>
              <span className="font-bold text-red-400">{hudState.kills}</span>
            </div>

            <button
              id="btn-pause-game"
              onClick={handleTogglePause}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title={lang === 'ar' ? 'إيقاف مؤقت' : 'Pause'}
            >
              {hudState.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>

      {/* Main Game Arena Canvas Container */}
      <div className="relative flex-1 w-full flex items-center justify-center bg-slate-950 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full block cursor-crosshair"
        />

        {/* Dynamic Combo Hit Notification */}
        {hudState.combo > 1 && (
          <div 
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            className="absolute top-4 left-6 pointer-events-none animate-bounce"
          >
            <div className="text-3xl sm:text-4xl font-black font-mono text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] flex items-center gap-2">
              <span className="text-amber-400">{hudState.combo}</span>
              <span className="text-lg uppercase">{lang === 'ar' ? 'ضربة متتالية!' : 'HITS!'}</span>
            </div>
            <div className={`text-xs font-black uppercase tracking-wider ${getComboRank(hudState.combo).color}`}>
              {getComboRank(hudState.combo).text}
            </div>
          </div>
        )}

        {/* Pause Overlay */}
        {hudState.isPaused && !hudState.isGameOver && !hudState.isVictory && (
          <div 
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-4 animate-in fade-in"
          >
            <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-700 text-center space-y-4 shadow-2xl">
              <h2 className="text-2xl font-black text-white">
                {lang === 'ar' ? 'اللعبة متوقفة مؤقتاً' : 'GAME PAUSED'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'ar' ? 'اضغط استئناف لمتابعة القتال، أو استعرض قائمة الحركات' : 'Resume the brawl or view character move combos.'}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  id="btn-resume"
                  onClick={handleTogglePause}
                  className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{lang === 'ar' ? 'استئناف' : 'Resume'}</span>
                </button>
                <button
                  id="btn-show-moves-pause"
                  onClick={onOpenMoveList}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs border border-slate-700"
                >
                  {lang === 'ar' ? 'دليل الحركات' : 'Move List'}
                </button>
              </div>

              <button
                id="btn-quit-pause"
                onClick={onBackToMenu}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-white"
              >
                {lang === 'ar' ? 'الخروج للقائمة الرئيسية' : 'Exit to Main Menu'}
              </button>
            </div>
          </div>
        )}

        {/* Victory Screen Overlay */}
        {hudState.isVictory && (
          <div 
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex flex-col items-center justify-center p-4 animate-in zoom-in-95"
          >
            <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/95 border-2 border-amber-500/50 text-center space-y-5 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-3xl font-black text-white">
                  {lang === 'ar' ? 'انتصار أسطوري ساحق!' : 'VICTORY!'}
                </h2>
                <p className="text-xs text-amber-400 font-bold mt-1">
                  {lang === 'ar' ? 'لقد طهرت الساحة وهزمت جميع الأعداء!' : 'You conquered the arena and crushed the syndicate!'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>{lang === 'ar' ? 'النقاط المحققة:' : 'Final Score:'}</span>
                  <span className="font-mono text-white font-bold">{hudState.score.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{lang === 'ar' ? 'عدد الأعداء المهزومين:' : 'Enemies Defeated:'}</span>
                  <span className="font-mono text-red-400 font-bold">{hudState.kills}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  id="btn-play-again"
                  onClick={handleRestart}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'اللعب مرة أخرى' : 'Play Again'}</span>
                </button>
                <button
                  id="btn-menu-victory"
                  onClick={onBackToMenu}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Over Screen Overlay */}
        {hudState.isGameOver && (
          <div 
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            className="absolute inset-0 bg-red-950/80 backdrop-blur-md z-30 flex flex-col items-center justify-center p-4 animate-in zoom-in-95"
          >
            <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border-2 border-red-500/50 text-center space-y-5 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 text-red-400 flex items-center justify-center mx-auto shadow-lg">
                <Skull className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-3xl font-black text-white tracking-wider">
                  {lang === 'ar' ? 'انتهت المعركة (هزيمة)' : 'GAME OVER'}
                </h2>
                <p className="text-xs text-red-400 font-semibold mt-1">
                  {lang === 'ar' ? 'لقد سقط مقاتلك في المعركة، انهض وحاول مجدداً!' : 'Your warrior has fallen in combat. Rise and fight again!'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex justify-between text-slate-300">
                <span>{lang === 'ar' ? 'النقاط التي جمعتها:' : 'Score Reached:'}</span>
                <span className="font-mono text-amber-400 font-bold">{hudState.score.toLocaleString()}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  id="btn-retry"
                  onClick={handleRestart}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'إعادة المحاولة (RETRY)' : 'Try Again'}</span>
                </button>
                <button
                  id="btn-menu-gameover"
                  onClick={onBackToMenu}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Virtual Touch / Mouse Arcade Gamepad Controls */}
      {playerChar && (
        <VirtualControls
          charDef={playerChar}
          currentMp={hudState.mp}
          lang={lang}
          onButtonDown={handleVirtualButtonDown}
          onButtonUp={handleVirtualButtonUp}
        />
      )}

    </div>
  );
};
