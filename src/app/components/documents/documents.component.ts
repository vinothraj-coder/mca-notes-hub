import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { FileStorageService } from '../../services/file-storage.service';
import { Document, Subject, Semester } from '../../models/models';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-documents',
  standalone: false,
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {
  semester!: Semester;
  subject!: Subject;
  documents: Document[] = [];

  viewingDoc: Document | null = null;
  viewingUrl: SafeResourceUrl | null = null;
  viewingObjectUrl: string | null = null;
  loadingView = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public data: DataService,
    public auth: AuthService,
    private fileStorage: FileStorageService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const semId = this.route.snapshot.paramMap.get('semId')!;
    const subId = this.route.snapshot.paramMap.get('subId')!;
    const sem = this.data.getSemester(semId);
    const sub = this.data.getSubject(subId);
    if (!sem || !sub) { this.router.navigate(['/semesters']); return; }
    this.semester = sem;
    this.subject = sub;
    this.data.documents$.subscribe(() => {
      this.documents = this.data.getDocumentsBySubject(subId);
    });
  }

  getFileIcon(type: string): string {
    const icons: Record<string, string> = {
      pdf: '📕', doc: '📘', ppt: '📙', txt: '📄', other: '📎'
    };
    return icons[type] || '📎';
  }

  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      pdf: '#ef4444', doc: '#3b82f6', ppt: '#f97316', txt: '#6b7280', other: '#8b5cf6'
    };
    return colors[type] || '#8b5cf6';
  }

  async viewDocument(doc: Document) {
    this.loadingView = true;
    this.viewingDoc = doc;
    this.revokeObjectUrl();
    this.viewingUrl = null;
    
    try {
      const stored = await this.fileStorage.getFile(doc.fileId);
      
      if (stored && stored.file) {
        const url = URL.createObjectURL(stored.file);
        this.viewingObjectUrl = url;
        this.viewingUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        
        // Create HTML page with filename as title
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${doc.name}</title>
            <style>
              body { margin: 0; padding: 0; }
              iframe { width: 100%; height: 100vh; border: none; }
            </style>
          </head>
          <body>
            <iframe src="${url}" title="${doc.name}"></iframe>
          </body>
          </html>
        `;
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const htmlUrl = URL.createObjectURL(blob);
        
        // Open in new tab
        window.open(htmlUrl, '_blank');
        
        // Close modal
        this.loadingView = false;
        this.viewingDoc = null;
        this.viewingUrl = null;
        this.cdr.detectChanges();
      } else {
        this.loadingView = false;
      }
    } catch (e) {
      this.loadingView = false;
    }
  }

  async downloadDocument(doc: Document) {
    try {
      const stored = await this.fileStorage.getFile(doc.fileId);
      if (stored) {
        const url = URL.createObjectURL(stored.file);
        const a = document.createElement('a');
        a.href = url;
        a.download = stored.name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (e) {
      console.error('Download error', e);
    }
  }

  revokeObjectUrl() {
    if (this.viewingObjectUrl) {
      URL.revokeObjectURL(this.viewingObjectUrl);
      this.viewingObjectUrl = null;
    }
  }

  closeViewer() {
    this.revokeObjectUrl();
    this.viewingDoc = null;
    this.viewingUrl = null;
  }

  async deleteDocument(id: string) {
    if (!confirm('Delete this document?')) return;
    const doc = this.documents.find(d => d.id === id);
    if (doc?.fileId) await this.fileStorage.deleteFile(doc.fileId);
    this.data.deleteDocument(id);
  }
}
