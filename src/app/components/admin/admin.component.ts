import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { FileStorageService } from '../../services/file-storage.service';
import { Semester, Subject, Document } from '../../models/models';

@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  activeTab: 'semesters' | 'subjects' | 'documents' = 'semesters';

  semesters: Semester[] = [];
  subjects: Subject[] = [];
  allDocuments: Document[] = [];

  // Semester form
  showSemForm = false;
  semForm: Partial<Semester> = {};
  editSemId: string | null = null;

  // Subject form
  showSubForm = false;
  subForm: Partial<Subject> = {};
  editSubId: string | null = null;

  // Document upload
  showDocForm = false;
  docForm: { name: string; subjectId: string; semesterId: string; type: string } =
    { name: '', subjectId: '', semesterId: '', type: 'pdf' };
  uploadedFile: File | null = null;
  uploadProgress = 0;
  uploading = false;
  uploadError = '';

  filterSemId = '';
  filterSubId = '';

  constructor(
    public data: DataService,
    public auth: AuthService,
    private fileStorage: FileStorageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fileStorage.init();
    this.data.semesters$.subscribe(s => this.semesters = s);
    this.data.subjects$.subscribe(s => this.subjects = s);
    this.data.documents$.subscribe(d => this.allDocuments = d);
  }

  // ── Semesters ────────────────────────────────────────
  openSemForm(sem?: Semester) {
    this.editSemId = sem?.id || null;
    this.semForm = sem
      ? { ...sem }
      : { name: '', number: this.semesters.length + 1, year: '2025-26' };
    this.showSemForm = true;
  }

  saveSemester() {
    if (!this.semForm.name || !this.semForm.number) return;
    if (this.editSemId) {
      this.data.updateSemester(this.editSemId, this.semForm);
    } else {
      this.data.addSemester(this.semForm as Omit<Semester, 'id'>);
    }
    this.showSemForm = false;
  }

  deleteSemester(id: string) {
    if (confirm('Delete this semester and all its subjects & documents?')) {
      this.data.deleteSemester(id);
    }
  }

  // ── Subjects ─────────────────────────────────────────
  getSubjectsForSem(semId: string): Subject[] {
    return this.data.getSubjectsBySemester(semId);
  }

  openSubForm(sub?: Subject) {
    this.editSubId = sub?.id || null;
    this.subForm = sub
      ? { ...sub }
      : { name: '', code: '', semesterId: this.subForm.semesterId || this.semesters[0]?.id || '' };
    this.showSubForm = true;
  }

  saveSubject() {
    if (!this.subForm.name || !this.subForm.code || !this.subForm.semesterId) return;
    if (this.editSubId) {
      this.data.updateSubject(this.editSubId, this.subForm);
    } else {
      this.data.addSubject(this.subForm as Omit<Subject, 'id'>);
    }
    this.showSubForm = false;
  }

  deleteSubject(id: string) {
    if (confirm('Delete this subject and all its documents?')) {
      this.data.deleteSubject(id);
    }
  }

  // ── Documents ─────────────────────────────────────────
  getSubjectsFiltered(): Subject[] {
    return this.docForm.semesterId
      ? this.data.getSubjectsBySemester(this.docForm.semesterId)
      : (this.filterSemId ? this.data.getSubjectsBySemester(this.filterSemId) : this.subjects);
  }

  getFilteredDocs(): Document[] {
    return this.allDocuments.filter(d =>
      (!this.filterSemId || d.semesterId === this.filterSemId) &&
      (!this.filterSubId || d.subjectId === this.filterSubId)
    );
  }

  onSemChange() {
    this.docForm.subjectId = '';
    this.filterSubId = '';
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.uploadedFile = input.files[0];
      if (!this.docForm.name) {
        this.docForm.name = this.uploadedFile.name.replace(/\.[^.]+$/, '');
      }
      const ext = this.uploadedFile.name.split('.').pop()?.toLowerCase() || '';
      this.docForm.type = ext === 'pdf' ? 'pdf'
        : (ext === 'doc' || ext === 'docx') ? 'doc'
        : (ext === 'ppt' || ext === 'pptx') ? 'ppt'
        : ext === 'txt' ? 'txt'
        : 'other';
    }
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  async uploadDocument() {
    if (!this.docForm.name || !this.docForm.subjectId || !this.uploadedFile) return;
    const sub = this.data.getSubject(this.docForm.subjectId);
    if (!sub) return;

    this.uploading = true;
    this.uploadProgress = 0;
    this.uploadError = '';

    try {
      const fileId = 'file_' + Date.now();
      let progressInterval: any = null;

      // Simulate progress while saving to IndexedDB
      progressInterval = setInterval(() => {
        if (this.uploadProgress < 90) {
          this.uploadProgress += 10;
        }
      }, 80);

      await this.fileStorage.saveFile(fileId, this.uploadedFile);

      // Clear progress interval
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      
      this.uploadProgress = 100;

      const doc: Omit<Document, 'id'> = {
        name: this.docForm.name,
        subject: sub.name,
        subjectId: this.docForm.subjectId,
        semesterId: sub.semesterId,
        type: this.docForm.type as any,
        size: this.formatSize(this.uploadedFile.size),
        uploadedAt: new Date().toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric'
        }),
        uploadedBy: this.auth.currentUser?.name || 'Admin',
        fileId
      };

      this.data.addDocument(doc);

      // Reset form and close modal
      this.uploading = false;
      this.uploadProgress = 0;
      this.docForm = { name: '', subjectId: '', semesterId: '', type: 'pdf' };
      this.uploadedFile = null;
      this.cdr.detectChanges();
      this.showDocForm = false;

    } catch (err) {
      this.uploading = false;
      this.uploadProgress = 0;
      this.uploadError = 'Upload failed. Please try again.';
      console.error('Upload error:', err);
    }
  }

  cancelUpload() {
    if (this.uploading) {
      this.uploading = false;
      this.uploadProgress = 0;
      this.uploadError = 'Upload cancelled.';
      // Don't reset the form completely, just stop the upload
      setTimeout(() => {
        this.uploadError = '';
      }, 3000);
    } else {
      // If not uploading, just close the modal and reset
      this.showDocForm = false;
      this.docForm = { name: '', subjectId: '', semesterId: '', type: 'pdf' };
      this.uploadedFile = null;
      this.uploadProgress = 0;
      this.uploadError = '';
    }
  }

  getSemesterName(id: string): string { return this.data.getSemester(id)?.name || '—'; }
  getSubjectName(id: string): string { return this.data.getSubject(id)?.name || '—'; }

  async deleteDoc(id: string) {
    if (!confirm('Delete this document?')) return;
    const doc = this.allDocuments.find(d => d.id === id);
    if (doc?.fileId) await this.fileStorage.deleteFile(doc.fileId);
    this.data.deleteDocument(id);
  }
}
