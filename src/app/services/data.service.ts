import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Semester, Subject, Document, User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class DataService {
  private SEMESTERS_KEY = 'mca_semesters';
  private SUBJECTS_KEY = 'mca_subjects';
  private DOCUMENTS_KEY = 'mca_documents';
  private USERS_KEY = 'mca_users';

  private semestersSubject = new BehaviorSubject<Semester[]>([]);
  private subjectsSubject = new BehaviorSubject<Subject[]>([]);
  private documentsSubject = new BehaviorSubject<Document[]>([]);

  semesters$ = this.semestersSubject.asObservable();
  subjects$ = this.subjectsSubject.asObservable();
  documents$ = this.documentsSubject.asObservable();

  constructor() {
    this.initData();
  }

  private initData() {
    // Always start empty — no seed data
    const sems = localStorage.getItem(this.SEMESTERS_KEY);
    const subs = localStorage.getItem(this.SUBJECTS_KEY);
    const docs = localStorage.getItem(this.DOCUMENTS_KEY);
    const users = localStorage.getItem(this.USERS_KEY);

    this.semestersSubject.next(sems ? JSON.parse(sems) : []);
    this.subjectsSubject.next(subs ? JSON.parse(subs) : []);
    this.documentsSubject.next(docs ? JSON.parse(docs) : []);

    if (!sems) localStorage.setItem(this.SEMESTERS_KEY, JSON.stringify([]));
    if (!subs) localStorage.setItem(this.SUBJECTS_KEY, JSON.stringify([]));
    if (!docs) localStorage.setItem(this.DOCUMENTS_KEY, JSON.stringify([]));

    if (!users) {
      const defaultUsers: User[] = [
        { id: 'u1', name: 'Vinoth', email: 'vinoth@gmail.com', role: 'admin', password: 'vinoth@123' },
        { id: 'u2', name: 'Imran', email: 'imran@gmail.com', role: 'admin', password: 'imran@123' },
      ];
      localStorage.setItem(this.USERS_KEY, JSON.stringify(defaultUsers));
    }
  }

  // Semesters
  getSemesters(): Semester[] { return this.semestersSubject.value; }
  getSemester(id: string): Semester | undefined { return this.semestersSubject.value.find(s => s.id === id); }

  addSemester(sem: Omit<Semester, 'id'>): Semester {
    const newSem: Semester = { ...sem, id: 'sem_' + Date.now() };
    const updated = [...this.semestersSubject.value, newSem];
    localStorage.setItem(this.SEMESTERS_KEY, JSON.stringify(updated));
    this.semestersSubject.next(updated);
    return newSem;
  }

  updateSemester(id: string, data: Partial<Semester>) {
    const updated = this.semestersSubject.value.map(s => s.id === id ? { ...s, ...data } : s);
    localStorage.setItem(this.SEMESTERS_KEY, JSON.stringify(updated));
    this.semestersSubject.next(updated);
  }

  deleteSemester(id: string) {
    const updated = this.semestersSubject.value.filter(s => s.id !== id);
    localStorage.setItem(this.SEMESTERS_KEY, JSON.stringify(updated));
    this.semestersSubject.next(updated);
    this.getSubjectsBySemester(id).forEach(sub => this.deleteSubject(sub.id));
  }

  // Subjects
  getSubjects(): Subject[] { return this.subjectsSubject.value; }
  getSubject(id: string): Subject | undefined { return this.subjectsSubject.value.find(s => s.id === id); }
  getSubjectsBySemester(semId: string): Subject[] { return this.subjectsSubject.value.filter(s => s.semesterId === semId); }

  addSubject(sub: Omit<Subject, 'id'>): Subject {
    const newSub: Subject = { ...sub, id: 'sub_' + Date.now() };
    const updated = [...this.subjectsSubject.value, newSub];
    localStorage.setItem(this.SUBJECTS_KEY, JSON.stringify(updated));
    this.subjectsSubject.next(updated);
    return newSub;
  }

  updateSubject(id: string, data: Partial<Subject>) {
    const updated = this.subjectsSubject.value.map(s => s.id === id ? { ...s, ...data } : s);
    localStorage.setItem(this.SUBJECTS_KEY, JSON.stringify(updated));
    this.subjectsSubject.next(updated);
  }

  deleteSubject(id: string) {
    const updated = this.subjectsSubject.value.filter(s => s.id !== id);
    localStorage.setItem(this.SUBJECTS_KEY, JSON.stringify(updated));
    this.subjectsSubject.next(updated);
    this.getDocumentsBySubject(id).forEach(doc => this.deleteDocument(doc.id));
  }

  // Documents
  getDocuments(): Document[] { return this.documentsSubject.value; }
  getDocumentsBySubject(subId: string): Document[] { return this.documentsSubject.value.filter(d => d.subjectId === subId); }
  getDocumentsBySemester(semId: string): Document[] { return this.documentsSubject.value.filter(d => d.semesterId === semId); }

  addDocument(doc: Omit<Document, 'id'>): Document {
    const newDoc: Document = { ...doc, id: 'doc_' + Date.now() };
    const updated = [...this.documentsSubject.value, newDoc];
    localStorage.setItem(this.DOCUMENTS_KEY, JSON.stringify(updated));
    this.documentsSubject.next(updated);
    return newDoc;
  }

  deleteDocument(id: string) {
    const updated = this.documentsSubject.value.filter(d => d.id !== id);
    localStorage.setItem(this.DOCUMENTS_KEY, JSON.stringify(updated));
    this.documentsSubject.next(updated);
  }

  // Auth
  getUsers(): User[] {
    const u = localStorage.getItem(this.USERS_KEY);
    return u ? JSON.parse(u) : [];
  }

  authenticate(email: string, password: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.email === email && u.password === password) || null;
  }

  validateUser(user: any): User | null {
    if (!user || !user.id || !user.email) return null;
    const users = this.getUsers();
    return users.find(u => u.id === user.id && u.email === user.email) || null;
  }
}
