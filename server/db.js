import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Helper wrappers
export const dbQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Database schema initialization
export const initDb = async () => {
  // 1. Users Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active',
      permissions TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_login TEXT
    )
  `);

  // 2. Audit Logs Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user TEXT NOT NULL,
      action TEXT NOT NULL,
      date_time TEXT DEFAULT CURRENT_TIMESTAMP,
      target TEXT NOT NULL,
      status TEXT NOT NULL
    )
  `);

  // 3. Teaching Methods Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS teaching_methods (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      cohort TEXT NOT NULL,
      implementation TEXT NOT NULL,
      expectedOutcome TEXT NOT NULL,
      detailedDescription TEXT,
      category TEXT NOT NULL,
      tags TEXT NOT NULL,
      materialsCount INTEGER DEFAULT 0,
      featured INTEGER DEFAULT 0,
      videoUrl TEXT DEFAULT NULL
    )
  `);

  // 4. Weekly Activities Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS weekly_activities (
      id TEXT PRIMARY KEY,
      day TEXT NOT NULL,
      groupAActivity TEXT NOT NULL,
      groupBActivity TEXT NOT NULL,
      groupAMethodId TEXT,
      groupBMethodId TEXT,
      timeSlot TEXT,
      location TEXT,
      status TEXT NOT NULL
    )
  `);

  // 5. Courseware Resources Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      fileName TEXT,
      fileSize TEXT,
      type TEXT NOT NULL,
      subject TEXT NOT NULL,
      cohort TEXT NOT NULL,
      methodId TEXT,
      url TEXT NOT NULL,
      description TEXT NOT NULL,
      addedBy TEXT NOT NULL,
      dateAdded TEXT NOT NULL,
      downloads INTEGER DEFAULT 0,
      contentSnippet TEXT
    )
  `);

  // 6. Students Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      rollNumber TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      cohort TEXT DEFAULT NULL,
      gpa REAL NOT NULL,
      attendance REAL NOT NULL,
      strengths TEXT NOT NULL,
      focusAreas TEXT NOT NULL
    )
  `);

  // 7. Media Submissions Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS media_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submitter_name TEXT NOT NULL,
      submitter_email TEXT,
      teaching_method_id TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      rejection_reason TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teaching_method_id) REFERENCES teaching_methods(id) ON DELETE CASCADE
    )
  `);

  // 8. Counselling Sessions Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS counselling_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      counsellor_id INTEGER NOT NULL,
      counsellor_name TEXT NOT NULL,
      counselling_date TEXT NOT NULL,
      type TEXT NOT NULL,
      private_notes TEXT NOT NULL,
      student_concerns TEXT,
      guidance TEXT,
      action_items TEXT,
      follow_up_date TEXT,
      follow_up_required TEXT NOT NULL DEFAULT 'No',
      status TEXT NOT NULL DEFAULT 'Completed',
      publish_to_home INTEGER DEFAULT 0,
      allow_student_name_public INTEGER DEFAULT 0,
      public_title TEXT,
      public_summary TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (counsellor_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 9. Student Assignments Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS student_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL UNIQUE,
      sub_admin_id INTEGER NOT NULL,
      assigned_by TEXT NOT NULL,
      assigned_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (sub_admin_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 10. Student Assignment History Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS assignment_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      student_roll TEXT NOT NULL,
      prev_sub_admin_id INTEGER,
      prev_sub_admin_name TEXT,
      new_sub_admin_id INTEGER,
      new_sub_admin_name TEXT,
      changed_by TEXT NOT NULL,
      changed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      reason TEXT
    )
  `);

  // 11. Innovative Teaching Tasks Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS teaching_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      super_admin_id INTEGER NOT NULL,
      sub_admin_id INTEGER NOT NULL,
      topic TEXT NOT NULL,
      description TEXT,
      department TEXT DEFAULT 'ECE',
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      no_of_faculty INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (super_admin_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (sub_admin_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 12. Innovative Teaching Submissions Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS teaching_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER,
      super_admin_id INTEGER,
      sub_admin_id INTEGER NOT NULL,
      topic TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      no_of_faculty INTEGER NOT NULL DEFAULT 1,
      department TEXT DEFAULT 'ECE',
      description TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_type TEXT,
      file_size INTEGER,
      status TEXT NOT NULL DEFAULT 'Submitted',
      feedback TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      approved_at TEXT,
      FOREIGN KEY (task_id) REFERENCES teaching_tasks(id) ON DELETE SET NULL,
      FOREIGN KEY (super_admin_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (sub_admin_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Migration: Add columns to students table if not exists
  const addColumn = async (col, type, def = 'NULL') => {
    try {
      await dbRun(`ALTER TABLE students ADD COLUMN ${col} ${type} DEFAULT ${def}`);
    } catch (e) {
      // Column might already exist, which is fine
    }
  };
  await addColumn('department', 'TEXT', "'ECE'");
  await addColumn('year', 'TEXT', "'3rd Year'");
  await addColumn('semester', 'TEXT', "'1st Sem'");
  await addColumn('section', 'TEXT', "'A'");
  await addColumn('phone', 'TEXT', 'NULL');
  await addColumn('academicStatus', 'TEXT', "'Regular'");
  await addColumn('parentName', 'TEXT', 'NULL');
  await addColumn('notes', 'TEXT', 'NULL');
  await addColumn('batch', 'TEXT', "'2023 - 2027'");

  // Migration: Add videoUrl to teaching_methods if not exists
  const addMethodColumn = async (col, type, def = 'NULL') => {
    try {
      await dbRun(`ALTER TABLE teaching_methods ADD COLUMN ${col} ${type} DEFAULT ${def}`);
    } catch (e) {
      // Column already exists
    }
  };
  await addMethodColumn('videoUrl', 'TEXT', 'NULL');

  // Migration: Unify all cohorts to 'Unified Learning Cohort'
  try {
    await dbRun("UPDATE teaching_methods SET cohort = 'Unified Learning Cohort' WHERE cohort IN ('Group A', 'Group B')");
    await dbRun("UPDATE students SET cohort = 'Unified Learning Cohort' WHERE cohort IN ('Group A', 'Group B') OR cohort IS NULL");
    await dbRun("UPDATE resources SET cohort = 'Unified Learning Cohort' WHERE cohort IN ('Group A', 'Group B')");
    
    // Pre-populate sample video URLs for existing methods if null
    await dbRun("UPDATE teaching_methods SET videoUrl = 'https://www.youtube.com/watch?v=qdKzBx54CSk' WHERE (id = 'method-a1' OR id = 'method-1') AND (videoUrl IS NULL OR videoUrl = '')");
    await dbRun("UPDATE teaching_methods SET videoUrl = 'https://www.youtube.com/watch?v=NnO8w6sW7-M' WHERE (id = 'method-a2' OR id = 'method-2') AND (videoUrl IS NULL OR videoUrl = '')");
    await dbRun("UPDATE teaching_methods SET videoUrl = 'https://www.youtube.com/watch?v=LMCZvGesRz8' WHERE (id = 'method-a3' OR id = 'method-3') AND (videoUrl IS NULL OR videoUrl = '')");
    await dbRun("UPDATE teaching_methods SET videoUrl = 'https://www.youtube.com/watch?v=s8r1mU9jQe0' WHERE (id = 'method-a10' OR id = 'method-10') AND (videoUrl IS NULL OR videoUrl = '')");
    await dbRun("UPDATE teaching_methods SET videoUrl = 'https://www.youtube.com/watch?v=f2O9z7X-W-w' WHERE (id = 'method-b1' OR id = 'method-11') AND (videoUrl IS NULL OR videoUrl = '')");
    await dbRun("UPDATE teaching_methods SET videoUrl = 'https://www.youtube.com/watch?v=oXbLpLw3V28' WHERE (id = 'method-b4' OR id = 'method-14') AND (videoUrl IS NULL OR videoUrl = '')");
    await dbRun("UPDATE teaching_methods SET videoUrl = 'https://www.youtube.com/watch?v=r0O6jG0jZ9s' WHERE (id = 'method-b10' OR id = 'method-20') AND (videoUrl IS NULL OR videoUrl = '')");
  } catch (e) {
    console.error('Migration error:', e);
  }

  // Seed default Super Admin
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminInitialPassword = process.env.ADMIN_INITIAL_PASSWORD || 'AdminSecurePassword123';
  const superAdmin = await dbGet('SELECT * FROM users WHERE role = ?', ['SUPER_ADMIN']);
  
  if (!superAdmin) {
    const passHash = await bcrypt.hash(adminInitialPassword, 10);
    const superAdminPerms = JSON.stringify([
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
      'Manage Sub-Admins',
      'Manage Media Submissions'
    ]);
    
    await dbRun(
      'INSERT INTO users (name, email, username, password_hash, role, status, permissions) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['Super Admin', 'admin@dhanekula.ac.in', adminUsername, passHash, 'SUPER_ADMIN', 'Active', superAdminPerms]
    );
    console.log(`Seeded default Super Admin with username: "${adminUsername}"`);
  }

  // Seed Teaching Methods
  const methodCount = await dbGet('SELECT COUNT(*) as count FROM teaching_methods');
  if (methodCount.count === 0) {
    const defaultMethods = [
      {
        id: 'method-1',
        name: 'Flipped Classroom',
        cohort: 'Unified Learning Cohort',
        implementation: 'Students study videos/material before class; class used for applications',
        expectedOutcome: 'Higher-order thinking',
        detailedDescription: 'Pre-class engagement via digital courseware lectures and interactive video modules, freeing in-person contact hours for deep problem solving, design challenges, and real-world engineering applications.',
        category: 'Active Learning',
        tags: JSON.stringify(['Pre-class Video', 'Higher Order', 'Application-Focused']),
        materialsCount: 14,
        featured: 1,
        videoUrl: 'https://www.youtube.com/watch?v=qdKzBx54CSk'
      },
      {
        id: 'method-a2',
        name: 'Case Study Learning',
        cohort: 'Group A',
        implementation: 'Analyse real engineering cases',
        expectedOutcome: 'Analytical ability',
        detailedDescription: 'Real-world industrial case studies from Semiconductor, Telecommunication, and Robotics sectors are dissected to build critical diagnosis, root cause analysis, and architectural design skills.',
        category: 'Innovative',
        tags: JSON.stringify(['Industry Case Studies', 'Root Cause', 'Analytical']),
        materialsCount: 8,
        featured: 1
      },
      {
        id: 'method-a3',
        name: 'Project-Based Learning',
        cohort: 'Group A',
        implementation: 'Mini-project in each module',
        expectedOutcome: 'Practical application',
        detailedDescription: 'Hands-on practical implementation where students build hardware/software mini-projects for each course module (e.g. IoT Edge node, DSP filter design on FPGA, VLSI layout).',
        category: 'Active Learning',
        tags: JSON.stringify(['Mini Project', 'Hands-on', 'Hardware/Software']),
        materialsCount: 12,
        featured: 0
      },
      {
        id: 'method-a4',
        name: 'Research Paper Discussion',
        cohort: 'Group A',
        implementation: 'Discuss one paper every fortnight',
        expectedOutcome: 'Research orientation',
        detailedDescription: 'Bi-weekly IEEE/Springer paper review sessions enabling students to critique state-of-the-art literature in ECE, write summaries, and identify research gaps.',
        category: 'Innovative',
        tags: JSON.stringify(['IEEE Papers', 'Literature Review', 'Research Gaps']),
        materialsCount: 6,
        featured: 0
      },
      {
        id: 'method-a5',
        name: 'Industry Problem Solving',
        cohort: 'Group A',
        implementation: 'Solve real industrial challenges',
        expectedOutcome: 'Industry readiness',
        detailedDescription: 'Direct mentorship with industrial problems provided by core electronics and telecommunication partner companies to sharpen industry-standard problem solving.',
        category: 'Innovative',
        tags: JSON.stringify(['Industry Sponsored', 'Real-world', 'Employability']),
        materialsCount: 9,
        featured: 0
      },
      {
        id: 'method-a6',
        name: 'Hackathons & Design Challenges',
        cohort: 'Group A',
        implementation: 'Monthly competitions',
        expectedOutcome: 'Innovation',
        detailedDescription: '24-hour sprint competitions focusing on Embedded AI, Circuit Optimization, and Green Tech hardware design to foster rapid prototyping and innovation.',
        category: 'Innovative',
        tags: JSON.stringify(['Monthly Sprint', 'Prototyping', 'Competitions']),
        materialsCount: 5,
        featured: 0
      },
      {
        id: 'method-a7',
        name: 'Reverse Teaching',
        cohort: 'Group A',
        implementation: 'Students teach selected topics',
        expectedOutcome: 'Deep understanding',
        detailedDescription: 'Advanced students research complex sub-topics and conduct seminars for peers, strengthening subject mastery through teaching.',
        category: 'Peer & Collaborative',
        tags: JSON.stringify(['Student Seminars', 'Subject Mastery', 'Presentation']),
        materialsCount: 7,
        featured: 0
      },
      {
        id: 'method-a8',
        name: 'Peer Mentoring',
        cohort: 'Group A',
        implementation: 'Mentor Foundation cohort',
        expectedOutcome: 'Leadership',
        detailedDescription: 'ALC students act as academic buddies for Foundation Cohort (Group B) students during lab practice and problem solving, cultivating leadership and empathy.',
        category: 'Peer & Collaborative',
        tags: JSON.stringify(['Peer Support', 'Leadership', 'Mentorship']),
        materialsCount: 10,
        featured: 0
      },
      {
        id: 'method-a9',
        name: 'AI-Assisted Learning',
        cohort: 'Group A',
        implementation: 'Use AI tools for coding/design/reporting',
        expectedOutcome: 'AI readiness',
        detailedDescription: 'Leveraging Generative AI and LLMs for verilog code generation, circuit optimization scripts, data analysis in Python, and automated report synthesis.',
        category: 'AI & Tech Supported',
        tags: JSON.stringify(['GenAI Tools', 'Verilog Scripts', 'AI Prompting']),
        materialsCount: 11,
        featured: 1
      },
      {
        id: 'method-a10',
        name: 'Simulation-Based Learning',
        cohort: 'Group A',
        implementation: 'MATLAB/Proteus/SolidWorks etc.',
        expectedOutcome: 'Concept mastery',
        detailedDescription: 'In-depth simulation analysis using MATLAB Simulink for DSP, Proteus VSM for Microcontrollers, and Cadence/SolidWorks for physical layout mastery.',
        category: 'Active Learning',
        tags: JSON.stringify(['MATLAB', 'Proteus', 'SolidWorks', 'CAD']),
        materialsCount: 15,
        featured: 0
      },
      {
        id: 'method-b1',
        name: 'Micro Teaching',
        cohort: 'Group B',
        implementation: 'Short 15–20 minute concept sessions',
        expectedOutcome: 'Improved concentration',
        detailedDescription: 'Laser-focused 15-20 minute bite-sized lectures addressing single core concepts to maximize attention span and minimize cognitive overload.',
        category: 'Active Learning',
        tags: JSON.stringify(['Bite-sized', '15 Min Max', 'High Focus']),
        materialsCount: 18,
        featured: 1
      },
      {
        id: 'method-b2',
        name: 'Chunk Learning',
        cohort: 'Group B',
        implementation: 'Break topics into smaller units',
        expectedOutcome: 'Better retention',
        detailedDescription: 'Modular breakdown of complex syllabus units into micro-modules with immediate knowledge checks to ensure gradual building of fundamental concepts.',
        category: 'Active Learning',
        tags: JSON.stringify(['Modular Units', 'Micro-modules', 'Stepwise']),
        materialsCount: 12,
        featured: 0
      },
      {
        id: 'method-b3',
        name: 'Active Recall',
        cohort: 'Group B',
        implementation: 'Frequent retrieval practice',
        expectedOutcome: 'Long-term learning',
        detailedDescription: 'Flashcard drills, formula memory exercises, and low-stakes retrieval quizzes integrated into every session to consolidate long-term memory.',
        category: 'Assessment',
        tags: JSON.stringify(['Memory Drills', 'Flashcards', 'Retrieval']),
        materialsCount: 16,
        featured: 0
      },
      {
        id: 'method-b4',
        name: 'Daily Concept Quiz',
        cohort: 'Group B',
        implementation: 'Five-question quiz',
        expectedOutcome: 'Continuous reinforcement',
        detailedDescription: 'Daily 5-minute, 5-question multiple choice quizzes at the end of class providing immediate automated feedback and diagnostic scoring.',
        category: 'Assessment',
        tags: JSON.stringify(['5 Questions', 'Daily Check', 'Instant Feedback']),
        materialsCount: 25,
        featured: 1
      },
      {
        id: 'method-b5',
        name: 'Think–Pair–Share',
        cohort: 'Group B',
        implementation: 'Discuss concepts in pairs',
        expectedOutcome: 'Confidence',
        detailedDescription: 'Structured cooperative learning technique where students individually think through a numerical problem, discuss solutions with a partner, and present to the class.',
        category: 'Peer & Collaborative',
        tags: JSON.stringify(['Pair Discussion', 'Confidence', 'Class Share']),
        materialsCount: 9,
        featured: 0
      },
      {
        id: 'method-b6',
        name: 'Worked Examples',
        cohort: 'Group B',
        implementation: 'Stepwise demonstrations',
        expectedOutcome: 'Reduced cognitive load',
        detailedDescription: 'Faculty demonstrates step-by-step problem solving with detailed annotations before fading guidance as students transition to independent practice.',
        category: 'Active Learning',
        tags: JSON.stringify(['Step-by-step', 'Annotated Math', 'Scaffolded']),
        materialsCount: 14,
        featured: 0
      },
      {
        id: 'method-b7',
        name: 'Gamified Learning',
        cohort: 'Group B',
        implementation: 'Quizizz/Kahoot activities',
        expectedOutcome: 'Higher engagement',
        detailedDescription: 'Interactive live leaderboards, multiplayer quizzes, and reward badges on Quizizz and Kahoot to make fundamental revision exciting and competitive.',
        category: 'AI & Tech Supported',
        tags: JSON.stringify(['Kahoot', 'Quizizz', 'Leaderboards', 'Gamification']),
        materialsCount: 10,
        featured: 0
      },
      {
        id: 'method-b8',
        name: 'Remedial Tutorials',
        cohort: 'Group B',
        implementation: 'Support for weak topics',
        expectedOutcome: 'Improved pass percentage',
        detailedDescription: 'Dedicated small-group tutorial sessions designed to clear backlog topics, revise key exam formulas, and clarify doubts before assessments.',
        category: 'Active Learning',
        tags: JSON.stringify(['Small Group', 'Doubt Clearing', 'Pass Guarantee']),
        materialsCount: 15,
        featured: 0
      },
      {
        id: 'method-b9',
        name: 'Peer Learning',
        cohort: 'Group B',
        implementation: 'Collaborative learning',
        expectedOutcome: 'Better understanding',
        detailedDescription: 'Cooperative problem-solving pods where students work in teams of 3 to solve guided assignment sheets with peer support.',
        category: 'Peer & Collaborative',
        tags: JSON.stringify(['Group Pods', 'Collaborative', 'Assignment Pods']),
        materialsCount: 11,
        featured: 0
      },
      {
        id: 'method-b10',
        name: 'AI Tutor Support',
        cohort: 'Group B',
        implementation: 'AI-assisted explanations and practice',
        expectedOutcome: 'Personalised learning',
        detailedDescription: 'Interactive 24/7 AI Tutor providing simplified analogies, customized practice problems, and step-by-step hint generation based on individual pace.',
        category: 'AI & Tech Supported',
        tags: JSON.stringify(['24/7 AI Tutor', 'Personalized', 'Step-by-step Hints']),
        materialsCount: 20,
        featured: 1
      }
    ];

    for (const m of defaultMethods) {
      await dbRun(
        'INSERT INTO teaching_methods (id, name, cohort, implementation, expectedOutcome, detailedDescription, category, tags, materialsCount, featured, videoUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [m.id, m.name, m.cohort, m.implementation, m.expectedOutcome, m.detailedDescription, m.category, m.tags, m.materialsCount, m.featured, m.videoUrl || null]
      );
    }
    console.log('Seeded teaching methods database.');
  }

  // Seed Weekly Activities
  const activityCount = await dbGet('SELECT COUNT(*) as count FROM weekly_activities');
  if (activityCount.count === 0) {
    const defaultActivities = [
      {
        id: 'plan-mon',
        day: 'Monday',
        groupAActivity: 'Industry News Discussion',
        groupBActivity: 'Concept Revision',
        groupAMethodId: 'method-a5',
        groupBMethodId: 'method-b1',
        timeSlot: '09:30 AM - 11:30 AM',
        location: 'ECE Lab 3 / Room 102',
        status: 'Completed'
      },
      {
        id: 'plan-tue',
        day: 'Tuesday',
        groupAActivity: 'Problem-Based Learning',
        groupBActivity: 'Worked Examples',
        groupAMethodId: 'method-a3',
        groupBMethodId: 'method-b6',
        timeSlot: '09:30 AM - 11:30 AM',
        location: 'VLSI Studio / Seminar Hall A',
        status: 'Completed'
      },
      {
        id: 'plan-wed',
        day: 'Wednesday',
        groupAActivity: 'Research Paper Review',
        groupBActivity: 'Concept Mapping',
        groupAMethodId: 'method-a4',
        groupBMethodId: 'method-b2',
        timeSlot: '11:45 AM - 01:15 PM',
        location: 'Digital Library / Classroom 204',
        status: 'In Progress'
      },
      {
        id: 'plan-thu',
        day: 'Thursday',
        groupAActivity: 'Mini Project / Simulation',
        groupBActivity: 'Guided Laboratory Practice',
        groupAMethodId: 'method-a10',
        groupBMethodId: 'method-b8',
        timeSlot: '02:00 PM - 04:30 PM',
        location: 'MATLAB Lab / Hardware Workshop',
        status: 'Scheduled'
      },
      {
        id: 'plan-fri',
        day: 'Friday',
        groupAActivity: 'Innovation Challenge',
        groupBActivity: 'Gamified Quiz & Remedial Support',
        groupAMethodId: 'method-a6',
        groupBMethodId: 'method-b7',
        timeSlot: '02:00 PM - 04:30 PM',
        location: 'Innovation Hub / Room 105',
        status: 'Scheduled'
      },
      {
        id: 'plan-sat',
        day: 'Saturday',
        groupAActivity: 'Presentations & Startup Ideas',
        groupBActivity: 'Placement Aptitude & Soft Skills',
        groupAMethodId: 'method-a7',
        groupBMethodId: 'method-b4',
        timeSlot: '10:00 AM - 01:00 PM',
        location: 'Auditorium / Placement Hall',
        status: 'Scheduled'
      }
    ];

    for (const a of defaultActivities) {
      await dbRun(
        'INSERT INTO weekly_activities (id, day, groupAActivity, groupBActivity, groupAMethodId, groupBMethodId, timeSlot, location, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [a.id, a.day, a.groupAActivity, a.groupBActivity, a.groupAMethodId, a.groupBMethodId, a.timeSlot, a.location, a.status]
      );
    }
    console.log('Seeded weekly activity schedule.');
  }

  // Seed Resources
  const resCount = await dbGet('SELECT COUNT(*) as count FROM resources');
  if (resCount.count === 0) {
    const defaultResources = [
      {
        id: 'res-1',
        title: 'Flipped Classroom Pre-Lecture: Embedded DSP System Architecture',
        type: 'video',
        subject: 'Digital Signal Processing',
        cohort: 'Group A',
        methodId: 'method-a1',
        url: 'https://dhanekula.ac.in/courseware/dsp-flipped-video-01',
        description: '18-minute pre-class video breakdown of FIR/IIR filter design before in-class MATLAB session.',
        addedBy: 'Dhanekula ECE Faculty',
        dateAdded: '2026-07-15',
        downloads: 142
      },
      {
        id: 'res-2',
        title: 'Case Study: Qualcomm 5G Front-End RF Transceiver Architecture',
        type: 'pdf',
        subject: 'Communication Systems',
        cohort: 'Group A',
        methodId: 'method-a2',
        url: 'https://dhanekula.ac.in/courseware/case-study-5g-rf.pdf',
        description: 'Industrial case study analyzing impedance matching and low-noise amplification.',
        addedBy: 'Dhanekula ECE Faculty',
        dateAdded: '2026-07-18',
        downloads: 98
      },
      {
        id: 'res-3',
        title: 'Micro Teaching 15-Min Module: Op-Amp Feedback Networks',
        type: 'video',
        subject: 'Analog Electronics',
        cohort: 'Group B',
        methodId: 'method-b1',
        url: 'https://dhanekula.ac.in/courseware/opamp-micro-learning',
        description: 'Short 15-minute concept video focusing strictly on non-inverting gain formulas.',
        addedBy: 'Dhanekula ECE Faculty',
        dateAdded: '2026-07-20',
        downloads: 210
      },
      {
        id: 'res-4',
        title: 'Daily Concept Quiz 04: Semiconductor Physics Flash Quiz',
        type: 'quiz',
        subject: 'VLSI Design',
        cohort: 'Group B',
        methodId: 'method-b4',
        url: 'https://dhanekula.ac.in/courseware/daily-quiz-04',
        description: '5-question interactive multiple-choice quiz on PN junction capacitance.',
        addedBy: 'Dhanekula ECE Faculty',
        dateAdded: '2026-07-22',
        downloads: 315
      },
      {
        id: 'res-5',
        title: 'Simulation Lab File: Proteus 8051 Microcontroller Interface',
        type: 'simulation',
        subject: 'Microcontrollers',
        cohort: 'Group A',
        methodId: 'method-a10',
        url: 'https://dhanekula.ac.in/courseware/proteus-8051-lcd.pdsprj',
        description: 'Proteus workspace file for LCD 16x2 interfacing with 8051 assembly code.',
        addedBy: 'Dhanekula ECE Faculty',
        dateAdded: '2026-07-24',
        downloads: 185
      },
      {
        id: 'res-6',
        title: 'AI Tutor Prompt Guide: Solving Complex Circuit Differential Equations',
        type: 'code',
        subject: 'Circuit Theory',
        cohort: 'Group B',
        methodId: 'method-b10',
        url: 'https://dhanekula.ac.in/courseware/ai-tutor-prompts-circuits',
        description: 'Step-by-step AI prompt collection for obtaining hints on second-order transient analysis.',
        addedBy: 'Dhanekula ECE Faculty',
        dateAdded: '2026-07-25',
        downloads: 160
      }
    ];

    for (const r of defaultResources) {
      await dbRun(
        'INSERT INTO resources (id, title, type, subject, cohort, methodId, url, description, addedBy, dateAdded, downloads) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [r.id, r.title, r.type, r.subject, r.cohort, r.methodId, r.url, r.description, r.addedBy, r.dateAdded, r.downloads]
      );
    }
    console.log('Seeded digital courseware resources.');
  }

  // Seed Students
  const studentCount = await dbGet('SELECT COUNT(*) as count FROM students');
  if (studentCount.count === 0) {
    const defaultStudents = [
      {
        id: 'stu-101',
        name: 'Aarav Sharma',
        rollNumber: '21DK1A0401',
        email: 'aarav.sharma@dhanekula.ac.in',
        cohort: 'Group A',
        gpa: 9.2,
        attendance: 96,
        strengths: JSON.stringify(['Verilog HDL', 'MATLAB Simulink', 'Research Papers']),
        focusAreas: JSON.stringify(['Edge AI Optimization'])
      },
      {
        id: 'stu-102',
        name: 'Ananya Mohanty',
        rollNumber: '21DK1A0415',
        email: 'ananya.m@dhanekula.ac.in',
        cohort: 'Group A',
        gpa: 8.9,
        attendance: 94,
        strengths: JSON.stringify(['VLSI Layout', 'Hackathons', 'Peer Mentoring']),
        focusAreas: JSON.stringify(['Cadence Virtuoso'])
      },
      {
        id: 'stu-103',
        name: 'Bikram K. Panda',
        rollNumber: '21DK1A0442',
        email: 'bikram.p@dhanekula.ac.in',
        cohort: 'Group B',
        gpa: 7.1,
        attendance: 88,
        strengths: JSON.stringify(['Active Recall', 'Practical Wiring']),
        focusAreas: JSON.stringify(['Signal & Systems Math', 'Op-Amp Derivations'])
      },
      {
        id: 'stu-104',
        name: 'Devika Rani',
        rollNumber: '21DK1A0458',
        email: 'devika.r@dhanekula.ac.in',
        cohort: 'Group B',
        gpa: 6.8,
        attendance: 85,
        strengths: JSON.stringify(['Daily Quizzes', 'Group Discussion']),
        focusAreas: JSON.stringify(['Fourier Transform', 'Microcontroller C Coding'])
      },
      {
        id: 'stu-105',
        name: 'Rohan Sethi',
        rollNumber: '21DK1A0489',
        email: 'rohan.s@dhanekula.ac.in',
        cohort: 'Group A',
        gpa: 9.5,
        attendance: 98,
        strengths: JSON.stringify(['AI-Assisted Coding', 'DSP Design', 'Flipped Classroom']),
        focusAreas: JSON.stringify(['FPGA Synthesis'])
      },
      {
        id: 'stu-106',
        name: 'Priyanka Das',
        rollNumber: '21DK1A04A4',
        email: 'priyanka.d@dhanekula.ac.in',
        cohort: 'Group B',
        gpa: 7.4,
        attendance: 91,
        strengths: JSON.stringify(['Chunk Learning', 'Kahoot Quizzes']),
        focusAreas: JSON.stringify(['Electromagnetic Theory'])
      }
    ];

    for (const s of defaultStudents) {
      await dbRun(
        'INSERT INTO students (id, name, rollNumber, email, cohort, gpa, attendance, strengths, focusAreas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [s.id, s.name, s.rollNumber, s.email, s.cohort, s.gpa, s.attendance, s.strengths, s.focusAreas]
      );
    }
    console.log('Seeded student records.');
  }

  // Seed default Sub-Admin if none exists
  const existingSubAdmin = await dbGet('SELECT * FROM users WHERE role = ?', ['SUB_ADMIN']);
  let subAdminId = existingSubAdmin ? existingSubAdmin.id : null;

  if (!existingSubAdmin) {
    const subAdminPassHash = await bcrypt.hash('Faculty@123', 10);
    const subAdminPerms = JSON.stringify([
      'Manage Teaching Methods',
      'Manage Courses',
      'Create Content',
      'Edit Content',
      'View Students',
      'Manage Students',
      'View Counselling',
      'Manage Counselling',
      'Manage Media Submissions'
    ]);
    const subResult = await dbRun(
      'INSERT INTO users (name, email, username, password_hash, role, status, permissions) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['Dr. K. Srinivas Rao', 'srinivas.rao@dhanekula.ac.in', 'faculty_ece', subAdminPassHash, 'SUB_ADMIN', 'Active', subAdminPerms]
    );
    subAdminId = subResult.id;
    console.log('Seeded default Sub Admin: "faculty_ece" / "Faculty@123"');
  }

  const superAdminUser = await dbGet('SELECT id FROM users WHERE role = ?', ['SUPER_ADMIN']);
  const superAdminId = superAdminUser ? superAdminUser.id : 1;

  // Seed Teaching Tasks
  const taskCount = await dbGet('SELECT COUNT(*) as count FROM teaching_tasks');
  if (taskCount.count === 0 && subAdminId) {
    const defaultTasks = [
      {
        super_admin_id: superAdminId,
        sub_admin_id: subAdminId,
        topic: 'Flipped Classroom Pedagogy in Digital Signal Processing',
        description: 'Design and upload lecture video modules and active problem-solving classroom templates for Fast Fourier Transform concepts.',
        department: 'ECE',
        date: '2026-08-25',
        time: '10:30 AM',
        no_of_faculty: 3,
        status: 'Approved'
      },
      {
        super_admin_id: superAdminId,
        sub_admin_id: subAdminId,
        topic: 'Project-Based Learning with IoT & Edge AI Hardware',
        description: 'Prepare laboratory case studies where students build ESP32 edge intelligence nodes for smart environmental sensing.',
        department: 'ECE',
        date: '2026-08-28',
        time: '02:00 PM',
        no_of_faculty: 2,
        status: 'Approved'
      },
      {
        super_admin_id: superAdminId,
        sub_admin_id: subAdminId,
        topic: 'Interactive Simulation Labs using Proteus & MATLAB',
        description: 'Document stepwise virtual circuit simulations and verification rubrics for RF transceiver and antenna designs.',
        department: 'ECE',
        date: '2026-08-30',
        time: '11:15 AM',
        no_of_faculty: 2,
        status: 'Submitted'
      },
      {
        super_admin_id: superAdminId,
        sub_admin_id: subAdminId,
        topic: 'Peer-to-Peer Collaborative Code Reviews in Verilog HDL',
        description: 'Establish structured peer-review rubrics for synthesizable RTL coding and testbench generation.',
        department: 'ECE',
        date: '2026-09-02',
        time: '03:30 PM',
        no_of_faculty: 4,
        status: 'Pending'
      }
    ];

    for (const t of defaultTasks) {
      await dbRun(
        'INSERT INTO teaching_tasks (super_admin_id, sub_admin_id, topic, description, department, date, time, no_of_faculty, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [t.super_admin_id, t.sub_admin_id, t.topic, t.description, t.department, t.date, t.time, t.no_of_faculty, t.status]
      );
    }
    console.log('Seeded initial teaching tasks.');
  }

  // Seed Teaching Submissions
  const submissionCount = await dbGet('SELECT COUNT(*) as count FROM teaching_submissions');
  if (submissionCount.count === 0 && subAdminId) {
    const defaultSubmissions = [
      {
        task_id: 1,
        super_admin_id: superAdminId,
        sub_admin_id: subAdminId,
        topic: 'Flipped Classroom Pedagogy in Digital Signal Processing',
        date: '2026-08-26',
        time: '11:00 AM',
        no_of_faculty: 3,
        department: 'ECE',
        description: 'Implemented the 3-stage Flipped Classroom model for 3rd Year ECE. Pre-class micro-lectures were assigned on Canvas, followed by hands-on MATLAB filter tuning in class. 94% comprehension rate achieved in formative assessments.',
        file_path: '/uploads/flipped_classroom_methodology.pdf',
        file_name: 'flipped_classroom_methodology.pdf',
        file_type: 'application/pdf',
        file_size: 154200,
        status: 'Approved',
        feedback: 'Excellent documentation and structured implementation workflow. Approved for public showcase.',
        approved_at: '2026-08-27 09:30:00'
      },
      {
        task_id: 2,
        super_admin_id: superAdminId,
        sub_admin_id: subAdminId,
        topic: 'Project-Based Learning with IoT & Edge AI Hardware',
        date: '2026-08-29',
        time: '04:15 PM',
        no_of_faculty: 2,
        department: 'ECE',
        description: 'Hands-on hardware sprint where 18 student teams deployed TinyML models onto ESP32 and STM32 microcontrollers. Full schematic diagrams, rubric criteria, and sample projects are compiled in the attached guide.',
        file_path: '/uploads/iot_edge_project_based_learning.pdf',
        file_name: 'iot_edge_project_based_learning.pdf',
        file_type: 'application/pdf',
        file_size: 218400,
        status: 'Approved',
        feedback: 'Outstanding industry-aligned coursework model. Approved.',
        approved_at: '2026-08-30 08:45:00'
      },
      {
        task_id: 3,
        super_admin_id: superAdminId,
        sub_admin_id: subAdminId,
        topic: 'Interactive Simulation Labs using Proteus & MATLAB',
        date: '2026-08-30',
        time: '11:45 AM',
        no_of_faculty: 2,
        department: 'ECE',
        description: 'Comprehensive virtual lab worksheets and live Proteus circuit simulation files for LCD interfacing and sensor ADC conversion.',
        file_path: '/uploads/flipped_classroom_methodology.pdf',
        file_name: 'proteus_simulation_lab_manual.pdf',
        file_type: 'application/pdf',
        file_size: 198000,
        status: 'Submitted',
        feedback: null,
        approved_at: null
      }
    ];

    for (const sub of defaultSubmissions) {
      await dbRun(
        'INSERT INTO teaching_submissions (task_id, super_admin_id, sub_admin_id, topic, date, time, no_of_faculty, department, description, file_path, file_name, file_type, file_size, status, feedback, approved_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [sub.task_id, sub.super_admin_id, sub.sub_admin_id, sub.topic, sub.date, sub.time, sub.no_of_faculty, sub.department, sub.description, sub.file_path, sub.file_name, sub.file_type, sub.file_size, sub.status, sub.feedback, sub.approved_at]
      );
    }
    console.log('Seeded initial teaching submissions.');
  }
};
