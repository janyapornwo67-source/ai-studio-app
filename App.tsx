
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Copy, 
  RotateCcw, 
  ChevronRight, 
  Check, 
  AlertCircle,
  MessageSquare,
  ArrowRightLeft,
  Clock,
  Info,
  Menu,
  History as HistoryIcon
} from 'lucide-react';
import { TONE_OPTIONS } from './constants';
import { ToneType, AdjustmentResult } from './types';
import { adjustThaiTone } from './geminiService';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [scenario, setScenario] = useState('');
  const [selectedTone, setSelectedTone] = useState<ToneType>('polite');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(9);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AdjustmentResult[]>([]);
  const [lastResult, setLastResult] = useState<AdjustmentResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Timer logic for the 9-second run requirement
  useEffect(() => {
    let interval: number | undefined;
    if (isLoading && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
        setProgress((prev) => Math.min(100, prev + (100 / 9)));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLoading, timeLeft]);

  const handleAdjust = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    setCopied(false);
    setProgress(0);
    setTimeLeft(9);

    try {
      // Create a promise that resolves after 9 seconds
      const nineSecondWait = new Promise(resolve => setTimeout(resolve, 9000));
      
      // Run both the API call and the timer
      const [adjusted] = await Promise.all([
        adjustThaiTone(inputText, selectedTone, scenario),
        nineSecondWait
      ]);

      const newResult: AdjustmentResult = {
        original: inputText,
        scenario: scenario.trim() || undefined,
        adjusted,
        tone: selectedTone
      };
      setLastResult(newResult);
      setHistory(prev => [newResult, ...prev.slice(0, 9)]);
      
      // Scroll to result on small screens
      if (window.innerWidth < 1024) {
        window.scrollTo({ top: document.getElementById('result-section')?.offsetTop ? document.getElementById('result-section')!.offsetTop - 80 : 0, behavior: 'smooth' });
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการปรับโทนภาษา กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
      setProgress(0);
      setTimeLeft(9);
    }
  }, [inputText, scenario, selectedTone, isLoading]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    if (isLoading) return;
    setInputText('');
    setScenario('');
    setLastResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-6xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-sky-600 rounded-xl flex items-center justify-center shadow-sky-200 shadow-lg shrink-0">
              <Sparkles className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="overflow-hidden">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 leading-tight truncate">Thai Tone Master</h1>
              <p className="hidden xs:block text-[10px] sm:text-xs text-slate-500 font-medium tracking-wide uppercase truncate">AI-Refining Engine</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
             <div className="hidden sm:flex items-center gap-2 bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100">
                <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-sky-600 uppercase">9s Processing Enabled</span>
             </div>
             <button className="sm:hidden p-2 text-slate-500">
               <Menu className="w-5 h-5" />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4 sm:py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          {/* Left Side: Input & Configuration */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-800">
                  <MessageSquare className="w-5 h-5 text-sky-600" />
                  ข้อความที่ต้องการปรับปรุง
                </h2>
                <button 
                  onClick={clearAll}
                  disabled={isLoading}
                  className="text-slate-400 hover:text-red-500 transition-colors p-2 -mr-2 rounded-lg hover:bg-slate-50 disabled:opacity-30"
                  aria-label="ล้างข้อความ"
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              
              <textarea
                className="w-full min-h-[140px] sm:min-h-[160px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all resize-none text-slate-700 leading-relaxed text-sm sm:text-base placeholder:text-slate-400"
                placeholder="พิมพ์หรือวางข้อความภาษาไทย..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
              />

              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-600 flex items-center gap-2">
                    <Info className="w-4 h-4 text-sky-400" />
                    บริบทหรือสถานการณ์
                    <span className="text-[9px] sm:text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">Optional</span>
                  </h3>
                </div>
                <textarea
                  className="w-full h-20 sm:h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all resize-none text-xs sm:text-sm text-slate-600 placeholder:text-slate-400"
                  placeholder="เช่น ตอบกลับเจ้านายเรื่องรายงานการประชุม..."
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div className="mt-3 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-medium italic">* แนะนำให้ระบุบริบทเพื่อความแม่นยำยิ่งขึ้น</span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{inputText.length} chars</span>
              </div>
            </section>

            <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md">
              <h2 className="text-base sm:text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
                <ArrowRightLeft className="w-5 h-5 text-sky-600" />
                เลือกโทนภาษา
              </h2>
              
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                {TONE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedTone(option.id)}
                    disabled={isLoading}
                    className={`flex flex-col items-start p-3 sm:p-4 rounded-xl border-2 text-left transition-all active:scale-[0.98] relative overflow-hidden group ${
                      selectedTone === option.id 
                      ? 'border-sky-500 bg-sky-100 ring-1 ring-sky-500 shadow-sm' 
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xl sm:text-2xl transition-transform group-hover:scale-110 duration-300">{option.icon}</span>
                      <span className={`font-bold text-xs sm:text-sm ${selectedTone === option.id ? 'text-sky-800' : 'text-slate-700'}`}>
                        {option.label}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-500 leading-snug">
                      {option.description}
                    </p>
                    {selectedTone === option.id && (
                      <div className="absolute top-1 right-1">
                        <div className="bg-sky-600 rounded-full p-0.5 shadow-sm">
                          <Check className="w-2 h-2 text-white" strokeWidth={4} />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                {isLoading && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold text-sky-600 uppercase tracking-widest">
                      <span className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 animate-[spin_3s_linear_infinite]" />
                        กำลังขัดเกลาด้วย AI อัจฉริยะ...
                      </span>
                      <span className="bg-sky-100 px-2 py-0.5 rounded">เหลืออีก {timeLeft} วินาที</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 sm:h-3 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-sky-500 to-sky-700 h-full transition-all duration-1000 ease-linear shadow-[0_0_12px_rgba(14,165,233,0.4)] relative"
                        style={{ width: `${progress}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]"></div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAdjust}
                  disabled={isLoading || !inputText.trim()}
                  className={`w-full py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 group overflow-hidden relative ${
                    isLoading || !inputText.trim()
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-sky-600 text-white hover:bg-sky-700 shadow-sky-200/50 hover:shadow-sky-300/60'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-4">
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="tracking-tight">ประมวลผลภายใน 9 วินาที...</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12" />
                      ปรับโทนด้วย AI ทันที
                    </>
                  )}
                </button>
              </div>
            </section>
          </div>

          {/* Right Side: Result & History */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8" id="result-section">
            <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-sky-100 min-h-[340px] flex flex-col relative overflow-hidden transition-all hover:shadow-xl">
              {isLoading && (
                 <div className="absolute inset-0 bg-white/90 backdrop-blur-[4px] z-20 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sky-50 rounded-full flex items-center justify-center mb-6 relative">
                      <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-sky-600 animate-pulse" />
                      <div className="absolute inset-0 border-3 border-sky-100 border-t-sky-600 rounded-full animate-spin"></div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">กำลังรังสรรค์ภาษา</h3>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-[240px] mx-auto leading-relaxed">AI กำลังเลือกสรรคำที่เหมาะสมที่สุด เพื่อรักษาความหมายเดิมและเพิ่มพลังการสื่อสาร</p>
                 </div>
              )}

              <h2 className="text-base sm:text-lg font-bold mb-5 text-slate-800 flex items-center gap-2">
                <div className="bg-green-100 p-1.5 rounded-lg">
                  <Check className="w-4 h-4 text-green-600" strokeWidth={3} />
                </div>
                ข้อความที่ปรับปรุงแล้ว
              </h2>

              {error ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-red-50 rounded-2xl border border-red-100">
                  <div className="bg-red-100 p-3 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-red-700 font-bold mb-2">เกิดข้อผิดพลาด</p>
                  <p className="text-xs text-red-600 mb-6">{error}</p>
                  <button onClick={handleAdjust} className="px-6 py-2 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors shadow-sm active:scale-95">
                    ลองใหม่อีกครั้ง
                  </button>
                </div>
              ) : lastResult ? (
                <div className="flex-1 flex flex-col animate-in zoom-in-95 fade-in duration-500 slide-in-from-bottom-4">
                  <div className="flex-1 p-5 sm:p-6 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 leading-relaxed font-medium shadow-inner text-sm sm:text-base selection:bg-sky-200">
                    {lastResult.adjusted}
                  </div>
                  
                  {lastResult.scenario && (
                    <div className="mt-4 p-3.5 bg-sky-50/50 border border-sky-100/50 rounded-xl flex items-start gap-3">
                      <div className="mt-0.5"><Info className="w-3.5 h-3.5 text-sky-400" /></div>
                      <div className="overflow-hidden">
                        <span className="text-[9px] font-bold text-sky-400 uppercase tracking-wider block mb-0.5">สถานการณ์ที่ใช้:</span>
                        <p className="text-[11px] text-sky-700/80 italic line-clamp-2 leading-relaxed font-medium">"{lastResult.scenario}"</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => copyToClipboard(lastResult.adjusted)}
                      className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold transition-all active:scale-95 shadow-md ${
                        copied 
                        ? 'bg-green-500 text-white shadow-green-100' 
                        : 'bg-white border-2 border-slate-100 text-slate-700 hover:border-sky-200 hover:bg-sky-50 shadow-slate-100'
                      }`}
                    >
                      {copied ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5" />}
                      <span className="text-sm sm:text-base">{copied ? 'คัดลอกสำเร็จ' : 'คัดลอกข้อความ'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center mb-5 opacity-50 shadow-inner">
                    <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-sky-300" />
                  </div>
                  <h4 className="text-slate-600 font-bold mb-1 text-sm sm:text-base">พร้อมรอปรับปรุง...</h4>
                  <p className="text-xs max-w-[180px] leading-relaxed">ผลลัพธ์ที่สมบูรณ์แบบจะปรากฏที่นี่ หลังการประมวลผลแม่นยำ 9 วินาที</p>
                </div>
              )}
            </section>

            {/* History List */}
            <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <HistoryIcon className="w-3.5 h-3.5" />
                  ประวัติล่าสุด
                </h2>
                <span className="text-[10px] font-bold text-slate-300">MAX 10</span>
              </div>
              
              <div className="space-y-3.5 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-1.5 custom-scrollbar">
                {history.length > 0 ? (
                  history.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-white transition-all cursor-pointer group shadow-sm active:scale-[0.98]"
                      onClick={() => {
                        if (isLoading) return;
                        setLastResult(item);
                        setInputText(item.original);
                        setScenario(item.scenario || '');
                        setSelectedTone(item.tone);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] sm:text-[10px] font-extrabold bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-500 group-hover:text-sky-600 group-hover:border-sky-200 transition-colors">
                          {TONE_OPTIONS.find(o => o.id === item.tone)?.label.split(' ')[0]}
                        </span>
                        <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-sky-500 transition-colors" />
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 italic leading-relaxed font-medium">"{item.adjusted}"</p>
                      {item.scenario && (
                         <div className="flex items-center gap-1.5 mt-2 opacity-60">
                            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                            <p className="text-[9px] font-bold text-slate-400 truncate tracking-tight">{item.scenario}</p>
                         </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center flex flex-col items-center">
                    <HistoryIcon className="w-8 h-8 text-slate-100 mb-2" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ยังไม่มีประวัติการใช้งาน</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-4 mt-8 sm:mt-12">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
          <div className="text-center md:text-left">
            <p className="text-[10px] sm:text-xs font-black text-slate-800 tracking-[0.2em] uppercase mb-1">© 2024 THAI TONE MASTER</p>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wide">PRECISION AI COPYWRITING FOR THAI LANGUAGE</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-sky-600 transition-colors py-2">Privacy</a>
            <a href="#" className="hover:text-sky-600 transition-colors py-2">Terms</a>
            <a href="#" className="hover:text-sky-600 transition-colors py-2">Contact</a>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
             <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-tighter">System Robust & Optimized</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;