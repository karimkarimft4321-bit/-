import React from 'react';
import { CharacterDef, Language } from '../types';
import { Shield, Zap, Flame, Snowflake, Wind, Sparkles } from 'lucide-react';

interface VirtualControlsProps {
  charDef: CharacterDef;
  currentMp: number;
  lang: Language;
  onButtonDown: (btn: string) => void;
  onButtonUp: (btn: string) => void;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  charDef,
  currentMp,
  lang,
  onButtonDown,
  onButtonUp
}) => {
  const getSkillIcon = (index: number) => {
    if (charDef.id === 'firen') return <Flame className="w-5 h-5 text-orange-400" />;
    if (charDef.id === 'freeze') return <Snowflake className="w-5 h-5 text-sky-400" />;
    if (charDef.id === 'woody') return <Wind className="w-5 h-5 text-emerald-400" />;
    if (index === 0) return <Zap className="w-5 h-5 text-blue-400" />;
    return <Sparkles className="w-5 h-5 text-amber-400" />;
  };

  return (
    <div className="w-full select-none pointer-events-auto py-2 px-3 bg-slate-900/90 backdrop-blur border-t border-slate-800">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Left Side: D-Pad */}
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-3 gap-1.5 w-36 h-36">
            <div />
            <button
              id="btn-dpad-up"
              onPointerDown={() => onButtonDown('up')}
              onPointerUp={() => onButtonUp('up')}
              onPointerLeave={() => onButtonUp('up')}
              className="bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-slate-200 font-bold rounded-lg flex items-center justify-center shadow transition-colors border border-slate-700"
            >
              ▲
            </button>
            <div />

            <button
              id="btn-dpad-left"
              onPointerDown={() => onButtonDown('left')}
              onPointerUp={() => onButtonUp('left')}
              onPointerLeave={() => onButtonUp('left')}
              className="bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-slate-200 font-bold rounded-lg flex items-center justify-center shadow transition-colors border border-slate-700"
            >
              ◀
            </button>

            <button
              id="btn-dpad-run"
              onPointerDown={() => onButtonDown('run')}
              onPointerUp={() => onButtonUp('run')}
              className="bg-amber-600/80 active:bg-amber-500 text-amber-100 text-xs font-bold rounded-lg flex items-center justify-center shadow border border-amber-500"
              title={lang === 'ar' ? 'ركض سريع' : 'Run / Dash'}
            >
              {lang === 'ar' ? 'ركض' : 'RUN'}
            </button>

            <button
              id="btn-dpad-right"
              onPointerDown={() => onButtonDown('right')}
              onPointerUp={() => onButtonUp('right')}
              onPointerLeave={() => onButtonUp('right')}
              className="bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-slate-200 font-bold rounded-lg flex items-center justify-center shadow transition-colors border border-slate-700"
            >
              ▶
            </button>

            <div />
            <button
              id="btn-dpad-down"
              onPointerDown={() => onButtonDown('down')}
              onPointerUp={() => onButtonUp('down')}
              onPointerLeave={() => onButtonUp('down')}
              className="bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-slate-200 font-bold rounded-lg flex items-center justify-center shadow transition-colors border border-slate-700"
            >
              ▼
            </button>
            <div />
          </div>
        </div>

        {/* Center: Special Move Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {charDef.moves.map((move, idx) => {
            const hasMp = currentMp >= move.mpCost;
            return (
              <button
                key={move.id}
                id={`btn-skill-${idx}`}
                disabled={!hasMp}
                onPointerDown={() => onButtonDown(`special${idx + 1}`)}
                onPointerUp={() => onButtonUp(`special${idx + 1}`)}
                className={`relative px-3 py-2 rounded-xl flex items-center gap-2 border transition-all text-xs font-bold shadow-md ${
                  hasMp
                    ? 'bg-slate-800/95 hover:bg-slate-700 active:scale-95 border-slate-600 text-slate-100'
                    : 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="p-1 rounded-lg bg-slate-900/80">
                  {getSkillIcon(idx)}
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-slate-200 truncate max-w-[100px]">
                    {move.name[lang]}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="text-blue-400 font-mono">{move.mpCost} MP</span>
                    <span className="text-slate-400 bg-slate-950 px-1 rounded">{move.command}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Attack, Jump, Guard Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Guard */}
          <button
            id="btn-guard"
            onPointerDown={() => onButtonDown('guard')}
            onPointerUp={() => onButtonUp('guard')}
            onPointerLeave={() => onButtonUp('guard')}
            className="w-14 h-14 rounded-2xl bg-indigo-950 hover:bg-indigo-900 active:bg-indigo-700 border border-indigo-500/50 text-indigo-200 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <Shield className="w-5 h-5 text-indigo-400" />
            <span className="text-[10px] font-bold mt-0.5">{lang === 'ar' ? 'دفاع' : 'GUARD'}</span>
            <span className="text-[9px] text-indigo-400/80 font-mono">(L/D)</span>
          </button>

          {/* Jump */}
          <button
            id="btn-jump"
            onPointerDown={() => onButtonDown('jump')}
            onPointerUp={() => onButtonUp('jump')}
            onPointerLeave={() => onButtonUp('jump')}
            className="w-14 h-14 rounded-2xl bg-emerald-950 hover:bg-emerald-900 active:bg-emerald-700 border border-emerald-500/50 text-emerald-200 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <span className="text-base font-black">▲</span>
            <span className="text-[10px] font-bold">{lang === 'ar' ? 'قفز' : 'JUMP'}</span>
            <span className="text-[9px] text-emerald-400/80 font-mono">(K/J)</span>
          </button>

          {/* Attack */}
          <button
            id="btn-attack"
            onPointerDown={() => onButtonDown('attack')}
            onPointerUp={() => onButtonUp('attack')}
            onPointerLeave={() => onButtonUp('attack')}
            className="w-16 h-16 rounded-2xl bg-red-600 hover:bg-red-500 active:bg-red-700 border-2 border-red-400 text-white flex flex-col items-center justify-center shadow-xl active:scale-95 transition-transform"
          >
            <span className="text-xl font-black">🥊</span>
            <span className="text-[11px] font-extrabold">{lang === 'ar' ? 'هجوم' : 'ATTACK'}</span>
            <span className="text-[9px] text-red-200 font-mono">(J/A)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
