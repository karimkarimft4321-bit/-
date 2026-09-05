import React, { useState } from 'react';
import { PLAYABLE_CHARACTERS } from '../game/characters';
import { GameMode, Language } from '../types';
import { Swords, Trophy, Flame, Shield, Zap, Sparkles, Play, BookOpen } from 'lucide-react';
import { sound } from '../audio';

interface CharacterSelectProps {
  lang: Language;
  onStartGame: (charId: string, mode: GameMode, vsOpponentId?: string) => void;
  onOpenMoveList: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  lang,
  onStartGame,
  onOpenMoveList
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>('davis');
  const [selectedMode, setSelectedMode] = useState<GameMode>('stage');
  const [vsOpponentId, setVsOpponentId] = useState<string>('firen');

  const selectedChar = PLAYABLE_CHARACTERS.find(c => c.id === selectedCharId) || PLAYABLE_CHARACTERS[0];

  const handleSelectChar = (id: string) => {
    setSelectedCharId(id);
    sound.playPunch();
  };

  const handleStart = () => {
    sound.playVictory();
    onStartGame(selectedCharId, selectedMode, vsOpponentId);
  };

  return (
    <div 
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8 select-none"
    >
      {/* Title Header */}
      <div className="max-w-6xl mx-auto w-full text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'لعبة قتال الآركيد الأسطورية' : 'Classic Retro Beat \'em Up Arcade'}</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white flex items-center justify-center gap-3">
          <span className="text-amber-400">LF2D</span>
          <span>{lang === 'ar' ? 'ليتل فايتر تو دي' : 'Little Fighter 2D'}</span>
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
          {lang === 'ar' 
            ? 'اختر بطلك الأسطوري، اتقن حركات الكي والفنون القتالية واهزم جيش قطاع الطرق والزعيم جوليان!'
            : 'Select your legendary fighter, unleash martial combos & elemental magic, and defeat Lord Julian!'}
        </p>
      </div>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Character Cards List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Swords className="w-4 h-4 text-blue-400" />
              {lang === 'ar' ? 'قائمة المقاتلين الأساطير' : 'Fighter Roster'}
            </h2>
            <button
              id="btn-open-guide-select"
              onClick={onOpenMoveList}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
            >
              <BookOpen className="w-3.5 h-3.5" />
              {lang === 'ar' ? 'دليل الحركات' : 'Move List'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PLAYABLE_CHARACTERS.map(c => {
              const isSelected = selectedCharId === c.id;
              return (
                <button
                  key={c.id}
                  id={`select-char-${c.id}`}
                  onClick={() => handleSelectChar(c.id)}
                  className={`relative p-4 rounded-2xl border text-start transition-all duration-200 flex flex-col justify-between overflow-hidden group ${
                    isSelected
                      ? 'bg-slate-800 border-blue-500 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/40'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  {/* Decorative corner tag */}
                  <div 
                    className="absolute -top-6 -right-6 w-12 h-12 rounded-full opacity-30 group-hover:opacity-60 transition-opacity"
                    style={{ backgroundColor: c.color }}
                  />

                  <div>
                    <div className="flex items-center justify-between">
                      <span 
                        className="w-3.5 h-3.5 rounded-full ring-2 ring-slate-950" 
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">
                        {c.element}
                      </span>
                    </div>

                    <div className="mt-3">
                      <h3 className="font-extrabold text-base text-slate-100 group-hover:text-white">
                        {c.name[lang]}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {c.title[lang]}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">{c.elementName[lang]}</span>
                    <span className="font-mono text-blue-400 font-bold">{c.baseStats.hp} HP</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mode Selector */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              {lang === 'ar' ? 'طريقة اللعب (Game Mode)' : 'Game Mode'}
            </h3>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                id="btn-mode-stage"
                onClick={() => setSelectedMode('stage')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedMode === 'stage'
                    ? 'bg-blue-600 border-blue-400 text-white font-bold shadow'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <div className="text-sm font-extrabold">{lang === 'ar' ? 'المراحل (Stage)' : 'Stage Mode'}</div>
                <div className="text-[10px] opacity-80 mt-1">{lang === 'ar' ? 'مواجهة موجات الأعداء والزعيم' : 'Defeat waves & Boss'}</div>
              </button>

              <button
                id="btn-mode-vs"
                onClick={() => setSelectedMode('vs')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedMode === 'vs'
                    ? 'bg-red-600 border-red-400 text-white font-bold shadow'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <div className="text-sm font-extrabold">{lang === 'ar' ? 'نزال (VS Bot)' : 'VS Mode'}</div>
                <div className="text-[10px] opacity-80 mt-1">{lang === 'ar' ? 'مبارزة 1 ضد 1' : '1v1 Duel Match'}</div>
              </button>

              <button
                id="btn-mode-survival"
                onClick={() => setSelectedMode('survival')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedMode === 'survival'
                    ? 'bg-amber-600 border-amber-400 text-white font-bold shadow'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <div className="text-sm font-extrabold">{lang === 'ar' ? 'البقاء (Survival)' : 'Survival'}</div>
                <div className="text-[10px] opacity-80 mt-1">{lang === 'ar' ? 'موجات لا نهائية ونقاط' : 'Endless onslaught'}</div>
              </button>
            </div>

            {/* If VS mode selected, select CPU opponent */}
            {selectedMode === 'vs' && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-300 mb-2">
                  {lang === 'ar' ? 'اختر الخصم للمبارزة:' : 'Select CPU Opponent:'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {PLAYABLE_CHARACTERS.map(opp => (
                    <button
                      key={opp.id}
                      onClick={() => setVsOpponentId(opp.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        vsOpponentId === opp.id
                          ? 'bg-red-900/60 border-red-500 text-red-200'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {opp.name[lang]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Character Details & Stats Inspector */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col justify-between space-y-6">
          <div>
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-800 text-blue-400 border border-slate-700">
                  {selectedChar.elementName[lang]}
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-white mt-1">
                  {selectedChar.name[lang]}
                </h2>
                <p className="text-xs text-amber-400 font-semibold">{selectedChar.title[lang]}</p>
              </div>

              {/* Avatar Icon */}
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner border-2"
                style={{ 
                  backgroundColor: selectedChar.color + '22',
                  borderColor: selectedChar.accentColor,
                  color: selectedChar.accentColor
                }}
              >
                {selectedChar.name.en[0]}
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              {selectedChar.description[lang]}
            </p>

            {/* Fighter Stats Bars */}
            <div className="mt-5 space-y-2.5">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-400">{lang === 'ar' ? 'نقاط الحياة (HP)' : 'Health (HP)'}</span>
                  <span className="font-mono text-emerald-400">{selectedChar.baseStats.hp}</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${(selectedChar.baseStats.hp / 550) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-400">{lang === 'ar' ? 'طاقة الكي (MP)' : 'Mana (MP)'}</span>
                  <span className="font-mono text-blue-400">{selectedChar.baseStats.mp}</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${(selectedChar.baseStats.mp / 260) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-400">{lang === 'ar' ? 'قوة الهجوم (Attack)' : 'Attack Power'}</span>
                  <span className="font-mono text-red-400">{selectedChar.baseStats.attackPower}</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full" 
                    style={{ width: `${(selectedChar.baseStats.attackPower / 50) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-400">{lang === 'ar' ? 'السرعة والرشاقة (Speed)' : 'Agility / Speed'}</span>
                  <span className="font-mono text-amber-400">{selectedChar.baseStats.speed}</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${(selectedChar.baseStats.speed / 5.0) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Special Moves Preview Cards */}
            <div className="mt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {lang === 'ar' ? 'الضربات الخاصة المتاحة' : 'Special Moves'}
              </h3>
              <div className="space-y-1.5">
                {selectedChar.moves.map(m => (
                  <div 
                    key={m.id}
                    className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-200">{m.name[lang]}</div>
                      <div className="text-[10px] text-slate-400">{m.description[lang]}</div>
                    </div>
                    <span className="font-mono px-2 py-1 rounded bg-slate-950 font-bold text-amber-300">
                      {m.command}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Big Start Button */}
          <button
            id="btn-start-game"
            onClick={handleStart}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] transition-all text-white font-black text-lg shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 border border-blue-400/30"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>{lang === 'ar' ? 'ابدأ المعركة الآن (START)!' : 'START BATTLE!'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
