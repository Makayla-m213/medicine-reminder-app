// Teacher-specific mock data

export interface TeacherNote {
  id: string;
  studentId: string;
  teacherId: string;
  noteText: string;
  createdAt: string;
  concern: boolean; // true if flagged as concern
}

export interface StudentPrescriptionStatus {
  studentId: string;
  studentName: string;
  studentAge: number;
  prescriptionId: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  status: 'completed' | 'pending' | 'missed';
  dateLogged: string;
}

// Mock students assigned to current teacher
export const mockAssignedStudents = [
  {
    id: '1',
    name: 'Alex Doe',
    age: 8,
    grade: 'Grade 3',
    parentName: 'John Doe',
    parentContact: '+254712345678',
    medicalNotes: 'Mild asthma, allergic to penicillin',
  },
  {
    id: '2',
    name: 'Emma Smith',
    age: 7,
    grade: 'Grade 2',
    parentName: 'Sarah Smith',
    parentContact: '+254787654321',
    medicalNotes: 'Type 1 diabetes',
  },
  {
    id: '3',
    name: 'Liam Johnson',
    age: 9,
    grade: 'Grade 4',
    parentName: 'Michael Johnson',
    parentContact: '+254798765432',
    medicalNotes: 'ADHD medication required',
  },
];

// Mock prescription statuses for today
export const mockPrescriptionStatuses: StudentPrescriptionStatus[] = [
  {
    studentId: '1',
    studentName: 'Alex Doe',
    studentAge: 8,
    prescriptionId: 'p1',
    medicineName: 'Amoxicillin',
    dosage: '250mg',
    scheduledTime: '10:00 AM',
    status: 'completed',
    dateLogged: '2026-03-31T10:05:00',
  },
  {
    studentId: '1',
    studentName: 'Alex Doe',
    studentAge: 8,
    prescriptionId: 'p2',
    medicineName: 'Vitamin D',
    dosage: '1000 IU',
    scheduledTime: '12:00 PM',
    status: 'pending',
    dateLogged: '2026-03-31',
  },
  {
    studentId: '2',
    studentName: 'Emma Smith',
    studentAge: 7,
    prescriptionId: 'p3',
    medicineName: 'Insulin',
    dosage: '5 units',
    scheduledTime: '09:00 AM',
    status: 'completed',
    dateLogged: '2026-03-31T09:03:00',
  },
  {
    studentId: '2',
    studentName: 'Emma Smith',
    studentAge: 7,
    prescriptionId: 'p4',
    medicineName: 'Insulin',
    dosage: '5 units',
    scheduledTime: '02:00 PM',
    status: 'pending',
    dateLogged: '2026-03-31',
  },
  {
    studentId: '3',
    studentName: 'Liam Johnson',
    studentAge: 9,
    prescriptionId: 'p5',
    medicineName: 'Ritalin',
    dosage: '10mg',
    scheduledTime: '08:00 AM',
    status: 'completed',
    dateLogged: '2026-03-31T08:02:00',
  },
  {
    studentId: '3',
    studentName: 'Liam Johnson',
    studentAge: 9,
    prescriptionId: 'p6',
    medicineName: 'Ritalin',
    dosage: '10mg',
    scheduledTime: '01:00 PM',
    status: 'missed',
    dateLogged: '2026-03-31T13:15:00',
  },
];

// Mock teacher notes (stored in localStorage in real app)
export const mockTeacherNotes: TeacherNote[] = [
  {
    id: 'n1',
    studentId: '1',
    teacherId: 'teacher-123',
    noteText: 'Alex took medicine on time. No issues.',
    createdAt: '2026-03-30T10:30:00',
    concern: false,
  },
  {
    id: 'n2',
    studentId: '2',
    teacherId: 'teacher-123',
    noteText: 'Emma complained of dizziness after insulin. Contacted parent.',
    createdAt: '2026-03-29T14:15:00',
    concern: true,
  },
];