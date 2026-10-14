import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  Users,
  Percent,
  Calendar,
  Clock,
  Download,
  FileText,
} from 'lucide-react';
import { AttendanceRecord, Student, SubjectItem } from '../types';
import { exportAttendanceToCSV, exportAttendanceToWord } from '../utils/exportUtils';

interface AttendanceSectionProps {
  attendance: AttendanceRecord[];
  students: Student[];
  subjects: SubjectItem[];
  selectedSubject: SubjectItem;
  onDeleteRecord: (id: string) => void;
  onClearAttendance: () => void;
  onPrintSheet: () => void;
}

export const AttendanceSection: React.FC<AttendanceSectionProps> = ({
  attendance,
  students,
  subjects,
  selectedSubject,
  onDeleteRecord,
  onClearAttendance,
  onPrintSheet,
}) => {
  const [filterSubject, setFilterSubject] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Filter records
  const filteredRecords = attendance.filter((rec) => {
    const matchSubject = filterSubject === 'ALL' || rec.subject === filterSubject;
    const matchDate = !selectedDate || rec.dateStr === selectedDate;
    const matchSearch =
      rec.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.studentBarcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.studentSequence.toString().includes(searchQuery);

    return matchSubject && matchDate && matchSearch;
  });

  // Calculate statistics
  const totalStudentsCount = students.length;
  // Unique students who attended
  const uniquePresentStudentIds = new Set(filteredRecords.map((r) => r.studentId));
  const uniquePresentCount = uniquePresentStudentIds.size;
  const attendanceRate =
    totalStudentsCount > 0
      ? Math.round((uniquePresentCount / totalStudentsCount) * 100)
      : 0;

  const handleExportCSV = () => {
    exportAttendanceToCSV(
      filteredRecords,
      filterSubject !== 'ALL' ? filterSubject : undefined
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cyber-glass-card rounded-2xl p-4 border border-cyan-500/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400">إجمالي طلبة المرحلة الثانية</div>
            <div className="text-2xl font-black text-white">{totalStudentsCount}</div>
            <div className="text-[11px] text-cyan-400/80 font-semibold">قسم الأمن السيبراني</div>
          </div>
        </div>

        <div className="cyber-glass-card rounded-2xl p-4 border border-emerald-500/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400">الحاضرون المسجلون</div>
            <div className="text-2xl font-black text-emerald-400">{uniquePresentCount}</div>
            <div className="text-[11px] text-slate-400 font-semibold">
              من أصل {totalStudentsCount} طالب
            </div>
          </div>
        </div>

        <div className="cyber-glass-card rounded-2xl p-4 border border-blue-500/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400">نسبة الحضور الإجمالية</div>
            <div className="text-2xl font-black text-blue-400">{attendanceRate}%</div>
            <div className="text-[11px] text-slate-400 font-semibold">للمحاضرة المحددة</div>
          </div>
        </div>

        <div className="cyber-glass-card rounded-2xl p-4 border border-purple-500/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400">إجمالي عمليات المسح</div>
            <div className="text-2xl font-black text-purple-300">{filteredRecords.length}</div>
            <div className="text-[11px] text-slate-400 font-semibold">مع فحص الأمان (5 دقائق)</div>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="cyber-glass-card rounded-2xl p-5 border border-cyan-500/20 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث باسم الطالب أو رقم الباركود أو التسلسل..."
              className="w-full pl-3.5 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Subject filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="filter-subject-select" className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>المادة:</span>
            </label>
            <select
              id="filter-subject-select"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white rounded-xl text-xs sm:text-sm font-bold py-2.5 px-3 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">جميع المواد</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.instructor})
                </option>
              ))}
            </select>
          </div>

          {/* Date filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="filter-date-input" className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>التاريخ:</span>
            </label>
            <input
              id="filter-date-input"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white rounded-xl text-xs sm:text-sm font-bold py-2 px-3 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            عدد السجلات المطابقة: <strong className="text-cyan-300 font-bold">{filteredRecords.length}</strong>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير إكسل (Excel)</span>
            </button>

            <button
              onClick={() =>
                exportAttendanceToWord(
                  filteredRecords,
                  selectedSubject,
                  selectedDate
                )
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500 hover:text-slate-950 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>تصدير وورد (Word)</span>
            </button>

            <button
              onClick={onPrintSheet}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500 hover:text-slate-950 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / PDF للكشف</span>
            </button>

            {attendance.length > 0 && (
              <button
                onClick={onClearAttendance}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-950/40 text-rose-400 border border-rose-500/30 hover:bg-rose-900/40 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>مسح السجلات</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="cyber-glass-card rounded-2xl p-5 border border-cyan-500/20">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-white">لا توجد سجلات حضور مطابقة</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              لم يتم العثور على أي حضور بالتاريخ أو المادة المحددة. يمكنك تغيير معايير البحث أو تسجيل حضور جديد عبر الماسح.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3.5 font-bold pr-3">#</th>
                  <th className="pb-3.5 font-bold">اسم الطالب الكامل</th>
                  <th className="pb-3.5 font-bold">رمز الباركود</th>
                  <th className="pb-3.5 font-bold">المادة</th>
                  <th className="pb-3.5 font-bold">أستاذ المادة</th>
                  <th className="pb-3.5 font-bold">التاريخ</th>
                  <th className="pb-3.5 font-bold">وقت التسجيل</th>
                  <th className="pb-3.5 font-bold">الحالة</th>
                  <th className="pb-3.5 font-bold pl-3 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRecords.map((record, index) => (
                  <tr key={record.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 pr-3 font-mono text-cyan-400 font-bold">
                      {record.studentSequence || index + 1}
                    </td>
                    <td className="py-3 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span>{record.studentName}</span>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-cyan-300/90 text-xs">
                      {record.studentBarcode}
                    </td>
                    <td className="py-3 text-slate-200 font-semibold">{record.subject}</td>
                    <td className="py-3 text-slate-400 text-xs">{record.instructor}</td>
                    <td className="py-3 font-mono text-slate-400 text-xs">{record.dateStr}</td>
                    <td className="py-3 font-mono text-slate-300 text-xs">{record.timeStr}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 pl-3 text-center">
                      <button
                        onClick={() => onDeleteRecord(record.id)}
                        title="حذف هذا السجل"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
