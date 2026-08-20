import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CohortSelector } from './components/CohortSelector';
import { TeachingMethodsGrid } from './components/TeachingMethodsGrid';
import { WeeklySchedulePlanner } from './components/WeeklySchedulePlanner';
import { OutcomesAnalytics } from './components/OutcomesAnalytics';
import { CoursewareResources } from './components/CoursewareResources';
import { StudentRoster } from './components/StudentRoster';
import { MethodDetailModal } from './components/MethodDetailModal';
import { ResourceViewerModal } from './components/ResourceViewerModal';
import { DailyQuizModule } from './components/DailyQuizModule';
import { AITutorModal } from './components/AITutorModal';
import { FacultyEditModal } from './components/FacultyEditModal';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import {
  BookOpen,
  Calendar,
  Award,
  FileText,
  Users,
  CheckCircle2,
  GraduationCap,
  HeartHandshake
} from 'lucide-react';

interface DashboardContentProps {
  navigate: (path: string) => void;
  initialTab?: 'methods' | 'schedule' | 'outcomes' | 'resources' | 'roster';
}

const DashboardContent: React.FC<DashboardContentProps> = ({ navigate, initialTab = 'methods' }) => {
  const { toastMessage } = useApp();
  const [activeTab, setActiveTab] = useState<'methods' | 'schedule' | 'outcomes' | 'resources' | 'roster'>(initialTab);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section */}
        <HeroBanner />

        {/* Cohort Selector */}
        <CohortSelector />

        {/* Main Tab Navigation */}
        <div className="border-b border-slate-200 dark:border-slate-800">
          <nav className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('methods')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'methods'
                  ? 'border-dhanekula-royal text-dhanekula-royal dark:border-dhanekula-400 dark:text-dhanekula-400 scale-105'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <BookOpen className="h-4 w-4 text-dhanekula-royal" />
              <span>Innovative Teaching Methods (20)</span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'schedule'
                  ? 'border-dhanekula-royal text-dhanekula-royal dark:border-dhanekula-400 dark:text-dhanekula-400 scale-105'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Calendar className="h-4 w-4 text-dhanekula-royal" />
              <span>Weekly Activity Plan</span>
            </button>

            <button
              onClick={() => setActiveTab('outcomes')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'outcomes'
                  ? 'border-dhanekula-royal text-dhanekula-royal dark:border-dhanekula-400 dark:text-dhanekula-400 scale-105'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Award className="h-4 w-4 text-dhanekula-royal" />
              <span>Expected Outcomes & Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('resources')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'resources'
                  ? 'border-dhanekula-royal text-dhanekula-royal dark:border-dhanekula-400 dark:text-dhanekula-400 scale-105'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <FileText className="h-4 w-4 text-dhanekula-royal" />
              <span>Digital Courseware Library</span>
            </button>

            <button
              onClick={() => setActiveTab('roster')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'roster'
                  ? 'border-dhanekula-royal text-dhanekula-royal dark:border-dhanekula-400 dark:text-dhanekula-400 scale-105'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <HeartHandshake className="h-4 w-4 text-dhanekula-royal" />
              <span>Student Counselling</span>
            </button>
          </nav>
        </div>

        {/* Tab Content Display */}
        <div className="pt-2">
          {activeTab === 'methods' && <TeachingMethodsGrid />}
          {activeTab === 'schedule' && <WeeklySchedulePlanner />}
          {activeTab === 'outcomes' && <OutcomesAnalytics />}
          {activeTab === 'resources' && <CoursewareResources />}
          {activeTab === 'roster' && <StudentRoster />}
        </div>

      </main>

      {/* Global Modals */}
      <MethodDetailModal />
      <ResourceViewerModal />
      <DailyQuizModule />
      <AITutorModal />
      <FacultyEditModal />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div className="px-5 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl border border-slate-700 dark:border-slate-300 text-xs font-bold flex items-center gap-2.5 max-w-md">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-dhanekula-royal" />
            <span className="font-extrabold text-slate-900 dark:text-white">
              Dhanekula Institute of Engineering and Technology (Autonomous)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <p>© {new Date().getFullYear()} Department of Electronics & Communication Engineering.</p>
            <span className="text-slate-350 dark:text-slate-700">|</span>
            <button
              onClick={() => navigate('/admin')}
              className="font-extrabold text-dhanekula-royal hover:underline hover:text-dhanekula-600 dark:text-dhanekula-300 transition-colors"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};

const MainAppContent: React.FC = () => {
  const { isAdminLoggedIn } = useApp();
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (newPath: string) => {
    window.history.pushState({}, '', newPath);
    setPath(newPath);
  };

  // Route switches
  if (path === '/student-counselling') {
    if (isAdminLoggedIn) {
      return <AdminDashboard navigate={navigate} initialTab="counselling" />;
    }
    return <DashboardContent navigate={navigate} initialTab="roster" />;
  }

  if (path === '/admin') {
    if (!isAdminLoggedIn) {
      return <AdminLogin navigate={navigate} />;
    }
    return <AdminDashboard navigate={navigate} />;
  }

  if (path === '/admin/login') {
    if (isAdminLoggedIn) {
      return <AdminDashboard navigate={navigate} />;
    }
    return <AdminLogin navigate={navigate} />;
  }

  return <DashboardContent navigate={navigate} />;
};

export function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
