import React, { createContext, useContext, useState, useEffect } from 'react';
import { TeachingMethod, WeeklyActivity, CoursewareResource, Student, UserRole, CohortType } from '../types';
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
  isFacultyEditModalOpen: boolean;
  setIsFacultyEditModalOpen: (open: boolean) => void;
  editingMethod: TeachingMethod | null;
  setEditingMethod: (method: TeachingMethod | null) => void;
  
  // Notification Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
  
  // Data Reset
  resetDataToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('dhanekula_role') as UserRole) || 'faculty';
  });
  
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('dhanekula_theme');
    if (saved) return saved as 'dark' | 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [activeCohort, setActiveCohort] = useState<CohortType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persistent States
  const [teachingMethods, setTeachingMethods] = useState<TeachingMethod[]>(() => {
    const saved = localStorage.getItem('dhanekula_methods');
    return saved ? JSON.parse(saved) : INITIAL_TEACHING_METHODS;
  });

  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyActivity[]>(() => {
    const saved = localStorage.getItem('dhanekula_weekly_plan');
    return saved ? JSON.parse(saved) : INITIAL_WEEKLY_PLAN;
  });

  const [resources, setResources] = useState<CoursewareResource[]>(() => {
    const saved = localStorage.getItem('dhanekula_resources');
    return saved ? JSON.parse(saved) : INITIAL_COURSEWARE_RESOURCES;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('dhanekula_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  // Modal States
  const [selectedMethod, setSelectedMethod] = useState<TeachingMethod | null>(null);
  const [viewingResource, setViewingResource] = useState<CoursewareResource | null>(null);
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);
  const [isDailyQuizOpen, setIsDailyQuizOpen] = useState(false);
  const [isFacultyEditModalOpen, setIsFacultyEditModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<TeachingMethod | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('dhanekula_theme', theme);
  }, [theme]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('dhanekula_role', newRole);
    showToast(`Switched access mode: ${newRole.toUpperCase()}`);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    localStorage.setItem('dhanekula_methods', JSON.stringify(teachingMethods));
  }, [teachingMethods]);

  useEffect(() => {
    localStorage.setItem('dhanekula_weekly_plan', JSON.stringify(weeklyPlan));
  }, [weeklyPlan]);

  useEffect(() => {
    localStorage.setItem('dhanekula_resources', JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem('dhanekula_students', JSON.stringify(students));
  }, [students]);

  const updateMethod = (updated: TeachingMethod) => {
    setTeachingMethods((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );
    if (selectedMethod && selectedMethod.id === updated.id) {
      setSelectedMethod(updated);
    }
    showToast(`Updated teaching method: "${updated.name}"`);
  };

  const addMethod = (newMethod: TeachingMethod) => {
    setTeachingMethods((prev) => [newMethod, ...prev]);
    showToast(`Added new method: "${newMethod.name}"`);
  };

  const deleteMethod = (id: string) => {
    const target = teachingMethods.find(m => m.id === id);
    setTeachingMethods((prev) => prev.filter((m) => m.id !== id));
    showToast(`Deleted method: "${target?.name || id}"`);
  };

  const updateWeeklyActivity = (updated: WeeklyActivity) => {
    setWeeklyPlan((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    );
    showToast(`Updated schedule for ${updated.day}`);
  };

  const addResource = (res: CoursewareResource) => {
    setResources((prev) => [res, ...prev]);
    showToast(`Uploaded courseware file: "${res.title}"`);
  };

  const deleteResource = (id: string) => {
    const target = resources.find(r => r.id === id);
    setResources((prev) => prev.filter((r) => r.id !== id));
    showToast(`Deleted resource file: "${target?.title || id}"`);
  };

  const updateStudentCohort = (studentId: string, cohort: CohortType) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, cohort } : s))
    );
    showToast(`Assigned student to ${cohort}`);
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
        isFacultyEditModalOpen,
        setIsFacultyEditModalOpen,
        editingMethod,
        setEditingMethod,
        toastMessage,
        showToast,
        resetDataToDefault,
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
