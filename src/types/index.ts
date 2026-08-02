export type CohortType = 'Group A' | 'Group B';

export type UserRole = 'faculty' | 'student';

export interface TeachingMethod {
  id: string;
  name: string;
  cohort: CohortType;
  implementation: string;
  expectedOutcome: string;
  detailedDescription?: string;
  iconName?: string;
  category: 'Innovative' | 'Active Learning' | 'Assessment' | 'Peer & Collaborative' | 'AI & Tech Supported';
  tags: string[];
  materialsCount?: number;
  featured?: boolean;
}

export interface CohortInfo {
  id: CohortType;
  title: string;
  subtitle: string;
  code: 'ALC' | 'FLC';
  description: string;
  targetAudience: string;
  studentCount: number;
  badgeColor: string;
  gradient: string;
}

export interface WeeklyActivity {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  groupAActivity: string;
  groupBActivity: string;
  groupAMethodId?: string;
  groupBMethodId?: string;
  timeSlot?: string;
  location?: string;
  status: 'Completed' | 'In Progress' | 'Scheduled';
}

export interface CoursewareResource {
  id: string;
  title: string;
  fileName?: string;
  fileSize?: string;
  type: 'video' | 'paper' | 'quiz' | 'simulation' | 'pdf' | 'code';
  subject: string;
  cohort: CohortType | 'All';
  methodId?: string;
  url: string;
  description: string;
  addedBy: string;
  dateAdded: string;
  downloads?: number;
  contentSnippet?: string;
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  cohort: CohortType;
  gpa: number;
  attendance: number;
  strengths: string[];
  focusAreas: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface ExpectedOutcomeMetric {
  id: string;
  title: string;
  value: string;
  percentage: number;
  description: string;
  cohortTarget: CohortType | 'Both';
  icon: string;
}
