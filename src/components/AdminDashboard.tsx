import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AdminUser, AuditLog, TeachingMethod, CoursewareResource, Student, MediaSubmission, CounsellingSession } from '../types';
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
  HeartHandshake
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
    updateStudentCohort,
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
    publishedCounsellingList,
    fetchAdminStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    fetchCounsellingHistory,
    addCounsellingSession,
    updateCounsellingSession,
    deleteCounsellingSession,
    publishCounsellingUpdate,
    fetchPublishedCounsellingList
  } = useApp();

  const isSuperAdmin = adminUser?.role === 'SUPER_ADMIN';

  // Navigation state within Dashboard
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'subadmins' | 'methods' | 'counselling' | 'content' | 'submissions' | 'logs' | 'settings'>(initialTab);
  
  // Mobile UI States
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  const [createdStudentDetails, setCreatedStudentDetails] = useState<{
    name: string;
    studentId: string;
    rollNumber: string;
    batch: string;
  } | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null); // null means adding new
  const [studentForm, setStudentForm] = useState({
    name: '',
    rollNumber: '',
    email: '',
    cohort: 'Group A' as 'Group A' | 'Group B',
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
    status: 'Completed' as 'Draft' | 'Completed' | 'Follow-Up Required',
    publish_to_home: 0,
    allow_student_name_public: 0,
    public_title: '',
    public_summary: ''
  });

  // Detailed profile view state
  const [viewingStudentProfile, setViewingStudentProfile] = useState<Student | null>(null);
  const [counsellingHistory, setCounsellingHistory] = useState<CounsellingSession[]>([]);

  // Sub-navigation inside counselling tab
  const [counsellingSubTab, setCounsellingSubTab] = useState<'students' | 'updates'>('students');

  // Filters for student directory
  const [filterYear, setFilterYear] = useState('All');
  const [filterSemester, setFilterSemester] = useState('All');
  const [filterSection, setFilterSection] = useState('All');
  const [filterCohortStatus, setFilterCohortStatus] = useState('All');
  const [filterAcademicStatus, setFilterAcademicStatus] = useState('All');
  const [filterBatch, setFilterBatch] = useState('All');
  const [viewingSubAdmin, setViewingSubAdmin] = useState<AdminUser | null>(null);

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
    cohort: 'Group A' as 'Group A' | 'Group B',
    implementation: '',
    expectedOutcome: '',
    detailedDescription: '',
    category: 'Innovative' as any,
    tags: [] as string[],
    tagInput: '',
    materialsCount: 0,
    featured: false
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
      fetchPublishedCounsellingList();
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
    setStudentForm({
      name: '',
      rollNumber: '',
      email: '',
      cohort: 'Group A',
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
    setStudentForm({
      name: stu.name,
      rollNumber: stu.rollNumber,
      email: stu.email || '',
      cohort: stu.cohort,
      gpa: stu.gpa,
      attendance: stu.attendance,
      strengths: stu.strengths.join(', '),
      focusAreas: stu.focusAreas.join(', '),
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
    setIsSavingStudent(true);
    const strengthsArr = studentForm.strengths.split(',').map(s => s.trim()).filter(s => s !== '');
    const focusAreasArr = studentForm.focusAreas.split(',').map(s => s.trim()).filter(s => s !== '');
    const payload = {
      ...studentForm,
      strengths: strengthsArr,
      focusAreas: focusAreasArr
    };

    let result;
    if (editingStudentId) {
      result = await updateStudent(editingStudentId, payload);
    } else {
      result = await addStudent(payload);
    }

    setIsSavingStudent(false);
    if (result.success) {
      setShowStudentFormModal(false);
      fetchAdminStudents();
      const addResult = result as { success: boolean; error?: string; studentId?: string };
      if (!editingStudentId && addResult.studentId) {
        setCreatedStudentDetails({
          name: studentForm.name,
          studentId: addResult.studentId,
          rollNumber: studentForm.rollNumber,
          batch: studentForm.batch
        });
      }
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
      status: 'Completed',
      publish_to_home: 0,
      allow_student_name_public: 0,
      public_title: '',
      public_summary: ''
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
      status: session.status,
      publish_to_home: session.publish_to_home,
      allow_student_name_public: session.allow_student_name_public,
      public_title: session.public_title || '',
      public_summary: session.public_summary || ''
    });
    setShowCounsellingFormModal(true);
  };

  const handleCounsellingFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (counsellingForm.publish_to_home === 1 && (!counsellingForm.public_title || !counsellingForm.public_summary)) {
      alert('Public Summary Title and Safe Summary are required when publishing to the homepage.');
      return;
    }

    let result;
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
      fetchPublishedCounsellingList();
    } else {
      alert(result.error || 'Failed to save session.');
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
        fetchPublishedCounsellingList();
      } else {
        alert(result.error);
      }
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

    const methodData: TeachingMethod = {
      id: methodForm.id || 'method-' + Math.random().toString(36).substring(2, 9),
      name: methodForm.name,
      cohort: methodForm.cohort,
      implementation: methodForm.implementation,
      expectedOutcome: methodForm.expectedOutcome,
      detailedDescription: methodForm.detailedDescription,
      category: methodForm.category,
      tags: methodForm.tags,
      materialsCount: methodForm.materialsCount,
      featured: methodForm.featured
    };

    if (editingMethod) {
      await updateMethod(methodData);
    } else {
      await addMethod(methodData);
    }
    setShowMethodModal(false);
  };

  const openAddMethodModal = () => {
    setEditingMethod(null);
    setMethodForm({
      id: '',
      name: '',
      cohort: 'Group A',
      implementation: '',
      expectedOutcome: '',
      detailedDescription: '',
      category: 'Innovative',
      tags: [],
      tagInput: '',
      materialsCount: 0,
      featured: false
    });
    setShowMethodModal(true);
  };

  const openEditMethodModal = (m: TeachingMethod) => {
    setEditingMethod(m);
    setMethodForm({
      id: m.id,
      name: m.name,
      cohort: m.cohort,
      implementation: m.implementation,
      expectedOutcome: m.expectedOutcome,
      detailedDescription: m.detailedDescription || '',
      category: m.category,
      tags: m.tags || [],
      tagInput: '',
      materialsCount: m.materialsCount || 0,
      featured: !!m.featured
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

  // Filtered lists
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
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeAdminTab === 'methods'
                  ? 'bg-dhanekula-royal text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="h-4.5 w-4.5" />
              <span>Teaching Methods</span>
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
                  <span className="text-xs font-bold uppercase tracking-wider">Teaching Methods</span>
                  <BookOpen className="h-5 w-5 text-dhanekula-500" />
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                  {teachingMethods.length}
                </div>
                <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase">
                  Differentiated Syllabus
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Student Directory</span>
                  <Users className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                  {students.length}
                </div>
                <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase">
                  Active B.Tech ECE
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Library Files</span>
                  <FileText className="h-5 w-5 text-amber-500" />
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                  {resources.length}
                </div>
                <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase">
                  Uploaded Digital Assets
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Sub-Admins</span>
                  <Lock className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                  {isSuperAdmin ? subAdmins.length : 'Restricted'}
                </div>
                <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase">
                  Authorized Assistants
                </div>
              </div>

            </div>

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

        {/* ==========================================
            3. TAB: TEACHING METHODS (With API sync)
            ========================================== */}
        {activeAdminTab === 'methods' && hasPermission('Manage Teaching Methods') && (
          <div className="space-y-6">
            
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:max-w-xs group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-dhanekula-royal" />
                <input
                  type="text"
                  value={methodSearch}
                  onChange={(e) => setMethodSearch(e.target.value)}
                  placeholder="Filter methods by name..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-dhanekula-500/50"
                />
              </div>

              {hasPermission('Create Content') && (
                <button
                  onClick={openAddMethodModal}
                  className="px-4 py-2 rounded-2xl bg-dhanekula-royal text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-dhanekula-600 btn-micro-interaction flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Method</span>
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
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            m.cohort === 'Group A'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          }`}>
                            {m.cohort === 'Group A' ? 'Group A (ALC)' : 'Group B (FLC)'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-650 dark:text-slate-350">
                          {m.category}
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
                            {hasPermission('Edit Content') && (
                              <button
                                onClick={() => openEditMethodModal(m)}
                                className="p-1.5 text-slate-500 hover:text-dhanekula-600 dark:hover:text-dhanekula-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                title="Edit Method"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                            {hasPermission('Delete Content') && (
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
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-450 italic">
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

        {/* ==========================================
            4. TAB: STUDENT COUNSELLING MANAGEMENT
            ========================================== */}
        {activeAdminTab === 'counselling' && (
          <div className="space-y-6 animate-fade-in text-xs">
            
            {/* Sub-tabs header */}
            <div className="flex border-b border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setCounsellingSubTab('students')}
                className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition-all ${
                  counsellingSubTab === 'students'
                    ? 'border-emerald-600 text-emerald-600 dark:border-emerald-450 dark:text-emerald-450'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Student Manager Directory</span>
              </button>
              <button
                onClick={() => setCounsellingSubTab('updates')}
                className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition-all ${
                  counsellingSubTab === 'updates'
                    ? 'border-emerald-600 text-emerald-600 dark:border-emerald-450 dark:text-emerald-450'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <HeartHandshake className="h-4 w-4" />
                <span>Homepage Highlights Control</span>
              </button>
            </div>

            {counsellingSubTab === 'students' ? (
              /* PANEL A: STUDENT DIRECTORY MANAGER */
              <div className="space-y-6">
                
                {/* Search & Filters */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* Search */}
                    <div className="relative w-full sm:max-w-xs group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600" />
                      <input
                        type="text"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Search student roll, name..."
                        className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Filters */}
                    <select
                      value={filterBatch}
                      onChange={(e) => setFilterBatch(e.target.value)}
                      className="p-2 text-xs rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold"
                    >
                      <option value="All">All Batches</option>
                      <option value="2022 - 2026">2022 - 2026</option>
                      <option value="2023 - 2027">2023 - 2027</option>
                      <option value="2024 - 2028">2024 - 2028</option>
                      <option value="2025 - 2029">2025 - 2029</option>
                      <option value="2026 - 2030">2026 - 2030</option>
                    </select>

                    <select
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className="p-2 text-xs rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    >
                      <option value="All">All Years</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>

                    <select
                      value={filterSection}
                      onChange={(e) => setFilterSection(e.target.value)}
                      className="p-2 text-xs rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    >
                      <option value="All">All Sections</option>
                      <option value="A">Sec A</option>
                      <option value="B">Sec B</option>
                      <option value="C">Sec C</option>
                    </select>

                    <select
                      value={filterCohortStatus}
                      onChange={(e) => setFilterCohortStatus(e.target.value)}
                      className="p-2 text-xs rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    >
                      <option value="All">All Cohorts</option>
                      <option value="Group A">Group A (ALC)</option>
                      <option value="Group B">Group B (FLC)</option>
                    </select>

                    <select
                      value={filterAcademicStatus}
                      onChange={(e) => setFilterAcademicStatus(e.target.value)}
                      className="p-2 text-xs rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Regular">Regular</option>
                      <option value="Condonation">Condonation</option>
                      <option value="Detained">Detained</option>
                    </select>

                  </div>

                  {hasPermission('Manage Students') && (
                    <button
                      onClick={openAddStudentModal}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Add Student
                    </button>
                  )}
                </div>

                {/* Students List Table */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <tr>
                          <th className="px-6 py-4">Student</th>
                          <th className="px-6 py-4">Roll Number</th>
                          <th className="px-6 py-4">Department & Class</th>
                          <th className="px-6 py-4">Cohort Assignment</th>
                          <th className="px-6 py-4">Stats (GPA / Att.)</th>
                          <th className="px-6 py-4">Academic Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                        {adminStudents.filter(s => {
                          const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                                s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                                (s.email && s.email.toLowerCase().includes(studentSearch.toLowerCase()));
                          const matchesYear = filterYear === 'All' || s.year === filterYear;
                          const matchesSec = filterSection === 'All' || s.section === filterSection;
                          const matchesCohort = filterCohortStatus === 'All' || s.cohort === filterCohortStatus;
                          const matchesStatus = filterAcademicStatus === 'All' || s.academicStatus === filterAcademicStatus;
                          const matchesBatch = filterBatch === 'All' || s.batch === filterBatch;
                          return matchesSearch && matchesYear && matchesSec && matchesCohort && matchesStatus && matchesBatch;
                        }).map((stu) => (
                          <tr key={stu.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-bold text-slate-900 dark:text-white block">{stu.name}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">{stu.email}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-slate-800 dark:text-slate-200">
                              {stu.rollNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-650 dark:text-slate-350">
                              <div className="font-bold text-slate-900 dark:text-white">{stu.department || 'ECE'} – {stu.year || '3rd Year'}</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Sec {stu.section || 'A'} • Batch: {stu.batch || '2023 - 2027'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                stu.cohort === 'Group A'
                                  ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                              }`}>
                                {stu.cohort === 'Group A' ? 'Group A (Advanced)' : 'Group B (Foundation)'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800 dark:text-slate-200">CGPA: {stu.gpa} / 10</span>
                                <span className="text-[10px] text-slate-400">Attendance: {stu.attendance}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                                stu.academicStatus === 'Regular'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : stu.academicStatus === 'Condonation'
                                  ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
                                  : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                              }`}>
                                {stu.academicStatus || 'Regular'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                
                                {/* View details */}
                                <button
                                  onClick={() => handleViewProfile(stu)}
                                  className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                  title="View Student Profile & Counselling Logs"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>

                                {/* Record Session shortcut */}
                                {hasPermission('Manage Counselling') && (
                                  <button
                                    onClick={() => openAddCounsellingModal(stu)}
                                    className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                    title="Add Counselling Record"
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
                        ))}
                        {adminStudents.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-slate-450 italic">
                              No student records have been created yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : (
              /* PANEL B: HOMEPAGE HIGHLIGHTS CONSOLE */
              <div className="space-y-6">
                
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50 rounded-2xl p-4 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  <strong>Privacy Rule Safeguard:</strong> Students' private details, session notes, and academic challenges are never published to the home page. Highlights are limited strictly to anonymized safe summaries and categories approved explicitly by admins with publishing controls.
                </div>

                {/* Published List Table */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <tr>
                          <th className="px-6 py-4">Date & Category</th>
                          <th className="px-6 py-4">Student Roll</th>
                          <th className="px-6 py-4">Public Header Title</th>
                          <th className="px-6 py-4">Safe Summary Preview</th>
                          <th className="px-6 py-4">Student Name Public?</th>
                          <th className="px-6 py-4">Homepage Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                        {publishedCounsellingList.map((session) => (
                          <tr key={session.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">{session.counselling_date}</span>
                              <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md mt-1 inline-block uppercase tracking-wider font-bold">{session.type}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-mono">
                              {session.student_roll || 'N/A'}
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                              {session.public_title || <span className="italic text-slate-400">No public title set</span>}
                            </td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-350 max-w-xs truncate">
                              {session.public_summary || <span className="italic text-slate-400">No safe summary configured</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                session.allow_student_name_public === 1
                                  ? 'bg-emerald-55 text-emerald-800 dark:bg-emerald-950'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-400'
                              }`}>
                                {session.allow_student_name_public === 1 ? 'ALLOWED (Public Name)' : 'ANONYMIZED (Hidden)'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                session.publish_to_home === 1
                                  ? 'bg-emerald-100 text-emerald-850 dark:bg-emerald-950/80 dark:text-emerald-350'
                                  : 'bg-slate-100 text-slate-500 dark:bg-slate-850 dark:text-slate-400'
                              }`}>
                                {session.publish_to_home === 1 ? 'PUBLISHED' : 'OFFLINE'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1">
                                
                                {/* Edit publishing status */}
                                {hasPermission('Publish Counselling') && (
                                  <button
                                    onClick={() => openEditCounsellingModal(session, session.student_name || 'Student')}
                                    className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                    title="Edit Public Highlight & Title"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                )}

                                {/* Delete Counselling session */}
                                {hasPermission('Manage Counselling') && (
                                  <button
                                    onClick={() => handleDeleteCounselling(session.id)}
                                    className="p-1.5 text-slate-500 hover:text-red-650 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                    title="Delete Session Log"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}

                              </div>
                            </td>
                          </tr>
                        ))}
                        {publishedCounsellingList.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-slate-450 italic">
                              No counselling records recorded yet. Set "Publish on Home Page" on a counselling session to list here.
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
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            res.cohort === 'Group A'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : res.cohort === 'Group B'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {res.cohort}
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

              <div className="py-3 text-xs">
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
                    <option value="Group A">Group A (Advanced - ALC)</option>
                    <option value="Group B">Group B (Foundation - FLC)</option>
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
                    <option value="All">All Cohorts (General)</option>
                    <option value="Group A">Group A Only (Advanced)</option>
                    <option value="Group B">Group B Only (Foundation)</option>
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
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {editingStudentId ? 'Modify Student Profile' : 'Add New Student Record'}
              </h3>
              <button onClick={() => setShowStudentFormModal(false)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-250">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleStudentFormSubmit} className="space-y-4 pt-4">
              {/* Basic Demographic Grid */}
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
              </div>
 
              {/* Batch Selector */}
              <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                <label className="font-extrabold text-slate-750 dark:text-slate-250 flex items-center gap-1.5">
                  Student Batch / Academic Batch <span className="text-red-500">*</span>
                </label>
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
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                  Select the academic batch this student belongs to. This determines where the student will appear in the Student Counselling section.
                </p>
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

              {/* Cohort & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-450">Cohort Group assignment *</label>
                  <select
                    value={studentForm.cohort}
                    onChange={(e) => setStudentForm({ ...studentForm, cohort: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none font-bold"
                  >
                    <option value="Group A">Group A – Advanced Learner (ALC)</option>
                    <option value="Group B">Group B – Foundation Learner (FLC)</option>
                  </select>
                </div>
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
                  {isSavingStudent ? 'Creating Student...' : editingStudentId ? 'Save Profile' : 'Create Student'}
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
                Student Created Successfully
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                The new student record has been saved and initialized.
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
                    <option value="Personal">Personal counselling</option>
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
                  placeholder="Enter detailed counseling session logs. These notes are stored securely and never exposed to the public frontend."
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

              {/* Homepage Publishing Control Console */}
              <div className="space-y-3 bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-250/25 dark:border-emerald-900/25 p-4.5 rounded-2xl">
                <div className="flex items-center justify-between border-b border-emerald-100/50 dark:border-emerald-850 pb-2">
                  <span className="font-extrabold text-emerald-850 dark:text-emerald-350 block uppercase tracking-wider text-[10px]">
                    Homepage Highlight Publisher Controls
                  </span>
                  
                  {/* Permission Guard */}
                  {!hasPermission('Publish Counselling') && (
                    <span className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Requires Publish permission
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="publish_to_home"
                      disabled={!hasPermission('Publish Counselling')}
                      checked={counsellingForm.publish_to_home === 1}
                      onChange={(e) => setCounsellingForm({ ...counsellingForm, publish_to_home: e.target.checked ? 1 : 0 })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="publish_to_home" className="font-bold text-slate-700 dark:text-slate-300 select-none">
                      Publish Update on Public Homepage
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="allow_student_name_public"
                      disabled={!hasPermission('Publish Counselling') || counsellingForm.publish_to_home !== 1}
                      checked={counsellingForm.allow_student_name_public === 1}
                      onChange={(e) => setCounsellingForm({ ...counsellingForm, allow_student_name_public: e.target.checked ? 1 : 0 })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="allow_student_name_public" className="font-bold text-slate-700 dark:text-slate-300 select-none flex items-center gap-1">
                      Allow Student Name to be Public <span className="text-[9px] text-slate-400 font-semibold">(Default: OFF)</span>
                    </label>
                  </div>
                </div>

                {counsellingForm.publish_to_home === 1 && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="font-bold text-emerald-850 dark:text-emerald-350">Public Highlight Title *</label>
                      <input
                        type="text"
                        required={counsellingForm.publish_to_home === 1}
                        disabled={!hasPermission('Publish Counselling')}
                        value={counsellingForm.public_title}
                        onChange={(e) => setCounsellingForm({ ...counsellingForm, public_title: e.target.value })}
                        placeholder="e.g. Guidance on Flipped Classrooms"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-emerald-850 dark:text-emerald-350">Public Safe Summary *</label>
                      <textarea
                        rows={2.5}
                        required={counsellingForm.publish_to_home === 1}
                        disabled={!hasPermission('Publish Counselling')}
                        value={counsellingForm.public_summary}
                        onChange={(e) => setCounsellingForm({ ...counsellingForm, public_summary: e.target.value })}
                        placeholder="Summarize the counseling update safely without exposing grades, family circumstances, parent contacts, or private issues. Focus on student cohort achievements."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
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
                  {editingSessionId ? 'Update Record' : 'Record Session'}
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
                <span className="text-[10px] text-dhanekula-royal dark:text-sky-400 block font-bold">Roll Number: {viewingStudentProfile.rollNumber}</span>
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
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Class & Cohort</span>
                  <span className="font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {viewingStudentProfile.department || 'ECE'} – {viewingStudentProfile.year || '3rd Year'} (Sec {viewingStudentProfile.section || 'A'})
                    <span className="block text-[10px] text-sky-600 mt-0.5 font-bold uppercase">{viewingStudentProfile.cohort} • Batch {viewingStudentProfile.batch || '2023 - 2027'}</span>
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
                    No counselling sessions recorded for this student yet.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {counsellingHistory.map((session, idx) => (
                      <div
                        key={session.id}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 relative group"
                      >
                        {/* Session Metadata header */}
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">{session.counselling_date}</span>
                            <span className="text-[9px] font-bold text-sky-600 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded ml-2 uppercase tracking-wide inline-block">{session.type} Counsel</span>
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

                        {/* Public summary tracker */}
                        {session.publish_to_home === 1 && (
                          <div className="bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-250/20 dark:border-emerald-900/20 p-3 rounded-xl text-[11px] leading-relaxed">
                            <span className="text-[9px] font-bold text-emerald-800 dark:text-emerald-450 block uppercase mb-1">Published Highlight Safe Preview:</span>
                            <strong className="text-slate-900 dark:text-white block mt-0.5">"{session.public_title}"</strong>
                            <p className="text-slate-650 dark:text-slate-350 italic mt-0.5">"{session.public_summary}"</p>
                          </div>
                        )}

                        {/* Concerns, action items info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] leading-relaxed text-slate-500">
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
