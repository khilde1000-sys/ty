export interface Student {
  id: string;
  barcode: string;
  name: string;
  department: string;
  stage: string;
  sequence: string;
  phone?: string;
  avatarSeed?: string;
  createdAt: string;
}

export interface SubjectItem {
  id: string;
  name: string;
  instructor: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentBarcode: string;
  studentName: string;
  studentSequence: string;
  department: string;
  stage: string;
  subject: string;
  instructor: string;
  timestamp: number;
  dateStr: string;
  timeStr: string;
  status: 'حاضر' | 'متأخر';
}

export interface CooldownEntry {
  barcode: string;
  lastScanTimestamp: number;
  studentName: string;
}

export type ActiveTab = 'scanner' | 'attendance' | 'students' | 'cards';
