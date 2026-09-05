import React, { useState } from 'react';
import { PLAYABLE_CHARACTERS } from '../game/characters';
import { Language } from '../types';
import { X, BookOpen, Sparkles, Shield, Swords, Zap } from 'lucide-react';

interface MoveListModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  initialCharId?: string;
}

export const MoveListModal: React.FC<MoveListModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialCharId = 'davis'
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(initialCharId);

  if (!isOpen) return null;

  const char = PLAYABLE_CHARACTERS.find(c => c.id === selectedCharId) || PLAYABLE_CHARACTERS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div 
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-lg font-black text-slate-100">
                {lang === 'ar' ? 'دليل حركات وحركات القتال (Move List)' : 'Fighter Moves & Combos'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'ar' ? 'حركات Little Fighter 2 الكلاسيكية وأسرار الطاقة' : 'Classic LF2 Combos and Special Techniques'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-movelist"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Character Selector Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-950/40 border-b border-slate-800 overflow-x-auto">
          {PLAYABLE_CHARACTERS.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCharId(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                selectedCharId === c.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
              {c.name[lang]}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Character Header Info */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-white">{char.name[lang]}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-700 text-slate-300">
                  {char.elementName[lang]}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{char.description[lang]}</p>
            </div>
          </div>

          {/* Basic Universal Controls */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Swords className="w-4 h-4 text-red-400" />
              {lang === 'ar' ? 'التحكم العام الأساسي' : 'Universal Controls'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/40 flex justify-between items-center">
                <span className="text-slate-300">{lang === 'ar' ? 'الحركة في الساحة (2.5D)' : 'Movement (2.5D)'}</span>
                <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-amber-300 font-bold">Arrow Keys / WASD</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/40 flex justify-between items-center">
                <span className="text-slate-300">{lang === 'ar' ? 'هجوم عادي / كومبو' : 'Attack / Combo'}</span>
                <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-red-400 font-bold">J / Z / Attack</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/40 flex justify-between items-center">
                <span className="text-slate-300">{lang === 'ar' ? 'قفز / ركلة طائرة' : 'Jump / Flying Kick'}</span>
                <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-emerald-400 font-bold">K / X / Jump</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/40 flex justify-between items-center">
                <span className="text-slate-300">{lang === 'ar' ? 'صد دفاعي' : 'Guard / Defend'}</span>
                <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-indigo-400 font-bold">L / C / Guard</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/40 flex justify-between items-center sm:col-span-2">
                <span className="text-slate-300">{lang === 'ar' ? 'ركض سريع / هجوم الاندفاع' : 'Dash Run / Slide Tackle'}</span>
                <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-amber-400 font-bold">Double-Tap ◀/▶ or Shift / Run Button</span>
              </div>
            </div>
          </div>

          {/* Character Special Moves */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />
              {lang === 'ar' ? 'الضربات والقدرات الخاصة' : 'Special Moves & Magic'}
            </h3>
            <div className="space-y-2.5">
              {char.moves.map(m => (
                <div 
                  key={m.id}
                  className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">{m.name[lang]}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-blue-900/60 text-blue-300">
                        {m.mpCost} MP
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{m.description[lang]}</p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <div className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 font-mono font-black text-amber-300 border border-slate-700 shadow-inner">
                      {m.command}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {lang === 'ar'
                ? '* ملاحظة: يمكنك تنفيذ الحركات إما بكتابة تسلسل الأزرار (دفاع + اتجاه + هجوم) أو بالضغط المباشر على زر المهارة في شاشة اللمس / الأسفل!'
                : '* Note: You can trigger special moves either via the combo input (Guard + Direction + Attack) or directly tapping the on-screen skill buttons!'}
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
          >
            {lang === 'ar' ? 'حسناً، فهمت' : 'Got it!'}
          </button>
        </div>
      </div>
    </div>
  );
};
