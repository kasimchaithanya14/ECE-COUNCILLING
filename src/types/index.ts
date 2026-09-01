export type CohortType = 'Unified Learning Cohort';

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
  videoUrl?: string;
}

export interface CohortInfo {
  id: CohortType;
  title: string;
  subtitle: string;
  code: 'ULC' | 'Unified' | string;
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
  cohort?: string;
  gpa: number;
  attendance: number;
  strengths: string[];
  focusAreas: string[];
  department?: string;
  year?: string;
  semester?: string;
  section?: string;
  phone?: string;
  academicStatus?: string;
  parentName?: string;
  notes?: string;
  batch?: string;
  assignedSubAdminId?: number;
  assignedSubAdminName?: string;
  latestCounsellingDate?: string;
  latestCounsellorName?: string;
  counsellingSessionsCount?: number;
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
  cohortTarget: CohortType | 'All' | 'Both';
  icon: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  username: string;
  role: 'SUPER_ADMIN' | 'SUB_ADMIN';
  status: 'Active' | 'Disabled';
  permissionsList: string[];
  created_at: string;
  last_login?: string;
}

export interface AuditLog {
  id: number;
  user: string;
  action: string;
  date_time: string;
  target: string;
  status: string;
}

export interface MediaSubmission {
  id: number;
  submitter_name: string;
  submitter_email: string | null;
  teaching_method_id: string;
  teaching_method_name?: string;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  description: string | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  rejection_reason: string | null;
  created_at: string;
}

export interface CounsellingSession {
  id: number;
  student_id: string;
  counsellor_id: number;
  counsellor_name: string;
  counselling_date: string;
  type: string;
  private_notes: string;
  student_concerns?: string;
  guidance?: string;
  action_items?: string;
  follow_up_date?: string;
  follow_up_required: 'Yes' | 'No';
  status: 'Draft' | 'Completed' | 'Follow-Up Required';
  publish_to_home?: number;
  allow_student_name_public?: number;
  public_title?: string;
  public_summary?: string;
  created_at?: string;
  updated_at?: string;
  student_name?: string;
  student_roll?: string;
}

export interface TeachingTask {
  id: number;
  super_admin_id: number;
  super_admin_name?: string;
  sub_admin_id: number;
  sub_admin_name?: string;
  sub_admin_email?: string;
  sub_admin_username?: string;
  topic: string;
  description?: string;
  department: string;
  date: string;
  time: string;
  no_of_faculty: number;
  status: 'Pending' | 'Submitted' | 'Approved' | 'Rejected';
  submissions_count?: number;
  latest_submission_id?: number;
  submission_id?: number;
  submission_date?: string;
  submission_time?: string;
  submission_file_path?: string;
  submission_file_name?: string;
  submission_file_size?: number;
  submission_file_type?: string;
  submission_description?: string;
  submission_status?: 'Pending' | 'Submitted' | 'Approved' | 'Rejected';
  submission_feedback?: string | null;
  submitted_at?: string;
  submission_approved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeachingSubmission {
  id: number;
  s_no?: number;
  task_id?: number | null;
  super_admin_id?: number;
  sub_admin_id: number;
  sub_admin_name?: string;
  sub_admin_email?: string;
  sub_admin_username?: string;
  sub_admin_display?: string;
  faculty_lead_name?: string;
  faculty_lead_email?: string;
  topic: string;
  date: string;
  time: string;
  no_of_faculty: number;
  department: string;
  description: string;
  file_path: string;
  file_name: string;
  file_type?: string;
  file_size?: number;
  status: 'Pending' | 'Submitted' | 'Approved' | 'Rejected';
  feedback?: string | null;
  created_at: string;
  approved_at?: string | null;
  task_topic?: string;
  task_status?: string;
}


