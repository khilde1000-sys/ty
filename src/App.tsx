import React, { useState, useEffect } from 'react';
import {
  Student,
  SubjectItem,
  AttendanceRecord,
  ActiveTab,
} from './types';
import { OFFICIAL_SUBJECTS, INITIAL_STUDENTS } from './data/initialData';
import { soundEffects } from './utils/audio';
import { downloadSingleFileHtml } from './utils/exportUtils';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { ScannerSection } from './components/ScannerSection';
import { AttendanceSection } from './components/AttendanceSection';
import { StudentsSection } from './components/StudentsSection';
import { StudentCardsView, AttendanceReportPrint, StudentsReportPrint } from './components/PrintViews';

export default function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('yuc_auth_session') === 'authenticated';
  });

  // Subjects state
  const [subjects] = useState<SubjectItem[]>(OFFICIAL_SUBJECTS);
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem>(() => {
    const savedSubjectId = localStorage.getItem('yuc_selected_subject_id');
    const found = OFFICIAL_SUBJECTS.find((s) => s.id === savedSubjectId);
    return found || OFFICIAL_SUBJECTS[0];
  });

  // Students roster state (persisted to LocalStorage)
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('yuc_students');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_STUDENTS;
  });

  // Attendance records state (persisted to LocalStorage)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('yuc_attendance');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('scanner');

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Print attendance sheet modal
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);

  // Print students roster sheet modal
  const [isPrintStudentsReportOpen, setIsPrintStudentsReportOpen] = useState(false);

  // Single card print selection
  const [cardSelectedStudent, setCardSelectedStudent] = useState<Student | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('yuc_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('yuc_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('yuc_selected_subject_id', selectedSubject.id);
  }, [selectedSubject]);

  // Handlers
  const handleLogout = () => {
    localStorage.removeItem('yuc_auth_session');
    setIsAuthenticated(false);
  };

  const handleToggleSound = () => {
    soundEffects.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  const handleAttendanceAdded = (record: AttendanceRecord) => {
    setAttendance((prev) => [record, ...prev]);
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا السجل من قائمة الحضور؟')) {
      setAttendance((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleClearAttendance = () => {
    if (
      confirm(
        'تحذير: هل أنت متأكد من مسح جميع سجلات الحضور المسجلة؟ لا يمكن التراجع عن هذا الإجراء.'
      )
    ) {
      setAttendance([]);
    }
  };

  const handleAddStudent = (newStd: Student) => {
    setStudents((prev) => [...prev, newStd]);
  };

  const handleUpdateStudent = (updatedStd: Student) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStd.id ? updatedStd : s))
    );
  };

  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const handleResetStudents = (newRoster: Student[]) => {
    setStudents(newRoster);
  };

  const handleSelectStudentForCard = (student: Student) => {
    setCardSelectedStudent(student);
    setActiveTab('cards');
  };

  const handlePrintAllCards = () => {
    setCardSelectedStudent(null);
    setActiveTab('cards');
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleDownloadSingleHTML = () => {
    downloadSingleFileHtml(students, attendance, subjects);
  };

  // If not authenticated, render Login Modal
  if (!isAuthenticated) {
    return <LoginModal onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen cyber-grid-bg text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation */}
      <Navbar
        subjects={subjects}
        selectedSubject={selectedSubject}
        onSelectSubject={setSelectedSubject}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onLogout={handleLogout}
        onPrintSheet={() => setIsPrintReportOpen(true)}
        onExportHTML={handleDownloadSingleHTML}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'scanner' && (
          <ScannerSection
            students={students}
            currentSubject={selectedSubject}
            attendance={attendance}
            onAttendanceAdded={handleAttendanceAdded}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceSection
            attendance={attendance}
            students={students}
            subjects={subjects}
            selectedSubject={selectedSubject}
            onDeleteRecord={handleDeleteRecord}
            onClearAttendance={handleClearAttendance}
            onPrintSheet={() => setIsPrintReportOpen(true)}
          />
        )}

        {activeTab === 'students' && (
          <StudentsSection
            students={students}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onResetStudents={handleResetStudents}
            onSelectStudentForCard={handleSelectStudentForCard}
            onPrintAllCards={handlePrintAllCards}
            onPrintStudentsPDF={() => setIsPrintStudentsReportOpen(true)}
          />
        )}

        {activeTab === 'cards' && (
          <StudentCardsView
            students={students}
            selectedStudent={cardSelectedStudent}
            onClearSelection={() => setCardSelectedStudent(null)}
          />
        )}
      </main>

      {/* Printable Attendance Report Modal */}
      {isPrintReportOpen && (
        <AttendanceReportPrint
          records={attendance.filter((r) => r.subject === selectedSubject.name)}
          subject={selectedSubject}
          dateStr={new Date().toISOString().split('T')[0]}
          onClose={() => setIsPrintReportOpen(false)}
        />
      )}

      {/* Printable Students Roster Report Modal (PDF / Print) */}
      {isPrintStudentsReportOpen && (
        <StudentsReportPrint
          students={students}
          onClose={() => setIsPrintStudentsReportOpen(false)}
        />
      )}

      {/* Subtle Footer */}
      <footer className="no-print border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            كلية اليرموك الجامعة | قسم هندسة تكنولوجيا الأمن السيبراني - المرحلة الثانية
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadSingleHTML}
              className="text-cyan-400 hover:underline cursor-pointer font-semibold"
            >
              تحميل الكود كملف HTML مستقل كامل
            </button>
            <span className="text-slate-700">|</span>
            <span>نظام تسجيل الحضور الذكي</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
