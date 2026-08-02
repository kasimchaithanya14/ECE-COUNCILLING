# CUTM Differentiated Teaching–Learning Courseware Platform

> **Academic Courseware Portal for Third-Year B.Tech Students & Faculty**  
> Centurion University of Technology and Management (CUTM) — Department of Electronics & Communication Engineering (ECE)

---

## 📌 Executive Overview

This web platform is designed for **Third-Year B.Tech ECE** courses to execute **Differentiated Teaching–Learning Strategies**. It partitions students into two targeted cohorts based on learning pace and academic readiness, offering customized teaching methods, daily timetables, courseware materials, and analytics tracking:

- **Group A — Advanced Learning Cohort (ALC)**: Tailored for high-performing students ready for advanced learning, innovation, research papers, hackathons, MATLAB/Proteus simulations, and higher-order problem solving.
- **Group B — Foundation Learning Cohort (FLC)**: Tailored for students requiring structured academic support, micro-teaching (15–20 min sessions), chunked learning, active recall drills, step-by-step worked examples, and daily concept quizzes.

---

## 🔒 Role-Based Edit & Access Control (RBAC)

- **Faculty Access Mode (Edit Privileges)**:
  - Edit implementation strategy text & expected outcomes for any of the 20 methods.
  - Modify Monday–Saturday weekly activity slots, timeslots, and locations.
  - Upload digital courseware resources (Pre-class videos, PDF slides, Proteus/MATLAB simulation files, Verilog scripts).
  - Assign and re-assign students between Group A (ALC) and Group B (FLC).
  - Reset baseline PDF data.
- **Student View Mode (Read-Only)**:
  - Interactive exploration of methods, weekly timetables, and expected outcomes.
  - Access Flipped Classroom videos and Micro Teaching modules.
  - Play 5-Question Daily Concept Quizzes with automated feedback.
  - Launch 24/7 AI Tutor & Assistant for hints and code generation.

---

## 🛠️ Technology Stack

- **Frontend Core**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS v3, Glassmorphism, Dark/Light Mode, Lucide Icons
- **State & Data**: React Context API, Persistent Browser LocalStorage, Recharts
- **DevOps**: Docker, Multi-stage Dockerfile, Docker Compose, Nginx, GitHub Actions CI/CD

---

## 🚀 Quick Start (Local Setup)

```bash
# 1. Clone the repository
cd c:\DATA\PROJECTS\ECE

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Production Deployment

```bash
# Build and spin up container using Docker Compose
docker-compose up -d --build
```

Access the production application at [http://localhost:8080](http://localhost:8080).

---

## 📊 Summary of PDF Baseline Data

### Group A — Innovative Teaching Methods (ALC)
1. **Flipped Classroom** → Implementation: *Students study videos/material before class; class used for applications* | Outcome: *Higher-order thinking*
2. **Case Study Learning** → Implementation: *Analyse real engineering cases* | Outcome: *Analytical ability*
3. **Project-Based Learning** → Implementation: *Mini-project in each module* | Outcome: *Practical application*
4. **Research Paper Discussion** → Implementation: *Discuss one paper every fortnight* | Outcome: *Research orientation*
5. **Industry Problem Solving** → Implementation: *Solve real industrial challenges* | Outcome: *Industry readiness*
6. **Hackathons & Design Challenges** → Implementation: *Monthly competitions* | Outcome: *Innovation*
7. **Reverse Teaching** → Implementation: *Students teach selected topics* | Outcome: *Deep understanding*
8. **Peer Mentoring** → Implementation: *Mentor Foundation cohort* | Outcome: *Leadership*
9. **AI-Assisted Learning** → Implementation: *Use AI tools for coding/design/reporting* | Outcome: *AI readiness*
10. **Simulation-Based Learning** → Implementation: *MATLAB/Proteus/SolidWorks etc.* | Outcome: *Concept mastery*

### Group B — Innovative Teaching Methods (FLC)
1. **Micro Teaching** → Implementation: *Short 15–20 minute concept sessions* | Outcome: *Improved concentration*
2. **Chunk Learning** → Implementation: *Break topics into smaller units* | Outcome: *Better retention*
3. **Active Recall** → Implementation: *Frequent retrieval practice* | Outcome: *Long-term learning*
4. **Daily Concept Quiz** → Implementation: *Five-question quiz* | Outcome: *Continuous reinforcement*
5. **Think–Pair–Share** → Implementation: *Discuss concepts in pairs* | Outcome: *Confidence*
6. **Worked Examples** → Implementation: *Stepwise demonstrations* | Outcome: *Reduced cognitive load*
7. **Gamified Learning** → Implementation: *Quizizz/Kahoot activities* | Outcome: *Higher engagement*
8. **Remedial Tutorials** → Implementation: *Support for weak topics* | Outcome: *Improved pass percentage*
9. **Peer Learning** → Implementation: *Collaborative learning* | Outcome: *Better understanding*
10. **AI Tutor Support** → Implementation: *AI-assisted explanations and practice* | Outcome: *Personalised learning*

---

## 📈 Expected Outcomes Summary
- Enhanced student engagement and learning outcomes.
- Improved pass percentage and academic progression.
- Better placement readiness and industry skills.
- Increased innovation, research participation and leadership among advanced learners.
- Stronger conceptual foundation and confidence among foundation learners.
