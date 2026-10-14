import React, { useState } from 'react';
import {
  UserPlus,
  Barcode,
  Search,
  Trash2,
  Edit2,
  Printer,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  QrCode,
  X,
  RotateCcw,
  FileType,
} from 'lucide-react';
import { Student } from '../types';
import { BarcodeSvg, QRCodeSvg } from '../utils/barcodeGenerator';
import { exportStudentsToCSV, exportStudentsToWord } from '../utils/exportUtils';
import { INITIAL_STUDENTS } from '../data/initialData';

interface StudentsSectionProps {
  students: Student[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onResetStudents: (students: Student[]) => void;
  onSelectStudentForCard: (student: Student) => void;
  onPrintAllCards: () => void;
  onPrintStudentsPDF: () => void;
}

export const StudentsSection: React.FC<StudentsSectionProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onResetStudents,
  onSelectStudentForCard,
  onPrintAllCards,
  onPrintStudentsPDF,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('هندسة تكنولوجيا الأمن السيبراني');
  const [stage, setStage] = useState('المرحلة الثانية');
  const [sequence, setSequence] = useState('');
  const [customBarcode, setCustomBarcode] = useState('');

  // Open Add modal with auto-calculated sequence
  const handleOpenAddModal = () => {
    const nextSeqNum = students.length + 1;
    const formattedSeq = nextSeqNum.toString().padStart(2, '0');
    setName('');
    setDepartment('هندسة تكنولوجيا الأمن السيبراني');
    setStage('المرحلة الثانية');
    setSequence(formattedSeq);
    setCustomBarcode(`YUC-SEC-${formattedSeq}`);
    setEditingStudent(null);
    setIsAddModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEditModal = (std: Student) => {
    setEditingStudent(std);
    setName(std.name);
    setDepartment(std.department);
    setStage(std.stage);
    setSequence(std.sequence);
    setCustomBarcode(std.barcode);
    setIsAddModalOpen(true);
  };

  // Form submit
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const barcodeVal =
      customBarcode.trim().toUpperCase() ||
      `YUC-SEC-${sequence.padStart(2, '0')}`;

    if (editingStudent) {
      const updated: Student = {
        ...editingStudent,
        name: name.trim(),
        department: department.trim(),
        stage: stage.trim(),
        sequence: sequence.trim(),
        barcode: barcodeVal,
      };
      onUpdateStudent(updated);
    } else {
      const newStd: Student = {
        id: `std-${Date.now()}`,
        name: name.trim(),
        department: department.trim(),
        stage: stage.trim(),
        sequence: sequence.trim(),
        barcode: barcodeVal,
        createdAt: new Date().toISOString(),
      };
      onAddStudent(newStd);
    }

    setIsAddModalOpen(false);
  };

  // Filter students
  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sequence.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="cyber-glass-card rounded-2xl p-5 border border-cyan-500/25 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <h2 className="text-lg font-black text-white">
              لوحة تحكم الطلبة وتوليد الباركود
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            قسم هندسة تكنولوجيا الأمن السيبراني - المرحلة الثانية (كلية اليرموك الجامعة)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ إضافة طالب</span>
          </button>

          <button
            onClick={onPrintStudentsPDF}
            title="طباعة أو حفظ كملف PDF"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/60 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>طباعة / PDF للقائمة</span>
          </button>

          <button
            onClick={() => exportStudentsToCSV(students)}
            title="تصدير كملف Excel أو CSV"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>تصدير إكسل (Excel)</span>
          </button>

          <button
            onClick={() => exportStudentsToWord(students)}
            title="تصدير كملف وورد رسمي بصيغة DOC"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-blue-950/70 text-blue-300 border border-blue-500/40 hover:bg-blue-900/60 transition-all cursor-pointer"
          >
            <FileType className="w-4 h-4 text-blue-400" />
            <span>تصدير وورد (Word)</span>
          </button>

          <button
            onClick={onPrintAllCards}
            title="طباعة بطاقات وهويات الطلبة"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-slate-200 border border-slate-700 hover:border-cyan-500/40 hover:text-cyan-300 transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-cyan-400" />
            <span>طباعة الهويات</span>
          </button>

          <button
            onClick={() => {
              if (confirm('هل ترغب باستعادة القائمة الافتراضية لطلبة المرحلة الثانية؟')) {
                onResetStudents(INITIAL_STUDENTS);
              }
            }}
            title="استعادة الطلبة الافتراضيين"
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن طالب بالاسم الثلاثي، التسلسل، أو كود الباركود..."
          className="w-full pl-3.5 pr-10 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* Students Table */}
      <div className="cyber-glass-card rounded-2xl p-5 border border-cyan-500/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3.5 font-bold pr-3">التسلسل</th>
                <th className="pb-3.5 font-bold">الاسم الثلاثي للطالب</th>
                <th className="pb-3.5 font-bold">القسم الأكاديمي</th>
                <th className="pb-3.5 font-bold">المرحلة</th>
                <th className="pb-3.5 font-bold">رمز الباركود</th>
                <th className="pb-3.5 font-bold text-center">الباركود البصري</th>
                <th className="pb-3.5 font-bold pl-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((std) => (
                <tr key={std.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 pr-3 font-mono text-cyan-400 font-bold text-sm">
                    {std.sequence}
                  </td>
                  <td className="py-3 font-bold text-white text-sm">
                    {std.name}
                  </td>
                  <td className="py-3 text-slate-300 text-xs">
                    {std.department}
                  </td>
                  <td className="py-3 text-slate-400 text-xs">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      {std.stage}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-cyan-300 text-xs font-semibold">
                    {std.barcode}
                  </td>
                  <td className="py-3 text-center">
                    <div className="inline-block transform scale-75 origin-center -my-2">
                      <BarcodeSvg value={std.barcode} width={160} height={42} showText={false} />
                    </div>
                  </td>
                  <td className="py-3 pl-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onSelectStudentForCard(std)}
                        title="معاينة وطباعة بطاقة الطالب والباركود"
                        className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-950/50 transition-colors cursor-pointer"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(std)}
                        title="تعديل بيانات الطالب"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف الطالب "${std.name}"؟`)) {
                            onDeleteStudent(std.id);
                          }
                        }}
                        title="حذف الطالب"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-2xl space-y-4">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-black text-white">
                {editingStudent ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد وتوليد باركود'}
              </h3>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  الاسم الثلاثي للطالب *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: علي حسن محمد الخفاجي"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    التسلسل الجامعي
                  </label>
                  <input
                    type="text"
                    required
                    value={sequence}
                    onChange={(e) => {
                      setSequence(e.target.value);
                      if (!editingStudent) {
                        setCustomBarcode(`YUC-SEC-${e.target.value.padStart(2, '0')}`);
                      }
                    }}
                    placeholder="01"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    المرحلة الدراسية
                  </label>
                  <input
                    type="text"
                    required
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  القسم الأكاديمي
                </label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  رمز الباركود المخصص (قابلة للتعديل أو توليد تلقائي)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                    <Barcode className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={customBarcode}
                    onChange={(e) => setCustomBarcode(e.target.value)}
                    dir="ltr"
                    placeholder="YUC-SEC-XX"
                    className="w-full pl-3 pr-9 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Instant Live Barcode Preview */}
              {customBarcode && (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-center">
                  <div className="text-[11px] font-bold text-cyan-300 mb-2">
                    معاينة حية للباركود المولد فوراً:
                  </div>
                  <div className="flex justify-center">
                    <BarcodeSvg value={customBarcode} width={220} height={56} />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 transition-all cursor-pointer"
                >
                  {editingStudent ? 'حفظ التعديلات' : 'إضافة الطالب وتوليد الباركود'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
