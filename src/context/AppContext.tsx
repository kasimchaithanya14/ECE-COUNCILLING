import React, { createContext, useContext, useState, useEffect } from 'react';
import { TeachingMethod, WeeklyActivity, CoursewareResource, Student, UserRole, CohortType, AdminUser, AuditLog, MediaSubmission, CounsellingSession } from '../types';
import {
  INITIAL_TEACHING_METHODS,
  INITIAL_WEEKLY_PLAN,
  INITIAL_COURSEWARE_RESOURCES,
  INITIAL_STUDENTS,
} from '../data/initialData';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  activeCohort: CohortType | 'All';
  setActiveCohort: (cohort: CohortType | 'All') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Teaching Methods
  teachingMethods: TeachingMethod[];
  updateMethod: (method: TeachingMethod) => void;
  addMethod: (method: TeachingMethod) => void;
  deleteMethod: (id: string) => void;
  
  // Weekly Activity Plan
  weeklyPlan: WeeklyActivity[];
  updateWeeklyActivity: (activity: WeeklyActivity) => void;
  
  // Resources
  resources: CoursewareResource[];
  addResource: (resource: CoursewareResource) => void;
  deleteResource: (id: string) => void;
  
  // Students
  students: Student[];
  updateStudentCohort: (studentId: string, cohort: CohortType) => void;
  
  // Modals & Resource Viewer
  selectedMethod: TeachingMethod | null;
  setSelectedMethod: (method: TeachingMethod | null) => void;
  viewingResource: CoursewareResource | null;
  setViewingResource: (resource: CoursewareResource | null) => void;
  isAITutorOpen: boolean;
  setIsAITutorOpen: (open: boolean) => void;
  isDailyQuizOpen: boolean;
  setIsDailyQuizOpen: (open: boolean) => void;
  editingMethod: TeachingMethod | null;
  setEditingMethod: (method: TeachingMethod | null) => void;
  
  // Notification Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
  
  // Data Reset
  resetDataToDefault: () => void;

  // Admin & Security States
  adminUser: AdminUser | null;
  isAdminLoggedIn: boolean;
  isApiMode: boolean;
  subAdmins: AdminUser[];
  auditLogs: AuditLog[];
  adminLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  fetchSubAdmins: () => Promise<void>;
  createSubAdmin: (data: any) => Promise<{ success: boolean; error?: string }>;
  updateSubAdmin: (id: number, data: any) => Promise<{ success: boolean; error?: string }>;
  toggleTeachingMethodPermission: (id: number, granted: boolean) => Promise<{ success: boolean; error?: string }>;
  resetSubAdminPassword: (id: number, data: any) => Promise<{ success: boolean; error?: string }>;
  deleteSubAdmin: (id: number) => Promise<{ success: boolean; error?: string }>;
  fetchAuditLogs: () => Promise<void>;
  syncData: () => Promise<void>;
  mediaSubmissions: MediaSubmission[];
  fetchMediaSubmissions: () => Promise<void>;
  approveSubmission: (id: number) => Promise<{ success: boolean; error?: string }>;
  rejectSubmission: (id: number, reason?: string) => Promise<{ success: boolean; error?: string }>;
  deleteSubmission: (id: number) => Promise<{ success: boolean; error?: string }>;
  submitMedia: (formData: FormData) => Promise<{ success: boolean; message?: string; error?: string }>;
  fetchApprovedMedia: (methodId: string) => Promise<MediaSubmission[]>;
  adminStudents: Student[];
  fetchAdminStudents: () => Promise<void>;
  addStudent: (data: any) => Promise<{ success: boolean; error?: string; studentId?: string; duplicate?: boolean; existingStudentId?: string }>;
  updateStudent: (id: string, data: any) => Promise<{ success: boolean; error?: string }>;
  deleteStudent: (id: string) => Promise<{ success: boolean; error?: string }>;
  fetchCounsellingHistory: (studentId: string) => Promise<CounsellingSession[]>;
  addCounsellingSession: (studentId: string, data: any) => Promise<{ success: boolean; error?: string }>;
  updateCounsellingSession: (sessionId: number, data: any) => Promise<{ success: boolean; error?: string }>;
  deleteCounsellingSession: (sessionId: number) => Promise<{ success: boolean; error?: string }>;
  assignments: any[];
  assignmentHistory: any[];
  fetchAssignments: () => Promise<void>;
  fetchAssignmentHistory: () => Promise<void>;
  assignStudents: (subAdminId: number | string, studentIds: string[], forceReassign: boolean, reason?: string) => Promise<any>;
  removeAssignment: (studentId: string) => Promise<{ success: boolean; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Traditional Local Roles (default: faculty/student selection)
  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('dhanekula_role') as UserRole) || 'student';
  });
  
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('dhanekula_theme');
    if (saved) return saved as 'dark' | 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [activeCohort, setActiveCohort] = useState<CohortType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Core Entity States
  const [teachingMethods, setTeachingMethods] = useState<TeachingMethod[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyActivity[]>([]);
  const [resources, setResources] = useState<CoursewareResource[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Admin & Security States
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isApiMode, setIsApiMode] = useState<boolean>(false);
  const [subAdmins, setSubAdmins] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [mediaSubmissions, setMediaSubmissions] = useState<MediaSubmission[]>([]);
  const [adminStudents, setAdminStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assignmentHistory, setAssignmentHistory] = useState<any[]>([]);

  // Modal States
  const [selectedMethod, setSelectedMethod] = useState<TeachingMethod | null>(null);
  const [viewingResource, setViewingResource] = useState<CoursewareResource | null>(null);
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);
  const [isDailyQuizOpen, setIsDailyQuizOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<TeachingMethod | null>(null);

  // Toast Function
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sync data from Express API with Local Storage fallback
  const syncData = async () => {
    try {
      const response = await fetch('/api/methods');
      if (response.ok) {
        const methodsData = await response.json();
        const schedRes = await fetch('/api/schedule');
        const schedData = await schedRes.json();
        const resRes = await fetch('/api/resources');
        const resData = await resRes.json();
        const studRes = await fetch('/api/students', { credentials: 'include' });
        const studData = studRes.ok ? await studRes.json() : [];

        setTeachingMethods(methodsData);
        setWeeklyPlan(schedData);
        setResources(resData);
        setStudents(studData);
        setIsApiMode(true);
      } else {
        throw new Error('API server unreachable');
      }
    } catch (error) {
      console.warn('Backend offline, using localStorage/static fallback.', error);
      setIsApiMode(false);
      
      // Local Storage Fallback initialization
      const savedMethods = localStorage.getItem('dhanekula_methods');
      setTeachingMethods(savedMethods ? JSON.parse(savedMethods) : INITIAL_TEACHING_METHODS);

      const savedWeekly = localStorage.getItem('dhanekula_weekly_plan');
      setWeeklyPlan(savedWeekly ? JSON.parse(savedWeekly) : INITIAL_WEEKLY_PLAN);

      const savedResources = localStorage.getItem('dhanekula_resources');
      setResources(savedResources ? JSON.parse(savedResources) : INITIAL_COURSEWARE_RESOURCES);

      const savedStudents = localStorage.getItem('dhanekula_students');
      setStudents(savedStudents ? JSON.parse(savedStudents) : INITIAL_STUDENTS);
    }
  };

  // Check auth session on startup and load resources
  useEffect(() => {
    const initSession = async () => {
      await syncData();
      try {
        const meRes = await fetch('/api/auth/me', { credentials: 'include' });
        if (meRes.ok) {
          const data = await meRes.json();
          setAdminUser(data.user);
          // Set role to faculty to allow edit triggers in basic tabs
          setRoleState('faculty');
        } else {
          setRoleState('student');
        }
      } catch (err) {
        setRoleState('student');
        console.log('No active admin session found.');
      }
    };
    initSession();
  }, []);

  // Theme Sync effect
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('dhanekula_theme', theme);
  }, [theme]);

  // Persist fallback variables to localStorage on updates (when API mode is false)
  useEffect(() => {
    if (!isApiMode && teachingMethods.length > 0) {
      localStorage.setItem('dhanekula_methods', JSON.stringify(teachingMethods));
    }
  }, [teachingMethods, isApiMode]);

  useEffect(() => {
    if (!isApiMode && weeklyPlan.length > 0) {
      localStorage.setItem('dhanekula_weekly_plan', JSON.stringify(weeklyPlan));
    }
  }, [weeklyPlan, isApiMode]);

  useEffect(() => {
    if (!isApiMode && resources.length > 0) {
      localStorage.setItem('dhanekula_resources', JSON.stringify(resources));
    }
  }, [resources, isApiMode]);

  useEffect(() => {
    if (!isApiMode && students.length > 0) {
      localStorage.setItem('dhanekula_students', JSON.stringify(students));
    }
  }, [students, isApiMode]);

  const setRole = (newRole: UserRole) => {
    if (newRole === 'faculty' && !adminUser) {
      showToast("Access Denied: Admin login required.");
      return;
    }
    setRoleState(newRole);
    localStorage.setItem('dhanekula_role', newRole);
    showToast(`Switched access mode: ${newRole.toUpperCase()}`);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // ==========================================
  // ACADEMIC OPERATION ACTIONS (Synced with API or Local Storage)
  // ==========================================

  const updateMethod = async (updated: TeachingMethod) => {
    if (isApiMode) {
      try {
        const res = await fetch(`/api/methods/${updated.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
          credentials: 'include'
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to update method on server.');
        }
        showToast(`Updated teaching method: "${updated.name}"`);
        await syncData();
      } catch (err: any) {
        showToast(`Error: ${err.message}`);
      }
    } else {
      setTeachingMethods((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      if (selectedMethod && selectedMethod.id === updated.id) {
        setSelectedMethod(updated);
      }
      showToast(`Updated teaching method: "${updated.name}"`);
    }
  };

  const addMethod = async (newMethod: TeachingMethod) => {
    if (isApiMode) {
      try {
        const res = await fetch('/api/methods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMethod),
          credentials: 'include'
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to create method on server.');
        }
        showToast(`Added new method: "${newMethod.name}"`);
        await syncData();
      } catch (err: any) {
        showToast(`Error: ${err.message}`);
      }
    } else {
      setTeachingMethods((prev) => [newMethod, ...prev]);
      showToast(`Added new method: "${newMethod.name}"`);
    }
  };

  const deleteMethod = async (id: string) => {
    const target = teachingMethods.find(m => m.id === id);
    if (isApiMode) {
      try {
        const res = await fetch(`/api/methods/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to delete method on server.');
        }
        showToast(`Deleted method: "${target?.name || id}"`);
        await syncData();
      } catch (err: any) {
        showToast(`Error: ${err.message}`);
      }
    } else {
      setTeachingMethods((prev) => prev.filter((m) => m.id !== id));
      showToast(`Deleted method: "${target?.name || id}"`);
    }
  };

  const updateWeeklyActivity = async (updated: WeeklyActivity) => {
    if (isApiMode) {
      try {
        const res = await fetch(`/api/schedule/${updated.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
          credentials: 'include'
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to update schedule.');
        }
        showToast(`Updated schedule for ${updated.day}`);
        await syncData();
      } catch (err: any) {
        showToast(`Error: ${err.message}`);
      }
    } else {
      setWeeklyPlan((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      showToast(`Updated schedule for ${updated.day}`);
    }
  };

  const addResource = async (resObj: CoursewareResource) => {
    if (isApiMode) {
      try {
        const res = await fetch('/api/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resObj),
          credentials: 'include'
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to add resource.');
        }
        showToast(`Uploaded courseware file: "${resObj.title}"`);
        await syncData();
      } catch (err: any) {
        showToast(`Error: ${err.message}`);
      }
    } else {
      setResources((prev) => [resObj, ...prev]);
      showToast(`Uploaded courseware file: "${resObj.title}"`);
    }
  };

  const deleteResource = async (id: string) => {
    const target = resources.find(r => r.id === id);
    if (isApiMode) {
      try {
        const res = await fetch(`/api/resources/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to delete resource.');
        }
        showToast(`Deleted resource file: "${target?.title || id}"`);
        await syncData();
      } catch (err: any) {
        showToast(`Error: ${err.message}`);
      }
    } else {
      setResources((prev) => prev.filter((r) => r.id !== id));
      showToast(`Deleted resource file: "${target?.title || id}"`);
    }
  };

  const updateStudentCohort = async (studentId: string, cohort: CohortType) => {
    if (isApiMode) {
      try {
        const res = await fetch(`/api/students/${studentId}/cohort`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cohort }),
          credentials: 'include'
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to update student cohort.');
        }
        showToast(`Assigned student to ${cohort}`);
        await syncData();
      } catch (err: any) {
        showToast(`Error: ${err.message}`);
      }
    } else {
      setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, cohort } : s)));
      showToast(`Assigned student to ${cohort}`);
    }
  };

  const resetDataToDefault = () => {
    setTeachingMethods(INITIAL_TEACHING_METHODS);
    setWeeklyPlan(INITIAL_WEEKLY_PLAN);
    setResources(INITIAL_COURSEWARE_RESOURCES);
    setStudents(INITIAL_STUDENTS);
    localStorage.removeItem('dhanekula_methods');
    localStorage.removeItem('dhanekula_weekly_plan');
    localStorage.removeItem('dhanekula_resources');
    localStorage.removeItem('dhanekula_students');
    showToast('Reset baseline syllabus data.');
  };

  // ==========================================
  // ADMIN SYSTEM ENDPOINT METHODS
  // ==========================================

  const adminLogin = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed.' };
      }
      setAdminUser(data.user);
      setRoleState('faculty'); // Ensure they have faculty edit triggers enabled
      showToast(`Welcome back, ${data.user.name}`);
      await syncData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Cannot connect to backend auth service.' };
    }
  };

  const adminLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.warn('Network issue during logout cleanup');
    }
    setAdminUser(null);
    setSubAdmins([]);
    setAuditLogs([]);
    setRoleState('student');
    localStorage.setItem('dhanekula_role', 'student');
    showToast('Logged out securely.');
  };

  const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to change password.' };
      }
      showToast('Your password has been changed successfully.');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error. Failed to change password.' };
    }
  };

  const fetchSubAdmins = async () => {
    try {
      const res = await fetch('/api/admin/sub-admins', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSubAdmins(data);
      }
    } catch (err) {
      console.error('Error fetching sub admins', err);
    }
  };

  const createSubAdmin = async (data: any) => {
    try {
      const res = await fetch('/api/admin/sub-admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      const body = await res.json();
      if (!res.ok) {
        return { success: false, error: body.error || 'Failed to create sub-admin.' };
      }
      showToast(`Created sub-admin: "${data.name}"`);
      await fetchSubAdmins();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error. Failed to communicate with server.' };
    }
  };

  const updateSubAdmin = async (id: number, data: any) => {
    try {
      const res = await fetch(`/api/admin/sub-admins/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      const body = await res.json();
      if (!res.ok) {
        return { success: false, error: body.error || 'Failed to update sub-admin.' };
      }
      showToast(`Updated sub-admin: "${data.name}"`);
      await fetchSubAdmins();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error.' };
    }
  };

  const toggleTeachingMethodPermission = async (id: number, granted: boolean) => {
    try {
      const res = await fetch(`/api/admin/sub-admins/${id}/permissions/teaching-methods`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ granted }),
        credentials: 'include'
      });
      const body = await res.json();
      if (!res.ok) {
        return { success: false, error: body.error || 'Failed to update permission.' };
      }
      showToast(body.message || (granted ? 'Permission granted.' : 'Permission revoked.'));
      await fetchSubAdmins();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error.' };
    }
  };

  const resetSubAdminPassword = async (id: number, data: any) => {
    try {
      const res = await fetch(`/api/admin/sub-admins/${id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      const body = await res.json();
      if (!res.ok) {
        return { success: false, error: body.error || 'Failed to reset password.' };
      }
      showToast('Password reset completed successfully.');
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error.' };
    }
  };

  const deleteSubAdmin = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/sub-admins/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const body = await res.json();
      if (!res.ok) {
        return { success: false, error: body.error || 'Failed to delete sub-admin.' };
      }
      showToast('Sub-admin deleted.');
      await fetchSubAdmins();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error.' };
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error('Error fetching audit logs', err);
    }
  };

  const fetchMediaSubmissions = async () => {
    try {
      const res = await fetch('/api/admin/submissions', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMediaSubmissions(data);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  const approveSubmission = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/submissions/${id}/approve`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to approve.' };
      }
      showToast('Media submission approved.');
      await fetchMediaSubmissions();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error.' };
    }
  };

  const rejectSubmission = async (id: number, reason?: string) => {
    try {
      const res = await fetch(`/api/admin/submissions/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to reject.' };
      }
      showToast('Media submission rejected.');
      await fetchMediaSubmissions();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error.' };
    }
  };

  const deleteSubmission = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to delete.' };
      }
      showToast('Media submission deleted.');
      await fetchMediaSubmissions();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error.' };
    }
  };

  const submitMedia = async (formData: FormData) => {
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to submit media.' };
      }
      showToast('Media submitted successfully!');
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: 'Network error.' };
    }
  };

  const fetchApprovedMedia = async (methodId: string): Promise<MediaSubmission[]> => {
    try {
      const res = await fetch(`/api/submissions/approved/${methodId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error('Error fetching approved media:', err);
    }
    return [];
  };

  const fetchAdminStudents = async () => {
    try {
      const res = await fetch('/api/admin/students', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAdminStudents(data);
      }
    } catch (err) {
      console.error('Error fetching admin students:', err);
    }
  };

  const addStudent = async (data: any) => {
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      const resData = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: resData.error || 'Failed to create student.',
          duplicate: !!resData.duplicate,
          existingStudentId: resData.existingStudentId
        };
      }
      showToast(`Created student: "${data.name}"`);
      await fetchAdminStudents();
      return { success: true, studentId: resData.studentId };
    } catch (err) {
      return { success: false, error: 'Network error.' };
    }
  };

  const updateStudent = async (id: string, data: any) => {
    try {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to update student.' };
      }
      showToast(`Updated student details.`);
      await fetchAdminStudents();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error.' };
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to delete student.' };
      }
      showToast(`Student record deleted.`);
      await fetchAdminStudents();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error.' };
    }
  };

  const fetchCounsellingHistory = async (studentId: string): Promise<CounsellingSession[]> => {
    try {
      const res = await fetch(`/api/admin/students/${studentId}/counselling`, { credentials: 'include' });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error('Error fetching counselling history:', err);
    }
    return [];
  };

  const addCounsellingSession = async (studentId: string, data: any) => {
    try {
      const res = await fetch(`/api/admin/students/${studentId}/counselling`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to record session.' };
      }
      showToast(`Counselling session recorded.`);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error.' };
    }
  };

  const updateCounsellingSession = async (sessionId: number, data: any) => {
    try {
      const res = await fetch(`/api/admin/counselling/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to update session.' };
      }
      showToast(`Counselling session updated.`);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error.' };
    }
  };

  const deleteCounsellingSession = async (sessionId: number) => {
    try {
      const res = await fetch(`/api/admin/counselling/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to delete session.' };
      }
      showToast(`Counselling session deleted.`);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error.' };
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/admin/assignments', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAssignments(data);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  };

  const fetchAssignmentHistory = async () => {
    try {
      const res = await fetch('/api/admin/assignments/history', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAssignmentHistory(data);
      }
    } catch (err) {
      console.error('Error fetching assignment history:', err);
    }
  };

  const assignStudents = async (subAdminId: number | string, studentIds: string[], forceReassign: boolean, reason?: string) => {
    try {
      const res = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subAdminId, studentIds, forceReassign, reason }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && !data.hasConflicts) {
        showToast('Students assigned successfully.');
        await fetchAssignments();
        await fetchAssignmentHistory();
      }
      return data;
    } catch (err: any) {
      console.error('Error assigning students:', err);
      return { success: false, error: err.message || 'Network error.' };
    }
  };

  const removeAssignment = async (studentId: string) => {
    try {
      const res = await fetch(`/api/admin/assignments/${studentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Assignment removed successfully.');
        await fetchAssignments();
        await fetchAssignmentHistory();
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to remove assignment.' };
    } catch (err: any) {
      console.error('Error removing assignment:', err);
      return { success: false, error: err.message || 'Network error.' };
    }
  };

  const isAdminLoggedIn = !!adminUser;

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        theme,
        toggleTheme,
        activeCohort,
        setActiveCohort,
        searchQuery,
        setSearchQuery,
        teachingMethods,
        updateMethod,
        addMethod,
        deleteMethod,
        weeklyPlan,
        updateWeeklyActivity,
        resources,
        addResource,
        deleteResource,
        students,
        updateStudentCohort,
        selectedMethod,
        setSelectedMethod,
        viewingResource,
        setViewingResource,
        isAITutorOpen,
        setIsAITutorOpen,
        isDailyQuizOpen,
        setIsDailyQuizOpen,
        editingMethod,
        setEditingMethod,
        toastMessage,
        showToast,
        resetDataToDefault,
        
        // Admin Management exports
        adminUser,
        isAdminLoggedIn,
        isApiMode,
        subAdmins,
        auditLogs,
        adminLogin,
        adminLogout,
        changePassword,
        fetchSubAdmins,
        createSubAdmin,
        updateSubAdmin,
        toggleTeachingMethodPermission,
        resetSubAdminPassword,
        deleteSubAdmin,
        fetchAuditLogs,
        syncData,
        mediaSubmissions,
        fetchMediaSubmissions,
        approveSubmission,
        rejectSubmission,
        deleteSubmission,
        submitMedia,
        fetchApprovedMedia,
        adminStudents,
        fetchAdminStudents,
        addStudent,
        updateStudent,
        deleteStudent,
        fetchCounsellingHistory,
        addCounsellingSession,
        updateCounsellingSession,
        deleteCounsellingSession,
        assignments,
        assignmentHistory,
        fetchAssignments,
        fetchAssignmentHistory,
        assignStudents,
        removeAssignment
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
