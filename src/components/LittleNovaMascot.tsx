import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  X,
  Send,
  BookOpen,
  GripHorizontal,
  Compass,
  Loader2,
} from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';
import { Language } from '../types';

interface MascotProps {
  currentStage: 'landing' | 'solar' | 'planet' | 'relic' | 'passport';
  customMessage?: string;
  language: Language;
}

export default function LittleNovaMascot({ currentStage, customMessage, language }: MascotProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [speechBubbleText, setSpeechBubbleText] = useState('');
  const [storyTopic, setStoryTopic] = useState<string | null>(null);

  // Custom user Q&A state
  const [userQuestion, setUserQuestion] = useState('');
  const [isLoadingStory, setIsLoadingStory] = useState(false);

  // Position and Autonomous Drifting
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 28, y: 76 });
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoDrifting, setIsAutoDrifting] = useState(true);
  const [lastUserInteraction, setLastUserInteraction] = useState<number>(Date.now());

  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    hasMoved: boolean;
  }>({ startX: 0, startY: 0, initialX: 28, initialY: 76, hasMoved: false });

  // Initial stage greetings in sweet, poetic story style
  const defaultMessages: Record<string, { en: string; bn: string }> = {
    landing: {
      en: "Hello dear explorer! I'm Nova, your sweet cosmic storyteller! I wander through the stars remembering our brave robots. Tap the button or ask me a question—I'll tell you an enchanting space tale! ✨",
      bn: 'হ্যালো প্রিয় অভিযাত্রী! আমি নোভা, তোমার মিষ্টি মহাকাশ রূপকথার সঙ্গী! আমি তারায় তারায় ভেসে বেড়াই আর রোবট বন্ধুদের গল্প মনে রাখি। আমাকে যেকোনো প্রশ্ন করো—আমি তোমাকে এক জাদুকরী মহাকাশ গল্প শোনাব! ✨',
    },
    solar: {
      en: 'Listen closely... the glowing planets are humming a quiet cosmic lullaby. Click on the Moon or Mars, and let our spaceship dive into their ancient sands! 🚀',
      bn: 'শোনো... ওই দূর আকাশে গ্রহগুলো যেন মিষ্টি এক মহাজাগতিক গান গাইছে। চাঁদে বা মঙ্গলে ক্লিক করো, আমরা স্পেসশিপ নিয়ে সেখানে নামব! 🚀',
    },
    planet: {
      en: "We've landed on the silent planetary desert! Follow the glowing beacons to find our lonely robot friends. Click on any beacon to begin! 🛰️",
      bn: 'আমরা মহাকাশের নিস্তব্ধ বালুকাবেলায় নেমে পড়েছি! দেখো যেখানে আলোর সিগন্যাল জ্বলছে, সেখানে আমাদের রোবট বন্ধুরা অপেক্ষা করছে। ক্লিক করে কাছে যাও! 🛰️',
    },
    relic: {
      en: "Under the thick cosmic dust, this hero is dreaming of the stars. Gently wipe the dust with your mouse—wake up their dormant memories! 🧹✨",
      bn: 'ধুলোর চাদরে ঢাকা এই বীর রোবট হয়তো এখনো তারাদের স্বপ্ন দেখছে। আলতো করে মাউস দিয়ে ধুলো মুছে দাও—ওর স্মৃতিগুলো আবার জেগে উঠবে! 🧹✨',
    },
    passport: {
      en: 'Wonderful! You unlocked timeless cosmic relics in your Astro Passport! Print your official certificate to keep this memory forever! 🏆',
      bn: 'কী অপূর্ব! তুমি মহাকাশের হারানো রোভারদের খুঁজে পেয়েছ এবং তোমার অ্যাস্ট্রো পাসপোর্টে নতুন স্ট্যাম্প জমা হয়েছে! সার্টিফিকেটটি দেখে নাও! 🏆',
    },
  };

  // Enchanting Story starter prompts
  const storyStarters = [
    {
      qEn: 'Tell me the story of the great Martian dust storm',
      qBn: 'মঙ্গলের ধূলিঝড়ের সেই রাতটির গল্প বলো',
    },
    {
      qEn: 'What is Apollo Eagle thinking alone on the Moon?',
      qBn: 'চাঁদে একা দাঁড়িয়ে অ্যাপোলো ঈগল কী ভাবছে?',
    },
    {
      qEn: 'Do space robots ever feel lonely?',
      qBn: 'মহাকাশের রোবটদের কি মন খারাপ হয়?',
    },
    {
      qEn: 'What is the secret heartbeat of Mars?',
      qBn: 'মঙ্গলের ভূগর্ভস্থ হৃদস্পন্দনের গোপন রহস্য কী?',
    },
  ];

  // Set initial text on stage/language changes
  useEffect(() => {
    const text = customMessage || defaultMessages[currentStage]?.[language] || '';
    setSpeechBubbleText(text);
    setStoryTopic(null);
  }, [currentStage, customMessage, language]);

  // Adjust initial position based on screen width
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 640;
      setPosition({ x: isMobile ? 14 : 28, y: isMobile ? 68 : 80 });
    }
  }, []);

  // Autonomous roaming effect: Nova gently floats around on her own occasionally!
  useEffect(() => {
    if (!isAutoDrifting) return;

    const interval = setInterval(() => {
      // Don't auto-move if currently dragging, or if user interacted recently (last 12 seconds), or speaking
      if (isDragging || isSpeaking || isLoadingStory || Date.now() - lastUserInteraction < 12000) {
        return;
      }

      // Safe floating zone (drifting naturally like in zero gravity)
      const maxX = Math.max(80, window.innerWidth - 320);
      const maxY = Math.min(260, window.innerHeight * 0.45);
      const minX = 20;
      const minY = 65;

      // Small gentle step from current position
      const deltaX = (Math.random() - 0.5) * 110;
      const deltaY = (Math.random() - 0.5) * 80;

      setPosition((prev) => {
        const nextX = Math.max(minX, Math.min(maxX, prev.x + deltaX));
        const nextY = Math.max(minY, Math.min(maxY, prev.y + deltaY));
        return { x: nextX, y: nextY };
      });

      // Play a soft fairy chime and trigger happy wave
      soundEffects.playNovaCuteVoice(3);
      setIsCelebrating(true);
      setTimeout(() => setIsCelebrating(false), 900);
    }, 14000);

    return () => clearInterval(interval);
  }, [isAutoDrifting, isDragging, isSpeaking, isLoadingStory, lastUserInteraction]);

  // Sweet female voice speech synthesis
  const triggerSpeech = (textToSpeak: string) => {
    soundEffects.stopSpeaking();
    setIsSpeaking(true);
    setIsCelebrating(true);
    setTimeout(() => setIsCelebrating(false), 900);

    soundEffects.speakText(
      textToSpeak,
      language,
      1.42, // Sweet female storytelling pitch
      language === 'bn' ? 0.94 : 0.98,
      () => {
        setIsSpeaking(false);
      }
    );

    const duration = Math.min(15000, Math.max(3500, textToSpeak.length * 75));
    setTimeout(() => {
      setIsSpeaking(false);
    }, duration);
  };

  const handleSpeakToggle = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isSpeaking) {
      soundEffects.stopSpeaking();
      setIsSpeaking(false);
    } else {
      triggerSpeech(speechBubbleText);
    }
  };

  // Dragging handlers: Mouse and Touch
  const handleDragStart = (clientX: number, clientY: number) => {
    setLastUserInteraction(Date.now());
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: position.x,
      initialY: position.y,
      hasMoved: false,
    };
    setIsDragging(true);

    const handlePointerMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentClientX =
        'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentClientY =
        'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const deltaX = currentClientX - dragRef.current.startX;
      const deltaY = currentClientY - dragRef.current.startY;

      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        dragRef.current.hasMoved = true;
      }

      const nextX = Math.max(
        10,
        Math.min(window.innerWidth - 85, dragRef.current.initialX + deltaX)
      );
      const nextY = Math.max(
        55,
        Math.min(window.innerHeight - 85, dragRef.current.initialY + deltaY)
      );

      setPosition({ x: nextX, y: nextY });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setLastUserInteraction(Date.now());
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);
  };

  const handleMascotClick = () => {
    if (!dragRef.current.hasMoved) {
      setLastUserInteraction(Date.now());
      setIsMinimized(false);
      triggerSpeech(speechBubbleText);
    }
  };

  // Ask Nova a custom or suggested question -> AI Storyteller Narrative!
  const handleAskQuestion = async (queryText: string) => {
    if (!queryText.trim() || isLoadingStory) return;
    setLastUserInteraction(Date.now());
    setIsLoadingStory(true);
    setStoryTopic(queryText);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relicId: 'nova',
          message: queryText,
          language,
        }),
      });
      const data = await res.json();
      const storyReply = data.reply || (language === 'bn'
        ? 'এক সময় সুদূর নীলাভ আকাশে ছোট্ট এক তারা ছিল, যে রাতের বেলা ঘুমন্ত রোবটদের পাহারা দিত...'
        : 'Once upon a time among the quiet starlight, little robots guarded the memories of Earth...');

      setSpeechBubbleText(storyReply);
      triggerSpeech(storyReply);
      setUserQuestion('');
    } catch (e) {
      const fallbackStory = language === 'bn'
        ? 'এক সময় সুদূর লাল গ্রহ মঙ্গলে এক ছোট্ট রোবট বাস করত। ধূলিঝড় আসার আগে সে আকাশের দিকে তাকিয়ে হাসত, যেন জানত তোমরা একদিন তার গল্প শুনবে!'
        : 'Once upon a time on the red dunes of Mars, a little robot rested under the silver stars, knowing that young explorers would remember its journey!';
      setSpeechBubbleText(fallbackStory);
      triggerSpeech(fallbackStory);
    } finally {
      setIsLoadingStory(false);
    }
  };

  // Dynamic layout calculations based on current position
  const isNearBottom =
    typeof window !== 'undefined' ? position.y > window.innerHeight * 0.55 : false;
  const isNearRight =
    typeof window !== 'undefined' ? position.x > window.innerWidth * 0.55 : false;

  return (
    <div
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        // Smooth cinematic glide transition when auto-wandering; instant when user drags
        transition: isDragging
          ? 'none'
          : 'left 2.8s cubic-bezier(0.25, 1, 0.5, 1), top 2.8s cubic-bezier(0.25, 1, 0.5, 1)',
      }}
      className={`fixed z-40 flex flex-col ${
        isNearRight ? 'items-end' : 'items-start'
      } pointer-events-none select-none`}
    >
      {/* Speech & Storytelling Bubble (Placed ABOVE if near bottom, BELOW if near top) */}
      {isNearBottom && !isMinimized && (
        <SpeechStoryBubble
          speechBubbleText={speechBubbleText}
          isSpeaking={isSpeaking}
          language={language}
          storyTopic={storyTopic}
          isLoadingStory={isLoadingStory}
          userQuestion={userQuestion}
          storyStarters={storyStarters}
          isNearRight={isNearRight}
          positionDirection="above"
          setUserQuestion={setUserQuestion}
          onSpeakToggle={handleSpeakToggle}
          onMinimize={() => setIsMinimized(true)}
          onAskQuestion={handleAskQuestion}
        />
      )}

      {/* Mascot Avatar Card with Drag Grip & Floating Thrusters */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <div
          onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
          onTouchStart={(e) => {
            if (e.touches.length > 0) {
              handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          onClick={handleMascotClick}
          title={
            language === 'bn'
              ? 'টেনে যেকোনো জায়গায় সরান বা ক্লিক করে মিষ্টি গল্প শুনুন!'
              : 'Drag anywhere or click to hear sweet cosmic stories!'
          }
          className={`relative group cursor-grab active:cursor-grabbing transition-transform duration-300 ${
            isDragging
              ? 'scale-115 rotate-3 shadow-2xl'
              : isCelebrating
              ? 'scale-120 rotate-6'
              : 'hover:scale-110 active:scale-95'
          }`}
        >
          {/* Floating Thruster Sparkles & Stardust Trail */}
          <div className="absolute -bottom-1.5 left-3 w-3.5 h-3.5 rounded-full bg-cyan-400 blur-[2px] opacity-80 animate-ping" />
          <div className="absolute -bottom-2 left-5 w-2.5 h-2.5 rounded-full bg-amber-300 blur-[1px] opacity-75 animate-pulse" />

          {/* Drag Handle Tag */}
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-cyan-400/60 rounded-full px-2 py-0.5 flex items-center gap-1 text-cyan-300 opacity-80 group-hover:opacity-100 shadow-md">
            <GripHorizontal className="w-3 h-3 text-cyan-400" />
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider hidden sm:inline">
              {language === 'bn' ? 'ভাসমান নোভা' : 'Nova Float'}
            </span>
          </div>

          {/* Mascot SVG Vector - Sweet Girl Astronaut with Golden & Cyan Wings */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 relative animate-float filter drop-shadow-[0_8px_25px_rgba(0,245,212,0.5)]">
            <svg viewBox="0 0 120 120" className="w-full h-full">
              {/* Backpack Thruster */}
              <rect
                x="22"
                y="42"
                width="16"
                height="34"
                rx="8"
                fill="#1E293B"
                stroke="#00F5D4"
                strokeWidth="2"
              />
              <ellipse cx="30" cy="78" rx="5" ry="3" fill="#00F5D4" opacity="0.8" />

              {/* Spacesuit Body with Rose & Cyan Trim */}
              <path
                d="M38 52 C38 40 82 40 82 52 L86 86 C86 92 80 96 74 96 L46 96 C40 96 34 92 34 86 Z"
                fill="#F8FAFC"
                stroke="#0EA5E9"
                strokeWidth="2.5"
              />

              {/* Chest Heart/Core */}
              <rect x="50" y="56" width="20" height="14" rx="4" fill="#0F172A" />
              <path
                d="M57 63 C57 60 63 60 63 63 C63 67 57 69 57 69 C57 69 51 67 51 63 C51 60 57 60 57 63 Z"
                fill="#F43F5E"
                className="animate-pulse"
              />

              {/* Feet / Boots */}
              <ellipse
                cx="46"
                cy="98"
                rx="8"
                ry="5"
                fill="#334155"
                stroke="#00F5D4"
                strokeWidth="1.5"
              />
              <ellipse
                cx="74"
                cy="98"
                rx="8"
                ry="5"
                fill="#334155"
                stroke="#00F5D4"
                strokeWidth="1.5"
              />

              {/* Left Arm */}
              <path
                d="M36 54 C26 60 25 72 32 78"
                fill="none"
                stroke="#F8FAFC"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <circle cx="32" cy="79" r="4.5" fill="#38BDF8" />

              {/* Big Round Helmet */}
              <circle cx="60" cy="38" r="26" fill="#F8FAFC" stroke="#0EA5E9" strokeWidth="3" />
              {/* Helmet Visor with Soft Iridescent Pink/Cyan Sheen */}
              <ellipse
                cx="60"
                cy="38"
                rx="20"
                ry="16"
                fill="#0F172A"
                stroke="#00F5D4"
                strokeWidth="2"
              />
              <path
                d="M45 32 Q60 22 75 32 Q60 48 45 32"
                fill="url(#visorGradientSweet)"
                opacity="0.9"
              />
              {/* Visor Cute Eye Glows */}
              <circle
                cx="53"
                cy="37"
                r="2.5"
                fill={isSpeaking ? '#00F5D4' : '#38BDF8'}
                className="animate-pulse"
              />
              <circle
                cx="67"
                cy="37"
                r="2.5"
                fill={isSpeaking ? '#00F5D4' : '#38BDF8'}
                className="animate-pulse"
              />

              {/* Sweet smile mouth indicator */}
              <path
                d="M56 46 Q60 50 64 46"
                fill="none"
                stroke={isSpeaking ? '#F43F5E' : '#00F5D4'}
                strokeWidth="2"
                strokeLinecap="round"
                className={isSpeaking ? 'animate-pulse' : ''}
              />

              {/* Right Arm (WAVING HAND!) */}
              <g className="animate-wave origin-[78px_50px]">
                <path
                  d="M78 50 C92 42 98 28 92 18"
                  fill="none"
                  stroke="#F8FAFC"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <circle cx="92" cy="16" r="6" fill="#38BDF8" />
                <circle cx="96" cy="13" r="2.5" fill="#00F5D4" />
                <circle cx="93" cy="10" r="2.5" fill="#F43F5E" />
                <circle cx="89" cy="11" r="2.5" fill="#00F5D4" />
              </g>

              {/* Iridescent Sweet Visor Gradient */}
              <defs>
                <linearGradient id="visorGradientSweet" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00F5D4" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#818CF8" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#F472B6" stopOpacity="0.5" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Sweet Voice & Story Badge */}
          <div className="absolute -bottom-1 -right-2 bg-gradient-to-r from-rose-400 via-pink-400 to-cyan-300 text-slate-950 font-black text-[8px] sm:text-[9px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5 border border-white/40">
            <Sparkles className="w-2.5 h-2.5" />
            <span>
              {isSpeaking
                ? language === 'bn'
                  ? 'গল্প বলছে 🎙️'
                  : 'STORY 🎙️'
                : language === 'bn'
                ? 'গল্প শোনো'
                : 'TALES'}
            </span>
          </div>
        </div>

        {/* If Minimized: Re-open Pill */}
        {isMinimized && (
          <button
            onClick={() => {
              setIsMinimized(false);
              triggerSpeech(speechBubbleText);
            }}
            className="pointer-events-auto px-3 py-1.5 rounded-xl bg-slate-900/95 border border-cyan-400/60 text-xs font-bold text-cyan-300 flex items-center gap-1.5 shadow-xl hover:bg-slate-800 transition-all active:scale-95"
          >
            <BookOpen className="w-3.5 h-3.5 text-pink-300" />
            <span>{language === 'bn' ? 'নোভা (গল্প শোনো)' : 'Nova Tales (🎙️)'}</span>
          </button>
        )}
      </div>

      {/* Speech & Storytelling Bubble (Placed BELOW if near top) */}
      {!isNearBottom && !isMinimized && (
        <SpeechStoryBubble
          speechBubbleText={speechBubbleText}
          isSpeaking={isSpeaking}
          language={language}
          storyTopic={storyTopic}
          isLoadingStory={isLoadingStory}
          userQuestion={userQuestion}
          storyStarters={storyStarters}
          isNearRight={isNearRight}
          positionDirection="below"
          setUserQuestion={setUserQuestion}
          onSpeakToggle={handleSpeakToggle}
          onMinimize={() => setIsMinimized(true)}
          onAskQuestion={handleAskQuestion}
        />
      )}
    </div>
  );
}

// Sub-component for Rich Interactive Storytelling Bubble
interface BubbleProps {
  speechBubbleText: string;
  isSpeaking: boolean;
  language: Language;
  storyTopic: string | null;
  isLoadingStory: boolean;
  userQuestion: string;
  storyStarters: Array<{ qEn: string; qBn: string }>;
  isNearRight: boolean;
  positionDirection: 'above' | 'below';
  setUserQuestion: (q: string) => void;
  onSpeakToggle: (e?: React.MouseEvent) => void;
  onMinimize: () => void;
  onAskQuestion: (text: string) => void;
}

function SpeechStoryBubble({
  speechBubbleText,
  isSpeaking,
  language,
  storyTopic,
  isLoadingStory,
  userQuestion,
  storyStarters,
  isNearRight,
  positionDirection,
  setUserQuestion,
  onSpeakToggle,
  onMinimize,
  onAskQuestion,
}: BubbleProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userQuestion.trim()) {
      onAskQuestion(userQuestion);
    }
  };

  return (
    <div
      className={`relative ${
        positionDirection === 'above' ? 'mb-2.5' : 'mt-2.5'
      } max-w-[310px] sm:max-w-sm pointer-events-auto transition-all duration-300 ${
        isNearRight ? 'origin-right' : 'origin-left'
      }`}
    >
      <div className="glass-panel p-3.5 sm:p-4 rounded-3xl shadow-2xl border border-cyan-400/50 text-slate-100 relative group bg-[#091124]/95 backdrop-blur-md">
        {/* Tail Arrow Pointer */}
        {positionDirection === 'below' ? (
          <div
            className={`absolute -top-2 ${
              isNearRight ? 'right-6' : 'left-6'
            } w-3.5 h-3.5 bg-[#091124] border-l border-t border-cyan-400/50 transform rotate-45`}
          />
        ) : (
          <div
            className={`absolute -bottom-2 ${
              isNearRight ? 'right-6' : 'left-6'
            } w-3.5 h-3.5 bg-[#091124] border-r border-b border-cyan-400/50 transform rotate-45`}
          />
        )}

        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-cyan-500/20">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isSpeaking ? 'bg-pink-400 animate-ping' : 'bg-cyan-400'
              }`}
            />
            <span className="text-xs font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 font-space flex items-center gap-1">
              <span>Nova AI Storyteller</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Sweet Voice Button */}
            <button
              onClick={onSpeakToggle}
              title={language === 'bn' ? 'মিষ্টি কণ্ঠে শুনুন' : 'Hear Sweet Voice'}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                isSpeaking
                  ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-slate-950 shadow-md animate-pulse'
                  : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3 h-3" />
                  <span>{language === 'bn' ? 'থামুন' : 'Stop'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3" />
                  <span>{language === 'bn' ? 'শোনো' : 'Listen'}</span>
                </>
              )}
            </button>

            {/* Minimize */}
            <button
              onClick={onMinimize}
              className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Storyline Topic Badge if asked */}
        {storyTopic && (
          <div className="mb-2 px-2.5 py-1 rounded-xl bg-pink-950/40 border border-pink-400/40 text-[10px] font-medium text-pink-200 flex items-center gap-1.5">
            <BookOpen className="w-3 h-3 text-pink-400 flex-shrink-0" />
            <span className="truncate">{storyTopic}</span>
          </div>
        )}

        {/* Loading State or Story Body */}
        {isLoadingStory ? (
          <div className="py-4 flex flex-col items-center justify-center gap-2 text-center text-xs text-pink-300 font-medium">
            <Loader2 className="w-5 h-5 animate-spin text-pink-400" />
            <span>
              {language === 'bn'
                ? 'নোভা একটি জাদুকরী মহাকাশ গল্প তৈরি করছে... ✨'
                : 'Nova is weaving a starry bedtime story... ✨'}
            </span>
          </div>
        ) : (
          <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-100 italic">
            "{speechBubbleText}"
          </p>
        )}

        {/* Melodic Audio Waves Animation */}
        {isSpeaking && (
          <div className="flex items-center gap-1.5 mt-2.5 pt-1.5 border-t border-pink-400/20">
            <span className="text-[9px] text-pink-300 font-mono">STORY VOICE:</span>
            <div className="flex items-center gap-0.5 h-3">
              <span className="w-1 bg-pink-400 h-2.5 animate-bounce rounded-full" />
              <span className="w-1 bg-purple-400 h-3 animate-bounce [animation-delay:100ms] rounded-full" />
              <span className="w-1 bg-cyan-300 h-1.5 animate-bounce [animation-delay:200ms] rounded-full" />
              <span className="w-1 bg-rose-400 h-3 animate-bounce [animation-delay:300ms] rounded-full" />
              <span className="w-1 bg-amber-300 h-2 animate-bounce [animation-delay:400ms] rounded-full" />
            </div>
          </div>
        )}

        {/* Interactive Storyteller Q&A Form: Ask anything to Nova */}
        <form onSubmit={handleSubmit} className="mt-3 pt-2 border-t border-slate-800 flex gap-1.5">
          <input
            type="text"
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'নোভাকে প্রশ্ন করো... ও গল্প শোনাবে ✨'
                : 'Ask Nova a question for a story... ✨'
            }
            className="flex-1 bg-slate-900/90 border border-slate-700 focus:border-pink-400 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!userQuestion.trim() || isLoadingStory}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-400 to-cyan-400 text-slate-950 font-bold text-xs disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Suggested Story Starters */}
        <div className="mt-2.5">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Compass className="w-2.5 h-2.5 text-cyan-400" />
            <span>{language === 'bn' ? 'গল্পের বিষয় বেছে নাও:' : 'Choose a story topic:'}</span>
          </div>
          <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1">
            {storyStarters.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onAskQuestion(language === 'bn' ? item.qBn : item.qEn)}
                className="text-[10px] px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/90 text-cyan-200 hover:text-white border border-slate-700 hover:border-pink-400/50 transition-all text-left flex items-center gap-1.5"
              >
                <Sparkles className="w-2.5 h-2.5 text-pink-400 flex-shrink-0" />
                <span className="truncate">{language === 'bn' ? item.qBn : item.qEn}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
