/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameMode, Language } from './types';
import { Header } from './components/Header';
import { CharacterSelect } from './components/CharacterSelect';
import { GameCanvas } from './components/GameCanvas';
import { MoveListModal } from './components/MoveListModal';
import { sound } from './audio';

export default function App() {
  const [screen, setScreen] = useState<'select' | 'playing'>('select');
  const [lang, setLang] = useState<Language>('ar');
  const [selectedCharId, setSelectedCharId] = useState<string>('davis');
  const [selectedMode, setSelectedMode] = useState<GameMode>('stage');
  const [vsOpponentId, setVsOpponentId] = useState<string>('firen');
  const [isMoveListOpen, setIsMoveListOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(true);
  const [gameKey, setGameKey] = useState<number>(0);

  const handleStartGame = (charId: string, mode: GameMode, opponentId?: string) => {
    setSelectedCharId(charId);
    setSelectedMode(mode);
    if (opponentId) setVsOpponentId(opponentId);
    setGameKey(prev => prev + 1);
    setScreen('playing');
  };

  const handleRestartMatch = () => {
    setGameKey(prev => prev + 1);
  };

  const handleBackToMenu = () => {
    setScreen('select');
  };

  const handleToggleLang = () => {
    setLang(prev => (prev === 'ar' ? 'en' : 'ar'));
  };

  const handleToggleSound = () => {
    const val = sound.toggleSound();
    setSoundEnabled(val);
  };

  const handleToggleMusic = () => {
    const val = sound.toggleMusic();
    setMusicEnabled(val);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 antialiased overflow-x-hidden">
      {/* Top Header */}
      <Header
        lang={lang}
        onToggleLang={handleToggleLang}
        onOpenMoveList={() => setIsMoveListOpen(true)}
        onRestart={handleRestartMatch}
        onBackToMenu={handleBackToMenu}
        soundEnabled={soundEnabled}
        musicEnabled={musicEnabled}
        onToggleSound={handleToggleSound}
        onToggleMusic={handleToggleMusic}
        inGame={screen === 'playing'}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col">
        {screen === 'select' ? (
          <CharacterSelect
            lang={lang}
            onStartGame={handleStartGame}
            onOpenMoveList={() => setIsMoveListOpen(true)}
          />
        ) : (
          <GameCanvas
            key={gameKey}
            playerCharId={selectedCharId}
            gameMode={selectedMode}
            vsOpponentId={vsOpponentId}
            lang={lang}
            onBackToMenu={handleBackToMenu}
            onOpenMoveList={() => setIsMoveListOpen(true)}
          />
        )}
      </main>

      {/* Move List Modal Guide */}
      <MoveListModal
        isOpen={isMoveListOpen}
        onClose={() => setIsMoveListOpen(false)}
        lang={lang}
        initialCharId={selectedCharId}
      />
    </div>
  );
}
