import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Semester, Subject } from '../../models/models';

@Component({
  selector: 'app-subjects',
  standalone: false,
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.scss']
})
export class SubjectsComponent implements OnInit {
  semester!: Semester;
  subjects: Subject[] = [];

  constructor(private route: ActivatedRoute, private router: Router, private data: DataService) {}

  ngOnInit() {
    const semId = this.route.snapshot.paramMap.get('semId')!;
    const sem = this.data.getSemester(semId);
    if (!sem) { this.router.navigate(['/semesters']); return; }
    this.semester = sem;
    this.data.subjects$.subscribe(() => {
      this.subjects = this.data.getSubjectsBySemester(semId).map(s => ({
        ...s,
        documentCount: this.data.getDocumentsBySubject(s.id).length
      }));
    });
  }
}
