import React from 'react';
import { Shield, Sparkles, Volume2, VolumeX, LogOut, Printer, Download, BookOpen } from 'lucide-react';
import { SubjectItem, ActiveTab } from '../types';

interface NavbarProps {
  subjects: SubjectItem[];
  selectedSubject: SubjectItem;
  onSelectSubject: (s: SubjectItem) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onLogout: () => void;
  onPrintSheet: () => void;
  onExportHTML: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  subjects,
  selectedSubject,
  onSelectSubject,
  activeTab,
  setActiveTab,
  soundEnabled,
  onToggleSound,
  onLogout,
  onPrintSheet,
  onExportHTML,
}) => {
  return (
    <header className="no-print sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          {/* Brand & College identity */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 text-slate-950 shadow-lg shadow-cyan-500/25 border border-cyan-400/40">
              <Shield className="w-7 h-7 text-slate-950" />
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-slate-950"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                  كلية اليرموك الجامعة
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  المرحلة الثانية
                </span>
              </div>
              <p className="text-xs text-cyan-400/80 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                قسم هندسة تكنولوجيا الأمن السيبراني
              </p>
            </div>
          </div>

          {/* Subject & Instructor Selector */}
          <div className="hidden md:flex items-center gap-2 bg-slate-900/90 border border-cyan-500/30 rounded-xl p-1.5 px-3">
            <BookOpen className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <div className="flex flex-col text-right">
              <label htmlFor="active-subject-select" className="text-[10px] text-slate-400 font-bold">المادة والأستاذ الحالية:</label>
              <select
                id="active-subject-select"
                aria-label="المادة والأستاذ الحالية"
                value={selectedSubject.id}
                onChange={(e) => {
                  const found = subjects.find((s) => s.id === e.target.value);
                  if (found) onSelectSubject(found);
                }}
                className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer pr-1"
              >
                {subjects.map((subj) => (
                  <option key={subj.id} value={subj.id} className="bg-slate-900 text-slate-100">
                    {subj.name} - {subj.instructor}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onPrintSheet}
              title="طباعة استمارة الحضور"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-slate-200 border border-slate-700 hover:border-cyan-500/50 hover:text-cyan-300 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>طباعة الكشف</span>
            </button>

            <button
              onClick={onExportHTML}
              title="تحميل كود كامل ملف واحد HTML مستقل"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/50 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>ملف HTML كامل</span>
            </button>

            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'كتم الصوت' : 'تفعيل الصوت'}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20'
                  : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onLogout}
              title="تسجيل الخروج"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-950/40 text-rose-300 border border-rose-500/30 hover:bg-rose-900/40 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>

        {/* Mobile Subject Selector */}
        <div className="md:hidden pb-3">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-cyan-500/30 rounded-lg p-2">
            <BookOpen className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <select
              aria-label="المادة والأستاذ الحالية"
              value={selectedSubject.id}
              onChange={(e) => {
                const found = subjects.find((s) => s.id === e.target.value);
                if (found) onSelectSubject(found);
              }}
              className="bg-transparent text-xs font-bold text-white outline-none w-full"
            >
              {subjects.map((subj) => (
                <option key={subj.id} value={subj.id} className="bg-slate-900 text-slate-100">
                  {subj.name} - {subj.instructor}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-1 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'scanner'
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            ماسح الباركود و QR
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            سجل الحضور اليومي
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'students'
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            لوحة تحكم الطلاب
          </button>

          <button
            onClick={() => setActiveTab('cards')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'cards'
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            هويات وباركودات الطلبة
          </button>
        </div>
      </div>
    </header>
  );
};
