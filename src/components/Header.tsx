import React from 'react';
import { Language } from '../types';
import { Volume2, VolumeX, Music, Languages, BookOpen, RotateCcw, Home } from 'lucide-react';
import { sound } from '../audio';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  onOpenMoveList: () => void;
  onRestart: () => void;
  onBackToMenu: () => void;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  inGame?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  onOpenMoveList,
  onRestart,
  onBackToMenu,
  soundEnabled,
  musicEnabled,
  onToggleSound,
  onToggleMusic,
  inGame = false
}) => {
  return (
    <header className="w-full bg-slate-950/80 backdrop-blur border-b border-slate-800/80 px-4 py-2.5 select-none z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Logo / App Name */}
        <div className="flex items-center gap-3">
          {inGame && (
            <button
              id="btn-back-menu"
              onClick={onBackToMenu}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
              title={lang === 'ar' ? 'العودة للقائمة الرئيسية' : 'Back to Menu'}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'القائمة' : 'Menu'}</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-amber-400 font-mono tracking-wider">LF2D</span>
            <span className="text-xs font-bold text-slate-400 hidden sm:inline">
              {lang === 'ar' ? 'ليتل فايتر تو دي' : 'Little Fighter 2D'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {inGame && (
            <button
              id="btn-restart-match"
              onClick={onRestart}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title={lang === 'ar' ? 'إعادة المعركة' : 'Restart Match'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Move List Guide Button */}
          <button
            id="btn-open-movelist-header"
            onClick={onOpenMoveList}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5 text-xs font-bold border border-slate-700"
            title={lang === 'ar' ? 'دليل الضربات' : 'Move List'}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden md:inline">{lang === 'ar' ? 'الحركات' : 'Moves'}</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-700'
                : 'bg-slate-900 border-slate-800 text-slate-600'
            }`}
            title={lang === 'ar' ? 'المؤثرات الصوتية' : 'Sound Effects'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Music BGM Toggle */}
          <button
            id="btn-toggle-music"
            onClick={onToggleMusic}
            className={`p-2 rounded-xl border transition-colors ${
              musicEnabled
                ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700'
                : 'bg-slate-900 border-slate-800 text-slate-600'
            }`}
            title={lang === 'ar' ? 'الموسيقى التصويرية' : 'BGM Music'}
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Arabic / English Toggle */}
          <button
            id="btn-toggle-language"
            onClick={onToggleLang}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Languages className="w-4 h-4 text-amber-400" />
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
