import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AdminUser, AuditLog, TeachingMethod, CoursewareResource, Student, MediaSubmission, CounsellingSession, TeachingTask, TeachingSubmission } from '../types';
import { getYouTubeEmbedUrl } from './TeachingMethodsGrid';
import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  FileText,
  ClipboardList,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Lock,
  UserCheck,
  UserX,
  Menu,
  X,
  Check,
  RefreshCw,
  Search,
  Eye,
  PlusCircle,
  Clock,
  Shield,
  TrendingUp,
  FileDown,
  Image,
  Download,
  HeartHandshake,
  Key,
  ShieldCheck,
  ShieldAlert,
  Video,
  Upload,
  FileSpreadsheet,
  File,
  CheckCircle2,
  CheckCircle,
  Timer,
  AlertCircle,
  Building2,
  Layers,
  Award,
  Send,
  FileUp,
  Paperclip,
  Share2,
  User,
  Sparkles
} from 'lucide-react';

interface AdminDashboardProps {
  navigate: (path: string) => void;
  initialTab?: 'overview' | 'subadmins' | 'methods' | 'counselling' | 'content' | 'submissions' | 'logs' | 'settings';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate, initialTab = 'overview' }) => {
  const {
    adminUser,
    adminLogout,
    subAdmins,
    fetchSubAdmins,
    createSubAdmin,
    updateSubAdmin,
    toggleTeachingMethodPermission,
    resetSubAdminPassword,
    deleteSubAdmin,
    auditLogs,
    fetchAuditLogs,
    teachingMethods,
    addMethod,
    updateMethod,
    deleteMethod,
    weeklyPlan,
    updateWeeklyActivity,
    resources,
    addResource,
    deleteResource,
    students,
    theme,
    toggleTheme,
    showToast,
    // Media Submissions
    mediaSubmissions,
    fetchMediaSubmissions,
    approveSubmission,
    rejectSubmission,
    deleteSubmission,
    // Student Counselling
    adminStudents,
    fetchAdminStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    fetchCounsellingHistory,
    addCounsellingSession,
    updateCounsellingSession,
    deleteCounsellingSession,
    changePassword,
    // Innovative Teaching–Learning Methods Workflow
    teachingTasks,
    teachingSubmissions,
    trackingSubmissions,
    fetchTeachingTasks,
    createTeachingTask,
    updateTeachingTask,
    deleteTeachingTask,
    fetchTeachingSubmissions,
    fetchTrackingSubmissions,
    submitTeachingMethod,
    approveTeachingSubmission,
    rejectTeachingSubmission,
    deleteTeachingSubmission
  } = useApp();

  const isSuperAdmin = adminUser?.role === 'SUPER_ADMIN';

  // Navigation state within Dashboard
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'subadmins' | 'methods' | 'counselling' | 'content' | 'submissions' | 'logs' | 'settings'>(initialTab);
  
  // Mobile UI States
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Innovative Teaching Methods Module Sub-Tabs
  const [methodsViewTab, setMethodsViewTab] = useState<'tracking' | 'tasks' | 'submit' | 'history' | 'catalog'>(
    isSuperAdmin ? 'tracking' : 'tasks'
  );

  // Super Admin Task Modal States
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TeachingTask | null>(null);
  const [taskAssignMode, setTaskAssignMode] = useState<'single' | 'selective' | 'all'>('single');
  const [selectedTaskSubAdminIds, setSelectedTaskSubAdminIds] = useState<number[]>([]);
  const [taskSubAdminSearch, setTaskSubAdminSearch] = useState('');
  const [taskForm, setTaskForm] = useState({
    sub_admin_id: '',
    topic: '',
    description: '',
    department: 'ECE',
    date: new Date().toISOString().split('T')[0],
    time: '10:30 AM',
    no_of_faculty: 1
  });
  const [isSavingTask, setIsSavingTask] = useState(false);

  // Sub Admin Task Submission Modal States
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedTaskIdForSubmit, setSelectedTaskIdForSubmit] = useState<string>('none');
  const [submissionForm, setSubmissionForm] = useState({
    topic: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    no_of_faculty: 1,
    department: 'ECE',
    description: ''
  });
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isSubmittingMethod, setIsSubmittingMethod] = useState(false);

  // Super Admin Review / Tracking Action States
  const [previewTrackingSubmission, setPreviewTrackingSubmission] = useState<TeachingSubmission | null>(null);
  const [approvingSubId, setApprovingSubId] = useState<number | null>(null);
  const [approvalFeedback, setApprovalFeedback] = useState('Approved for Public Showcase');
  const [rejectingSubId, setRejectingSubId] = useState<number | null>(null);
  const [rejectionFeedback, setRejectionFeedback] = useState('');

  // Filters for Tracking and Tasks
  const [trackingSearch, setTrackingSearch] = useState('');
  const [trackingStatusFilter, setTrackingStatusFilter] = useState('All');
  const [trackingDeptFilter, setTrackingDeptFilter] = useState('All');

  // Search & Filters
  const [logSearch, setLogSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [methodSearch, setMethodSearch] = useState('');
  const [submissionSearch, setSubmissionSearch] = useState('');

  // Media submissions states
  const [previewSubmission, setPreviewSubmission] = useState<MediaSubmission | null>(null);
  const [rejectingSubmissionId, setRejectingSubmissionId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Modals visibility
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSubAdmin, setEditingSubAdmin] = useState<AdminUser | null>(null);
  const [passwordResetSubAdmin, setPasswordResetSubAdmin] = useState<AdminUser | null>(null);

  // Student Form states
  const [showStudentFormModal, setShowStudentFormModal] = useState(false);
  const [duplicateAlert, setDuplicateAlert] = useState<{
    message: string;
    existingStudentId?: string;
  } | null>(null);
  const [createdStudentDetails, setCreatedStudentDetails] = useState<{
    name: string;
    studentId: string;
    rollNumber: string;
    batch: string;
  } | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null); // null means adding new
  const [studentForm, setStudentForm] = useState({
    studentId: '',
    name: '',
    rollNumber: '',
    email: '',
    gpa: 0,
    attendance: 100,
    strengths: '',
    focusAreas: '',
    department: 'ECE',
    year: '3rd Year',
    semester: '1st Sem',
    section: 'A',
    phone: '',
    academicStatus: 'Regular',
    parentName: '',
    notes: '',
    batch: ''
  });

  // Counselling Form states
  const [showCounsellingFormModal, setShowCounsellingFormModal] = useState(false);
  const [counsellingStudentId, setCounsellingStudentId] = useState<string | null>(null);
  const [counsellingStudentName, setCounsellingStudentName] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null); // null means adding new
  const [counsellingForm, setCounsellingForm] = useState({
    counselling_date: new Date().toISOString().split('T')[0],
    type: 'Academic',
    private_notes: '',
    student_concerns: '',
    guidance: '',
    action_items: '',
    follow_up_date: '',
    follow_up_required: 'No' as 'Yes' | 'No',
    status: 'Completed' as 'Draft' | 'Completed' | 'Follow-Up Required'
  });

  // Detailed profile view state
  const [viewingStudentProfile, setViewingStudentProfile] = useState<Student | null>(null);
  const [counsellingHistory, setCounsellingHistory] = useState<CounsellingSession[]>([]);

  // Filters for student directory & counselling
  const [filterYear, setFilterYear] = useState('All');
  const [filterSemester, setFilterSemester] = useState('All');
  const [filterSection, setFilterSection] = useState('All');
  const [filterAcademicStatus, setFilterAcademicStatus] = useState('All');
  const [filterBatch, setFilterBatch] = useState('All');
  const [filterCounsellor, setFilterCounsellor] = useState('All');
  const [filterCounsellingStatus, setFilterCounsellingStatus] = useState('All');
  const [filterCounsellingDate, setFilterCounsellingDate] = useState('All');
  const [viewingSubAdmin, setViewingSubAdmin] = useState<AdminUser | null>(null);

  // Settings tab Password states
  const [changePassForm, setChangePassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changePassLoading, setChangePassLoading] = useState(false);
  const [changePassMsg, setChangePassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [superAdminResetForm, setSuperAdminResetForm] = useState({
    selectedSubAdminId: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [superAdminResetLoading, setSuperAdminResetLoading] = useState(false);
  const [superAdminResetMsg, setSuperAdminResetMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [permUpdatingId, setPermUpdatingId] = useState<number | null>(null);

  // Method add/edit modal states
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<TeachingMethod | null>(null);

  // Resource add modal states
  const [showResourceModal, setShowResourceModal] = useState(false);

  // Form states for Sub-Admin Creation & Editing
  const [subAdminForm, setSubAdminForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    status: 'Active',
    permissions: [] as string[]
  });

  const [resetPassForm, setResetPassForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Form states for Teaching Methods
  const [methodForm, setMethodForm] = useState({
    id: '',
    name: '',
    cohort: 'Unified Learning Cohort' as any,
    implementation: '',
    expectedOutcome: '',
    detailedDescription: '',
    category: 'Innovative' as any,
    tags: [] as string[],
    tagInput: '',
    materialsCount: 0,
    featured: false,
    videoUrl: ''
  });

  // Form states for Digital Resources
  const [resourceForm, setResourceForm] = useState({
    title: '',
    type: 'pdf' as any,
    subject: 'Digital Signal Processing',
    cohort: 'All' as any,
    methodId: '',
    url: '',
    description: ''
  });

  // Available permissions list
  const availablePermissions = [
    'Manage Teaching Methods',
    'Manage Student Cohorts',
    'Manage Courses',
    'Create Content',
    'Edit Content',
    'Delete Content',
    'View Analytics',
    'Manage Students',
    'View Students',
    'Manage Counselling',
    'View Counselling',
    'Publish Counselling',
    'View Activity Logs',
    'Manage Media Submissions'
  ];

  // Fetch baseline data on mount
  useEffect(() => {
    if (isSuperAdmin) {
      fetchSubAdmins();
    }
    fetchAuditLogs();
    if (activeAdminTab === 'submissions' && hasPermission('Manage Media Submissions')) {
      fetchMediaSubmissions();
    }
    if (activeAdminTab === 'counselling') {
      fetchAdminStudents();
    }
  }, [activeAdminTab]);

  // Handle Logout
  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out from the admin portal?")) {
      await adminLogout();
      navigate('/admin/login');
    }
  };

  // Student Counselling handlers
  const openAddStudentModal = () => {
    setEditingStudentId(null);
    setDuplicateAlert(null);
    setStudentForm({
      studentId: '',
      name: '',
      rollNumber: '',
      email: '',
      gpa: 0,
      attendance: 100,
      strengths: '',
      focusAreas: '',
      department: 'ECE',
      year: '3rd Year',
      semester: '1st Sem',
      section: 'A',
      phone: '',
      academicStatus: 'Regular',
      parentName: '',
      notes: '',
      batch: ''
    });
    setShowStudentFormModal(true);
  };

  const openEditStudentModal = (stu: Student) => {
    setEditingStudentId(stu.id);
    setDuplicateAlert(null);
    setStudentForm({
      studentId: stu.id,
      name: stu.name,
      rollNumber: stu.rollNumber,
      email: stu.email || '',
      gpa: stu.gpa,
      attendance: stu.attendance,
      strengths: stu.strengths ? stu.strengths.join(', ') : '',
      focusAreas: stu.focusAreas ? stu.focusAreas.join(', ') : '',
      department: stu.department || 'ECE',
      year: stu.year || '3rd Year',
      semester: stu.semester || '1st Sem',
      section: stu.section || 'A',
      phone: stu.phone || '',
      academicStatus: stu.academicStatus || 'Regular',
      parentName: stu.parentName || '',
      notes: stu.notes || '',
      batch: stu.batch || '2023 - 2027'
    });
    setShowStudentFormModal(true);
  };

  const [isSavingStudent, setIsSavingStudent] = useState(false);

  const handleStudentFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.batch) {
      alert("Please select a student batch.");
      return;
    }
    setDuplicateAlert(null);
    setIsSavingStudent(true);
    const strengthsArr = studentForm.strengths.split(',').map(s => s.trim()).filter(s => s !== '');
    const focusAreasArr = studentForm.focusAreas.split(',').map(s => s.trim()).filter(s => s !== '');
    const payload = {
      ...studentForm,
      strengths: strengthsArr,
      focusAreas: focusAreasArr
    };

    let result: any;
    if (editingStudentId) {
      result = await updateStudent(editingStudentId, payload);
    } else {
      result = await addStudent(payload);
    }

    setIsSavingStudent(false);
    if (result.success) {
      setShowStudentFormModal(false);
      fetchAdminStudents();
      if (!editingStudentId && result.studentId) {
        setCreatedStudentDetails({
          name: studentForm.name,
          studentId: result.studentId,
          rollNumber: studentForm.rollNumber,
          batch: studentForm.batch
        });
      }
    } else if (result.duplicate) {
      setDuplicateAlert({
        message: result.error || 'A student with this Student ID or Roll Number already exists in the system.',
        existingStudentId: result.existingStudentId
      });
    } else {
      alert(result.error || 'Failed to save student.');
    }
  };

  const handleDeleteStudent = async (stu: Student) => {
    if (confirm(`Are you sure you want to permanently archive student "${stu.name}" (${stu.rollNumber})? This will delete all their counselling histories.`)) {
      const result = await deleteStudent(stu.id);
      if (result.success) {
        fetchAdminStudents();
      } else {
        alert(result.error);
      }
    }
  };

  const openAddCounsellingModal = (stu: Student) => {
    setCounsellingStudentId(stu.id);
    setCounsellingStudentName(stu.name);
    setEditingSessionId(null);
    setCounsellingForm({
      counselling_date: new Date().toISOString().split('T')[0],
      type: 'Academic',
      private_notes: '',
      student_concerns: '',
      guidance: '',
      action_items: '',
      follow_up_date: '',
      follow_up_required: 'No',
      status: 'Completed'
    });
    setShowCounsellingFormModal(true);
  };

  const openEditCounsellingModal = (session: CounsellingSession, studentName: string) => {
    setCounsellingStudentId(session.student_id);
    setCounsellingStudentName(studentName);
    setEditingSessionId(session.id);
    setCounsellingForm({
      counselling_date: session.counselling_date,
      type: session.type,
      private_notes: session.private_notes,
      student_concerns: session.student_concerns || '',
      guidance: session.guidance || '',
      action_items: session.action_items || '',
      follow_up_date: session.follow_up_date || '',
      follow_up_required: session.follow_up_required,
      status: session.status
    });
    setShowCounsellingFormModal(true);
  };

  const handleCounsellingFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counsellingForm.counselling_date || !counsellingForm.type || !counsellingForm.private_notes) {
      alert('Counselling Date, Counselling Category, and Discussion Notes are required.');
      return;
    }

    let result: any;
    if (editingSessionId) {
      result = await updateCounsellingSession(editingSessionId, counsellingForm);
    } else {
      if (counsellingStudentId) {
        result = await addCounsellingSession(counsellingStudentId, counsellingForm);
      } else {
        alert('No student selected.');
        return;
      }
    }

    if (result.success) {
      setShowCounsellingFormModal(false);
      if (viewingStudentProfile && counsellingStudentId) {
        const history = await fetchCounsellingHistory(counsellingStudentId);
        setCounsellingHistory(history);
      }
    } else {
      alert(result.error || 'Failed to save counselling session.');
    }
  };

  const handleDeleteCounselling = async (sessionId: number, studentIdForReload?: string) => {
    if (confirm('Are you sure you want to permanently delete this counselling session record?')) {
      const result = await deleteCounsellingSession(sessionId);
      if (result.success) {
        if (viewingStudentProfile && studentIdForReload) {
          const history = await fetchCounsellingHistory(studentIdForReload);
          setCounsellingHistory(history);
        }
      } else {
        alert(result.error);
      }
    }
  };

  // Password Management Handlers for Settings Tab
  const handleChangeMyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePassMsg(null);
    if (!changePassForm.currentPassword || !changePassForm.newPassword || !changePassForm.confirmPassword) {
      setChangePassMsg({ type: 'error', text: 'All fields are required.' });
      return;
    }
    if (changePassForm.newPassword.length < 6) {
      setChangePassMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (changePassForm.newPassword !== changePassForm.confirmPassword) {
      setChangePassMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setChangePassLoading(true);
    const res = await changePassword(changePassForm.currentPassword, changePassForm.newPassword, changePassForm.confirmPassword);
    setChangePassLoading(false);
    if (res.success) {
      setChangePassMsg({ type: 'success', text: 'Your password has been changed successfully.' });
      setChangePassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setChangePassMsg({ type: 'error', text: res.error || 'Failed to change password.' });
    }
  };

  const handleSuperAdminResetSubAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuperAdminResetMsg(null);
    if (!superAdminResetForm.selectedSubAdminId) {
      setSuperAdminResetMsg({ type: 'error', text: 'Please select a sub-admin from the list.' });
      return;
    }
    if (superAdminResetForm.newPassword.length < 6) {
      setSuperAdminResetMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (superAdminResetForm.newPassword !== superAdminResetForm.confirmPassword) {
      setSuperAdminResetMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setSuperAdminResetLoading(true);
    const res = await resetSubAdminPassword(parseInt(superAdminResetForm.selectedSubAdminId, 10), {
      newPassword: superAdminResetForm.newPassword,
      confirmPassword: superAdminResetForm.confirmPassword
    });
    setSuperAdminResetLoading(false);
    if (res.success) {
      const target = subAdmins.find(sa => sa.id === parseInt(superAdminResetForm.selectedSubAdminId, 10));
      setSuperAdminResetMsg({
        type: 'success',
        text: `Password for "${target?.name || 'Sub-Admin'}" has been reset successfully.`
      });
      setSuperAdminResetForm({ selectedSubAdminId: '', newPassword: '', confirmPassword: '' });
    } else {
      setSuperAdminResetMsg({ type: 'error', text: res.error || 'Failed to reset sub-admin password.' });
    }
  };

  const handleToggleTeachingPerm = async (subAdmin: AdminUser) => {
    const hasPerm = subAdmin.permissionsList.includes('Manage Teaching Methods');
    const action = hasPerm ? 'revoke' : 'grant';
    if (!confirm(`Are you sure you want to ${action} Teaching Methodology Management permissions for "${subAdmin.name}"?`)) {
      return;
    }
    setPermUpdatingId(subAdmin.id);
    const res = await toggleTeachingMethodPermission(subAdmin.id, !hasPerm);
    setPermUpdatingId(null);
    if (!res.success) {
      alert(res.error || 'Failed to update permission.');
    }
  };

  const handleViewProfile = async (stu: Student) => {
    const history = await fetchCounsellingHistory(stu.id);
    setCounsellingHistory(history);
    setViewingStudentProfile(stu);
  };

  // Check sub-admin permission before rendering actions / tabs
  const hasPermission = (perm: string) => {
    if (isSuperAdmin) return true;
    return adminUser?.permissionsList.includes(perm) || false;
  };

  // Helper to get initials
  const getInitials = (nameStr: string) => {
    return nameStr.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Helper for dates
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) + ' • ' + d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ==========================================
  // SUB-ADMIN CRUD IMPLEMENTATION
  // ==========================================

  const handleCreateSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subAdminForm.password !== subAdminForm.confirmPassword) {
      showToast('Passwords do not match.');
      return;
    }

    const res = await createSubAdmin({
      name: subAdminForm.name,
      email: subAdminForm.email,
      username: subAdminForm.username,
      password: subAdminForm.password,
      confirmPassword: subAdminForm.confirmPassword,
      permissions: subAdminForm.permissions,
      status: subAdminForm.status
    });

    if (res.success) {
      setShowCreateModal(false);
      // Reset form
      setSubAdminForm({
        name: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        status: 'Active',
        permissions: []
      });
    } else {
      alert(res.error || 'Failed to create sub-admin.');
    }
  };

  const handleEditSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubAdmin) return;

    const res = await updateSubAdmin(editingSubAdmin.id, {
      name: subAdminForm.name,
      email: subAdminForm.email,
      username: subAdminForm.username,
      permissions: subAdminForm.permissions,
      status: subAdminForm.status
    });

    if (res.success) {
      setEditingSubAdmin(null);
    } else {
      alert(res.error || 'Failed to update sub-admin.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetSubAdmin) return;

    if (resetPassForm.newPassword !== resetPassForm.confirmPassword) {
      showToast('Passwords do not match.');
      return;
    }

    const res = await resetSubAdminPassword(passwordResetSubAdmin.id, {
      newPassword: resetPassForm.newPassword,
      confirmPassword: resetPassForm.confirmPassword
    });

    if (res.success) {
      setPasswordResetSubAdmin(null);
      setResetPassForm({ newPassword: '', confirmPassword: '' });
    } else {
      alert(res.error || 'Failed to reset password.');
    }
  };

  const toggleSubAdminStatus = async (admin: AdminUser) => {
    const newStatus = admin.status === 'Active' ? 'Disabled' : 'Active';
    if (confirm(`Are you sure you want to ${newStatus === 'Active' ? 'enable' : 'disable'} account "${admin.name}"?`)) {
      const res = await updateSubAdmin(admin.id, {
        name: admin.name,
        email: admin.email,
        username: admin.username,
        permissions: admin.permissionsList,
        status: newStatus
      });
      if (!res.success) {
        alert(res.error || 'Failed to toggle account status.');
      }
    }
  };

  const handleDeleteSubAdmin = async (id: number, name: string) => {
    if (confirm(`WARNING: Are you absolutely sure you want to permanently delete sub-admin "${name}"?\nThis action cannot be undone.`)) {
      const res = await deleteSubAdmin(id);
      if (!res.success) {
        alert(res.error || 'Failed to delete sub-admin.');
      }
    }
  };

  // Toggle form permission checking
  const handleFormPermissionChange = (perm: string) => {
    setSubAdminForm(prev => {
      const updatedPerms = prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm];
      return { ...prev, permissions: updatedPerms };
    });
  };

  // Open modal pre-populated for edit
  const openEditModal = (admin: AdminUser) => {
    setEditingSubAdmin(admin);
    setSubAdminForm({
      name: admin.name,
      email: admin.email,
      username: admin.username,
      password: '',
      confirmPassword: '',
      status: admin.status,
      permissions: admin.permissionsList
    });
  };

  // ==========================================
  // TEACHING METHODS CRUD IMPLEMENTATION
  // ==========================================

  const handleSaveMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!methodForm.name || !methodForm.category) {
      showToast('Name and Category are required.');
      return;
    }

    const cleanVideoUrl = methodForm.videoUrl && methodForm.videoUrl.trim() ? methodForm.videoUrl.trim() : undefined;

    const methodData: TeachingMethod = {
      id: methodForm.id || (editingMethod ? editingMethod.id : 'method-' + Math.random().toString(36).substring(2, 9)),
      name: methodForm.name,
      cohort: methodForm.cohort || 'Unified Learning Cohort',
      implementation: methodForm.implementation,
      expectedOutcome: methodForm.expectedOutcome,
      detailedDescription: methodForm.detailedDescription,
      category: methodForm.category,
      tags: methodForm.tags,
      materialsCount: methodForm.materialsCount,
      featured: methodForm.featured,
      videoUrl: cleanVideoUrl
    };

    if (editingMethod) {
      await updateMethod(methodData);
    } else {
      await addMethod(methodData);
    }
    setEditingMethod(null);
    setShowMethodModal(false);
  };

  const openAddMethodModal = () => {
    setEditingMethod(null);
    setMethodForm({
      id: '',
      name: '',
      cohort: 'Unified Learning Cohort' as any,
      implementation: '',
      expectedOutcome: '',
      detailedDescription: '',
      category: 'Innovative',
      tags: [],
      tagInput: '',
      materialsCount: 0,
      featured: false,
      videoUrl: ''
    });
    setShowMethodModal(true);
  };

  const openEditMethodModal = (m: TeachingMethod) => {
    setEditingMethod(m);
    setMethodForm({
      id: m.id,
      name: m.name,
      cohort: m.cohort || 'Unified Learning Cohort',
      implementation: m.implementation,
      expectedOutcome: m.expectedOutcome,
      detailedDescription: m.detailedDescription || '',
      category: m.category,
      tags: m.tags || [],
      tagInput: '',
      materialsCount: m.materialsCount || 0,
      featured: !!m.featured,
      videoUrl: m.videoUrl || ''
    });
    setShowMethodModal(true);
  };

  const handleAddTag = () => {
    if (methodForm.tagInput.trim() && !methodForm.tags.includes(methodForm.tagInput.trim())) {
      setMethodForm(prev => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: ''
      }));
    }
  };

  const handleRemoveTag = (tag: string) => {
    setMethodForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // ==========================================
  // DIGITAL RESOURCES UPLOAD
  // ==========================================

  const handleUploadResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceForm.title || !resourceForm.url) {
      showToast('Title and Resource URL are required.');
      return;
    }

    const newRes: CoursewareResource = {
      id: 'res-' + Math.random().toString(36).substring(2, 9),
      title: resourceForm.title,
      fileName: resourceForm.type.toUpperCase() + '_Resource_File',
      fileSize: Math.floor(Math.random() * 8 + 2) + ' MB',
      type: resourceForm.type,
      subject: resourceForm.subject,
      cohort: resourceForm.cohort,
      methodId: resourceForm.methodId || undefined,
      url: resourceForm.url,
      description: resourceForm.description,
      addedBy: adminUser?.name || 'Academic Administrator',
      dateAdded: new Date().toISOString().split('T')[0],
      downloads: 0
    };

    await addResource(newRes);
    setShowResourceModal(false);
    // Reset Form
    setResourceForm({
      title: '',
      type: 'pdf',
      subject: 'Digital Signal Processing',
      cohort: 'All',
      methodId: '',
      url: '',
      description: ''
    });
  };

  // ==========================================
  // INNOVATIVE TEACHING–LEARNING METHODS HANDLERS
  // ==========================================

  const openAddTaskModal = () => {
    setEditingTask(null);
    setTaskAssignMode('single');
    setSelectedTaskSubAdminIds(subAdmins.map(s => s.id));
    setTaskSubAdminSearch('');
    setTaskForm({
      sub_admin_id: subAdmins.length > 0 ? String(subAdmins[0].id) : '',
      topic: '',
      description: '',
      department: 'ECE',
      date: new Date().toISOString().split('T')[0],
      time: '10:30 AM',
      no_of_faculty: 1
    });
    setShowTaskModal(true);
  };

  const openEditTaskModal = (task: TeachingTask) => {
    setEditingTask(task);
    setTaskAssignMode('single');
    setTaskForm({
      sub_admin_id: String(task.sub_admin_id),
      topic: task.topic,
      description: task.description || '',
      department: task.department || 'ECE',
      date: task.date,
      time: task.time,
      no_of_faculty: task.no_of_faculty || 1
    });
    setShowTaskModal(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.topic || !taskForm.date || !taskForm.time) {
      showToast('Please provide Topic, Target Date, and Target Time.');
      return;
    }

    if (!editingTask) {
      if (taskAssignMode === 'selective' && selectedTaskSubAdminIds.length === 0) {
        showToast('Please select at least one Faculty Coordinator.');
        return;
      }
      if (taskAssignMode === 'single' && !taskForm.sub_admin_id) {
        showToast('Please select a Sub-Admin Coordinator.');
        return;
      }
    }

    setIsSavingTask(true);
    let res: any;
    if (editingTask) {
      res = await updateTeachingTask(editingTask.id, {
        sub_admin_id: parseInt(taskForm.sub_admin_id, 10),
        topic: taskForm.topic,
        description: taskForm.description,
        department: taskForm.department,
        date: taskForm.date,
        time: taskForm.time,
        no_of_faculty: taskForm.no_of_faculty
      });
    } else {
      if (taskAssignMode === 'all') {
        res = await createTeachingTask({
          assign_all: true,
          topic: taskForm.topic,
          description: taskForm.description,
          department: taskForm.department,
          date: taskForm.date,
          time: taskForm.time,
          no_of_faculty: taskForm.no_of_faculty
        });
      } else if (taskAssignMode === 'selective') {
        res = await createTeachingTask({
          sub_admin_ids: selectedTaskSubAdminIds,
          topic: taskForm.topic,
          description: taskForm.description,
          department: taskForm.department,
          date: taskForm.date,
          time: taskForm.time,
          no_of_faculty: taskForm.no_of_faculty
        });
      } else {
        res = await createTeachingTask({
          sub_admin_id: parseInt(taskForm.sub_admin_id, 10),
          topic: taskForm.topic,
          description: taskForm.description,
          department: taskForm.department,
          date: taskForm.date,
          time: taskForm.time,
          no_of_faculty: taskForm.no_of_faculty
        });
      }
    }
    setIsSavingTask(false);

    if (res.success) {
      setShowTaskModal(false);
      setEditingTask(null);
    } else {
      alert(res.error || 'Failed to save task.');
    }
  };

  const handleDeleteTask = async (taskId: number, topic: string) => {
    if (confirm(`Are you sure you want to delete assigned task "${topic}"?`)) {
      await deleteTeachingTask(taskId);
    }
  };

  const openSubmitTaskModal = (task?: TeachingTask) => {
    if (task) {
      setSelectedTaskIdForSubmit(String(task.id));
      setSubmissionForm({
        topic: task.topic,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        no_of_faculty: task.no_of_faculty || 1,
        department: task.department || 'ECE',
        description: task.description ? `Implementation based on guidelines: ${task.description}\n\n` : ''
      });
    } else {
      setSelectedTaskIdForSubmit('none');
      setSubmissionForm({
        topic: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        no_of_faculty: 1,
        department: 'ECE',
        description: ''
      });
    }
    setSubmissionFile(null);
    setShowSubmissionModal(true);
  };

  const handleMethodSubmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionForm.topic || !submissionForm.description || !submissionFile) {
      showToast('Topic, Method Description, and an Uploaded File are required.');
      return;
    }

    setIsSubmittingMethod(true);
    const formData = new FormData();
    if (selectedTaskIdForSubmit && selectedTaskIdForSubmit !== 'none') {
      formData.append('task_id', selectedTaskIdForSubmit);
    }
    formData.append('topic', submissionForm.topic);
    formData.append('date', submissionForm.date);
    formData.append('time', submissionForm.time);
    formData.append('no_of_faculty', String(submissionForm.no_of_faculty));
    formData.append('department', submissionForm.department);
    formData.append('description', submissionForm.description);
    formData.append('file', submissionFile);

    const res = await submitTeachingMethod(formData);
    setIsSubmittingMethod(false);

    if (res.success) {
      setShowSubmissionModal(false);
      setSubmissionFile(null);
      setSubmissionForm({
        topic: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        no_of_faculty: 1,
        department: 'ECE',
        description: ''
      });
      setMethodsViewTab('history');
    } else {
      alert(res.error || 'Failed to submit teaching method.');
    }
  };

  const handleApproveSubmission = async (subId: number) => {
    const res = await approveTeachingSubmission(subId, approvalFeedback);
    if (res.success) {
      setApprovingSubId(null);
      if (previewTrackingSubmission?.id === subId) {
        setPreviewTrackingSubmission(null);
      }
    } else {
      alert(res.error || 'Failed to approve submission.');
    }
  };

  const handleRejectSubmission = async (subId: number) => {
    if (!rejectionFeedback.trim()) {
      alert('Please provide feedback explaining the reason for rejection.');
      return;
    }
    const res = await rejectTeachingSubmission(subId, rejectionFeedback);
    if (res.success) {
      setRejectingSubId(null);
      if (previewTrackingSubmission?.id === subId) {
        setPreviewTrackingSubmission(null);
      }
    } else {
      alert(res.error || 'Failed to reject submission.');
    }
  };

  const handleDeleteSubmissionAction = async (subId: number, topic: string) => {
    if (confirm(`Are you sure you want to permanently delete submission "${topic}"?`)) {
      await deleteTeachingSubmission(subId);
    }
  };

  // Filtered lists
  const filteredTrackingList = trackingSubmissions.filter(item => {
    const matchesSearch =
      trackingSearch === '' ||
      item.topic.toLowerCase().includes(trackingSearch.toLowerCase()) ||
      (item.sub_admin_name && item.sub_admin_name.toLowerCase().includes(trackingSearch.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(trackingSearch.toLowerCase()));
    const matchesStatus = trackingStatusFilter === 'All' || item.status === trackingStatusFilter;
    const matchesDept = trackingDeptFilter === 'All' || item.department === trackingDeptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const filteredLogs = auditLogs.filter(log =>
    log.user.toLowerCase().includes(logSearch.toLowerCase()) ||
    log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
    log.target.toLowerCase().includes(logSearch.toLowerCase()) ||
    log.status.toLowerCase().includes(logSearch.toLowerCase())
  );

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredMethods = teachingMethods.filter(m =>
    m.name.toLowerCase().includes(methodSearch.toLowerCase()) ||
    m.category.toLowerCase().includes(methodSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200">
      
      {/* MOBILE HEADER BAR */}
      <div className="md:hidden h-16 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-dhanekula-royal" />
          <span className="font-extrabold text-xs tracking-tight text-slate-850 dark:text-white uppercase">
            ECE Admin Console
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* SIDEBAR SIDE PANEL */}
      <aside className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:flex w-64 bg-slate-900 text-white flex-col z-40 transition-transform duration-300 ease-in-out`}>
        
        {/* Sidebar Header */}
        <div className="h-20 border-b border-slate-850 px-6 flex items-center gap-3 shrink-0">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-dhanekula-royal to-sky-400 flex items-center justify-center shadow-md">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-black text-sm tracking-tight block">Dhanekula ECE</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block">Admin Panel</span>
          </div>
        </div>

        {/* User Profile Summary */}
        <div className="p-4 border-b border-slate-850 bg-slate-950/40 shrink-0 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-dhanekula-800/80 border border-dhanekula-600 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-inner">
            {getInitials(adminUser?.name || 'Admin User')}
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-xs text-white block truncate">{adminUser?.name || 'Administrator'}</span>
            <span className="text-[10px] font-bold text-slate-400 block truncate lowercase">@{adminUser?.username || 'admin'}</span>
            <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-full mt-1 ${isSuperAdmin ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/25' : 'bg-blue-950/80 text-blue-300 border border-blue-500/25'}`}>
              {adminUser?.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 'SUB ADMIN'}
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          
          <button
            onClick={() => { setActiveAdminTab('overview'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeAdminTab === 'overview'
                ? 'bg-dhanekula-royal text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ClipboardList className="h-4.5 w-4.5" />
            <span>Dashboard Overview</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => { setActiveAdminTab('subadmins'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeAdminTab === 'subadmins'
                  ? 'bg-dhanekula-royal text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="h-4.5 w-4.5" />
              <span>Sub-Admin Accounts</span>
            </button>
          )}

          {hasPermission('Manage Teaching Methods') && (
            <button
              onClick={() => { setActiveAdminTab('methods'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeAdminTab === 'methods'
                  ? 'bg-dhanekula-royal text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-4.5 w-4.5" />
                <span>Teaching Methods</span>
              </div>
              {!isSuperAdmin && teachingTasks.filter(t => t.status === 'Pending').length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-slate-950 animate-pulse">
                  {teachingTasks.filter(t => t.status === 'Pending').length} Due
                </span>
              )}
            </button>
          )}

          {(hasPermission('View Students') || hasPermission('View Counselling') || hasPermission('Manage Students') || hasPermission('Manage Counselling')) && (
            <button
              onClick={() => { setActiveAdminTab('counselling'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeAdminTab === 'counselling'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <HeartHandshake className="h-4.5 w-4.5" />
              <span>Student Counselling</span>
            </button>
          )}

          {hasPermission('Manage Courses') && (
            <button
              onClick={() => { setActiveAdminTab('content'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeAdminTab === 'content'
                  ? 'bg-dhanekula-royal text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="h-4.5 w-4.5" />
              <span>Courses & Content</span>
            </button>
          )}

          {hasPermission('Manage Media Submissions') && (
            <button
              onClick={() => { setActiveAdminTab('submissions'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeAdminTab === 'submissions'
                  ? 'bg-dhanekula-royal text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Image className="h-4.5 w-4.5" />
              <span>Media Submissions</span>
            </button>
          )}

          {hasPermission('View Activity Logs') && (
            <button
              onClick={() => { setActiveAdminTab('logs'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeAdminTab === 'logs'
                  ? 'bg-dhanekula-royal text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Shield className="h-4.5 w-4.5" />
              <span>Activity / Audit Logs</span>
            </button>
          )}

          <button
            onClick={() => { setActiveAdminTab('settings'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeAdminTab === 'settings'
                ? 'bg-dhanekula-royal text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Settings className="h-4.5 w-4.5" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-850 shrink-0 space-y-2.5">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-[11px] font-bold text-slate-400 hover:text-white bg-slate-850/40 hover:bg-slate-800/50 transition-all"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Return to Portal</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black bg-red-950/40 hover:bg-red-900/40 border border-red-500/20 text-red-400 hover:text-red-300 transition-all btn-micro-interaction"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout Securely</span>
          </button>
        </div>

      </aside>

      {/* OVERLAY FOR MOBILE SIDEBAR */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-35 md:hidden"
        ></div>
      )}

      {/* MAIN CONTAINER CONTENT */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-7xl w-full mx-auto">
        
        {/* HEADER WELCOME BANNER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              {activeAdminTab === 'overview' && 'Dashboard Overview'}
              {activeAdminTab === 'subadmins' && 'Sub-Admin Management'}
              {activeAdminTab === 'methods' && 'Innovative Teaching Methods'}
              {activeAdminTab === 'counselling' && 'Student Counselling Management'}
              {activeAdminTab === 'content' && 'Digital Courseware Hub'}
              {activeAdminTab === 'submissions' && 'Media Submissions'}
              {activeAdminTab === 'logs' && 'Security Audit Logs'}
              {activeAdminTab === 'settings' && 'Admin Settings'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
              {activeAdminTab === 'overview' && `Welcome back, ${adminUser?.name || 'Admin'}. Manage academic modules.`}
              {activeAdminTab === 'subadmins' && 'Create and manage administrators who can help manage the academic portal.'}
              {activeAdminTab === 'methods' && 'Manage, update, and configure differentiated ECE teaching methodologies.'}
              {activeAdminTab === 'counselling' && 'Manage student counselling sessions, histories, and safe homepage updates.'}
              {activeAdminTab === 'content' && 'Upload, review, and delete digital assets, video lectures, and documents.'}
              {activeAdminTab === 'submissions' && 'Review and approve public media submissions.'}
              {activeAdminTab === 'logs' && 'Full forensic trace of administrative and content actions.'}
              {activeAdminTab === 'settings' && 'Manage system properties, configuration keys, and database baseline defaults.'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Live Database Mode
            </span>
          </div>
        </div>

        {/* ==========================================
            1. TAB: OVERVIEW
            ========================================== */}
        {activeAdminTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {isSuperAdmin ? 'Teaching Methods' : 'Tasks Assigned to You'}
                  </span>
                  <BookOpen className="h-5 w-5 text-dhanekula-500" />
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                  {isSuperAdmin ? teachingMethods.length : teachingTasks.length}
                </div>
                <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase">
                  {isSuperAdmin ? 'Differentiated Syllabus' : 'Main Admin Directives'}
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-amber-500">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {isSuperAdmin ? 'Student Directory' : 'Pending Directives'}
                  </span>
                  {isSuperAdmin ? <Users className="h-5 w-5 text-emerald-500" /> : <Timer className="h-5 w-5 text-amber-500" />}
                </div>
                <div className={`text-3xl font-black mt-2 ${isSuperAdmin ? 'text-slate-900 dark:text-white' : 'text-amber-500'}`}>
                  {isSuperAdmin ? students.length : teachingTasks.filter(t => t.status === 'Pending').length}
                </div>
                <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase">
                  {isSuperAdmin ? 'Active B.Tech ECE' : 'Action Required to Complete'}
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-blue-500">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {isSuperAdmin ? 'Library Files' : 'Submissions Under Review'}
                  </span>
                  {isSuperAdmin ? <FileText className="h-5 w-5 text-amber-500" /> : <Clock className="h-5 w-5 text-blue-500" />}
                </div>
                <div className={`text-3xl font-black mt-2 ${isSuperAdmin ? 'text-slate-900 dark:text-white' : 'text-blue-500'}`}>
                  {isSuperAdmin ? resources.length : teachingSubmissions.filter(s => s.status === 'Submitted').length}
                </div>
                <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase">
                  {isSuperAdmin ? 'Uploaded Digital Assets' : 'Awaiting Super Admin Approval'}
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-emerald-500">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {isSuperAdmin ? 'Sub-Admins' : 'Approved & Showcased'}
                  </span>
                  {isSuperAdmin ? <Lock className="h-5 w-5 text-indigo-500" /> : <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                </div>
                <div className={`text-3xl font-black mt-2 ${isSuperAdmin ? 'text-slate-900 dark:text-white' : 'text-emerald-500'}`}>
                  {isSuperAdmin ? subAdmins.length : teachingSubmissions.filter(s => s.status === 'Approved').length}
                </div>
                <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase">
                  {isSuperAdmin ? 'Authorized Assistants' : 'Live on Public Portal'}
                </div>
              </div>

            </div>

            {/* SUB-ADMIN SHOWCASE: TASKS ASSIGNED BY MAIN ADMIN */}
            {!isSuperAdmin && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <Layers className="h-5 w-5" />
                      </span>
                      <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight uppercase">
                        Teaching Directives Assigned to You by Main Admin
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Innovative Teaching–Learning Methods delegated by Institutional Leadership. Complete directives and submit deliverables here.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveAdminTab('methods');
                        setMethodsViewTab('tasks');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5"
                    >
                      <Layers className="h-3.5 w-3.5 text-blue-500" />
                      <span>Methods Tab ({teachingTasks.length})</span>
                    </button>
                    <button
                      onClick={() => openSubmitTaskModal()}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>New Method Upload</span>
                    </button>
                  </div>
                </div>

                {/* Directive Cards Grid */}
                {teachingTasks.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-850/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      All caught up! No pending teaching directives assigned to your account.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {teachingTasks.map((task) => {
                      const isApproved = task.status === 'Approved' || task.submission_status === 'Approved';
                      const isSubmitted = task.status === 'Submitted' || task.submission_status === 'Submitted';
                      const isPending = !isApproved && !isSubmitted;

                      return (
                        <div
                          key={task.id}
                          className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                            isPending
                              ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/50 shadow-xs'
                              : isSubmitted
                              ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-900/50'
                              : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/50'
                          }`}
                        >
                          <div className="space-y-2.5">
                            {/* Header Tags & Status */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-white/80 dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                  Dept: {task.department || 'ECE'}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/80 dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {task.no_of_faculty} Faculty
                                </span>
                              </div>

                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                isApproved
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                  : isSubmitted
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                              }`}>
                                {isApproved ? 'Approved & Showcased' : isSubmitted ? 'Submitted (In Review)' : 'Pending Action'}
                              </span>
                            </div>

                            {/* Topic Title */}
                            <div>
                              <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                                {task.topic}
                              </h4>
                              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-blue-500" />
                                  Target Deadline: {task.date} {task.time}
                                </span>
                              </div>
                            </div>

                            {/* Directive Guidelines */}
                            {task.description && (
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                  Main Admin Instructions:
                                </span>
                                <p className="text-xs text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 line-clamp-3 leading-relaxed">
                                  {task.description}
                                </p>
                              </div>
                            )}

                            {/* Deliverable info if submitted */}
                            {(isSubmitted || isApproved) && (task.submission_description || task.submission_file_path) && (
                              <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between text-[11px]">
                                  <span>Your Submitted Deliverable</span>
                                  <span className="text-[10px] text-slate-400">{task.submission_date}</span>
                                </div>
                                {task.submission_description && (
                                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                                    {task.submission_description}
                                  </p>
                                )}
                                {task.submission_file_path && (
                                  <div className="flex items-center justify-between pt-1">
                                    <span className="text-[10px] font-bold text-slate-500 truncate max-w-[200px]">
                                      📎 {task.submission_file_name || 'Deliverable Document'}
                                    </span>
                                    <a
                                      href={task.submission_file_path}
                                      download={task.submission_file_name || 'deliverable.pdf'}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                                    >
                                      Download
                                    </a>
                                  </div>
                                )}
                                {task.submission_feedback && (
                                  <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                    Admin Feedback: {task.submission_feedback}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                            {isPending ? (
                              <button
                                onClick={() => openSubmitTaskModal(task)}
                                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
                              >
                                <Upload className="h-4 w-4" />
                                <span>⚡ Complete & Submit Work for this Directive</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openSubmitTaskModal(task)}
                                  className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5"
                                >
                                  <Edit className="h-3.5 w-3.5 text-blue-500" />
                                  <span>Update / Resubmit Work</span>
                                </button>
                                {task.submission_file_path && (
                                  <a
                                    href={task.submission_file_path}
                                    download={task.submission_file_name || 'deliverable.pdf'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs transition-all"
                                    title="Download File"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                  </a>
                                )}
                              </div>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Welcome banner info */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-dhanekula-navy to-slate-900 border border-slate-850 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-base sm:text-lg font-black tracking-tight">Active Session Logged In</h3>
                <p className="text-xs text-slate-350 max-w-xl">
                  You are logged in as <span className="font-bold text-white">{adminUser?.name}</span> with administrative rights. Any changes made to teaching methods, cohorts, files, or permissions are tracked inside the forensic security audit log.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => {
                    if (isSuperAdmin) {
                      setActiveAdminTab('subadmins');
                    } else {
                      setActiveAdminTab('methods');
                    }
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-all btn-micro-interaction shadow-md"
                >
                  {isSuperAdmin ? 'Manage Sub-Admins' : 'Manage Methods'}
                </button>
              </div>
            </div>

            {/* Recent activity summary */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Recent Portal Activity Logs
                </h3>
                {hasPermission('View Activity Logs') && (
                  <button
                    onClick={() => setActiveAdminTab('logs')}
                    className="text-xs font-bold text-dhanekula-royal hover:underline dark:text-dhanekula-400"
                  >
                    View All Logs
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-850">
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 shrink-0 text-slate-400">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          <span className="font-bold text-dhanekula-600 dark:text-dhanekula-400">{log.user}</span>{' '}
                          {log.action} <span className="font-medium text-slate-650 dark:text-slate-350">{log.target}</span>
                        </p>
                        <p className="text-[10px] text-slate-450 mt-0.5">{formatDate(log.date_time)}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                      log.status.toLowerCase().startsWith('failed')
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-900/35'
                        : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/35'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <p className="text-xs text-slate-450 py-4 text-center">No activity logs recorded in database.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            2. TAB: SUB-ADMIN ACCOUNTS (SUPER_ADMIN Only)
            ========================================== */}
        {activeAdminTab === 'subadmins' && isSuperAdmin && (
          <div className="space-y-6">
            
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Registered Assistants ({subAdmins.length})
              </h3>
              <button
                onClick={() => {
                  setEditingSubAdmin(null);
                  setSubAdminForm({
                    name: '',
                    email: '',
                    username: '',
                    password: '',
                    confirmPassword: '',
                    status: 'Active',
                    permissions: []
                  });
                  setShowCreateModal(true);
                }}
                className="px-4 py-2 rounded-2xl bg-dhanekula-royal text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-dhanekula-600 btn-micro-interaction flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Create Sub-Admin</span>
              </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Username & Email</th>
                      <th className="px-6 py-4">Permissions</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Created Date</th>
                      <th className="px-6 py-4">Last Login</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                    {subAdmins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px]">
                              {getInitials(admin.name)}
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">{admin.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="block text-slate-900 dark:text-white font-bold">@{admin.username}</span>
                          <span className="block text-slate-450 text-[11px]">{admin.email}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {admin.permissionsList.length > 0 ? (
                              admin.permissionsList.map((p, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-250/20 text-[9px] font-semibold">
                                  {p}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-slate-450 italic">No permissions assigned</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleSubAdminStatus(admin)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                              admin.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-250/25 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/60 dark:hover:text-red-400 hover:border-red-250/25'
                                : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border-red-250/25 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-400 hover:border-emerald-250/25'
                            }`}
                            title="Click to toggle account status"
                          >
                            {admin.status}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[11px] text-slate-450">
                          {formatDate(admin.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[11px] text-slate-450">
                          {formatDate(admin.last_login)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setViewingSubAdmin(admin); }}
                              className="p-1.5 text-slate-500 hover:text-dhanekula-600 dark:hover:text-dhanekula-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(admin)}
                              className="p-1.5 text-slate-500 hover:text-dhanekula-600 dark:hover:text-dhanekula-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                              title="Edit Details"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setPasswordResetSubAdmin(admin);
                                setResetPassForm({ newPassword: '', confirmPassword: '' });
                              }}
                              className="p-1.5 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                              title="Reset Password"
                            >
                              <Lock className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubAdmin(admin.id, admin.name)}
                              className="p-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                              title="Delete Sub-Admin"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {subAdmins.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-slate-450 italic">
                          No sub-admins registered. Click "+ Create Sub-Admin" to add.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            3. TAB: INNOVATIVE TEACHING–LEARNING METHODS MODULE (Super Admin & Sub Admin)
            ========================================================================= */}
        {activeAdminTab === 'methods' && hasPermission('Manage Teaching Methods') && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Top Module Sub-Nav Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex flex-wrap items-center gap-1.5">
                {isSuperAdmin ? (
                  <>
                    <button
                      onClick={() => setMethodsViewTab('tracking')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        methodsViewTab === 'tracking'
                          ? 'bg-dhanekula-royal text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <ClipboardList className="h-4 w-4" />
                      <span>Tracking Table (Submissions)</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-bold ml-0.5">
                        {trackingSubmissions.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setMethodsViewTab('tasks')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        methodsViewTab === 'tasks'
                          ? 'bg-dhanekula-royal text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Layers className="h-4 w-4" />
                      <span>Assigned Tasks</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold ml-0.5">
                        {teachingTasks.length}
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setMethodsViewTab('tasks')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        methodsViewTab === 'tasks'
                          ? 'bg-dhanekula-royal text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Layers className="h-4 w-4" />
                      <span>Tasks Given by Super Admin</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-bold ml-0.5">
                        {teachingTasks.filter(t => t.status === 'Pending').length} Pending
                      </span>
                    </button>

                    <button
                      onClick={() => openSubmitTaskModal()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md transition-all scale-102"
                    >
                      <Upload className="h-4 w-4" />
                      <span>+ Upload Teaching Method & Total Work</span>
                    </button>

                    <button
                      onClick={() => setMethodsViewTab('history')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        methodsViewTab === 'history'
                          ? 'bg-dhanekula-royal text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Clock className="h-4 w-4" />
                      <span>My Uploaded Methods</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold ml-0.5">
                        {teachingSubmissions.length}
                      </span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => setMethodsViewTab('catalog')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    methodsViewTab === 'catalog'
                      ? 'bg-dhanekula-royal text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Curriculum Catalog (20)</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {isSuperAdmin && (
                  <button
                    onClick={openAddTaskModal}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Assign New Task</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    fetchTeachingTasks();
                    fetchTeachingSubmissions();
                    if (isSuperAdmin) fetchTrackingSubmissions();
                    showToast('Refreshed teaching methods workflow data.');
                  }}
                  className="p-2 text-slate-500 hover:text-dhanekula-royal hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                  title="Refresh Data"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Sub-Admin Banner Callout */}
            {!isSuperAdmin && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white border border-emerald-800/40 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Sub-Admin Teaching Methodology Section
                    </span>
                    <span className="text-xs text-slate-300 font-bold">
                      Logged in as: {adminUser?.name} (@{adminUser?.username})
                    </span>
                  </div>
                  <h3 className="text-lg font-black tracking-tight">
                    Upload Innovative Teaching Methods & Task Deliverables
                  </h3>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Review pedagogical tasks assigned to you by the Super Admin, execute your classroom/lab innovations, and upload your full method details, topic, and documentation here.
                  </p>
                </div>
                <button
                  onClick={() => openSubmitTaskModal()}
                  className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all shrink-0 flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Method Details</span>
                </button>
              </div>
            )}

            {/* Quick Metrics Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {isSuperAdmin ? 'Total Assigned Tasks' : 'Tasks Assigned to You'}
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                  {teachingTasks.length}
                </span>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider block">
                  Pending Submissions
                </span>
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                  {teachingTasks.filter(t => t.status === 'Pending').length}
                </span>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider block">
                  {isSuperAdmin ? 'Awaiting Review' : 'Under Review'}
                </span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">
                  {(isSuperAdmin ? trackingSubmissions : teachingSubmissions).filter(s => s.status === 'Submitted').length}
                </span>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block">
                  Approved & Showcased
                </span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {(isSuperAdmin ? trackingSubmissions : teachingSubmissions).filter(s => s.status === 'Approved').length}
                </span>
              </div>
            </div>

            {/* =========================================================================
                VIEW 1: SUPER ADMIN TRACKING TABLE (With all 8 required columns)
                ========================================================================= */}
            {isSuperAdmin && methodsViewTab === 'tracking' && (
              <div className="space-y-4">
                
                {/* Tracking Search & Status Filters */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={trackingSearch}
                      onChange={(e) => setTrackingSearch(e.target.value)}
                      placeholder="Search tracking table by topic, Sub-Admin username, keyword..."
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-dhanekula-royal"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={trackingStatusFilter}
                      onChange={(e) => setTrackingStatusFilter(e.target.value)}
                      className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-200"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Submitted">Submitted (Needs Review)</option>
                      <option value="Approved">Approved (Public Live)</option>
                      <option value="Pending">Pending (Not Yet Submitted)</option>
                      <option value="Rejected">Rejected</option>
                    </select>

                    <select
                      value={trackingDeptFilter}
                      onChange={(e) => setTrackingDeptFilter(e.target.value)}
                      className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-200"
                    >
                      <option value="All">All Departments</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="CSE">CSE</option>
                      <option value="Mechanical">Mechanical</option>
                    </select>
                  </div>
                </div>

                {/* TRACKING TABLE WITH ALL MANDATED COLUMNS */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <tr>
                          <th className="py-4 px-4 text-center w-14">1. S.No</th>
                          <th className="py-4 px-4 whitespace-nowrap">2. Date of Upload</th>
                          <th className="py-4 px-4 whitespace-nowrap">3. Time of Upload</th>
                          <th className="py-4 px-5">4. Topic Name & Work Details</th>
                          <th className="py-4 px-4 text-center whitespace-nowrap">5. No. of Faculty Done</th>
                          <th className="py-4 px-5 whitespace-nowrap">6. Done by User Name / Dept</th>
                          <th className="py-4 px-4 whitespace-nowrap">7. Status</th>
                          <th className="py-4 px-4 text-right whitespace-nowrap">8. Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                        {filteredTrackingList.map((sub, index) => (
                          <tr key={sub.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/20 transition-colors">
                            
                            {/* Column 1: S.No */}
                            <td className="py-4 px-4 text-center font-extrabold text-slate-400">
                              #{sub.s_no || index + 1}
                            </td>

                            {/* Column 2: Date of Upload */}
                            <td className="py-4 px-4 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-blue-500" />
                                {sub.date}
                              </span>
                            </td>

                            {/* Column 3: Time of Upload */}
                            <td className="py-4 px-4 whitespace-nowrap font-semibold text-slate-500 dark:text-slate-400 text-[11px]">
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                {sub.time || '10:00 AM'}
                              </span>
                            </td>

                            {/* Column 4: Topic Name & Total Work Details */}
                            <td className="py-4 px-5 max-w-xs">
                              <span className="font-extrabold text-slate-900 dark:text-white block text-xs">
                                {sub.topic}
                              </span>
                              {sub.description && (
                                <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                                  {sub.description}
                                </p>
                              )}
                            </td>

                            {/* Column 5: No of Faculty Done */}
                            <td className="py-4 px-4 text-center whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                <Users className="h-3.5 w-3.5" />
                                {sub.no_of_faculty} Faculty
                              </span>
                            </td>

                            {/* Column 6: Done by User Name & Department */}
                            <td className="py-4 px-5 whitespace-nowrap">
                              <div className="font-bold text-slate-900 dark:text-white text-xs">
                                {sub.sub_admin_name || 'Faculty Lead'}
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                  @{sub.sub_admin_username || 'faculty'}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                  {sub.department || 'ECE'}
                                </span>
                              </div>
                            </td>

                            {/* Column 7: Status */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                sub.status === 'Approved'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                  : sub.status === 'Rejected'
                                  ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border-red-200 dark:border-red-800'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                              }`}>
                                {sub.status === 'Approved' && <CheckCircle2 className="h-3 w-3" />}
                                {sub.status === 'Rejected' && <AlertCircle className="h-3 w-3" />}
                                {sub.status === 'Submitted' && <Clock className="h-3 w-3" />}
                                {sub.status}
                              </span>
                            </td>

                            {/* Column 8: Action (View / Download Uploaded File / Approve) */}
                            <td className="py-4 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                
                                {/* View Total Work Action */}
                                <button
                                  onClick={() => setPreviewTrackingSubmission(sub)}
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-all"
                                  title="View Total Work & Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>

                                {/* Download File Action */}
                                {sub.file_path && (
                                  <a
                                    href={sub.file_path}
                                    download={sub.file_name || 'teaching-method-resource.pdf'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-all"
                                    title={`Download File (${sub.file_name || 'Attachment'})`}
                                  >
                                    <Download className="h-4 w-4" />
                                  </a>
                                )}

                                {/* Approve Action */}
                                {sub.status !== 'Approved' && (
                                  <button
                                    onClick={() => {
                                      setApprovingSubId(sub.id);
                                      setApprovalFeedback('Approved for institutional showcase');
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all flex items-center gap-1 shadow-xs"
                                    title="Approve & Publish to Public Showcase"
                                  >
                                    <Check className="h-3 w-3" />
                                    <span>Approve</span>
                                  </button>
                                )}

                                {/* Reject / Request Revision Action */}
                                {sub.status === 'Submitted' && (
                                  <button
                                    onClick={() => {
                                      setRejectingSubId(sub.id);
                                      setRejectionFeedback('');
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all"
                                    title="Reject or Request Revision"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                )}

                                {/* Delete Record */}
                                <button
                                  onClick={() => handleDeleteSubmissionAction(sub.id, sub.topic)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                  title="Delete Submission Record"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>

                              </div>
                            </td>

                          </tr>
                        ))}

                        {filteredTrackingList.length === 0 && (
                          <tr>
                            <td colSpan={8} className="py-10 text-center text-slate-400 italic">
                              No submissions found in tracking table. Assigned tasks will show here once Sub-Admins upload their completed work.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* =========================================================================
                VIEW 2: ASSIGNED TASKS (Super Admin Assigns / Sub Admin Completes)
                ========================================================================= */}
            {methodsViewTab === 'tasks' && (
              <div className="space-y-4">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      {isSuperAdmin ? 'Institutional Task Assignments' : 'Tasks Assigned to You'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isSuperAdmin
                        ? 'Super Admin task directives assigned to Sub-Admins across departments.'
                        : 'Review tasks assigned by Super Admin and click "Submit Completed Work" to upload pedagogy materials.'}
                    </p>
                  </div>

                  {isSuperAdmin && (
                    <button
                      onClick={openAddTaskModal}
                      className="px-4 py-2 rounded-2xl bg-dhanekula-royal text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-dhanekula-600 transition-all flex items-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Assign New Task</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teachingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 relative overflow-hidden"
                    >
                      {/* Top Accent Strip */}
                      <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                        task.status === 'Approved' ? 'bg-emerald-500' : task.status === 'Submitted' ? 'bg-blue-500' : 'bg-amber-500'
                      }`}></div>

                      <div className="flex items-start justify-between gap-3 pt-1">
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              Dept: {task.department || 'ECE'}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {task.no_of_faculty} Faculty
                            </span>
                          </div>

                          <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                            {task.topic}
                          </h4>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 ${
                          task.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : task.status === 'Submitted'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                        }`}>
                          {task.status}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-850/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                          {task.description}
                        </p>
                      )}

                      {/* Sub-Admin Deliverable info if submitted */}
                      {(task.submission_description || task.submission_file_path || task.status === 'Submitted' || task.status === 'Approved') && (
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Completed Deliverable Attached</span>
                            </span>
                            {task.submission_date && (
                              <span className="text-[10px] text-slate-400">
                                {task.submission_date} {task.submission_time}
                              </span>
                            )}
                          </div>

                          {task.submission_description && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                              {task.submission_description}
                            </p>
                          )}

                          {task.submission_file_path && (
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] font-bold text-slate-500 truncate max-w-[180px]">
                                📎 {task.submission_file_name || 'Deliverable Document'}
                              </span>
                              <a
                                href={task.submission_file_path}
                                download={task.submission_file_name || 'deliverable.pdf'}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 transition-all"
                              >
                                <Download className="h-3 w-3" />
                                <span>Download</span>
                              </a>
                            </div>
                          )}

                          {task.submission_feedback && (
                            <div className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
                              Super Admin Feedback: {task.submission_feedback}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Assigned To
                          </span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">
                            {task.sub_admin_name || 'Sub Admin'}
                          </span>
                        </div>

                        <div className="space-y-0.5 text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Target Date & Time
                          </span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-blue-500" />
                            {task.date} {task.time}
                          </span>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        {isSuperAdmin ? (
                          <div className="flex items-center gap-2 w-full justify-end">
                            <button
                              onClick={() => openEditTaskModal(task)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all flex items-center gap-1"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              <span>Edit Directive</span>
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id, task.topic)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all"
                              title="Delete Task"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ) : task.status === 'Pending' ? (
                          <button
                            onClick={() => openSubmitTaskModal(task)}
                            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
                          >
                            <Upload className="h-4 w-4" />
                            <span>⚡ Complete & Submit Work for this Task</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 w-full">
                            <button
                              onClick={() => openSubmitTaskModal(task)}
                              className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5"
                            >
                              <Edit className="h-3.5 w-3.5 text-blue-500" />
                              <span>Update / Resubmit Work</span>
                            </button>
                            {task.submission_file_path && (
                              <a
                                href={task.submission_file_path}
                                download={task.submission_file_name || 'deliverable.pdf'}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs transition-all flex items-center gap-1"
                                title="Download Deliverable"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  ))}

                  {teachingTasks.length === 0 && (
                    <div className="col-span-2 p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 italic">
                      No teaching tasks found. {isSuperAdmin ? 'Click "+ Assign New Task" to create one.' : 'No tasks assigned yet.'}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* =========================================================================
                VIEW 3: SUB ADMIN SUBMISSION HISTORY TABLE
                ========================================================================= */}
            {!isSuperAdmin && methodsViewTab === 'history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      My Submission History Table
                    </h3>
                    <p className="text-xs text-slate-500">
                      Track the status of your uploaded Innovative Teaching Methods.
                    </p>
                  </div>
                  <button
                    onClick={() => openSubmitTaskModal()}
                    className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Submission</span>
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <tr>
                          <th className="py-4 px-4 text-center w-14">S.No</th>
                          <th className="py-4 px-4">Date</th>
                          <th className="py-4 px-4">Time</th>
                          <th className="py-4 px-5">Topic</th>
                          <th className="py-4 px-4 text-center">Faculty Involved</th>
                          <th className="py-4 px-4">Status</th>
                          <th className="py-4 px-4 text-right">Uploaded File Link</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                        {teachingSubmissions.map((sub, index) => (
                          <tr key={sub.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="py-4 px-4 text-center font-extrabold text-slate-400">
                              #{index + 1}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                              {sub.date}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                              {sub.time || '10:00 AM'}
                            </td>
                            <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                              {sub.topic}
                              {sub.feedback && (
                                <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                                  Note: {sub.feedback}
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-center whitespace-nowrap">
                              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                {sub.no_of_faculty}
                              </span>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                sub.status === 'Approved'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                  : sub.status === 'Rejected'
                                  ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border-red-200 dark:border-red-800'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                              }`}>
                                {sub.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right whitespace-nowrap">
                              {sub.file_path ? (
                                <a
                                  href={sub.file_path}
                                  download={sub.file_name || 'method-resource.pdf'}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold hover:bg-blue-100 transition-colors"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  <span>{sub.file_name || 'Download File'}</span>
                                </a>
                              ) : (
                                <span className="text-slate-400 text-xs">No file</span>
                              )}
                            </td>
                          </tr>
                        ))}

                        {teachingSubmissions.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                              No submissions recorded yet. Click "+ Submit Work / Method" to submit your first pedagogy innovation.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* =========================================================================
                VIEW 4: STANDARD CURRICULUM METHODS CATALOG (20)
                ========================================================================= */}
            {methodsViewTab === 'catalog' && (
              <div className="space-y-4">
                
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="relative w-full sm:max-w-xs group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-dhanekula-royal" />
                    <input
                      type="text"
                      value={methodSearch}
                      onChange={(e) => setMethodSearch(e.target.value)}
                      placeholder="Filter standard curriculum methods..."
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-dhanekula-500/50"
                    />
                  </div>

                  {hasPermission('Manage Teaching Methods') && (
                    <button
                      onClick={openAddMethodModal}
                      className="px-4 py-2 rounded-2xl bg-dhanekula-royal text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-dhanekula-600 btn-micro-interaction flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Curriculum Method</span>
                    </button>
                  )}
                </div>

                {/* Methods Table */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <tr>
                          <th className="px-6 py-4">Method Name</th>
                          <th className="px-6 py-4">Cohort</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">Video Link</th>
                          <th className="px-6 py-4">Objective / Expected Outcome</th>
                          <th className="px-6 py-4">Tags</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                        {filteredMethods.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                            <td className="px-6 py-4">
                              <span className="font-bold text-slate-900 dark:text-white block">{m.name}</span>
                              <span className="block text-[10px] text-slate-450 mt-0.5 truncate max-w-[200px]">{m.implementation}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-dhanekula-royal/10 text-dhanekula-royal dark:bg-dhanekula-navy/60 dark:text-dhanekula-300 border border-dhanekula-royal/20">
                                Unified (ULC)
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-650 dark:text-slate-350">
                              {m.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {m.videoUrl ? (
                                <a
                                  href={m.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-[10px] font-bold hover:bg-red-100 transition-colors"
                                  title={m.videoUrl}
                                >
                                  <Video className="h-3 w-3" />
                                  <span>YouTube Video</span>
                                </a>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">No video</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-slate-650 dark:text-slate-350 font-medium max-w-[220px] truncate">
                              {m.expectedOutcome}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1 max-w-[180px]">
                                {m.tags.map((tag, idx) => (
                                  <span key={idx} className="px-1.5 py-0.5 rounded-lg bg-slate-105 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[9px] font-medium border border-slate-200/50 dark:border-slate-700/50">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1">
                                {hasPermission('Manage Teaching Methods') && (
                                  <button
                                    onClick={() => openEditMethodModal(m)}
                                    className="p-1.5 text-slate-500 hover:text-dhanekula-600 dark:hover:text-dhanekula-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                    title="Edit Method"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                )}
                                {hasPermission('Manage Teaching Methods') && (
                                  <button
                                    onClick={() => deleteMethod(m.id)}
                                    className="p-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                    title="Delete Method"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredMethods.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-slate-450 italic">
                              No teaching methods match your search.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* Access Restricted fallback for Methods tab */}
        {activeAdminTab === 'methods' && !hasPermission('Manage Teaching Methods') && (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <ShieldAlert className="h-12 w-12 text-amber-500 mx-auto" />
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Access Restricted</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You do not have authorization to view or manage innovative teaching methodologies. Only the Super Admin and explicitly authorized Sub-Admins may access this section.
            </p>
            <button
              onClick={() => setActiveAdminTab('overview')}
              className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold shadow-md hover:scale-105 transition-all"
            >
              Return to Overview
            </button>
          </div>
        )}

        {/* ==========================================
            4. TAB: STUDENT COUNSELLING MANAGEMENT
            ========================================== */}
        {activeAdminTab === 'counselling' && (
          <div className="space-y-6 animate-fade-in text-xs">
            
            {/* Header & Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <HeartHandshake className="h-4.5 w-4.5 text-emerald-600" />
                  <span>{isSuperAdmin ? 'Comprehensive Student Counselling Roster' : 'Your Assigned Mentee Roster'}</span>
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  {isSuperAdmin
                    ? `Super Admin Overview: All ${adminStudents.length} students across the department with counselling timeline logs, counsellor assignments, and results.`
                    : `Faculty Mentorship: Viewing ${adminStudents.length} students assigned specifically to your mentorship portfolio.`}
                </p>
              </div>

              {hasPermission('Manage Students') && (
                <button
                  onClick={openAddStudentModal}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Student Record
                </button>
              )}
            </div>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {isSuperAdmin ? 'Total Students' : 'Assigned Mentees'}
                </span>
                <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                  {adminStudents.length}
                </span>
              </div>
              <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block">
                  Counselled Students
                </span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {adminStudents.filter(s => (s.counsellingSessionsCount || 0) > 0).length}
                </span>
              </div>
              <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider block">
                  Needs Counselling
                </span>
                <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                  {adminStudents.filter(s => (s.counsellingSessionsCount || 0) === 0).length}
                </span>
              </div>
              <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] text-dhanekula-royal dark:text-dhanekula-400 font-bold uppercase tracking-wider block">
                  {isSuperAdmin ? 'Faculty Counsellors' : 'Your Total Sessions'}
                </span>
                <span className="text-xl font-black text-dhanekula-royal dark:text-dhanekula-400 mt-1 block">
                  {isSuperAdmin ? subAdmins.length : adminStudents.reduce((acc, s) => acc + (s.counsellingSessionsCount || 0), 0)}
                </span>
              </div>
            </div>

            {/* Search & Multi-Dimensional Filters */}
            <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search student name, roll number, ID..."
                  className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white w-full focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Counsellor Filter (Super Admin Only) */}
              {isSuperAdmin && (
                <select
                  value={filterCounsellor}
                  onChange={(e) => setFilterCounsellor(e.target.value)}
                  className="p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-200 font-bold"
                >
                  <option value="All">All Counsellors</option>
                  <option value="Unassigned">Unassigned Only</option>
                  {subAdmins.map(sa => (
                    <option key={sa.id} value={sa.name}>
                      Counsellor: {sa.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Counselling Status Filter */}
              <select
                value={filterCounsellingStatus}
                onChange={(e) => setFilterCounsellingStatus(e.target.value)}
                className="p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-200 font-bold"
              >
                <option value="All">All Statuses</option>
                <option value="Counselled">Counselled (Has Notes)</option>
                <option value="Pending">Needs Counselling (0 Notes)</option>
              </select>

              {/* Counselling Date Filter */}
              <select
                value={filterCounsellingDate}
                onChange={(e) => setFilterCounsellingDate(e.target.value)}
                className="p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-200"
              >
                <option value="All">All Session Dates</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="This Year">This Year</option>
              </select>

              {/* Batch Filter */}
              <select
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className="p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="All">All Batches</option>
                <option value="2022 - 2026">2022 - 2026</option>
                <option value="2023 - 2027">2023 - 2027</option>
                <option value="2024 - 2028">2024 - 2028</option>
                <option value="2025 - 2029">2025 - 2029</option>
                <option value="2026 - 2030">2026 - 2030</option>
              </select>

              {/* Year Filter */}
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-200"
              >
                <option value="All">All Years</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>

              {/* Academic Status Filter */}
              <select
                value={filterAcademicStatus}
                onChange={(e) => setFilterAcademicStatus(e.target.value)}
                className="p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-200"
              >
                <option value="All">All Performance Statuses</option>
                <option value="Regular">Regular</option>
                <option value="Condonation">Condonation</option>
                <option value="Detained">Detained</option>
              </select>

            </div>

            {/* Students List Table or Empty State */}
            {adminStudents.length === 0 && !isSuperAdmin ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                  <HeartHandshake className="h-8 w-8" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    No Students Currently Assigned
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    You currently have no students assigned to your counselling roster. The Super Admin assigns students to faculty counsellors. Please reach out to your department Super Admin to receive your mentee cohort.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <tr>
                        <th className="px-5 py-4">Student</th>
                        <th className="px-5 py-4">Roll Number / ID</th>
                        <th className="px-5 py-4">{isSuperAdmin ? 'Assigned Counsellor' : 'Mentorship'}</th>
                        <th className="px-5 py-4">Latest Counselling</th>
                        <th className="px-5 py-4">Sessions</th>
                        <th className="px-5 py-4">Results & Stats</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                      {adminStudents.filter(s => {
                        const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                              s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                              (s.id && s.id.toLowerCase().includes(studentSearch.toLowerCase())) ||
                                              (s.email && s.email.toLowerCase().includes(studentSearch.toLowerCase()));
                        const matchesYear = filterYear === 'All' || s.year === filterYear;
                        const matchesSec = filterSection === 'All' || s.section === filterSection;
                        const matchesStatus = filterAcademicStatus === 'All' || s.academicStatus === filterAcademicStatus;
                        const matchesBatch = filterBatch === 'All' || s.batch === filterBatch;

                        // Counsellor filter (Super Admin)
                        let matchesCounsellor = true;
                        if (isSuperAdmin && filterCounsellor !== 'All') {
                          if (filterCounsellor === 'Unassigned') {
                            matchesCounsellor = !s.assignedSubAdminId && !s.assignedSubAdminName;
                          } else {
                            matchesCounsellor = s.assignedSubAdminName === filterCounsellor || s.assignedSubAdminId?.toString() === filterCounsellor;
                          }
                        }

                        // Counselling status filter
                        let matchesCounsellingStatus = true;
                        if (filterCounsellingStatus === 'Counselled') {
                          matchesCounsellingStatus = (s.counsellingSessionsCount || 0) > 0;
                        } else if (filterCounsellingStatus === 'Pending') {
                          matchesCounsellingStatus = (s.counsellingSessionsCount || 0) === 0;
                        }

                        // Counselling Date filter
                        let matchesCounsellingDate = true;
                        if (filterCounsellingDate !== 'All') {
                          if (!s.latestCounsellingDate) {
                            matchesCounsellingDate = false;
                          } else {
                            const sessionDate = new Date(s.latestCounsellingDate);
                            const now = new Date();
                            if (filterCounsellingDate === 'Last 7 Days') {
                              const diffDays = (now.getTime() - sessionDate.getTime()) / (1000 * 3600 * 24);
                              matchesCounsellingDate = diffDays <= 7;
                            } else if (filterCounsellingDate === 'Last 30 Days') {
                              const diffDays = (now.getTime() - sessionDate.getTime()) / (1000 * 3600 * 24);
                              matchesCounsellingDate = diffDays <= 30;
                            } else if (filterCounsellingDate === 'This Year') {
                              matchesCounsellingDate = sessionDate.getFullYear() === now.getFullYear();
                            }
                          }
                        }

                        return matchesSearch && matchesYear && matchesSec && matchesStatus && matchesBatch && matchesCounsellor && matchesCounsellingStatus && matchesCounsellingDate;
                      }).map((stu) => {
                        const hasSessions = (stu.counsellingSessionsCount || 0) > 0;
                        return (
                          <tr key={stu.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                            
                            {/* Student Name */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                                  {getInitials(stu.name)}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white block">{stu.name}</span>
                                  <span className="text-[10px] text-slate-400 block mt-0.5">{stu.email} • Batch {stu.batch || '2023 - 2027'}</span>
                                </div>
                              </div>
                            </td>

                            {/* Roll Number / Student ID */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">{stu.rollNumber}</span>
                              <span className="text-[10px] text-slate-400 font-mono block">ID: {stu.id}</span>
                            </td>

                            {/* Assigned Counsellor */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              {stu.assignedSubAdminName ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-dhanekula-50 text-dhanekula-royal dark:bg-dhanekula-950 dark:text-dhanekula-300 border border-dhanekula-200 dark:border-dhanekula-800">
                                  <Users className="h-3 w-3" />
                                  {stu.assignedSubAdminName}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                  Unassigned
                                </span>
                              )}
                            </td>

                            {/* Latest Counselling Date & Counsellor */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              {stu.latestCounsellingDate ? (
                                <div>
                                  <span className="font-mono font-bold text-slate-900 dark:text-white block">{stu.latestCounsellingDate}</span>
                                  <span className="text-[10px] text-slate-400 block mt-0.5">By {stu.latestCounsellorName || 'Faculty Counsellor'}</span>
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                  No sessions yet
                                </span>
                              )}
                            </td>

                            {/* Sessions Count */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                hasSessions
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}>
                                {stu.counsellingSessionsCount || 0} {stu.counsellingSessionsCount === 1 ? 'Session' : 'Sessions'}
                              </span>
                            </td>

                            {/* Results & Stats */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-800 dark:text-slate-200">CGPA: {stu.gpa} / 10</span>
                                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                                    stu.academicStatus === 'Regular'
                                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950'
                                      : 'bg-red-50 text-red-700 dark:bg-red-950'
                                  }`}>
                                    {stu.academicStatus || 'Regular'}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400">Att: {stu.attendance}% • {stu.year || '3rd Year'} (Sec {stu.section || 'A'})</span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                
                                {/* View details */}
                                <button
                                  onClick={() => handleViewProfile(stu)}
                                  className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                  title="View Student Profile & Counselling History Timeline"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>

                                {/* Record Session shortcut */}
                                {hasPermission('Manage Counselling') && (
                                  <button
                                    onClick={() => openAddCounsellingModal(stu)}
                                    className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                    title="Record Counselling Note"
                                  >
                                    <HeartHandshake className="h-4 w-4" />
                                  </button>
                                )}

                                {/* Edit student details */}
                                {hasPermission('Manage Students') && (
                                  <button
                                    onClick={() => openEditStudentModal(stu)}
                                    className="p-1.5 text-slate-500 hover:text-dhanekula-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                    title="Edit Student Info"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                )}

                                {/* Delete student details */}
                                {hasPermission('Manage Students') && (
                                  <button
                                    onClick={() => handleDeleteStudent(stu)}
                                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                    title="Archive Student Record"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}

                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {adminStudents.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-slate-450 italic">
                            No student records match your search or filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ==========================================
            5. TAB: COURSES & DIGITAL CONTENT
            ========================================== */}
        {activeAdminTab === 'content' && hasPermission('Manage Courses') && (
          <div className="space-y-6">
            
            {/* Header Actions */}
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Uploaded Digital Resources ({resources.length})
              </h3>
              {hasPermission('Create Content') && (
                <button
                  onClick={() => setShowResourceModal(true)}
                  className="px-4 py-2 rounded-2xl bg-dhanekula-royal text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-dhanekula-600 btn-micro-interaction flex items-center gap-1.5"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Upload Resource</span>
                </button>
              )}
            </div>

            {/* Resources Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Resource File Title</th>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Cohort Group</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">File Name & Size</th>
                      <th className="px-6 py-4">Uploader / Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                    {resources.map((res) => (
                      <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="px-6 py-4 max-w-[220px]">
                          <span className="font-bold text-slate-900 dark:text-white block">{res.title}</span>
                          <span className="block text-[10px] text-slate-450 mt-0.5 truncate">{res.description}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-650 dark:text-slate-350">
                          {res.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-dhanekula-royal/10 text-dhanekula-royal dark:bg-dhanekula-navy/60 dark:text-dhanekula-300 border border-dhanekula-royal/20">
                            {res.cohort === 'All' ? 'All Students' : 'Unified (ULC)'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap uppercase text-[10px] font-bold">
                          {res.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="block font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">{res.fileName || 'N/A'}</span>
                          <span className="block text-[10px] text-slate-450">{res.fileSize || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                          <span className="block text-slate-900 dark:text-white">{res.addedBy}</span>
                          <span className="block text-[10px] text-slate-450">{res.dateAdded}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-500 hover:text-dhanekula-600 dark:hover:text-dhanekula-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                              title="Download File"
                            >
                              <FileDown className="h-4 w-4" />
                            </a>
                            {hasPermission('Delete Content') && (
                              <button
                                onClick={() => deleteResource(res.id)}
                                className="p-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                title="Delete Resource"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {resources.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-slate-450 italic">
                          No digital courseware files uploaded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            6. TAB: ACTIVITY / AUDIT LOGS (View Permission Required)
            ========================================== */}

        {/* ==========================================
            5B. TAB: MEDIA SUBMISSIONS (Review & Approvals)
            ========================================== */}
        {activeAdminTab === 'submissions' && hasPermission('Manage Media Submissions') && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Action Bar */}
            <div className="flex justify-between items-center">
              <div className="relative w-full sm:max-w-xs group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-dhanekula-royal" />
                <input
                  type="text"
                  value={submissionSearch}
                  onChange={(e) => setSubmissionSearch(e.target.value)}
                  placeholder="Filter submissions by submitter or method..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-dhanekula-500/50"
                />
              </div>
              
              <button
                onClick={fetchMediaSubmissions}
                className="p-2 text-slate-500 hover:text-dhanekula-royal hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                title="Refresh Submissions"
              >
                <RefreshCw className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Submissions List Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Submitter</th>
                      <th className="px-6 py-4">Teaching Method</th>
                      <th className="px-6 py-4">File Name & Type</th>
                      <th className="px-6 py-4">Submitted Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                    {mediaSubmissions
                      .filter(s => 
                        s.submitter_name.toLowerCase().includes(submissionSearch.toLowerCase()) ||
                        (s.teaching_method_name && s.teaching_method_name.toLowerCase().includes(submissionSearch.toLowerCase())) ||
                        s.status.toLowerCase().includes(submissionSearch.toLowerCase())
                      )
                      .map((sub) => {
                        const isImg = ['jpg', 'jpeg', 'png', 'webp'].some(ext => sub.file_type.toLowerCase().includes(ext) || sub.file_name.toLowerCase().endsWith(ext));
                        const isVid = ['mp4', 'webm'].some(ext => sub.file_type.toLowerCase().includes(ext) || sub.file_name.toLowerCase().endsWith(ext));
                        
                        return (
                          <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-bold text-slate-900 dark:text-white block">{sub.submitter_name}</span>
                              <span className="block text-[10px] text-slate-450">{sub.submitter_email || 'No email provided'}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-bold text-slate-900 dark:text-white">{sub.teaching_method_name || 'Generic'}</span>
                              <span className="block text-[9px] text-slate-400">ID: {sub.teaching_method_id}</span>
                            </td>
                            <td className="px-6 py-4 max-w-[180px]">
                              <span className="font-semibold text-slate-850 dark:text-slate-200 block truncate" title={sub.file_name}>
                                {sub.file_name}
                              </span>
                              <span className="text-[10px] text-slate-450 uppercase block">
                                {isImg ? 'Image' : isVid ? 'Video' : 'Document'} ({sub.file_type.split('/').pop()})
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-450 text-[11px]">
                              {formatDate(sub.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                                sub.status === 'Approved'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-250/20'
                                  : sub.status === 'Rejected'
                                  ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border-red-250/20'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-250/20'
                              }`} title={sub.rejection_reason ? `Reason: ${sub.rejection_reason}` : undefined}>
                                {sub.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setPreviewSubmission(sub)}
                                  className="p-1.5 text-slate-500 hover:text-dhanekula-royal hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                  title="Preview Uploaded File"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                
                                {sub.status === 'Pending' && (
                                  <>
                                    <button
                                      onClick={async () => {
                                        if (confirm(`Approve media submission by "${sub.submitter_name}"?`)) {
                                          await approveSubmission(sub.id);
                                        }
                                      }}
                                      className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-all"
                                      title="Approve Submission"
                                    >
                                      <Check className="h-4 w-4" />
                                    </button>
                                    
                                    <button
                                      onClick={() => {
                                        setRejectingSubmissionId(sub.id);
                                        setRejectionReason('');
                                      }}
                                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                                      title="Reject Submission"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </>
                                )}

                                <button
                                  onClick={async () => {
                                    if (confirm(`WARNING: Are you sure you want to delete this media submission?\nThis will permanently erase the database record and delete the uploaded file.`)) {
                                      await deleteSubmission(sub.id);
                                    }
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                  title="Delete Record"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    {mediaSubmissions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-450 italic">
                          No public media submissions recorded in database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            6. TAB: ACTIVITY / AUDIT LOGS (View Permission Required)
            ========================================== */}
        {activeAdminTab === 'logs' && hasPermission('View Activity Logs') && (
          <div className="space-y-6">
            
            {/* Logs Search */}
            <div className="flex justify-between items-center">
              <div className="relative w-full sm:max-w-xs group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-dhanekula-royal" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Filter logs by User or Action..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-dhanekula-500/50"
                />
              </div>
              <button
                onClick={fetchAuditLogs}
                className="p-2 text-slate-500 hover:text-dhanekula-royal hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                title="Refresh Logs List"
              >
                <RefreshCw className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Logs List Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">Operator / User</th>
                      <th className="px-6 py-4">Action</th>
                      <th className="px-6 py-4">Affected Entity / Target</th>
                      <th className="px-6 py-4">Status Code</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="px-6 py-4 whitespace-nowrap text-slate-450 text-[11px]">
                          {formatDate(log.date_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                          {log.user}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-650 dark:text-slate-350">
                          {log.action}
                        </td>
                        <td className="px-6 py-4 text-slate-650 dark:text-slate-350">
                          {log.target}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            log.status.toLowerCase().startsWith('failed')
                              ? 'bg-red-50 text-red-650 dark:bg-red-950/60 dark:text-red-400 border-red-200/30'
                              : 'bg-emerald-50 text-emerald-650 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/30'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-450 italic">
                          No audit logs match your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            7. TAB: ADMIN SYSTEM SETTINGS
            ========================================== */}
        {activeAdminTab === 'settings' && (
          <div className="space-y-6">
            
            {/* Visual Theme Configuration */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                System and Theme Configuration
              </h3>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Active Visual Mode</h4>
                  <p className="text-slate-450 text-[11px] mt-0.5">Toggle counseling website light or dark appearance themes.</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700"
                >
                  {theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                </button>
              </div>
            </div>

            {/* Change My Password (Available for all logged-in accounts) */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
              <div className="flex items-center gap-2">
                <Key className="h-4.5 w-4.5 text-dhanekula-royal" />
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Change My Password
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Update the credentials for your logged-in account ({adminUser?.name} • @{adminUser?.username}).
                  </p>
                </div>
              </div>

              {changePassMsg && (
                <div className={`p-3 rounded-2xl border text-xs font-bold animate-fade-in ${
                  changePassMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800'
                }`}>
                  {changePassMsg.text}
                </div>
              )}

              <form onSubmit={handleChangeMyPassword} className="space-y-4 max-w-lg pt-1">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 dark:text-slate-400">Current Password *</label>
                  <input
                    type="password"
                    required
                    value={changePassForm.currentPassword}
                    onChange={(e) => setChangePassForm({ ...changePassForm, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 dark:text-slate-400">New Password * (Min 6 chars)</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={changePassForm.newPassword}
                      onChange={(e) => setChangePassForm({ ...changePassForm, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 dark:text-slate-400">Confirm New Password *</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={changePassForm.confirmPassword}
                      onChange={(e) => setChangePassForm({ ...changePassForm, confirmPassword: e.target.value })}
                      placeholder="Re-enter new password"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={changePassLoading}
                  className="px-5 py-2.5 rounded-xl bg-dhanekula-royal hover:bg-dhanekula-600 text-white font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  {changePassLoading ? 'Saving Password...' : 'Update Password'}
                </button>
              </form>
            </div>

            {/* Super Admin Teaching Methodology Permissions Management */}
            {isSuperAdmin && (
              <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4.5 w-4.5 text-dhanekula-royal" />
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Teaching Methodology Management Permissions
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Super Admin Control: Select which sub-admin accounts are authorized to add, edit, and delete teaching methodologies.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Sub-Admin Account</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Teaching Methods Access</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                      {subAdmins.map((sa) => {
                        const hasPerm = sa.permissionsList.includes('Manage Teaching Methods');
                        const isUpdating = permUpdatingId === sa.id;
                        return (
                          <tr key={sa.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px]">
                                  {getInitials(sa.name)}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white block">{sa.name}</span>
                                  <span className="text-[10px] text-slate-400">@{sa.username} • {sa.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                sa.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                  : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                              }`}>
                                {sa.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {hasPerm ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  <Check className="h-3 w-3" />
                                  Authorized (Can Manage)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                  <Lock className="h-3 w-3" />
                                  Restricted (Read-Only / No Access)
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <button
                                onClick={() => handleToggleTeachingPerm(sa)}
                                disabled={isUpdating}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-xs disabled:opacity-50 ${
                                  hasPerm
                                    ? 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-300 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                                }`}
                              >
                                {isUpdating ? 'Updating...' : hasPerm ? 'Revoke Permission' : 'Grant Permission'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {subAdmins.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-slate-400 italic">
                            No Sub-Admin accounts registered.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Super Admin Password Reset Tool for Sub-Admins */}
            {isSuperAdmin && (
              <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Reset Sub-Admin Password
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Super Admin Tool: Select any Sub-Admin account and securely set a new password.
                    </p>
                  </div>
                </div>

                {superAdminResetMsg && (
                  <div className={`p-3 rounded-2xl border text-xs font-bold animate-fade-in ${
                    superAdminResetMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800'
                  }`}>
                    {superAdminResetMsg.text}
                  </div>
                )}

                <form onSubmit={handleSuperAdminResetSubAdminPassword} className="space-y-4 max-w-lg pt-1">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 dark:text-slate-400">Select Sub-Admin Account *</label>
                    <select
                      required
                      value={superAdminResetForm.selectedSubAdminId}
                      onChange={(e) => setSuperAdminResetForm({ ...superAdminResetForm, selectedSubAdminId: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none"
                    >
                      <option value="" disabled>▼ Select a Sub-Admin</option>
                      {subAdmins.map(sa => (
                        <option key={sa.id} value={sa.id}>
                          {sa.name} (@{sa.username}) – {sa.email} [{sa.status}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 dark:text-slate-400">New Password * (Min 6 chars)</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={superAdminResetForm.newPassword}
                        onChange={(e) => setSuperAdminResetForm({ ...superAdminResetForm, newPassword: e.target.value })}
                        placeholder="Enter new password"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 dark:text-slate-400">Confirm New Password *</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={superAdminResetForm.confirmPassword}
                        onChange={(e) => setSuperAdminResetForm({ ...superAdminResetForm, confirmPassword: e.target.value })}
                        placeholder="Re-enter new password"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/50 dark:border-slate-800 text-[10px] text-slate-500">
                    ℹ️ Note: The Super Admin cannot reset their own password using this tool. To update the Super Admin password, please use the "Change My Password" section above.
                  </div>

                  <button
                    type="submit"
                    disabled={superAdminResetLoading}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm disabled:opacity-50"
                  >
                    {superAdminResetLoading ? 'Resetting Sub-Admin Password...' : 'Reset Sub-Admin Password'}
                  </button>
                </form>
              </div>
            )}

            {/* System Info */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white">System Information</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                    <span className="block text-[10px] text-slate-450 uppercase">Express Port</span>
                    <span className="font-bold block mt-1">5000</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                    <span className="block text-[10px] text-slate-450 uppercase">Database Driver</span>
                    <span className="font-bold block mt-1">SQLite 3 (File-based)</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                    <span className="block text-[10px] text-slate-450 uppercase">Session Token</span>
                    <span className="font-bold block mt-1 text-emerald-600 dark:text-emerald-400">JWT Enabled</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                    <span className="block text-[10px] text-slate-450 uppercase">API Status</span>
                    <span className="font-bold block mt-1 text-emerald-600 dark:text-emerald-400">Synced & Connected</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ==========================================
          MODAL: VIEW SUB-ADMIN DETAILS
          ========================================== */}
      {viewingSubAdmin && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Shield className="h-4.5 w-4.5 text-dhanekula-royal animate-pulse" />
                <span>Admin Details</span>
              </h3>
              <button
                onClick={() => setViewingSubAdmin(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 py-2 border-b border-slate-100 dark:border-slate-850">
                <span className="font-semibold text-slate-450">Full Name:</span>
                <span className="col-span-2 font-bold text-slate-900 dark:text-white">{viewingSubAdmin.name}</span>
              </div>
              <div className="grid grid-cols-3 py-2 border-b border-slate-100 dark:border-slate-850">
                <span className="font-semibold text-slate-450">Username:</span>
                <span className="col-span-2 font-bold text-slate-900 dark:text-white">@{viewingSubAdmin.username}</span>
              </div>
              <div className="grid grid-cols-3 py-2 border-b border-slate-100 dark:border-slate-850">
                <span className="font-semibold text-slate-450">Email:</span>
                <span className="col-span-2 font-bold text-slate-900 dark:text-white">{viewingSubAdmin.email}</span>
              </div>
              <div className="grid grid-cols-3 py-2 border-b border-slate-100 dark:border-slate-850">
                <span className="font-semibold text-slate-450">Account Status:</span>
                <span className={`col-span-2 font-black uppercase ${viewingSubAdmin.status === 'Active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-650'}`}>
                  {viewingSubAdmin.status}
                </span>
              </div>
              <div className="grid grid-cols-3 py-2 border-b border-slate-100 dark:border-slate-850">
                <span className="font-semibold text-slate-450">Last Login:</span>
                <span className="col-span-2 font-semibold text-slate-650 dark:text-slate-350">{formatDate(viewingSubAdmin.last_login)}</span>
              </div>
              <div className="space-y-1.5 py-2">
                <span className="font-semibold text-slate-450 block">Assigned Permissions:</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {viewingSubAdmin.permissionsList.map((p, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-full bg-slate-105 dark:bg-slate-800 text-slate-650 dark:text-slate-350 border border-slate-200/60 dark:border-slate-700/60 text-[10px] font-bold">
                      {p}
                    </span>
                  ))}
                  {viewingSubAdmin.permissionsList.length === 0 && (
                    <span className="text-[10px] text-slate-450 italic">No assigned scopes</span>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setViewingSubAdmin(null)}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 font-bold text-xs"
            >
              Close Info
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: CREATE SUB-ADMIN
          ========================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Create New Sub-Admin Account
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-450 hover:text-slate-750 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubAdmin} className="space-y-4 pt-4 text-xs">
              
              {/* Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Full Name</label>
                  <input
                    type="text"
                    required
                    value={subAdminForm.name}
                    onChange={(e) => setSubAdminForm({ ...subAdminForm, name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-dhanekula-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Username</label>
                  <input
                    type="text"
                    required
                    value={subAdminForm.username}
                    onChange={(e) => setSubAdminForm({ ...subAdminForm, username: e.target.value })}
                    placeholder="e.g. content_manager"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-dhanekula-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="font-bold text-slate-450">Email Address</label>
                <input
                  type="email"
                  required
                  value={subAdminForm.email}
                  onChange={(e) => setSubAdminForm({ ...subAdminForm, email: e.target.value })}
                  placeholder="name@dhanekula.ac.in"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-dhanekula-500"
                />
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Account Password</label>
                  <input
                    type="password"
                    required
                    value={subAdminForm.password}
                    onChange={(e) => setSubAdminForm({ ...subAdminForm, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-dhanekula-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={subAdminForm.confirmPassword}
                    onChange={(e) => setSubAdminForm({ ...subAdminForm, confirmPassword: e.target.value })}
                    placeholder="Re-type password"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-dhanekula-500"
                  />
                </div>
              </div>

              {/* Permissions scope */}
              <div className="space-y-2">
                <label className="font-bold text-slate-450 block">Assign Permission Scopes</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl">
                  {availablePermissions.map((perm) => (
                    <label key={perm} className="flex items-center gap-2 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={subAdminForm.permissions.includes(perm)}
                        onChange={() => handleFormPermissionChange(perm)}
                        className="rounded border-slate-300 dark:border-slate-700 text-dhanekula-royal focus:ring-dhanekula-royal h-4 w-4"
                      />
                      <span className="font-semibold text-slate-750 dark:text-slate-350">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-750 hover:bg-slate-55 dark:hover:bg-slate-850 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-dhanekula-royal text-white font-bold hover:bg-dhanekula-600 shadow-md shadow-dhanekula-royal/20"
                >
                  Create Sub-Admin
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: EDIT SUB-ADMIN DETAILS
          ========================================== */}
      {editingSubAdmin && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Edit Sub-Admin Details
              </h3>
              <button
                onClick={() => setEditingSubAdmin(null)}
                className="p-1.5 text-slate-450 hover:text-slate-750 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubAdmin} className="space-y-4 pt-4 text-xs">
              
              {/* Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Full Name</label>
                  <input
                    type="text"
                    required
                    value={subAdminForm.name}
                    onChange={(e) => setSubAdminForm({ ...subAdminForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Username</label>
                  <input
                    type="text"
                    required
                    value={subAdminForm.username}
                    onChange={(e) => setSubAdminForm({ ...subAdminForm, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="font-bold text-slate-450">Email Address</label>
                <input
                  type="email"
                  required
                  value={subAdminForm.email}
                  onChange={(e) => setSubAdminForm({ ...subAdminForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              {/* Status Selector */}
              <div className="space-y-1">
                <label className="font-bold text-slate-450">Account Status</label>
                <select
                  value={subAdminForm.status}
                  onChange={(e) => setSubAdminForm({ ...subAdminForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-dhanekula-500 font-semibold"
                >
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>

              {/* Permissions scope */}
              <div className="space-y-2">
                <label className="font-bold text-slate-450 block">Modify Permission Scopes</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl">
                  {availablePermissions.map((perm) => (
                    <label key={perm} className="flex items-center gap-2 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={subAdminForm.permissions.includes(perm)}
                        onChange={() => handleFormPermissionChange(perm)}
                        className="rounded border-slate-300 dark:border-slate-700 text-dhanekula-royal focus:ring-dhanekula-royal h-4 w-4"
                      />
                      <span className="font-semibold text-slate-750 dark:text-slate-350">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSubAdmin(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-750 hover:bg-slate-55 dark:hover:bg-slate-850 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-dhanekula-royal text-white font-bold hover:bg-dhanekula-600 shadow-md shadow-dhanekula-royal/20"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: RESET PASSWORD
          ========================================== */}
      {passwordResetSubAdmin && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-105 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Reset password for: {passwordResetSubAdmin.name}
              </h3>
              <button
                onClick={() => setPasswordResetSubAdmin(null)}
                className="p-1.5 text-slate-450 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-450">New Password</label>
                <input
                  type="password"
                  required
                  value={resetPassForm.newPassword}
                  onChange={(e) => setResetPassForm({ ...resetPassForm, newPassword: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-450">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={resetPassForm.confirmPassword}
                  onChange={(e) => setResetPassForm({ ...resetPassForm, confirmPassword: e.target.value })}
                  placeholder="Re-type new password"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setPasswordResetSubAdmin(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-750 hover:bg-slate-55 dark:hover:bg-slate-850 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-dhanekula-royal text-white font-bold hover:bg-dhanekula-600 shadow-md shadow-dhanekula-royal/20"
                >
                  Reset Password
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: ADD/EDIT TEACHING METHOD
          ========================================== */}
      {showMethodModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {editingMethod ? 'Modify Teaching Method' : 'Create Innovative Teaching Method'}
              </h3>
              <button
                onClick={() => setShowMethodModal(false)}
                className="p-1.5 text-slate-450 hover:text-slate-750 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMethod} className="space-y-4 pt-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Method ID (Readonly)</label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={methodForm.id || '(Auto-generated)'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Method Name</label>
                  <input
                    type="text"
                    required
                    value={methodForm.name}
                    onChange={(e) => setMethodForm({ ...methodForm, name: e.target.value })}
                    placeholder="e.g. Flipped Classroom"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Target Cohort</label>
                  <select
                    value={methodForm.cohort}
                    onChange={(e) => setMethodForm({ ...methodForm, cohort: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none font-semibold"
                  >
                    <option value="Unified Learning Cohort">Unified Learning Cohort (ULC)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Category</label>
                  <select
                    value={methodForm.category}
                    onChange={(e) => setMethodForm({ ...methodForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none font-semibold"
                  >
                    <option value="Innovative">Innovative</option>
                    <option value="Active Learning">Active Learning</option>
                    <option value="Assessment">Assessment</option>
                    <option value="Peer & Collaborative">Peer & Collaborative</option>
                    <option value="AI & Tech Supported">AI & Tech Supported</option>
                  </select>
                </div>
              </div>

              {/* YouTube Video URL Input & Live Preview (Strict Admin Access Control) */}
              {isSuperAdmin ? (
                <div className="space-y-2 p-3.5 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                      <Video className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                      YouTube Video Link / URL (Embedded on Main Page)
                    </label>
                    <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">Admin Only</span>
                  </div>
                  <input
                    type="url"
                    value={methodForm.videoUrl}
                    onChange={(e) => setMethodForm({ ...methodForm, videoUrl: e.target.value })}
                    placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Paste any standard YouTube video URL. It will automatically render as an interactive, playable video player directly on the main page card.
                  </p>

                  {methodForm.videoUrl && getYouTubeEmbedUrl(methodForm.videoUrl) && (
                    <div className="pt-1.5 space-y-1">
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Live Video Preview:</span>
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800 shadow-sm">
                        <iframe
                          src={getYouTubeEmbedUrl(methodForm.videoUrl) || ''}
                          title="Video Preview"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-amber-500" />
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-200 block">YouTube Video Link</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {methodForm.videoUrl ? 'Configured by Administrator' : 'No video attached'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-300 dark:border-amber-800">
                    Admin Controlled
                  </span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-450">Implementation Description</label>
                <input
                  type="text"
                  value={methodForm.implementation}
                  onChange={(e) => setMethodForm({ ...methodForm, implementation: e.target.value })}
                  placeholder="e.g. Students study videos before class; class used for applications"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-450">Expected Outcome Objective</label>
                <input
                  type="text"
                  value={methodForm.expectedOutcome}
                  onChange={(e) => setMethodForm({ ...methodForm, expectedOutcome: e.target.value })}
                  placeholder="e.g. Higher-order thinking / Analytical ability"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-450">Detailed Narrative Description</label>
                <textarea
                  value={methodForm.detailedDescription}
                  onChange={(e) => setMethodForm({ ...methodForm, detailedDescription: e.target.value })}
                  placeholder="Provide deep curriculum breakdown or syllabus objectives..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              {/* Tags Setup */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-450">Method Tags</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={methodForm.tagInput}
                    onChange={(e) => setMethodForm({ ...methodForm, tagInput: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                    placeholder="Enter a tag and hit Enter"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold border border-slate-200 dark:border-slate-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 pt-1.5">
                  {methodForm.tags.map((tag, idx) => (
                    <span key={idx} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-750 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700 text-[10px]">
                      <span>{tag}</span>
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="text-slate-450 hover:text-slate-800 dark:hover:text-white">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Materials Count</label>
                  <input
                    type="number"
                    value={methodForm.materialsCount}
                    onChange={(e) => setMethodForm({ ...methodForm, materialsCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5 cursor-pointer">
                  <input
                    type="checkbox"
                    id="featuredCheckbox"
                    checked={methodForm.featured}
                    onChange={(e) => setMethodForm({ ...methodForm, featured: e.target.checked })}
                    className="rounded border-slate-300 text-dhanekula-royal focus:ring-dhanekula-royal h-4.5 w-4.5"
                  />
                  <label htmlFor="featuredCheckbox" className="font-bold text-slate-700 dark:text-slate-350 cursor-pointer select-none">
                    Feature in Hero Section
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMethodModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-750 hover:bg-slate-55 dark:hover:bg-slate-850 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-dhanekula-royal text-white font-bold hover:bg-dhanekula-600 shadow-md shadow-dhanekula-royal/20"
                >
                  Save Method
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: UPLOAD RESOURCE
          ========================================== */}
      {showResourceModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Upload Digital Courseware Resource
              </h3>
              <button
                onClick={() => setShowResourceModal(false)}
                className="p-1.5 text-slate-450 hover:text-slate-750 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUploadResource} className="space-y-4 pt-4 text-xs">
              
              <div className="space-y-1">
                <label className="font-bold text-slate-450">Resource Title</label>
                <input
                  type="text"
                  required
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                  placeholder="e.g. Case Study: Qualcomm 5G Transceiver RF Link Design"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Subject Course</label>
                  <select
                    value={resourceForm.subject}
                    onChange={(e) => setResourceForm({ ...resourceForm, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none font-semibold"
                  >
                    <option value="Digital Signal Processing">Digital Signal Processing</option>
                    <option value="Communication Systems">Communication Systems</option>
                    <option value="Analog Electronics">Analog Electronics</option>
                    <option value="VLSI Design">VLSI Design</option>
                    <option value="Microcontrollers">Microcontrollers</option>
                    <option value="Circuit Theory">Circuit Theory</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Resource Type</label>
                  <select
                    value={resourceForm.type}
                    onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none font-semibold"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="video">Video Lecture</option>
                    <option value="quiz">Interactive Quiz</option>
                    <option value="simulation">CAD/Simulation File</option>
                    <option value="code">Verilog/HDL Code</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Cohort Audience</label>
                  <select
                    value={resourceForm.cohort}
                    onChange={(e) => setResourceForm({ ...resourceForm, cohort: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none font-semibold"
                  >
                    <option value="All">All Students (General)</option>
                    <option value="Unified Learning Cohort">Unified Learning Cohort (ULC)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Linked Teaching Method (Optional)</label>
                  <select
                    value={resourceForm.methodId}
                    onChange={(e) => setResourceForm({ ...resourceForm, methodId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none font-semibold"
                  >
                    <option value="">None (Generic File)</option>
                    {teachingMethods.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.cohort})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-450">Resource URL / External Link</label>
                <input
                  type="url"
                  required
                  value={resourceForm.url}
                  onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                  placeholder="https://dhanekula.ac.in/courseware/file.pdf"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-450">Resource Description Summary</label>
                <textarea
                  value={resourceForm.description}
                  onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                  placeholder="Describe resource contents and utility objectives..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowResourceModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-750 hover:bg-slate-55 dark:hover:bg-slate-850 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-dhanekula-royal text-white font-bold hover:bg-dhanekula-600 shadow-md shadow-dhanekula-royal/20"
                >
                  Upload File
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
      {/* ==========================================
          MODAL: REJECT SUBMISSION DIALOG
          ========================================== */}
      {rejectingSubmissionId !== null && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Provide Rejection Reason
              </h3>
              <button onClick={() => setRejectingSubmissionId(null)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <label className="font-bold text-slate-500">Reason for rejection (Optional)</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Describe why this file is not suitable (e.g., blurry image, duplicate document)..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setRejectingSubmissionId(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-750 hover:bg-slate-55 dark:hover:bg-slate-850 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (rejectingSubmissionId !== null) {
                    await rejectSubmission(rejectingSubmissionId, rejectingSubmissionId ? rejectionReason : undefined);
                    setRejectingSubmissionId(null);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-red-650 text-white font-bold hover:bg-red-700 shadow-md animate-fade-in"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: ADD/EDIT STUDENT DETAILS
          ========================================== */}
      {showStudentFormModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in text-xs text-slate-800 dark:text-slate-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {editingStudentId ? 'Modify Student Profile' : 'Add New Student Record'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {editingStudentId ? 'Update details for this existing student.' : 'Create a permanent student record using Roll Number & Student ID.'}
                </p>
              </div>
              <button onClick={() => setShowStudentFormModal(false)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-250">
                <X className="h-4 w-4" />
              </button>
            </div>

            {duplicateAlert && (
              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-2xl text-amber-900 dark:text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <ShieldAlert className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Student Already Exists</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {duplicateAlert.message}
                </p>
                {duplicateAlert.existingStudentId && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowStudentFormModal(false);
                      const existing = adminStudents.find(s => s.id === duplicateAlert.existingStudentId);
                      if (existing) {
                        handleViewProfile(existing);
                      }
                    }}
                    className="mt-1 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Open Existing Student Profile & Add Counselling Note →
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleStudentFormSubmit} className="space-y-4 pt-4">
              
              {/* Optional Custom Student ID and Roll Number */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    placeholder="Enter student name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={studentForm.rollNumber}
                    onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                    placeholder="e.g. 238W1A0401"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Student ID (Optional / Auto)</label>
                  <input
                    type="text"
                    disabled={!!editingStudentId}
                    value={studentForm.studentId}
                    onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                    placeholder="Auto-generated if blank"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Email & Academic Batch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    placeholder="e.g. student@dhanekula.in"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Academic Batch *</label>
                  <select
                    required
                    value={studentForm.batch}
                    onChange={(e) => setStudentForm({ ...studentForm, batch: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none"
                  >
                    <option value="" disabled>▼ Select Batch</option>
                    <option value="2022 - 2026">2022 - 2026</option>
                    <option value="2023 - 2027">2023 - 2027</option>
                    <option value="2024 - 2028">2024 - 2028</option>
                    <option value="2025 - 2029">2025 - 2029</option>
                    <option value="2026 - 2030">2026 - 2030</option>
                  </select>
                </div>
              </div>

              {/* Class & Department info */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Department</label>
                  <input
                    type="text"
                    value={studentForm.department}
                    onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Academic Year</label>
                  <select
                    value={studentForm.year}
                    onChange={(e) => setStudentForm({ ...studentForm, year: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Semester</label>
                  <select
                    value={studentForm.semester}
                    onChange={(e) => setStudentForm({ ...studentForm, semester: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="1st Sem">1st Sem</option>
                    <option value="2nd Sem">2nd Sem</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Section</label>
                  <input
                    type="text"
                    value={studentForm.section}
                    onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
                    placeholder="e.g. A"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              {/* Stats & Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="font-bold text-slate-450">Phone Number</label>
                  <input
                    type="text"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Current CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={studentForm.gpa}
                    onChange={(e) => setStudentForm({ ...studentForm, gpa: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Attendance (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={studentForm.attendance}
                    onChange={(e) => setStudentForm({ ...studentForm, attendance: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="font-bold text-slate-450">Academic Status</label>
                <select
                  value={studentForm.academicStatus}
                  onChange={(e) => setStudentForm({ ...studentForm, academicStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none font-bold"
                >
                  <option value="Regular">Regular Status</option>
                  <option value="Condonation">Condonation Warning</option>
                  <option value="Detained">Detained Status</option>
                </select>
              </div>

              {/* Parents & Strengths CSV */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Parent / Guardian Name</label>
                  <input
                    type="text"
                    value={studentForm.parentName}
                    onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
                    placeholder="Enter parent's full name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Strengths (Comma separated)</label>
                  <input
                    type="text"
                    value={studentForm.strengths}
                    onChange={(e) => setStudentForm({ ...studentForm, strengths: e.target.value })}
                    placeholder="e.g. Mathematics, Programming, VLSI"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Focus Areas (Comma separated)</label>
                  <input
                    type="text"
                    value={studentForm.focusAreas}
                    onChange={(e) => setStudentForm({ ...studentForm, focusAreas: e.target.value })}
                    placeholder="e.g. Communications, Analog Circuits"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-bold text-slate-450">Private Academic Notes</label>
                <textarea
                  rows={2}
                  value={studentForm.notes}
                  onChange={(e) => setStudentForm({ ...studentForm, notes: e.target.value })}
                  placeholder="Enter other general academic notes, counseling warnings, etc."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3.5">
                <button
                  type="button"
                  onClick={() => setShowStudentFormModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingStudent}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingStudent ? 'Saving Student...' : editingStudentId ? 'Save Profile' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: STUDENT CREATION SUCCESS DETAILS
          ========================================== */}
      {createdStudentDetails && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in text-xs text-slate-800 dark:text-slate-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl animate-scale-in text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/70 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Check className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Student Record Created Successfully
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                The student record has been initialized and is ready for counselling sessions.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-left space-y-2">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-1.5">
                <span className="text-slate-450 font-bold">Name:</span>
                <span className="text-slate-900 dark:text-white font-extrabold">{createdStudentDetails.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-1.5">
                <span className="text-slate-450 font-bold">Student ID:</span>
                <span className="text-slate-900 dark:text-white font-mono font-extrabold text-emerald-600 dark:text-emerald-400">{createdStudentDetails.studentId}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-1.5">
                <span className="text-slate-450 font-bold">Roll Number:</span>
                <span className="text-slate-905 dark:text-slate-105 font-mono font-bold">{createdStudentDetails.rollNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-450 font-bold">Batch:</span>
                <span className="text-slate-905 dark:text-slate-105 font-bold">{createdStudentDetails.batch}</span>
              </div>
            </div>
            <button
              onClick={() => setCreatedStudentDetails(null)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md active:scale-95 text-xs"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: RECORD/EDIT COUNSELLING SESSION
          ========================================== */}
      {showCounsellingFormModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in text-xs text-slate-800 dark:text-slate-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {editingSessionId ? 'Edit Counselling Record' : 'Record Counselling Session'}
                </h3>
                <span className="text-[10px] text-slate-400 mt-0.5 block font-bold">Student: {counsellingStudentName}</span>
              </div>
              <button onClick={() => setShowCounsellingFormModal(false)} className="p-1.5 text-slate-450 hover:text-slate-750 dark:hover:text-slate-200">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCounsellingFormSubmit} className="space-y-4 pt-4">
              
              {/* Date & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Counselling Date *</label>
                  <input
                    type="date"
                    required
                    value={counsellingForm.counselling_date}
                    onChange={(e) => setCounsellingForm({ ...counsellingForm, counselling_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Counselling Category *</label>
                  <select
                    value={counsellingForm.type}
                    onChange={(e) => setCounsellingForm({ ...counsellingForm, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none font-bold"
                  >
                    <option value="Academic">Academic Guidance</option>
                    <option value="Career">Career & Placement</option>
                    <option value="Attendance">Low Attendance Warning</option>
                    <option value="Performance">Low Mid-Term Performance</option>
                    <option value="Disciplinary">Disciplinary Counsel</option>
                    <option value="Personal">Personal Counselling</option>
                  </select>
                </div>
              </div>

              {/* Private Discussion Notes (Strictly Confidential) */}
              <div className="space-y-1 bg-red-50/20 dark:bg-red-950/10 border border-red-250/25 dark:border-red-900/25 p-4.5 rounded-2xl">
                <label className="font-extrabold text-red-700 dark:text-red-400 block uppercase tracking-wider text-[10px] mb-1">
                  Private Discussion Notes * (Strictly Confidential - Admins Only)
                </label>
                <textarea
                  rows={3}
                  required
                  value={counsellingForm.private_notes}
                  onChange={(e) => setCounsellingForm({ ...counsellingForm, private_notes: e.target.value })}
                  placeholder="Enter detailed counseling session logs. These notes are stored securely and never exposed publicly."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-55 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              {/* Concerns, Guidance, Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Student Primary Concerns</label>
                  <textarea
                    rows={2.5}
                    value={counsellingForm.student_concerns}
                    onChange={(e) => setCounsellingForm({ ...counsellingForm, student_concerns: e.target.value })}
                    placeholder="Concerns raised by the student..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Guidance Provided</label>
                  <textarea
                    rows={2.5}
                    value={counsellingForm.guidance}
                    onChange={(e) => setCounsellingForm({ ...counsellingForm, guidance: e.target.value })}
                    placeholder="Advisory guidance given..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Action Items / Recommendations</label>
                  <textarea
                    rows={2.5}
                    value={counsellingForm.action_items}
                    onChange={(e) => setCounsellingForm({ ...counsellingForm, action_items: e.target.value })}
                    placeholder="Recommended next steps..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              {/* Follow up & status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Follow-Up Required?</label>
                  <select
                    value={counsellingForm.follow_up_required}
                    onChange={(e) => setCounsellingForm({ ...counsellingForm, follow_up_required: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none font-bold"
                  >
                    <option value="No">No Follow-Up Required</option>
                    <option value="Yes">Yes, Follow-Up Needed</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Follow-Up Date</label>
                  <input
                    type="date"
                    value={counsellingForm.follow_up_date}
                    onChange={(e) => setCounsellingForm({ ...counsellingForm, follow_up_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Counselling Record Status</label>
                  <select
                    value={counsellingForm.status}
                    onChange={(e) => setCounsellingForm({ ...counsellingForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none font-bold"
                  >
                    <option value="Completed">Completed Record</option>
                    <option value="Follow-Up Required">Needs Review / Follow-Up</option>
                    <option value="Draft">Draft Record</option>
                  </select>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3.5">
                <button
                  type="button"
                  onClick={() => setShowCounsellingFormModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {editingSessionId ? 'Update Record' : 'Save Counselling Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: VIEW STUDENT DETAILS & TIMELINE PROFILE
          ========================================== */}
      {viewingStudentProfile && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in text-xs text-slate-800 dark:text-slate-200">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl my-8">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Student Profile Timeline
                </h3>
                <span className="text-[10px] text-dhanekula-royal dark:text-sky-400 block font-bold">Roll Number: {viewingStudentProfile.rollNumber} • ID: {viewingStudentProfile.id}</span>
              </div>
              <button
                onClick={() => setViewingStudentProfile(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Grid details */}
            <div className="space-y-4 pt-4">
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Full Name</span>
                  <span className="font-extrabold text-slate-900 dark:text-white mt-0.5">{viewingStudentProfile.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Email Address</span>
                  <span className="font-extrabold text-slate-900 dark:text-white mt-0.5">{viewingStudentProfile.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Phone Number</span>
                  <span className="font-extrabold text-slate-900 dark:text-white mt-0.5">{viewingStudentProfile.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Parent / Guardian</span>
                  <span className="font-extrabold text-slate-900 dark:text-white mt-0.5">{viewingStudentProfile.parentName || 'N/A'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Class & Batch</span>
                  <span className="font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {viewingStudentProfile.department || 'ECE'} – {viewingStudentProfile.year || '3rd Year'} (Sec {viewingStudentProfile.section || 'A'})
                    <span className="block text-[10px] text-emerald-600 mt-0.5 font-bold uppercase">Batch {viewingStudentProfile.batch || '2023 - 2027'}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Academic Stats</span>
                  <span className="font-extrabold text-slate-900 dark:text-white mt-0.5">
                    CGPA: {viewingStudentProfile.gpa} / 10
                    <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">Attendance: {viewingStudentProfile.attendance}%</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Academic Status</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black inline-block mt-0.5 uppercase ${
                    viewingStudentProfile.academicStatus === 'Regular'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950'
                      : 'bg-red-50 text-red-700 dark:bg-red-950'
                  }`}>
                    {viewingStudentProfile.academicStatus || 'Regular'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Strengths & Focus Areas</span>
                  <span className="text-[10px] font-medium text-slate-650 dark:text-slate-350 block mt-0.5">
                    <strong>S:</strong> {viewingStudentProfile.strengths?.join(', ') || 'None'}
                  </span>
                  <span className="text-[10px] font-medium text-slate-650 dark:text-slate-350 block">
                    <strong>F:</strong> {viewingStudentProfile.focusAreas?.join(', ') || 'None'}
                  </span>
                </div>
              </div>

              {/* Assigned Counsellor Banner */}
              <div className="p-3 bg-dhanekula-50/60 dark:bg-dhanekula-950/40 rounded-2xl border border-dhanekula-200/50 dark:border-dhanekula-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4 text-dhanekula-royal dark:text-dhanekula-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Designated Faculty Counsellor</span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {viewingStudentProfile.assignedSubAdminName ? `${viewingStudentProfile.assignedSubAdminName} (Faculty Mentor)` : 'Unassigned (No faculty counsellor allotted yet)'}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  {counsellingHistory.length} Total {counsellingHistory.length === 1 ? 'Session' : 'Sessions'}
                </span>
              </div>

              {viewingStudentProfile.notes && (
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/50 dark:border-slate-800">
                  <span className="font-bold text-slate-450 block mb-0.5">Admin Comments / Notes:</span>
                  <p className="text-slate-700 dark:text-slate-300 italic">"{viewingStudentProfile.notes}"</p>
                </div>
              )}

              {/* Counselling Sessions Timeline list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-black text-slate-900 dark:text-white uppercase tracking-tight block">
                    Counselling History Logs ({counsellingHistory.length})
                  </span>
                  
                  {hasPermission('Manage Counselling') && (
                    <button
                      onClick={() => {
                        setViewingStudentProfile(null);
                        openAddCounsellingModal(viewingStudentProfile);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Session Record
                    </button>
                  )}
                </div>

                {counsellingHistory.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-slate-500 italic text-[11px]">
                    No counselling sessions recorded for this student yet. Click "Add Session Record" to record a new session.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {counsellingHistory.map((session) => (
                      <div
                        key={session.id}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 relative group"
                      >
                        {/* Session Metadata header */}
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">{session.counselling_date}</span>
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded ml-2 uppercase tracking-wide inline-block">{session.type} Guidance</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                            <span>Counsellor: {session.counsellor_name}</span>
                            
                            {/* Controls */}
                            {hasPermission('Manage Counselling') && (
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 ml-2">
                                <button
                                  onClick={() => {
                                    setViewingStudentProfile(null);
                                    openEditCounsellingModal(session, viewingStudentProfile.name);
                                  }}
                                  className="p-1 text-slate-450 hover:text-sky-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCounselling(session.id, viewingStudentProfile.id)}
                                  className="p-1 text-slate-450 hover:text-red-650 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Private notes display */}
                        <div className="bg-red-50/20 dark:bg-red-950/10 border border-red-200/30 dark:border-red-900/20 p-3 rounded-xl">
                          <span className="text-[9px] font-bold text-red-750 dark:text-red-400 block uppercase mb-1">Confidential Discussion Log:</span>
                          <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed font-sans">{session.private_notes}</p>
                        </div>

                        {/* Concerns, action items info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] leading-relaxed text-slate-500">
                          {session.student_concerns && (
                            <p><strong>Concerns:</strong> {session.student_concerns}</p>
                          )}
                          {session.guidance && (
                            <p><strong>Guidance:</strong> {session.guidance}</p>
                          )}
                          {session.action_items && (
                            <p><strong>Actions:</strong> {session.action_items}</p>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="pt-3.5 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setViewingStudentProfile(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: ASSIGN / EDIT TEACHING TASK (SUPER ADMIN)
          ========================================================================= */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-xs">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-600" />
                  <span>{editingTask ? 'Edit Teaching Directive' : 'Assign New Innovative Teaching Task'}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Super Admin module to delegate innovative pedagogy directives to department Sub-Admins.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  setEditingTask(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              
              {/* Sub Admin Assignee */}
              {/* Assignment Target Scope Mode Selector */}
              {!editingTask && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Assign Scope / Target Faculty Coordinators *
                    </label>
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {taskAssignMode === 'all'
                        ? `All (${subAdmins.length}) Coordinators`
                        : taskAssignMode === 'selective'
                        ? `${selectedTaskSubAdminIds.length} Selected`
                        : '1 Coordinator'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setTaskAssignMode('single')}
                      className={`py-2 px-2 sm:px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                        taskAssignMode === 'single'
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>Single Person</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTaskAssignMode('selective');
                        if (selectedTaskSubAdminIds.length === 0) {
                          setSelectedTaskSubAdminIds(subAdmins.map(a => a.id));
                        }
                      }}
                      className={`py-2 px-2 sm:px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                        taskAssignMode === 'selective'
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>Selective People</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTaskAssignMode('all');
                        setSelectedTaskSubAdminIds(subAdmins.map(a => a.id));
                      }}
                      className={`py-2 px-2 sm:px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                        taskAssignMode === 'all'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>All People ({subAdmins.length})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 1. SINGLE SUB-ADMIN DROPDOWN VIEW */}
              {(editingTask || taskAssignMode === 'single') && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Assign to Sub-Admin (Faculty Coordinator) *
                  </label>
                  <select
                    required
                    value={taskForm.sub_admin_id}
                    onChange={(e) => setTaskForm({ ...taskForm, sub_admin_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>▼ Select Sub-Admin Coordinator</option>
                    {subAdmins.map((admin) => (
                      <option key={admin.id} value={admin.id}>
                        {admin.name} (@{admin.username}) - {admin.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 2. SELECTIVE PEOPLE MULTI-SELECT VIEW */}
              {!editingTask && taskAssignMode === 'selective' && (
                <div className="space-y-2.5 p-3.5 bg-slate-50 dark:bg-slate-850/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                        Select Coordinators ({selectedTaskSubAdminIds.length} of {subAdmins.length} selected)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedTaskSubAdminIds(subAdmins.map(a => a.id))}
                        className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <button
                        type="button"
                        onClick={() => setSelectedTaskSubAdminIds([])}
                        className="font-bold text-slate-500 hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Search within coordinators */}
                  {subAdmins.length > 2 && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={taskSubAdminSearch}
                        onChange={(e) => setTaskSubAdminSearch(e.target.value)}
                        placeholder="Search coordinators by name, username or email..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {/* Checklist of Faculty Coordinators */}
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {subAdmins
                      .filter(a =>
                        taskSubAdminSearch === '' ||
                        a.name.toLowerCase().includes(taskSubAdminSearch.toLowerCase()) ||
                        a.username.toLowerCase().includes(taskSubAdminSearch.toLowerCase()) ||
                        a.email.toLowerCase().includes(taskSubAdminSearch.toLowerCase())
                      )
                      .map((admin) => {
                        const isChecked = selectedTaskSubAdminIds.includes(admin.id);
                        return (
                          <label
                            key={admin.id}
                            className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-xs'
                                : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedTaskSubAdminIds(selectedTaskSubAdminIds.filter(id => id !== admin.id));
                                } else {
                                  setSelectedTaskSubAdminIds([...selectedTaskSubAdminIds, admin.id]);
                                }
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-extrabold text-slate-900 dark:text-white truncate text-xs">
                                  {admin.name}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">
                                  @{admin.username}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {admin.email}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* 3. ALL PEOPLE BROADCAST VIEW */}
              {!editingTask && taskAssignMode === 'all' && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 border border-blue-200 dark:border-blue-800 flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shrink-0 shadow-md">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-black text-slate-900 dark:text-white">
                      Institutional Directive Broadcast (All {subAdmins.length} Faculty Coordinators)
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      This will automatically generate and assign an individual teaching task directive to all active department Sub-Admins across the institution.
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {subAdmins.map((a) => (
                        <span key={a.id} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/80 dark:bg-slate-900/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {a.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Topic Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Topic Name / Pedagogy Directive *
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.topic}
                  onChange={(e) => setTaskForm({ ...taskForm, topic: e.target.value })}
                  placeholder="e.g. Flipped Classroom for Signal & Systems / AI Simulation Lab"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Target Submission Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={taskForm.date}
                    onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Target Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={taskForm.time}
                    onChange={(e) => setTaskForm({ ...taskForm, time: e.target.value })}
                    placeholder="e.g. 10:30 AM"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              {/* Number of Faculty & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Number of Faculty Involved *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={taskForm.no_of_faculty}
                    onChange={(e) => setTaskForm({ ...taskForm, no_of_faculty: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Department
                  </label>
                  <select
                    value={taskForm.department}
                    onChange={(e) => setTaskForm({ ...taskForm, department: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none font-medium"
                  >
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="CSE">CSE</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                  </select>
                </div>
              </div>

              {/* Instructions / Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Directive Instructions / Outcome Expectations
                </label>
                <textarea
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Specify guidelines for the Sub-Admin, student cohorts, expected deliverables, and rubrics..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskModal(false);
                    setEditingTask(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTask}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black shadow-md disabled:opacity-50"
                >
                  {isSavingTask ? 'Saving Task...' : editingTask ? 'Update Directive' : 'Assign Directive'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: SUB ADMIN SUBMISSION FORM (SUBMIT INNOVATIVE METHOD WITH FILE)
          ========================================================================= */}
      {showSubmissionModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-xs">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <Upload className="h-4 w-4 text-emerald-600" />
                  <span>Submit Innovative Teaching–Learning Method</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Complete your assigned task or submit innovative pedagogy with documentation & artifacts.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSubmissionModal(false);
                  setSubmissionFile(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleMethodSubmissionSubmit} className="space-y-4">
              
              {/* Linked Task Selector */}
              {teachingTasks.length > 0 && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Linked Task Directive (Optional / Pre-fill)
                  </label>
                  <select
                    value={selectedTaskIdForSubmit}
                    onChange={(e) => {
                      const tId = e.target.value;
                      setSelectedTaskIdForSubmit(tId);
                      if (tId !== 'none') {
                        const matched = teachingTasks.find(t => String(t.id) === tId);
                        if (matched) {
                          setSubmissionForm(prev => ({
                            ...prev,
                            topic: matched.topic,
                            no_of_faculty: matched.no_of_faculty || prev.no_of_faculty,
                            department: matched.department || prev.department,
                            description: matched.description ? `Implementation based on guidelines: ${matched.description}\n\n` : prev.description
                          }));
                        }
                      }
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none"
                  >
                    <option value="none">-- Independent Pedagogy Innovation (No Linked Directive) --</option>
                    {teachingTasks.map(t => (
                      <option key={t.id} value={String(t.id)}>
                        Task #{t.id}: {t.topic} (Due: {t.date} {t.time})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Field 1: Topic Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  1. Topic Name *
                </label>
                <input
                  type="text"
                  required
                  value={submissionForm.topic}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, topic: e.target.value })}
                  placeholder="e.g. Flipped Classroom Model for Digital Communications"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Fields 2 & 3: Date & Time (Auto-captured / Selectable) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>2. Date *</span>
                    <span className="text-[10px] text-slate-400 font-normal">Auto-captured</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={submissionForm.date}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>3. Time *</span>
                    <span className="text-[10px] text-slate-400 font-normal">Auto-captured</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={submissionForm.time}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, time: e.target.value })}
                    placeholder="e.g. 11:30 AM"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              {/* Field 4: Number of Faculty & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    4. Number of Faculty Involved *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={submissionForm.no_of_faculty}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, no_of_faculty: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Department
                  </label>
                  <input
                    type="text"
                    value={submissionForm.department}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, department: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              {/* Field 5: Description / Method Details */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  5. Method Details / Implementation Narrative *
                </label>
                <textarea
                  rows={4}
                  required
                  value={submissionForm.description}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, description: e.target.value })}
                  placeholder="Describe the innovative teaching methodology, pedagogical structure, student cohort activities, assessments, and learning outcomes..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Field 6: File Upload (PDF, Images, Documents) */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  6. Upload Supporting Documentation / Artifacts (PDF, Images, Documents) *
                </label>

                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850/50 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors text-center">
                  <input
                    type="file"
                    id="teachingMethodFileUpload"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSubmissionFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  
                  {submissionFile ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-left">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-slate-900 dark:text-white block text-xs truncate">
                            {submissionFile.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {(submissionFile.size / 1024 / 1024).toFixed(2)} MB • {submissionFile.type || 'Document'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSubmissionFile(null)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                        title="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="teachingMethodFileUpload"
                      className="cursor-pointer flex flex-col items-center justify-center py-4 space-y-2 group"
                    >
                      <div className="p-3 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 group-hover:scale-110 transition-transform">
                        <FileUp className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 dark:text-white block">
                          Click to select a file from your computer
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Supported Formats: PDF, DOCX, PPTX, JPG, PNG (Max 50MB)
                        </span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowSubmissionModal(false);
                    setSubmissionFile(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMethod}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSubmittingMethod ? 'Uploading & Submitting...' : 'Submit to Super Admin'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: SUBMISSION DETAIL PREVIEW (SUPER ADMIN & SUB ADMIN)
          ========================================================================= */}
      {previewTrackingSubmission && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">
                  Submission Dossier #{previewTrackingSubmission.id}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {previewTrackingSubmission.topic}
                </h3>
              </div>
              <button
                onClick={() => setPreviewTrackingSubmission(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Metadata Pill Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Submission Date</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{previewTrackingSubmission.date}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Time</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{previewTrackingSubmission.time || '10:00 AM'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Faculty Involved</span>
                <span className="font-extrabold text-purple-600 dark:text-purple-400">{previewTrackingSubmission.no_of_faculty} Faculty</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
                <span className={`font-black uppercase ${
                  previewTrackingSubmission.status === 'Approved' ? 'text-emerald-600' : previewTrackingSubmission.status === 'Rejected' ? 'text-red-600' : 'text-amber-600'
                }`}>
                  {previewTrackingSubmission.status}
                </span>
              </div>
            </div>

            {/* Submitter details */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
              <div className="h-9 w-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {previewTrackingSubmission.sub_admin_name ? previewTrackingSubmission.sub_admin_name.charAt(0) : 'F'}
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase block">Coordinator / Sub-Admin</span>
                <span className="font-black text-slate-900 dark:text-white block">
                  {previewTrackingSubmission.sub_admin_name || 'Department Faculty'} ({previewTrackingSubmission.department || 'ECE'})
                </span>
              </div>
            </div>

            {/* Full Narrative */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Method Description & Pedagogy Implementation
              </span>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {previewTrackingSubmission.description || 'No description provided.'}
              </div>
            </div>

            {/* Attached File Download & Direct Link */}
            {previewTrackingSubmission.file_path && (
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white block">
                      {previewTrackingSubmission.file_name || 'teaching_method_material.pdf'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Uploaded File Attachment • Ready for Download
                    </span>
                  </div>
                </div>

                <a
                  href={previewTrackingSubmission.file_path}
                  download={previewTrackingSubmission.file_name || 'teaching_method_material.pdf'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Download className="h-4 w-4" />
                  <span>Download File</span>
                </a>
              </div>
            )}

            {/* Super Admin Review Actions inside Modal */}
            {isSuperAdmin && previewTrackingSubmission.status !== 'Approved' && (
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                  Super Admin Decision:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setApprovingSubId(previewTrackingSubmission.id);
                      setApprovalFeedback('Approved for public showcase');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm flex items-center gap-1"
                  >
                    <Check className="h-4 w-4" />
                    <span>Approve Submission</span>
                  </button>
                  <button
                    onClick={() => {
                      setRejectingSubId(previewTrackingSubmission.id);
                      setRejectionFeedback('');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewTrackingSubmission(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: APPROVE CONFIRMATION (SUPER ADMIN)
          ========================================================================= */}
      {approvingSubId && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="p-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Approve Teaching Method
                </h3>
                <p className="text-[11px] text-slate-400">
                  This will publish the method to the Public Homepage Showcase.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Approval Note / Commendation Feedback (Optional)
              </label>
              <textarea
                rows={2}
                value={approvalFeedback}
                onChange={(e) => setApprovalFeedback(e.target.value)}
                placeholder="e.g. Excellent active learning pedagogy. Approved for institutional showcase."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setApprovingSubId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleApproveSubmission(approvingSubId)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md"
              >
                Confirm Approval & Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: REJECT / REVISION FEEDBACK (SUPER ADMIN)
          ========================================================================= */}
      {rejectingSubId && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-full bg-red-50 dark:bg-red-950">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Reject or Request Revision
                </h3>
                <p className="text-[11px] text-slate-400">
                  Please provide actionable feedback for the Sub-Admin.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Rejection Reason / Revision Directives *
              </label>
              <textarea
                rows={3}
                required
                value={rejectionFeedback}
                onChange={(e) => setRejectionFeedback(e.target.value)}
                placeholder="Specify the required revisions or reasons for rejecting this pedagogy method..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRejectingSubId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRejectSubmission(rejectingSubId)}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black shadow-md"
              >
                Send Rejection Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: MEDIA PREVIEWER
          ========================================== */}
      {previewSubmission && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight block">
                  Preview Upload: {previewSubmission.file_name}
                </h3>
                <span className="text-[10px] text-slate-400 block mt-0.5">Submitted by {previewSubmission.submitter_name} ({previewSubmission.submitter_email || 'No email'})</span>
              </div>
              <button onClick={() => setPreviewSubmission(null)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Preview Box */}
            <div className="flex items-center justify-center bg-slate-105 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 p-2 min-h-[300px] max-h-[500px]">
              {['jpg', 'jpeg', 'png', 'webp'].some(ext => previewSubmission.file_type.toLowerCase().includes(ext) || previewSubmission.file_name.toLowerCase().endsWith(ext)) ? (
                <img
                  src={previewSubmission.file_path}
                  alt={previewSubmission.file_name}
                  className="max-w-full max-h-[480px] object-contain rounded-xl"
                />
              ) : ['mp4', 'webm'].some(ext => previewSubmission.file_type.toLowerCase().includes(ext) || previewSubmission.file_name.toLowerCase().endsWith(ext)) ? (
                <video
                  src={previewSubmission.file_path}
                  controls
                  className="max-w-full max-h-[480px] object-contain rounded-xl"
                />
              ) : (
                <div className="text-center p-8 space-y-3.5 mx-auto">
                  <FileText className="h-14 w-14 text-blue-500 mx-auto" />
                  <div className="space-y-1">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 block text-base">{previewSubmission.file_name}</span>
                    <span className="text-slate-450 block uppercase tracking-wider text-[10px]">Type: {previewSubmission.file_type} • Size: {Math.round(previewSubmission.file_size / 1024)} KB</span>
                  </div>
                  <p className="text-slate-500 text-xs italic px-6">Direct file preview is not supported for this document type. Please click the button below to download/view it in a new window.</p>
                </div>
              )}
            </div>

            {/* Description detail */}
            {previewSubmission.description && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800/50">
                <span className="font-bold text-slate-450 block mb-1">Submitter Narrative:</span>
                <p className="text-slate-700 dark:text-slate-300 italic">"{previewSubmission.description}"</p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2 border-t border-slate-105 dark:border-slate-800">
              <a
                href={previewSubmission.file_path}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold shadow-md flex items-center gap-1.5"
              >
                <Download className="h-4 w-4" />
                <span>Open in Tab</span>
              </a>
              <button
                type="button"
                onClick={() => setPreviewSubmission(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-750 hover:bg-slate-55 dark:hover:bg-slate-850 font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Helper components missing in imported lucide-react in TS
const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);
