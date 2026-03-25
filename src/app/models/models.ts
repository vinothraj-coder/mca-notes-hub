export interface Document {
  id: string;
  name: string;
  subject: string;
  subjectId: string;
  semesterId: string;
  type: 'pdf' | 'doc' | 'ppt' | 'txt' | 'other';
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  fileId: string; // key into IndexedDB
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  semesterId: string;
  description?: string;
  documentCount?: number;
}

export interface Semester {
  id: string;
  name: string;
  number: number;
  year: string;
  subjectCount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  password: string;
}
