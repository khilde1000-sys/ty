import React from 'react';
import { Printer, X, Download, Shield, FileText } from 'lucide-react';
import { Student, AttendanceRecord, SubjectItem } from '../types';
import { BarcodeSvg, QRCodeSvg } from '../utils/barcodeGenerator';

// Printable Attendance Report Sheet
export const AttendanceReportPrint: React.FC<{
  records: AttendanceRecord[];
  subject: SubjectItem;
  dateStr: string;
  onClose: () => void;
}> = ({ records, subject, dateStr, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md p-4 flex justify-center">
      <div className="relative w-full max-w-4xl bg-white text-black p-8 rounded-2xl shadow-2xl my-8 font-sans">
        {/* Screen Controls */}
        <div className="no-print flex items-center justify-between pb-6 mb-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-cyan-600" />
            <h3 className="text-base font-bold text-gray-900">
              معاينة طباعة استمارة الحضور الرسمية (كلية اليرموك الجامعة)
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-5 py-2 rounded-xl text-xs font-black bg-cyan-600 text-white hover:bg-cyan-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>إرسال إلى الطابعة / حفظ PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-500 hover:text-black hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document */}
        <div className="print-container">
          {/* Official Letterhead */}
          <div className="text-center pb-4 border-b-2 border-black mb-6">
            <div className="flex justify-between items-center px-4">
              <div className="text-right text-xs font-bold leading-5">
                <div>جمهورية العراق</div>
                <div>وزارة التعليم العالي والبحث العلمي</div>
                <div>كلية اليرموك الجامعة</div>
              </div>
              <div className="text-center">
                <div className="inline-block p-2 border-2 border-black rounded-full mb-1">
                  <Shield className="w-8 h-8 text-black" />
                </div>
                <h1 className="text-lg font-black text-black">كلية اليرموك الجامعة</h1>
                <div className="text-xs font-bold text-gray-800">
                  قسم هندسة تكنولوجيا الأمن السيبراني
                </div>
              </div>
              <div className="text-left text-xs font-bold leading-5" dir="ltr">
                <div>Al-Yarmouk Univ. College</div>
                <div>Cybersecurity Eng. Dept.</div>
                <div>Stage 2 - Attendance</div>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-gray-300">
              <h2 className="text-base font-black underline underline-offset-8">
                استمارة تسجيل الحضور اليومي للمحاضرات (المرحلة الثانية)
              </h2>
            </div>
          </div>

          {/* Lecture Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-gray-50 border border-gray-300 rounded mb-6 text-xs font-bold">
            <div>
              <span className="text-gray-600">المادة الدراسية: </span>
              <span className="text-black">{subject.name}</span>
            </div>
            <div>
              <span className="text-gray-600">أستاذ المادة: </span>
              <span className="text-black">{subject.instructor}</span>
            </div>
            <div>
              <span className="text-gray-600">التاريخ: </span>
              <span className="font-mono text-black">{dateStr}</span>
            </div>
            <div>
              <span className="text-gray-600">إجمالي الحضور: </span>
              <span className="text-black">{records.length} طالب</span>
            </div>
          </div>

          {/* Official Attendance Table */}
          <table className="print-table w-full text-right text-xs mb-8">
            <thead>
              <tr className="bg-gray-100 border border-black">
                <th className="p-2 border border-black w-10 text-center">ت</th>
                <th className="p-2 border border-black">اسم الطالب الثلاثي</th>
                <th className="p-2 border border-black w-28 text-center font-mono">الباركود</th>
                <th className="p-2 border border-black w-24 text-center font-mono">وقت المسح</th>
                <th className="p-2 border border-black w-20 text-center">الحالة</th>
                <th className="p-2 border border-black w-32 text-center">توقيع الطالب</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500 border border-black">
                    لا يوجد حضور مسجل لهذا التاريخ والمادة
                  </td>
                </tr>
              ) : (
                records.map((r, i) => (
                  <tr key={r.id} className="border border-black">
                    <td className="p-2 border border-black text-center font-bold">
                      {r.studentSequence || i + 1}
                    </td>
                    <td className="p-2 border border-black font-bold text-gray-900">
                      {r.studentName}
                    </td>
                    <td className="p-2 border border-black text-center font-mono text-xs">
                      {r.studentBarcode}
                    </td>
                    <td className="p-2 border border-black text-center font-mono text-xs">
                      {r.timeStr}
                    </td>
                    <td className="p-2 border border-black text-center font-bold">
                      {r.status}
                    </td>
                    <td className="p-2 border border-black text-center text-gray-400">
                      ___________
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-10 text-center text-xs font-bold">
            <div>
              <div className="mb-8">أستاذ المادة:</div>
              <div>{subject.instructor}</div>
              <div className="text-gray-400 mt-2">التوقيع: _____________</div>
            </div>
            <div>
              <div className="mb-8">مقرر القسم:</div>
              <div className="text-gray-400 mt-6">التوقيع: _____________</div>
            </div>
            <div>
              <div className="mb-8">رئيس قسم هندسة الأمن السيبراني:</div>
              <div className="text-gray-400 mt-6">التوقيع: _____________</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Printable Students List Sheet (A4 & PDF)
export const StudentsReportPrint: React.FC<{
  students: Student[];
  onClose: () => void;
}> = ({ students, onClose }) => {
  const dateNow = new Date().toLocaleDateString('ar-IQ');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md p-4 flex justify-center">
      <div className="relative w-full max-w-4xl bg-white text-black p-8 rounded-2xl shadow-2xl my-8 font-sans">
        {/* Screen Controls */}
        <div className="no-print flex items-center justify-between pb-6 mb-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-600" />
            <h3 className="text-base font-bold text-gray-900">
              معاينة طباعة وحفظ PDF لقائمة أسماء الطلبة (كلية اليرموك الجامعة)
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-5 py-2 rounded-xl text-xs font-black bg-cyan-600 text-white hover:bg-cyan-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>إرسال للطباعة / حفظ كـ PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-500 hover:text-black hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document */}
        <div className="print-container">
          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-black mb-6">
            <div className="flex justify-between items-center px-4">
              <div className="text-right text-xs font-bold leading-5">
                <div>جمهورية العراق</div>
                <div>وزارة التعليم العالي والبحث العلمي</div>
                <div>كلية اليرموك الجامعة</div>
              </div>
              <div className="text-center">
                <div className="inline-block p-2 border-2 border-black rounded-full mb-1">
                  <Shield className="w-8 h-8 text-black" />
                </div>
                <h1 className="text-lg font-black text-black">كلية اليرموك الجامعة</h1>
                <div className="text-xs font-bold text-gray-800">
                  قسم هندسة تكنولوجيا الأمن السيبراني
                </div>
              </div>
              <div className="text-left text-xs font-bold leading-5" dir="ltr">
                <div>Al-Yarmouk Univ. College</div>
                <div>Cybersecurity Eng. Dept.</div>
                <div>Stage 2 - Students Roster</div>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-gray-300">
              <h2 className="text-base font-black underline underline-offset-8">
                كشف أسماء طلبة المرحلة الثانية وأكواد الباركود الرسمية
              </h2>
              <div className="text-xs text-gray-600 mt-2">
                تاريخ الاستخراج: {dateNow} | إجمالي المسجلين: {students.length} طالب
              </div>
            </div>
          </div>

          {/* Students Table */}
          <table className="print-table w-full text-right text-xs mb-8">
            <thead>
              <tr className="bg-gray-100 border border-black">
                <th className="p-2 border border-black w-12 text-center">التسلسل</th>
                <th className="p-2 border border-black">اسم الطالب الثلاثي</th>
                <th className="p-2 border border-black w-32 text-center font-mono">رمز الباركود</th>
                <th className="p-2 border border-black w-24 text-center">المرحلة</th>
                <th className="p-2 border border-black w-44 text-center">القسم الأكاديمي</th>
                <th className="p-2 border border-black w-28 text-center">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {students.map((std, idx) => (
                <tr key={std.id} className="border border-black">
                  <td className="p-2 border border-black text-center font-bold">
                    {std.sequence || idx + 1}
                  </td>
                  <td className="p-2 border border-black font-bold text-gray-900">
                    {std.name}
                  </td>
                  <td className="p-2 border border-black text-center font-mono text-xs">
                    {std.barcode}
                  </td>
                  <td className="p-2 border border-black text-center">
                    {std.stage}
                  </td>
                  <td className="p-2 border border-black text-center text-xs">
                    {std.department}
                  </td>
                  <td className="p-2 border border-black text-center text-gray-400">
                    ___________
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-10 text-center text-xs font-bold">
            <div>
              <div className="mb-8">مقرر القسم الأكاديمي:</div>
              <div className="text-gray-400 mt-4">التوقيع: _____________</div>
            </div>
            <div>
              <div className="mb-8">رئيس قسم هندسة تكنولوجيا الأمن السيبراني:</div>
              <div className="text-gray-400 mt-4">التوقيع: _____________</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Printable Student ID Badges / Barcode Cards View
export const StudentCardsView: React.FC<{
  students: Student[];
  selectedStudent: Student | null;
  onClearSelection: () => void;
}> = ({ students, selectedStudent, onClearSelection }) => {
  const displayList = selectedStudent ? [selectedStudent] : students;

  return (
    <div className="space-y-6">
      {/* Control Toolbar */}
      <div className="no-print cyber-glass-card rounded-2xl p-5 border border-cyan-500/25 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <span>هويات وباركودات طلبة الأمن السيبراني (المرحلة الثانية)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {selectedStudent
              ? `عرض هوية الطالب: ${selectedStudent.name}`
              : `جاهزة للطباعة المباشرة (${students.length} بطاقة طالب)`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedStudent && (
            <button
              onClick={onClearSelection}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 cursor-pointer"
            >
              عرض جميع الهويات
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الهويات والباركودات (A4 / PDF)</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayList.map((std) => (
          <div
            key={std.id}
            className="student-id-card-print bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between"
          >
            {/* Card Header */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-white">كلية اليرموك الجامعة</div>
                    <div className="text-[9px] text-cyan-400 font-bold">هندسة تكنولوجيا الأمن السيبراني</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    المرحلة 2
                  </span>
                </div>
              </div>

              {/* Student Info */}
              <div className="space-y-1 mb-4 text-right">
                <div className="text-xs text-slate-400 font-semibold">اسم الطالب:</div>
                <div className="text-sm font-black text-white">{std.name}</div>
                <div className="flex items-center gap-4 text-[11px] text-slate-300 mt-2">
                  <span>التسلسل: <strong className="text-cyan-400 font-mono">{std.sequence}</strong></span>
                  <span>الرمز: <code className="text-slate-300 font-mono">{std.barcode}</code></span>
                </div>
              </div>
            </div>

            {/* Scannable Barcode & QR Code Section */}
            <div className="pt-3 border-t border-slate-700/60 flex flex-col items-center justify-center gap-2 bg-slate-950/40 rounded-xl p-2.5">
              <div className="w-full flex justify-center">
                <BarcodeSvg value={std.barcode} width={210} height={52} />
              </div>
              <div className="w-full flex items-center justify-between px-2 pt-1">
                <span className="text-[9px] text-slate-400 font-mono">بطاقة الحضور الذكية</span>
                <QRCodeSvg value={std.barcode} size={36} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
