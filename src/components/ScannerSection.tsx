import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  CameraOff,
  ScanLine,
  ShieldCheck,
  AlertTriangle,
  Clock,
  UserCheck,
  Barcode,
  Search,
  CheckCircle2,
  Zap,
  Upload,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Student, SubjectItem, AttendanceRecord } from '../types';
import { soundEffects } from '../utils/audio';

interface ScannerSectionProps {
  students: Student[];
  currentSubject: SubjectItem;
  attendance: AttendanceRecord[];
  onAttendanceAdded: (record: AttendanceRecord) => void;
}

export const ScannerSection: React.FC<ScannerSectionProps> = ({
  students,
  currentSubject,
  attendance,
  onAttendanceAdded,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  
  // Security 5-minute cooldown state
  const [cooldownAlert, setCooldownAlert] = useState<{
    barcode: string;
    studentName: string;
    remainingMs: number;
    formattedTime: string;
  } | null>(null);

  // Success confirmation state
  const [recentScanSuccess, setRecentScanSuccess] = useState<{
    student: Student;
    time: string;
  } | null>(null);

  // General error state (e.g., student not found)
  const [generalError, setGeneralError] = useState<string | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const readerElementId = 'barcode-scanner-viewport';

  // Tick down remaining cooldown time every second
  useEffect(() => {
    if (!cooldownAlert) return;
    const interval = setInterval(() => {
      setCooldownAlert((prev) => {
        if (!prev) return null;
        const newRemaining = prev.remainingMs - 1000;
        if (newRemaining <= 0) {
          return null; // Cooldown expired
        }
        const mins = Math.floor(newRemaining / 60000);
        const secs = Math.floor((newRemaining % 60000) / 1000);
        return {
          ...prev,
          remainingMs: newRemaining,
          formattedTime: `${mins} دقيقة و ${secs < 10 ? '0' : ''}${secs} ثانية`,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownAlert]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            html5QrCodeRef.current.stop().catch(() => {});
          }
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Main barcode verification & attendance logic with 5-minute security constraint
  const handleBarcodeScanned = (scannedRaw: string) => {
    const raw = scannedRaw.trim();
    if (!raw) return;

    // Normalize barcode string
    const normalizedBarcode = raw.toUpperCase();

    // 1. Match barcode to student roster
    const student = students.find(
      (s) =>
        s.barcode.toUpperCase() === normalizedBarcode ||
        s.sequence.toUpperCase() === normalizedBarcode ||
        s.sequence.padStart(2, '0') === normalizedBarcode ||
        s.id.toUpperCase() === normalizedBarcode
    );

    if (!student) {
      soundEffects.playError();
      setGeneralError(`الرمز "${raw}" غير مرتبط بأي طالب في قسم هندسة الأمن السيبراني - المرحلة الثانية!`);
      setCooldownAlert(null);
      setRecentScanSuccess(null);
      return;
    }

    // 2. Enforce 5-Minute Cooldown Rule (300,000 ms)
    const now = Date.now();
    const COOLDOWN_DURATION = 5 * 60 * 1000; // 5 minutes

    const studentRecords = attendance.filter(
      (r) => r.studentBarcode.toUpperCase() === student.barcode.toUpperCase()
    );

    if (studentRecords.length > 0) {
      const latestRecord = studentRecords[0]; // sorted latest first
      const elapsed = now - latestRecord.timestamp;

      if (elapsed < COOLDOWN_DURATION) {
        // Violates 5-minute security rule!
        const remainingMs = COOLDOWN_DURATION - elapsed;
        const mins = Math.floor(remainingMs / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        const formattedTime = `${mins} دقيقة و ${secs < 10 ? '0' : ''}${secs} ثانية`;

        soundEffects.playWarning();
        setCooldownAlert({
          barcode: student.barcode,
          studentName: student.name,
          remainingMs,
          formattedTime,
        });
        setGeneralError(null);
        setRecentScanSuccess(null);
        return;
      }
    }

    // 3. Register attendance successfully!
    const dateObj = new Date();
    const dateStr = dateObj.toISOString().split('T')[0];
    const timeStr = dateObj.toLocaleTimeString('ar-IQ', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const newRecord: AttendanceRecord = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      studentId: student.id,
      studentBarcode: student.barcode,
      studentName: student.name,
      studentSequence: student.sequence,
      department: student.department,
      stage: student.stage,
      subject: currentSubject.name,
      instructor: currentSubject.instructor,
      timestamp: now,
      dateStr,
      timeStr,
      status: 'حاضر',
    };

    onAttendanceAdded(newRecord);
    soundEffects.playSuccess();

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#06b6d4', '#10b981', '#38bdf8'],
      });
    } catch {
      // confetti optional
    }

    setRecentScanSuccess({
      student,
      time: timeStr,
    });
    setCooldownAlert(null);
    setGeneralError(null);
    setManualCode('');

    // Re-focus input for next physical gun scan
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const startCamera = async (facing: 'environment' | 'user' = cameraFacingMode) => {
    setCameraError(null);
    setCameraStarting(true);

    try {
      // Stop previous scanner if running
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            await html5QrCodeRef.current.stop();
          }
          await html5QrCodeRef.current.clear();
        } catch {
          // ignore
        }
      }

      // Allow DOM to update and element to be visible with dimensions
      await new Promise((r) => setTimeout(r, 100));

      const qrCodeInstance = new Html5Qrcode(readerElementId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
        ],
        verbose: false,
      });

      html5QrCodeRef.current = qrCodeInstance;

      const qrCodeSuccessCallback = (decodedText: string) => {
        handleBarcodeScanned(decodedText);
      };

      await qrCodeInstance.start(
        { facingMode: facing },
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            return {
              width: Math.floor(minEdge * 0.75),
              height: Math.floor(minEdge * 0.75),
            };
          },
        },
        qrCodeSuccessCallback,
        () => {} // frame without barcode
      );

      setIsScanning(true);
      setCameraStarting(false);
    } catch (err: unknown) {
      console.error('Camera init error:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setCameraError(
        `تعذر الوصول إلى كاميرا الجهاز (${errMsg}). يمكنك استخدام "مسح من صورة" أو جهاز ماسح الباركود USB أو النقر على الطالب في القائمة أدناه.`
      );
      setIsScanning(false);
      setCameraStarting(false);
    }
  };

  const stopCamera = async () => {
    setCameraStarting(false);
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Failed to stop camera:', err);
      }
    }
    setIsScanning(false);
  };

  const handleFlipCamera = async () => {
    const nextFacing = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextFacing);
    if (isScanning) {
      await stopCamera();
      await startCamera(nextFacing);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(readerElementId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
          ],
          verbose: false,
        });
      }

      const decodedText = await html5QrCodeRef.current.scanFile(file, true);
      handleBarcodeScanned(decodedText);
    } catch (err) {
      setGeneralError('لم يتم العثور على باركود أو QR صالح في الصورة المحددة.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleBarcodeScanned(manualCode.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Lecture Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 to-cyan-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3 text-center sm:text-right">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/40 font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">المحاضرة النشطة لتسجيل الحضور:</div>
            <div className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>{currentSubject.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {currentSubject.instructor}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>شرط الأمان مفعل: منع تكرار الباركود خلال 5 دقائق</span>
        </div>
      </div>

      {/* Security Cooldown Alert Modal / Banner */}
      {cooldownAlert && (
        <div className="p-5 rounded-2xl bg-rose-950/70 border-2 border-rose-500 shadow-2xl shadow-rose-900/50 text-rose-200 animate-cyber-pulse">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex-shrink-0">
              <AlertTriangle className="w-8 h-8 animate-bounce" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>⛔ تنبيه أمني مشدد: تم تسجيل الحضور مسبقاً!</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/30 text-rose-300 border border-rose-400/50">
                  كود الحماية 5 دقائق
                </span>
              </div>
              <p className="text-sm font-semibold text-rose-200 leading-relaxed">
                الطالب <strong className="text-white underline decoration-rose-400 underline-offset-4 text-base font-black">({cooldownAlert.studentName})</strong> صاحب الرمز <code className="bg-rose-900/50 px-2 py-0.5 rounded text-white font-mono">{cooldownAlert.barcode}</code> مسجل بالفعل في هذه المحاضرة. لا يمكن قبول نفس الباركود مجدداً إلا بعد مرور 5 دقائق من التسجيل الأول لمنع التكرار والتلاعب.
              </p>
              
              <div className="mt-3 p-3 rounded-xl bg-black/50 border border-rose-500/30 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-400" />
                  الوقت المتبقي لفتح صلاحية إعادة المسح:
                </span>
                <span className="text-lg font-mono font-black text-rose-400 tracking-wider">
                  {cooldownAlert.formattedTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {recentScanSuccess && (
        <div className="p-5 rounded-2xl bg-emerald-950/70 border-2 border-emerald-500 shadow-2xl shadow-emerald-900/40 text-emerald-200 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <UserCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                تم تسجيل الحضور بنجاح في النظام!
              </div>
              <div className="text-xl font-black text-white mt-0.5">
                {recentScanSuccess.student.name}
              </div>
              <div className="text-xs text-slate-300 flex items-center gap-3 mt-1">
                <span>التسلسل: <strong className="text-emerald-400">{recentScanSuccess.student.sequence}</strong></span>
                <span>الباركود: <code className="text-cyan-300 font-mono">{recentScanSuccess.student.barcode}</code></span>
                <span>وقت المسح: <span className="text-slate-200">{recentScanSuccess.time}</span></span>
              </div>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-300">
            حالة الحضور: حاضر (مؤكد)
          </div>
        </div>
      )}

      {/* General Error Banner */}
      {generalError && (
        <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-500/60 text-amber-200 text-sm font-bold flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Camera & Scanner Viewport */}
        <div className="lg:col-span-7 space-y-4">
          <div className="cyber-glass-card rounded-2xl p-5 border border-cyan-500/25">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-black text-white">ماسح الباركود و QR المباشر</h2>
              </div>
              <div className="flex items-center gap-2">
                {isScanning && (
                  <button
                    onClick={handleFlipCamera}
                    title="تبديل الكاميرا (أمامية / خلفية)"
                    className="p-2 rounded-xl text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-900/50 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="مسح من ملف صورة"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-cyan-300 bg-slate-900 border border-slate-700 hover:border-cyan-400 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>مسح من صورة</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {!isScanning ? (
                  <button
                    onClick={() => startCamera()}
                    disabled={cameraStarting}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{cameraStarting ? 'جاري التشغيل...' : 'تشغيل كاميرا الماسح'}</span>
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-rose-600 text-white hover:bg-rose-500 transition-all cursor-pointer"
                  >
                    <CameraOff className="w-4 h-4" />
                    <span>إيقاف الكاميرا</span>
                  </button>
                )}
              </div>
            </div>

            {/* Camera Viewport Container */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-cyan-500/40 min-h-[300px] flex items-center justify-center">
              {/* HTML5 QR Code Mount Element - always present with explicit sizing */}
              <div
                id={readerElementId}
                className="w-full min-h-[300px]"
                style={{ display: isScanning ? 'block' : 'none' }}
              />

              {!isScanning && (
                <div className="text-center p-6 space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Barcode className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">الكاميرا في وضع الاستعداد</h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                      اضغط "تشغيل كاميرا الماسح" لمسح باركود الطالب، أو استخدم قارئ الباركود USB، أو انقر على الطالب من القائمة.
                    </p>
                  </div>
                  <button
                    onClick={() => startCamera()}
                    disabled={cameraStarting}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 shadow-lg shadow-cyan-500/20 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{cameraStarting ? 'جاري الاتصال بالكاميرا...' : 'تشغيل الكاميرا الآن'}</span>
                  </button>
                </div>
              )}

              {/* Laser animation overlay while scanning */}
              {isScanning && (
                <div className="absolute inset-x-8 h-0.5 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-scan-laser pointer-events-none z-10" />
              )}
            </div>

            {cameraError && (
              <div className="mt-3 p-3 rounded-xl bg-amber-950/50 border border-amber-500/40 text-xs text-amber-200 font-semibold space-y-1">
                <div>{cameraError}</div>
                <div className="text-slate-400 text-[11px]">
                  💡 نصيحة: إذا كنت تتصفح من متصفح يمنع إذن الكاميرا داخل الإطار، يمكنك استخدام زر <b>"مسح من صورة"</b>، أو إدخال الرمز في الحقل أدناه، أو النقر على زر <b>"مسح فوري"</b> بجانب اسم الطالب.
                </div>
              </div>
            )}

            {/* Hardware Scanner Gun / Manual Input */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <form onSubmit={handleManualSubmit} className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 text-right">
                  قارئ الباركود اللاسلكي / USB أو الإدخال اليدوي:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                      <Barcode className="w-4 h-4" />
                    </div>
                    <input
                      ref={inputRef}
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="امسح بالماسح الضوئي (Gun) أو اكتب الكود واضغط Enter..."
                      dir="ltr"
                      className="w-full pl-3 pr-9 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:brightness-110 cursor-pointer"
                  >
                    تسجيل
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  يدعم مباشرة أجهزة ماسحات الباركود USB (Barcode Scanners) التي تقرأ الكود وتضغط Enter تلقائياً.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Right: Quick Simulator & Student List for Testing */}
        <div className="lg:col-span-5 space-y-4">
          <div className="cyber-glass-card rounded-2xl p-5 border border-cyan-500/25 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-black text-white">محاكي المسح السريع للطلبة</h2>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-cyan-500/30">
                {students.length} طالب
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              يمكن للأستاذ النقر على زر <span className="text-cyan-300 font-bold">"مسح فوري"</span> لمحاكاة مسح باركود الطالب وتجربة شرط الـ 5 دقائق:
            </p>

            <div className="flex-1 overflow-y-auto max-h-[460px] pr-1 space-y-2">
              {students.map((student) => {
                const studentRecords = attendance.filter(
                  (r) => r.studentBarcode.toUpperCase() === student.barcode.toUpperCase()
                );
                const isPresent = studentRecords.length > 0;
                const lastRecord = studentRecords[0];

                return (
                  <div
                    key={student.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">
                        {student.sequence}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {student.name}
                        </div>
                        <div className="text-[11px] font-mono text-cyan-400/90 flex items-center gap-2">
                          <span>{student.barcode}</span>
                          {isPresent && (
                            <span className="text-emerald-400 font-sans font-semibold text-[10px]">
                              (حاضر {lastRecord.timeStr})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBarcodeScanned(student.barcode)}
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500 hover:text-slate-950 transition-all cursor-pointer"
                    >
                      مسح فوري
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attendance Log (Quick View) */}
      <div className="cyber-glass-card rounded-2xl p-5 border border-cyan-500/25">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-black text-white">آخر الطلاب المسجلين في الجلسة الحالية</h2>
          </div>
          <span className="text-xs text-slate-400">
            إجمالي الحاضرين اليوم: <strong className="text-emerald-400 font-bold">{attendance.length}</strong>
          </span>
        </div>

        {attendance.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs font-medium border border-dashed border-slate-800 rounded-xl">
            لم يتم تسجيل أي حضور حتى الآن في هذه الجلسة. ابدأ بمسح الباركود أعلاه.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-bold pr-2">#</th>
                  <th className="pb-3 font-bold">اسم الطالب الثلاثي</th>
                  <th className="pb-3 font-bold">رمز الباركود</th>
                  <th className="pb-3 font-bold">المادة</th>
                  <th className="pb-3 font-bold">وقت التسجيل</th>
                  <th className="pb-3 font-bold pl-2">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {attendance.slice(0, 6).map((rec, idx) => (
                  <tr key={rec.id} className="hover:bg-slate-900/50">
                    <td className="py-2.5 pr-2 font-mono text-cyan-400 font-bold">
                      {rec.studentSequence || idx + 1}
                    </td>
                    <td className="py-2.5 font-bold text-white">{rec.studentName}</td>
                    <td className="py-2.5 font-mono text-slate-300">{rec.studentBarcode}</td>
                    <td className="py-2.5 text-slate-300">{rec.subject}</td>
                    <td className="py-2.5 text-slate-300 font-mono">{rec.timeStr}</td>
                    <td className="py-2.5 pl-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
