import { AttendanceRecord, Student, SubjectItem } from '../types';

/**
 * Exports attendance records to CSV with UTF-8 BOM so Arabic displays correctly in Excel
 */
export function exportAttendanceToCSV(
  records: AttendanceRecord[],
  activeSubject?: string
) {
  if (records.length === 0) {
    alert('لا توجد سجلات حضور لتصديرها');
    return;
  }

  const headers = [
    'التسلسل',
    'اسم الطالب الثلاثي',
    'رمز الباركود',
    'المرحلة',
    'القسم',
    'المادة',
    'أستاذ المادة',
    'التاريخ',
    'الوقت',
    'حالة الحضور',
  ];

  const rows = records.map((r, idx) => [
    r.studentSequence || (idx + 1).toString(),
    `"${r.studentName.replace(/"/g, '""')}"`,
    `"${r.studentBarcode}"`,
    `"${r.stage}"`,
    `"${r.department}"`,
    `"${r.subject}"`,
    `"${r.instructor}"`,
    r.dateStr,
    r.timeStr,
    r.status,
  ]);

  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Microsoft Excel Arabic support
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `حضور_الأمن_السيبراني_${activeSubject ? activeSubject.replace(/\s+/g, '_') : 'الكل'}_${dateStr}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports all students list to CSV / Excel
 */
export function exportStudentsToCSV(students: Student[]) {
  if (students.length === 0) {
    alert('لا يوجد طلاب في القائمة للتصدير');
    return;
  }

  const headers = [
    'التسلسل',
    'اسم الطالب الثلاثي',
    'رمز الباركود',
    'القسم الأكاديمي',
    'المرحلة الدراسية',
    'تاريخ التسجيل',
  ];

  const rows = students.map((s) => [
    s.sequence,
    `"${s.name.replace(/"/g, '""')}"`,
    `"${s.barcode}"`,
    `"${s.department}"`,
    `"${s.stage}"`,
    s.createdAt ? s.createdAt.split('T')[0] : '',
  ]);

  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `قائمة_أسماء_طلبة_الأمن_السيبراني_المرحلة_الثانية.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports Student List to Microsoft Word (.doc) with official university formatting
 */
export function exportStudentsToWord(students: Student[]) {
  if (students.length === 0) {
    alert('لا يوجد طلاب في القائمة للتصدير');
    return;
  }

  const dateNow = new Date().toLocaleDateString('ar-IQ');

  const rowsHtml = students
    .map(
      (s, idx) => `
    <tr>
      <td style="text-align:center;font-weight:bold;">${s.sequence || idx + 1}</td>
      <td style="font-weight:bold;">${s.name}</td>
      <td style="text-align:center;font-family:Consolas, monospace;">${s.barcode}</td>
      <td style="text-align:center;">${s.stage}</td>
      <td style="text-align:center;">${s.department}</td>
      <td style="text-align:center;color:#666;">_______________</td>
    </tr>
  `
    )
    .join('');

  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>قائمة أسماء طلبة هندسة الأمن السيبراني</title>
      <!--[if gte mso 9]>
      <xml>
      <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
      </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        body {
          font-family: 'Arial', 'Calibri', 'Traditional Arabic', sans-serif;
          direction: rtl;
          text-align: right;
          margin: 20px;
        }
        .header {
          border-bottom: 2px solid #000;
          padding-bottom: 12px;
          margin-bottom: 16px;
          text-align: center;
        }
        .title {
          font-size: 18pt;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .sub-title {
          font-size: 13pt;
          font-weight: bold;
          color: #222;
        }
        .doc-title {
          font-size: 15pt;
          font-weight: bold;
          margin-top: 14px;
          text-decoration: underline;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
          direction: rtl;
        }
        th, td {
          border: 1px solid #000;
          padding: 8px 10px;
          font-size: 11pt;
        }
        th {
          background-color: #f0f4f8;
          font-weight: bold;
          text-align: center;
        }
        .footer {
          margin-top: 40px;
          width: 100%;
        }
        .footer td {
          border: none;
          text-align: center;
          font-weight: bold;
          font-size: 11pt;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <table style="width:100%;border:none;margin-bottom:10px;">
          <tr>
            <td style="border:none;text-align:right;width:35%;font-size:10pt;font-weight:bold;">
              جمهورية العراق<br>
              وزارة التعليم العالي والبحث العلمي<br>
              كلية اليرموك الجامعة
            </td>
            <td style="border:none;text-align:center;width:30%;">
              <div class="title">كلية اليرموك الجامعة</div>
              <div class="sub-title">قسم هندسة تكنولوجيا الأمن السيبراني</div>
            </td>
            <td style="border:none;text-align:left;width:35%;font-size:10pt;font-weight:bold;" dir="ltr">
              Al-Yarmouk Univ. College<br>
              Cybersecurity Eng. Dept.<br>
              Stage 2 - Students List
            </td>
          </tr>
        </table>
        <div class="doc-title">قائمة أسماء طلبة المرحلة الثانية وأكواد الباركود</div>
        <div style="font-size:10pt;color:#444;margin-top:6px;">تاريخ الاستخراج: ${dateNow} | إجمالي عدد الطلبة: ${students.length} طالب</div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:8%;">التسلسل</th>
            <th style="width:32%;">اسم الطالب الثلاثي</th>
            <th style="width:18%;">رمز الباركود</th>
            <th style="width:14%;">المرحلة</th>
            <th style="width:18%;">القسم الأكاديمي</th>
            <th style="width:10%;">ملاحظات</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <table class="footer">
        <tr>
          <td style="width:50%;">
            مقرر القسم الأكاديمي<br><br><br>
            التوقيع: ____________________
          </td>
          <td style="width:50%;">
            رئيس قسم هندسة تكنولوجيا الأمن السيبراني<br><br><br>
            التوقيع: ____________________
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\uFEFF' + wordContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'قائمة_أسماء_طلبة_الأمن_السيبراني_المرحلة_الثانية.doc');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports Attendance Sheet to Microsoft Word (.doc)
 */
export function exportAttendanceToWord(
  records: AttendanceRecord[],
  subject: SubjectItem,
  dateStr: string
) {
  if (records.length === 0) {
    alert('لا توجد سجلات حضور لتصديرها إلى Word');
    return;
  }

  const rowsHtml = records
    .map(
      (r, idx) => `
    <tr>
      <td style="text-align:center;font-weight:bold;">${r.studentSequence || idx + 1}</td>
      <td style="font-weight:bold;">${r.studentName}</td>
      <td style="text-align:center;font-family:Consolas, monospace;">${r.studentBarcode}</td>
      <td style="text-align:center;">${r.subject}</td>
      <td style="text-align:center;">${r.instructor}</td>
      <td style="text-align:center;">${r.timeStr}</td>
      <td style="text-align:center;font-weight:bold;color:green;">${r.status}</td>
      <td style="text-align:center;color:#666;">_______________</td>
    </tr>
  `
    )
    .join('');

  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>استمارة حضور المحاضرات الرسمية</title>
      <style>
        body {
          font-family: 'Arial', 'Calibri', sans-serif;
          direction: rtl;
          text-align: right;
          margin: 20px;
        }
        .header {
          border-bottom: 2px solid #000;
          padding-bottom: 12px;
          margin-bottom: 16px;
          text-align: center;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
        }
        th, td {
          border: 1px solid #000;
          padding: 8px;
          font-size: 11pt;
        }
        th {
          background-color: #f1f5f9;
          font-weight: bold;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2 style="margin:0;font-size:18pt;">كلية اليرموك الجامعة</h2>
        <h3 style="margin:4px 0;font-size:14pt;">قسم هندسة تكنولوجيا الأمن السيبراني - المرحلة الثانية</h3>
        <h4 style="margin:10px 0 4px;font-size:15pt;text-decoration:underline;">استمارة تسجيل الحضور اليومي للمحاضرات</h4>
        <div style="font-size:11pt;margin-top:8px;">
          المادة: <b>${subject.name}</b> | أستاذ المادة: <b>${subject.instructor}</b> | التاريخ: <b>${dateStr}</b> | الحضور: <b>${records.length} طالب</b>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:6%;">ت</th>
            <th style="width:28%;">اسم الطالب الثلاثي</th>
            <th style="width:14%;">الباركود</th>
            <th style="width:16%;">المادة</th>
            <th style="width:14%;">أستاذ المادة</th>
            <th style="width:10%;">وقت المسح</th>
            <th style="width:8%;">الحالة</th>
            <th style="width:10%;">توقيع الطالب</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <table style="border:none;margin-top:40px;width:100%;">
        <tr>
          <td style="border:none;text-align:center;font-weight:bold;width:33%;">
            أستاذ المادة<br><br><br>
            ${subject.instructor}<br>
            التوقيع: _____________
          </td>
          <td style="border:none;text-align:center;font-weight:bold;width:33%;">
            مقرر القسم<br><br><br><br>
            التوقيع: _____________
          </td>
          <td style="border:none;text-align:center;font-weight:bold;width:33%;">
            رئيس قسم هندسة الأمن السيبراني<br><br><br><br>
            التوقيع: _____________
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\uFEFF' + wordContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `كشف_حضور_${subject.name.replace(/\s+/g, '_')}_${dateStr}.doc`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a complete standalone single-file HTML version
 * containing all CSS, HTML, and JS in one single file ready to run directly in any browser.
 */
export function downloadSingleFileHtml(
  students: Student[],
  attendance: AttendanceRecord[],
  subjects: SubjectItem[]
) {
  const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>منظومة تسجيل الحضور بالباركود | كلية اليرموك الجامعة - هندسة الأمن السيبراني</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/html5-qrcode"></script>
  <style>
    :root {
      --bg-dark: #030712;
      --card-bg: rgba(15, 23, 42, 0.85);
      --cyan: #06b6d4;
      --emerald: #10b981;
      --red: #ef4444;
      --border: rgba(6, 182, 212, 0.25);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Cairo', sans-serif; }
    body {
      background-color: var(--bg-dark);
      color: #f1f5f9;
      min-height: 100vh;
      background-image: radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.15) 0%, transparent 60%);
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .glass {
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .btn {
      background: linear-gradient(135deg, #0891b2, #06b6d4);
      color: #030712;
      font-weight: 700;
      border: none;
      padding: 10px 20px;
      border-radius: 10px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .btn:hover { filter: brightness(1.15); transform: translateY(-1px); }
    .btn-danger { background: linear-gradient(135deg, #dc2626, #ef4444); color: #fff; }
    .btn-success { background: linear-gradient(135deg, #059669, #10b981); color: #030712; }
    .btn-outline { background: transparent; border: 1px solid var(--cyan); color: var(--cyan); }
    .input {
      background: #090d16;
      border: 1px solid rgba(255,255,255,0.15);
      color: #fff;
      padding: 10px 14px;
      border-radius: 8px;
      outline: none;
      font-size: 14px;
    }
    .input:focus { border-color: var(--cyan); }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
    }
    .badge-cyan { background: rgba(6, 182, 212, 0.15); color: var(--cyan); border: 1px solid rgba(6, 182, 212, 0.4); }
    .badge-green { background: rgba(16, 185, 129, 0.15); color: var(--emerald); border: 1px solid rgba(16, 185, 129, 0.4); }
    .alert-box {
      padding: 14px;
      border-radius: 10px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
    }
    .alert-danger { background: rgba(239, 68, 68, 0.15); border: 1px solid var(--red); color: #fca5a5; }
    .alert-success { background: rgba(16, 185, 129, 0.15); border: 1px solid var(--emerald); color: #6ee7b7; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { padding: 12px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.08); }
    th { color: var(--cyan); font-weight: 700; font-size: 13px; text-transform: uppercase; }
    .scanner-view {
      max-width: 480px;
      margin: 0 auto;
      border: 2px dashed var(--cyan);
      border-radius: 14px;
      overflow: hidden;
      background: #000;
      position: relative;
    }
    #reader { width: 100%; min-height: 280px; }
    .grid-cols-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
    .stat-card { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); padding: 16px; border-radius: 12px; }
    .tab-btn { background: none; border: none; color: #94a3b8; font-size: 16px; font-weight: 700; padding: 10px 18px; cursor: pointer; border-radius: 8px; }
    .tab-btn.active { color: #fff; background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.4); }
    @media print {
      body { background: #fff !important; color: #000 !important; }
      .no-print { display: none !important; }
      .glass { background: #fff !important; border: 1px solid #000 !important; color: #000 !important; box-shadow: none !important; }
      th, td { color: #000 !important; border-bottom: 1px solid #000 !important; }
    }
  </style>
</head>
<body>
  <div id="loginOverlay" style="position:fixed;inset:0;background:rgba(3,7,18,0.95);backdrop-filter:blur(20px);z-index:9999;display:flex;align-items:center;justify-content:center;">
    <div class="glass" style="max-width:440px;width:90%;text-align:center;">
      <h2 style="color:var(--cyan);margin-bottom:8px;">كلية اليرموك الجامعة</h2>
      <p style="color:#94a3b8;margin-bottom:24px;font-size:14px;">قسم هندسة تكنولوجيا الأمن السيبراني - المرحلة الثانية</p>
      <div id="loginErr" style="color:var(--red);margin-bottom:12px;font-size:13px;display:none;">بيانات الدخول غير صحيحة!</div>
      <input id="uName" type="text" placeholder="اسم المستخدم" class="input" style="width:100%;margin-bottom:12px;text-align:center;">
      <input id="uPass" type="password" placeholder="كلمة المرور" class="input" style="width:100%;margin-bottom:20px;text-align:center;">
      <button onclick="handleLogin()" class="btn" style="width:100%;justify-content:center;">تسجيل الدخول للنظام</button>
    </div>
  </div>

  <div class="container no-print">
    <div class="glass header">
      <div>
        <h1 style="font-size:22px;display:flex;align-items:center;gap:10px;">
          <span>كلية اليرموك الجامعة</span>
          <span class="badge badge-cyan">الأمن السيبراني - المرحلة الثانية</span>
        </h1>
        <p style="color:#94a3b8;font-size:13px;margin-top:4px;">منظومة الحضور الذكية بالباركود و QR (ملف متكامل محلي)</p>
      </div>
      <div style="display:flex;gap:10px;align-items:center;">
        <select id="lectureSelect" class="input" style="font-weight:700;">
          <option value="أسس الإلكترونيك||ست الآء بشير">أسس الإلكترونيك - ست الآء بشير</option>
          <option value="الرياضيات||أستاذ حيدر رشيد">الرياضيات - أستاذ حيدر رشيد</option>
          <option value="مبادئ لينكس||أستاذ وائل محمود">مبادئ لينكس - أستاذ وائل محمود</option>
          <option value="هياكل بيانات||أستاذ هيثم قتيبة">هياكل بيانات - أستاذ هيثم قتيبة</option>
          <option value="تركيب ومعمارية الحاسوب||أستاذ أنس ياسين">تركيب ومعمارية الحاسوب - أستاذ أنس ياسين</option>
        </select>
        <button onclick="window.print()" class="btn btn-outline">طباعة الكشف</button>
        <button onclick="exportCSV()" class="btn btn-success">تصدير إكسل</button>
      </div>
    </div>

    <div style="display:flex;gap:10px;margin-bottom:16px;">
      <button class="tab-btn active" onclick="switchTab('scanner', this)">ماسح الباركود</button>
      <button class="tab-btn" onclick="switchTab('attendance', this)">سجل الحضور</button>
      <button class="tab-btn" onclick="switchTab('students', this)">إدارة الطلاب</button>
    </div>

    <!-- SCANNER TAB -->
    <div id="tab-scanner">
      <div class="glass" style="text-align:center;">
        <div id="alertMsg" style="display:none;" class="alert-box"></div>

        <div style="margin-bottom:16px;">
          <button id="startCamBtn" onclick="toggleCamera()" class="btn">تشغيل كاميرا الماسح</button>
        </div>
        <div class="scanner-view" id="cameraBox" style="display:none;margin-bottom:20px;">
          <div id="reader"></div>
        </div>

        <div style="max-width:420px;margin:0 auto;display:flex;gap:8px;">
          <input id="manualInput" class="input" style="flex:1;" placeholder="مسح يدوي / جهاز الباركود USB..." onkeypress="if(event.key==='Enter') scanManual()">
          <button onclick="scanManual()" class="btn">تسجيل</button>
        </div>
        <p style="color:#64748b;font-size:12px;margin-top:10px;">شرط الأمان مفعل: لا يقبل نفس الباركود مجدداً إلا بعد مرور 5 دقائق</p>
      </div>

      <div class="glass">
        <h3>آخر الحاضرين المسجلين اليوم</h3>
        <table>
          <thead>
            <tr>
              <th>التسلسل</th>
              <th>اسم الطالب</th>
              <th>الباركود</th>
              <th>المادة</th>
              <th>الوقت</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody id="recentAttendanceBody"></tbody>
        </table>
      </div>
    </div>

    <!-- ATTENDANCE TAB -->
    <div id="tab-attendance" style="display:none;">
      <div class="glass">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3>كشف الحضور اليومي الكامل</h3>
          <button onclick="clearTodayAttendance()" class="btn btn-danger" style="font-size:12px;padding:6px 12px;">مسح سجلات اليوم</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>الاسم الثلاثي</th>
              <th>الباركود</th>
              <th>المادة</th>
              <th>الأستاذ</th>
              <th>التاريخ</th>
              <th>الوقت</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody id="allAttendanceBody"></tbody>
        </table>
      </div>
    </div>

    <!-- STUDENTS TAB -->
    <div id="tab-students" style="display:none;">
      <div class="glass">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3>قائمة طلبة المرحلة الثانية (الأمن السيبراني)</h3>
          <button onclick="showAddStudent()" class="btn">+ إضافة طالب جديد</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>التسلسل</th>
              <th>الاسم الكامل</th>
              <th>الباركود</th>
              <th>القسم</th>
              <th>المرحلة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody id="studentsBody"></tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    const INITIAL_STUDENTS = ${JSON.stringify(students)};
    let students = JSON.parse(localStorage.getItem('yuc_students') || 'null') || INITIAL_STUDENTS;
    let attendance = JSON.parse(localStorage.getItem('yuc_attendance') || 'null') || ${JSON.stringify(attendance)};
    let scanCooldowns = {};
    let html5QrCode = null;

    function handleLogin() {
      const u = document.getElementById('uName').value.trim();
      const p = document.getElementById('uPass').value.trim();
      if (u === 'K@AAA@K' && p === 'QPLKMAZX') {
        document.getElementById('loginOverlay').style.display = 'none';
        sessionStorage.setItem('auth', '1');
      } else {
        document.getElementById('loginErr').style.display = 'block';
      }
    }
    if (sessionStorage.getItem('auth') === '1') {
      document.getElementById('loginOverlay').style.display = 'none';
    }

    function switchTab(tab, btn) {
      document.getElementById('tab-scanner').style.display = tab === 'scanner' ? 'block' : 'none';
      document.getElementById('tab-attendance').style.display = tab === 'attendance' ? 'block' : 'none';
      document.getElementById('tab-students').style.display = tab === 'students' ? 'block' : 'none';
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    function processBarcode(code) {
      const barcode = code.trim().toUpperCase();
      const student = students.find(s => s.barcode.toUpperCase() === barcode);
      const alertBox = document.getElementById('alertMsg');
      alertBox.style.display = 'flex';

      if (!student) {
        alertBox.className = 'alert-box alert-danger';
        alertBox.innerHTML = '❌ لم يتم العثور على طالب مرتبط بالرمز: ' + barcode;
        return;
      }

      // Check 5-minute cooldown (300,000 ms)
      const now = Date.now();
      const lastScan = scanCooldowns[barcode] || 0;
      const elapsed = now - lastScan;
      const COOLDOWN_MS = 5 * 60 * 1000;

      if (elapsed < COOLDOWN_MS) {
        const remainingMs = COOLDOWN_MS - elapsed;
        const mins = Math.floor(remainingMs / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        alertBox.className = 'alert-box alert-danger';
        alertBox.innerHTML = '⛔ تنبيه أمني: الطالب <b>(' + student.name + ')</b> مسجل مسبقاً! لا يمكن تسجيل الحضور مرة ثانية إلا بعد مرور 5 دقائق.<br>الوقت المتبقي: ' + mins + ' دقيقة و ' + secs + ' ثانية.';
        return;
      }

      // Record attendance
      scanCooldowns[barcode] = now;
      const lectureParts = document.getElementById('lectureSelect').value.split('||');
      const subject = lectureParts[0];
      const instructor = lectureParts[1];

      const record = {
        id: 'rec-' + Date.now(),
        studentId: student.id,
        studentName: student.name,
        studentBarcode: student.barcode,
        studentSequence: student.sequence,
        department: student.department,
        stage: student.stage,
        subject: subject,
        instructor: instructor,
        timestamp: now,
        dateStr: new Date().toISOString().split('T')[0],
        timeStr: new Date().toLocaleTimeString('ar-IQ'),
        status: 'حاضر'
      };

      attendance.unshift(record);
      localStorage.setItem('yuc_attendance', JSON.stringify(attendance));

      alertBox.className = 'alert-box alert-success';
      alertBox.innerHTML = '✅ تم تسجيل حضور الطالب بنجاح: <b>' + student.name + '</b> (تسلسل: ' + student.sequence + ')';
      renderTables();
    }

    function scanManual() {
      const input = document.getElementById('manualInput');
      if (input.value.trim()) {
        processBarcode(input.value.trim());
        input.value = '';
      }
    }

    async function toggleCamera() {
      const box = document.getElementById('cameraBox');
      const btn = document.getElementById('startCamBtn');
      if (box.style.display === 'none') {
        box.style.display = 'block';
        btn.textContent = 'إيقاف الكاميرا';
        if (!html5QrCode) {
          html5QrCode = new Html5Qrcode("reader");
        }
        try {
          await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              processBarcode(decodedText);
            },
            () => {}
          );
        } catch (e) {
          console.error(e);
        }
      } else {
        box.style.display = 'none';
        btn.textContent = 'تشغيل كاميرا الماسح';
        if (html5QrCode) {
          html5QrCode.stop().catch(() => {});
        }
      }
    }

    function renderTables() {
      const recent = document.getElementById('recentAttendanceBody');
      const allBody = document.getElementById('allAttendanceBody');
      const stdBody = document.getElementById('studentsBody');

      recent.innerHTML = attendance.slice(0, 5).map(r => 
        '<tr><td>' + r.studentSequence + '</td><td><b>' + r.studentName + '</b></td><td><code>' + r.studentBarcode + '</code></td><td>' + r.subject + '</td><td>' + r.timeStr + '</td><td><span class="badge badge-green">حاضر</span></td></tr>'
      ).join('') || '<tr><td colspan="6" style="text-align:center;color:#64748b;">لا يوجد حضور مسجل اليوم بعد</td></tr>';

      allBody.innerHTML = attendance.map((r, i) => 
        '<tr><td>' + (i + 1) + '</td><td><b>' + r.studentName + '</b></td><td><code>' + r.studentBarcode + '</code></td><td>' + r.subject + '</td><td>' + r.instructor + '</td><td>' + r.dateStr + '</td><td>' + r.timeStr + '</td><td><span class="badge badge-green">حاضر</span></td></tr>'
      ).join('') || '<tr><td colspan="8" style="text-align:center;color:#64748b;">لا توجد سجلات</td></tr>';

      stdBody.innerHTML = students.map(s => 
        '<tr><td>' + s.sequence + '</td><td><b>' + s.name + '</b></td><td><code>' + s.barcode + '</code></td><td>' + s.department + '</td><td>' + s.stage + '</td><td><button onclick="processBarcode(\\'' + s.barcode + '\\')" class="btn btn-outline" style="padding:4px 8px;font-size:11px;">محاكاة مسح</button></td></tr>'
      ).join('');
    }

    function exportCSV() {
      if (!attendance.length) return alert('لا توجد سجلات');
      let csv = '\uFEFFالتسلسل,اسم الطالب,الباركود,المادة,الأستاذ,التاريخ,الوقت,الحالة\\r\\n';
      attendance.forEach((r, i) => {
        csv += [(i+1), '"' + r.studentName + '"', r.studentBarcode, '"' + r.subject + '"', '"' + r.instructor + '"', r.dateStr, r.timeStr, r.status].join(',') + '\\r\\n';
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'حضور_الأمن_السيبراني.csv';
      a.click();
    }

    function clearTodayAttendance() {
      if (confirm('هل أنت متأكد من مسح جميع سجلات الحضور؟')) {
        attendance = [];
        localStorage.removeItem('yuc_attendance');
        renderTables();
      }
    }

    function showAddStudent() {
      const name = prompt('أدخل الاسم الثلاثي للطالب:');
      if (!name) return;
      const seq = prompt('أدخل التسلسل/الرقم الجامعي:', (students.length + 1).toString().padStart(2, '0'));
      const barcode = 'YUC-SEC-' + seq;
      const newS = {
        id: 'std-' + Date.now(),
        name,
        sequence: seq,
        barcode,
        department: 'هندسة تكنولوجيا الأمن السيبراني',
        stage: 'المرحلة الثانية',
        createdAt: new Date().toISOString()
      };
      students.push(newS);
      localStorage.setItem('yuc_students', JSON.stringify(students));
      renderTables();
      alert('تمت إضافة الطالب بنجاح! الباركود الخاص به: ' + barcode);
    }

    renderTables();
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'نظام_حضور_الأمن_السيبراني_ملف_واحد_مستقل.html');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
