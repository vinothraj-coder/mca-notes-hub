# 📚 StudyHub – MCA A25 Batch

A full-featured Angular study notes hub for MCA A25 Batch students.

## Features

- 🗓️ **Semester Management** – Browse all semesters with subject & document counts
- 📚 **Subject Pages** – Subject-wise material organization with course codes
- 📄 **Document Viewer** – View PDFs inline or download any file
- 🔐 **Admin Panel** – Full CRUD: create semesters, subjects, upload documents
- 💾 **localStorage Persistence** – All data persists in the browser
- 📱 **Responsive Design** – Works on mobile, tablet, and desktop

## Demo Credentials

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@mca.edu          | admin123    |
| Student | student@mca.edu        | student123  |

Guests can also browse without logging in.

## Getting Started

### Prerequisites
- Node.js 18+
- Angular CLI: `npm install -g @angular/cli`

### Run Locally
```bash
npm install
ng serve
# Visit http://localhost:4200
```

### Production Build
```bash
ng build --configuration=production
# Output in dist/mca-study-hub/browser/
```

## Project Structure

```
src/app/
├── models/          # TypeScript interfaces
├── services/        # DataService (localStorage) + AuthService
├── guards/          # AdminGuard for protected routes
├── pipes/           # SafeUrlPipe for PDF iframe
└── components/
    ├── navbar/      # Responsive navigation bar
    ├── home/        # Landing page with stats
    ├── semesters/   # Semester listing
    ├── subjects/    # Subjects per semester
    ├── documents/   # Documents + PDF viewer modal
    ├── login/       # Split-screen login page
    └── admin/       # Admin sidebar panel
```

## Routes

| Path | Component | Access |
|------|-----------|--------|
| `/` | Home | Public |
| `/semesters` | Semester list | Public |
| `/semesters/:semId` | Subject list | Public |
| `/semesters/:semId/subjects/:subId` | Documents | Public |
| `/login` | Login | Public |
| `/admin` | Admin Panel | Admin only |
