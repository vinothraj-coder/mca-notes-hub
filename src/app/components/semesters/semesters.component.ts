import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Semester } from '../../models/models';

@Component({
  selector: 'app-semesters',
  standalone: false,
  templateUrl: './semesters.component.html',
  styleUrls: ['./semesters.component.scss']
})
export class SemestersComponent implements OnInit {
  semesters: Semester[] = [];

  constructor(private data: DataService) {}

  ngOnInit() {
    this.data.semesters$.subscribe(sems => {
      this.semesters = sems.map(s => ({
        ...s,
        subjectCount: this.data.getSubjectsBySemester(s.id).length,
      }));
    });
  }

  getDocCount(semId: string): number {
    return this.data.getDocumentsBySemester(semId).length;
  }
}
