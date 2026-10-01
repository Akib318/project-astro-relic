/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import InteractiveStarfield from './components/InteractiveStarfield';
import LittleNovaMascot from './components/LittleNovaMascot';
import SolarSystemViewer from './components/SolarSystemViewer';
import PlanetarySurfaceViewer from './components/PlanetarySurfaceViewer';
import RelicExperienceModal from './components/RelicExperienceModal';
import AstroPassportModal from './components/AstroPassportModal';
import { RELICS_DATA } from './data/relicsData';
import { PlanetId, Language, RelicData } from './types';
import { soundEffects } from './utils/soundEffects';
import {
  Volume2,
  VolumeX,
  Award,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

type AppStage = 'landing' | 'solar' | 'planet';

export default function App() {
  const [stage, setStage] = useState<AppStage>('landing');
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetId>('mars');
  const [activeRelic, setActiveRelic] = useState<RelicData | null>(null);
  const [language, setLanguage] = useState<Language>('bn');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isWarping, setIsWarping] = useState<boolean>(false);
  const [isPassportOpen, setIsPassportOpen] = useState<boolean>(false);
  const [unlockedRelicIds, setUnlockedRelicIds] = useState<string[]>(['opportunity']);

  // Enter 3D Solar System from Landing
  const handleEnterSolarSystem = () => {
    soundEffects.playClick();
    soundEffects.playWarp();
    setIsWarping(true);
  };

  const handleWarpComplete = () => {
    setIsWarping(false);
    setStage('solar');
  };

  const handleSelectPlanet = (planet: PlanetId) => {
    soundEffects.playClick();
    setSelectedPlanet(planet);
    setStage('planet');
  };

  const handleSelectRelic = (relicId: string) => {
    soundEffects.playClick();
    const data = RELICS_DATA[relicId] || RELICS_DATA.opportunity;
    setActiveRelic(data);
  };

  const handleUnlockStamp = (relicId: string) => {
    if (!unlockedRelicIds.includes(relicId)) {
      setUnlockedRelicIds((prev) => [...prev, relicId]);
    }
  };

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEffects.setMuted(nextMuted);
  };

  const toggleLanguage = () => {
    soundEffects.playClick();
    setLanguage((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  return (
    <div
      className={`relative min-h-screen w-full bg-[#050814] text-slate-100 overflow-hidden select-none ${
        language === 'bn' ? 'font-bengali' : ''
      }`}
    >
      {/* Sleek, Minimalist Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between pointer-events-none">
        {/* Brand Name Logo (clean, zero external branding) */}
        <div
          onClick={() => {
            soundEffects.playClick();
            setStage('landing');
          }}
          className="pointer-events-auto cursor-pointer flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-amber-300 flex items-center justify-center text-sm shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            🛸
          </div>
          <span className="text-sm font-black tracking-widest text-white font-space group-hover:text-cyan-300 transition-colors">
            ASTRO RELIC
          </span>
        </div>

        {/* Minimal Controls: Passport, Sound & Language */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Astro Passport icon */}
          <button
            onClick={() => {
              soundEffects.playClick();
              setIsPassportOpen(true);
            }}
            title={language === 'bn' ? 'অ্যাস্ট্রো পাসপোর্ট' : 'Astro Passport'}
            className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-400/60 text-amber-300 transition-all active:scale-95 shadow-md backdrop-blur-md flex items-center gap-1.5"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-mono font-bold text-amber-200">
              {unlockedRelicIds.length}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={isMuted ? 'সাউন্ড আনমিউট' : 'সাউন্ড মিউট'}
            className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-400/60 text-slate-300 hover:text-cyan-300 transition-all active:scale-95 shadow-md backdrop-blur-md"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            )}
          </button>

          {/* Language Switch */}
          <button
            onClick={toggleLanguage}
            title="ভাষা পরিবর্তন / Switch Language"
            className="px-2.5 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-400/60 text-cyan-300 font-mono font-bold text-xs transition-all active:scale-95 shadow-md backdrop-blur-md"
          >
            {language === 'bn' ? 'EN' : 'বাং'}
          </button>
        </div>
      </header>

      {/* ========================================================
          STAGE 1: ULTRA-MINIMAL HOME PAGE
          - Interactive Starlight Constellation Background
          - Clean App Name & Theme Motto
          - Single Sleek CTA to Enter 3D Solar System
          - Functional Nova AI on the Left Top Side
          ======================================================== */}
      {stage === 'landing' && (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 z-10">
          {/* Interactive Proximity Glow Starfield Background */}
          <InteractiveStarfield isWarping={isWarping} onWarpComplete={handleWarpComplete} />

          {/* Center Pure Minimal Content */}
          <div className="text-center max-w-xl px-4 z-10">
            {/* Theme Motto Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-400/30 text-cyan-300 text-xs font-mono mb-6 backdrop-blur-sm shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {language === 'bn'
                  ? 'হারিয়ে যাওয়া স্মৃতি • অমর অভিযান'
                  : 'Abandoned but Not Forgotten'}
              </span>
            </div>

            {/* App Name */}
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white font-space drop-shadow-[0_10px_35px_rgba(0,245,212,0.25)]">
              ASTRO{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300">
                RELIC
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-md mx-auto">
              {language === 'bn'
                ? 'চাঁদ ও মঙ্গলের নির্জনতায় ঘুমিয়ে থাকা ঐতিহাসিক রোবট বন্ধুদের পুনরুজ্জীবনের অভিযান।'
                : 'Uncovering humanity’s silent robotic pioneers resting across the Moon and Mars.'}
            </p>

            {/* Single Clean Way to Enter 3D Solar System */}
            <div className="mt-10 flex justify-center">
              <button
                onClick={handleEnterSolarSystem}
                disabled={isWarping}
                className="group relative px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-400 hover:from-cyan-300 hover:to-amber-300 text-slate-950 font-black text-sm sm:text-base shadow-[0_0_30px_rgba(0,245,212,0.3)] hover:shadow-[0_0_45px_rgba(0,245,212,0.55)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2.5 font-space cursor-pointer"
              >
                <span className="text-lg">🪐</span>
                <span>
                  {isWarping
                    ? language === 'bn'
                      ? 'হাইপারড্রাইভ স্টার্ট হচ্ছে...'
                      : 'Warping...'
                    : language === 'bn'
                    ? '3D সোলার সিস্টেমে প্রবেশ করুন'
                    : 'Enter 3D Solar System'}
                </span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STAGE 2: 3D SOLAR SYSTEM ORBIT (To be worked on next)
          ======================================================== */}
      {stage === 'solar' && (
        <SolarSystemViewer
          onSelectPlanet={handleSelectPlanet}
          language={language}
        />
      )}

      {/* ========================================================
          STAGE 3: PLANETARY SURFACE (Moon & Mars archaeological sites)
          ======================================================== */}
      {stage === 'planet' && (
        <PlanetarySurfaceViewer
          planet={selectedPlanet}
          onBackToOrbit={() => setStage('solar')}
          onSelectRelic={handleSelectRelic}
          language={language}
        />
      )}

      {/* RELIC DEEP ARCHEOLOGICAL EXPERIENCE MODAL */}
      {activeRelic && (
        <RelicExperienceModal
          relic={activeRelic}
          onClose={() => setActiveRelic(null)}
          onUnlockStamp={handleUnlockStamp}
          hasUnlockedStamp={unlockedRelicIds.includes(activeRelic.id)}
          language={language}
        />
      )}

      {/* ASTRO PASSPORT MODAL */}
      {isPassportOpen && (
        <AstroPassportModal
          unlockedRelicIds={unlockedRelicIds}
          onClose={() => setIsPassportOpen(false)}
          language={language}
        />
      )}

      {/* ========================================================
          LITTLE NOVA: FUNCTIONAL AI MASCOT COMPANION
          - Positioned on the Left Top Side
          - Interactive speech & melodic child-voice audio
          ======================================================== */}
      <LittleNovaMascot
        currentStage={
          activeRelic
            ? 'relic'
            : isPassportOpen
            ? 'passport'
            : stage === 'landing'
            ? 'landing'
            : stage === 'solar'
            ? 'solar'
            : 'planet'
        }
        language={language}
      />
    </div>
  );
}
