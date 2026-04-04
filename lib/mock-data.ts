// Mock Data for Testing - Replace with real API calls later

export interface User {
  id: string;
  email: string;
  password: string;
  fullName: string;
  role: 'parent' | 'teacher';
  phoneNumber: string;
}

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  medicalNotes: string;
  parentId: string;
}

export interface WearableDevice {
  id: string;
  childId: string;
  deviceSerial: string;
  batteryLevel: number;
  isLocked: boolean;
  lastSync: string;
  status: 'active' | 'inactive';
}

export interface Prescription {
  id: string;
  childId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  instructions: string;
}

export interface MedicineSchedule {
  id: string;
  prescriptionId: string;
  scheduledTime: string;
  dayOfWeek?: string;
  reminderEnabled: boolean;
}

export interface IntakeLog {
  id: string;
  scheduleId: string;
  childId: string;
  scheduledTime: string;
  actualIntakeTime?: string;
  status: 'taken' | 'missed' | 'pending';
  confirmationMethod?: 'device' | 'parent' | 'teacher';
}

// MOCK USERS
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'parent@example.com',
    password: 'parent123',
    fullName: 'John Doe',
    role: 'parent',
    phoneNumber: '+254712345678'
  },
  {
    id: '2',
    email: 'teacher@example.com',
    password: 'teacher123',
    fullName: 'Jane Smith',
    role: 'teacher',
    phoneNumber: '+254787654321'
  }
];

// MOCK CHILDREN
export const mockChildren: Child[] = [
  {
    id: '1',
    firstName: 'Alex',
    lastName: 'Doe',
    dateOfBirth: '2015-03-15',
    medicalNotes: 'Mild asthma, allergic to penicillin',
    parentId: '1'
  }
];

// MOCK WEARABLE DEVICES
export const mockDevices: WearableDevice[] = [
  {
    id: '1',
    childId: '1',
    deviceSerial: 'MRW-2024-001',
    batteryLevel: 75,
    isLocked: true,
    lastSync: '2026-03-03T10:30:00',
    status: 'active'
  }
];

// MOCK PRESCRIPTIONS
export const mockPrescriptions: Prescription[] = [
  {
    id: '1',
    childId: '1',
    medicineName: 'Amoxicillin',
    dosage: '250mg',
    frequency: '3 times daily',
    startDate: '2026-03-01',
    endDate: '2026-03-10',
    instructions: 'Take with food'
  },
  {
    id: '2',
    childId: '1',
    medicineName: 'Vitamin D',
    dosage: '1000 IU',
    frequency: 'Once daily',
    startDate: '2026-03-01',
    instructions: 'Take in the morning'
  }
];

// MOCK SCHEDULES
export const mockSchedules: MedicineSchedule[] = [
  {
    id: '1',
    prescriptionId: '1',
    scheduledTime: '08:00',
    reminderEnabled: true
  },
  {
    id: '2',
    prescriptionId: '1',
    scheduledTime: '14:00',
    reminderEnabled: true
  },
  {
    id: '3',
    prescriptionId: '1',
    scheduledTime: '20:00',
    reminderEnabled: true
  },
  {
    id: '4',
    prescriptionId: '2',
    scheduledTime: '09:00',
    reminderEnabled: true
  }
];

// MOCK INTAKE LOGS
export const mockIntakeLogs: IntakeLog[] = [
  {
    id: '1',
    scheduleId: '1',
    childId: '1',
    scheduledTime: '2026-03-03T08:00:00',
    actualIntakeTime: '2026-03-03T08:05:00',
    status: 'taken',
    confirmationMethod: 'device'
  },
  {
    id: '2',
    scheduleId: '2',
    childId: '1',
    scheduledTime: '2026-03-03T14:00:00',
    status: 'pending'
  },
  {
    id: '3',
    scheduleId: '1',
    childId: '1',
    scheduledTime: '2026-03-02T08:00:00',
    status: 'missed'
  }
];