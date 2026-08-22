import express from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dbGet, dbQuery, dbRun } from './db.js';
import { authenticateToken, generateToken, requireRole, requirePermission } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const cleanExt = path.extname(file.originalname).toLowerCase();
    cb(null, 'media-' + uniqueSuffix + cleanExt);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [
      '.jpg', '.jpeg', '.png', '.webp', // Images
      '.mp4', '.webm',                  // Videos
      '.pdf', '.doc', '.docx', '.ppt', '.pptx' // Documents
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file extension.'));
    }
  }
});

const router = express.Router();

// Helper to write audit logs
const logActivity = async (user, action, target, status = 'Success') => {
  try {
    await dbRun(
      'INSERT INTO audit_logs (user, action, target, status) VALUES (?, ?, ?, ?)',
      [user, action, target, status]
    );
  } catch (err) {
    console.error('Failed to log audit activity:', err);
  }
};

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

// POST: Login
router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    // Find user (by username or email)
    const user = await dbGet('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);

    if (!user) {
      await logActivity(username, 'Login attempt', 'None', 'Failed: User not found');
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    if (user.status === 'Disabled') {
      await logActivity(user.name, 'Login attempt', 'Disabled account', 'Failed: Disabled');
      return res.status(403).json({ error: 'Your account is disabled. Please contact the administrator.' });
    }

    // Verify password hash
    const passMatch = await bcrypt.compare(password, user.password_hash);
    if (!passMatch) {
      await logActivity(user.name, 'Login attempt', 'Incorrect password', 'Failed: Bad credentials');
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Generate JWT
    const token = generateToken(user);

    // Update last login timestamp
    const nowStr = new Date().toISOString();
    await dbRun('UPDATE users SET last_login = ? WHERE id = ?', [nowStr, user.id]);

    // Log success
    await logActivity(user.name, 'Admin login', 'Portal session', 'Success');

    // Set secure HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Set to true in prod if using HTTPS
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000 // 2 hours
    });

    // Return user info (omit password hash)
    const { password_hash, ...userInfo } = user;
    userInfo.permissionsList = JSON.parse(user.permissions || '[]');
    
    return res.json({
      message: 'Login successful',
      token, // Also return token in JSON in case client prefers Header storage
      user: userInfo
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST: Logout
router.post('/auth/logout', authenticateToken, async (req, res) => {
  try {
    await logActivity(req.user.name, 'Admin logout', 'Portal session', 'Success');
  } catch (err) {}
  
  res.clearCookie('token');
  return res.json({ message: 'Logged out successfully.' });
});

// GET: Current authenticated user details
// GET: Current authenticated user details
router.get('/auth/me', authenticateToken, (req, res) => {
  const { password_hash, ...userInfo } = req.user;
  return res.json({ user: userInfo });
});

// POST: Change own password (Logged-in Super Admin or Sub-Admin)
router.post('/auth/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: 'Current password, new password, and confirmation are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'New passwords do not match.' });
  }

  try {
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'New password cannot be the same as the current password.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await dbRun('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [passwordHash, user.id]);

    await logActivity(user.name, 'Changed Password', 'Own user account', 'Success');

    return res.json({ message: 'Your password has been changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'Failed to change password.' });
  }
});

// ==========================================
// 2. SUB-ADMIN MANAGEMENT ROUTES (SUPER_ADMIN Only)
// ==========================================

// GET: List all sub-admins
router.get('/admin/sub-admins', authenticateToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const admins = await dbQuery('SELECT id, name, email, username, role, status, permissions, created_at, last_login FROM users WHERE role = ?', ['SUB_ADMIN']);
    const list = admins.map(u => ({
      ...u,
      permissionsList: JSON.parse(u.permissions || '[]')
    }));
    return res.json(list);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch sub-admins.' });
  }
});

// POST: Create sub-admin
router.post('/admin/sub-admins', authenticateToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  const { name, email, username, password, confirmPassword, permissions, status } = req.body;

  // Validation
  if (!name || !email || !username || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  try {
    // Check if email or username exists
    const duplicate = await dbGet('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (duplicate) {
      return res.status(409).json({ error: 'Username or Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const permsJson = JSON.stringify(permissions || []);
    const adminStatus = status || 'Active';

    const result = await dbRun(
      'INSERT INTO users (name, email, username, password_hash, role, status, permissions) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, username, passwordHash, 'SUB_ADMIN', adminStatus, permsJson]
    );

    await logActivity(req.user.name, 'Created Sub-Admin', `Sub-Admin "${name}"`, 'Success');

    return res.status(201).json({
      message: 'Sub-admin created successfully.',
      id: result.id
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to create sub-admin.' });
  }
});

// PUT: Edit sub-admin
router.put('/admin/sub-admins/:id', authenticateToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { name, email, username, permissions, status } = req.body;

  if (!name || !email || !username) {
    return res.status(400).json({ error: 'Name, email, and username are required.' });
  }

  try {
    // Ensure we are targeting a sub-admin, not the super admin
    const targetUser = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
    if (!targetUser) {
      return res.status(404).json({ error: 'Sub-admin not found.' });
    }

    if (targetUser.role === 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Cannot modify the Super Admin account.' });
    }

    // Check duplicate username/email in OTHER users
    const duplicate = await dbGet(
      'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
      [username, email, id]
    );
    if (duplicate) {
      return res.status(409).json({ error: 'Username or Email is already taken by another account.' });
    }

    const permsJson = JSON.stringify(permissions || []);
    const adminStatus = status || 'Active';

    await dbRun(
      'UPDATE users SET name = ?, email = ?, username = ?, permissions = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, email, username, permsJson, adminStatus, id]
    );

    await logActivity(req.user.name, 'Updated Sub-Admin', `Sub-Admin "${name}"`, 'Success');

    return res.json({ message: 'Sub-admin details updated successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update sub-admin.' });
  }
});

// PUT: Toggle/Update Teaching Methods permission for sub-admin (SUPER_ADMIN only)
router.put('/admin/sub-admins/:id/permissions/teaching-methods', authenticateToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { granted } = req.body;

  try {
    const targetUser = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
    if (!targetUser) {
      return res.status(404).json({ error: 'Sub-admin not found.' });
    }

    if (targetUser.role === 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Super Admin already possesses all management permissions.' });
    }

    let permissions = JSON.parse(targetUser.permissions || '[]');
    const permName = 'Manage Teaching Methods';

    if (granted) {
      if (!permissions.includes(permName)) {
        permissions.push(permName);
      }
    } else {
      permissions = permissions.filter(p => p !== permName);
    }

    const permsJson = JSON.stringify(permissions);
    await dbRun('UPDATE users SET permissions = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [permsJson, id]);

    const actionText = granted ? 'Granted Teaching Methods Permission' : 'Revoked Teaching Methods Permission';
    await logActivity(req.user.name, actionText, `Sub-Admin "${targetUser.name}"`, 'Success');

    return res.json({
      message: `${actionText} for "${targetUser.name}".`,
      permissions: permissions
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update teaching methods permission.' });
  }
});

// POST: Reset sub-admin password (SUPER_ADMIN only)
router.post('/admin/sub-admins/:id/reset-password', authenticateToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  try {
    const targetUser = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
    if (!targetUser) {
      return res.status(404).json({ error: 'Sub-admin not found.' });
    }

    if (targetUser.role === 'SUPER_ADMIN' || parseInt(id, 10) === req.user.id) {
      return res.status(403).json({ error: 'Cannot reset the Super Admin password through the Sub-Admin reset flow. Please use the Change Password option in Settings.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await dbRun('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [passwordHash, id]);

    await logActivity(req.user.name, 'Reset Sub-Admin Password', `Sub-Admin "${targetUser.name}"`, 'Success');

    return res.json({ message: `Password for "${targetUser.name}" has been reset successfully.` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// DELETE: Delete sub-admin
router.delete('/admin/sub-admins/:id', authenticateToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  const { id } = req.params;

  try {
    const targetUser = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
    if (!targetUser) {
      return res.status(404).json({ error: 'Sub-admin not found.' });
    }

    if (targetUser.role === 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Cannot delete the Super Admin account.' });
    }

    await dbRun('DELETE FROM users WHERE id = ?', [id]);

    await logActivity(req.user.name, 'Deleted Sub-Admin', `Sub-Admin "${targetUser.name}"`, 'Success');

    return res.json({ message: 'Sub-admin permanently deleted.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to delete sub-admin.' });
  }
});

// ==========================================
// 3. AUDIT LOGS ROUTES
// ==========================================

// GET: Fetch audit logs
router.get('/admin/audit-logs', authenticateToken, requirePermission('View Activity Logs'), async (req, res) => {
  try {
    const logs = await dbQuery('SELECT * FROM audit_logs ORDER BY date_time DESC LIMIT 100');
    return res.json(logs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
});

// ==========================================
// 4. ACADEMIC SYNC / CRUD ENDPOINTS
// ==========================================

// --- TEACHING METHODS ---
router.get('/methods', async (req, res) => {
  try {
    const rows = await dbQuery('SELECT * FROM teaching_methods ORDER BY id ASC');
    const methods = rows.map(r => ({
      ...r,
      tags: JSON.parse(r.tags || '[]'),
      featured: !!r.featured
    }));
    return res.json(methods);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch teaching methods.' });
  }
});

router.post('/methods', authenticateToken, requirePermission('Manage Teaching Methods'), async (req, res) => {
  const { id, name, cohort, implementation, expectedOutcome, detailedDescription, category, tags, materialsCount, featured } = req.body;
  if (!id || !name || !cohort || !category) {
    return res.status(400).json({ error: 'ID, name, cohort, and category are required.' });
  }
  try {
    const tagStr = JSON.stringify(tags || []);
    const featVal = featured ? 1 : 0;
    await dbRun(
      'INSERT INTO teaching_methods (id, name, cohort, implementation, expectedOutcome, detailedDescription, category, tags, materialsCount, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, cohort, implementation || '', expectedOutcome || '', detailedDescription || '', category, tagStr, materialsCount || 0, featVal]
    );
    await logActivity(req.user.name, 'Created Teaching Method', `Method "${name}"`, 'Success');
    return res.status(201).json({ message: 'Teaching method added.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to add teaching method.' });
  }
});

router.put('/methods/:id', authenticateToken, requirePermission('Manage Teaching Methods'), async (req, res) => {
  const { id } = req.params;
  const { name, cohort, implementation, expectedOutcome, detailedDescription, category, tags, materialsCount, featured } = req.body;
  try {
    const tagStr = JSON.stringify(tags || []);
    const featVal = featured ? 1 : 0;
    await dbRun(
      'UPDATE teaching_methods SET name = ?, cohort = ?, implementation = ?, expectedOutcome = ?, detailedDescription = ?, category = ?, tags = ?, materialsCount = ?, featured = ? WHERE id = ?',
      [name, cohort, implementation, expectedOutcome, detailedDescription, category, tagStr, materialsCount, featVal, id]
    );
    await logActivity(req.user.name, 'Updated Teaching Method', `Method "${name}"`, 'Success');
    return res.json({ message: 'Teaching method updated.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update teaching method.' });
  }
});

router.delete('/methods/:id', authenticateToken, requirePermission('Manage Teaching Methods'), async (req, res) => {
  const { id } = req.params;
  try {
    const target = await dbGet('SELECT name FROM teaching_methods WHERE id = ?', [id]);
    await dbRun('DELETE FROM teaching_methods WHERE id = ?', [id]);
    await logActivity(req.user.name, 'Deleted Teaching Method', `Method "${target?.name || id}"`, 'Success');
    return res.json({ message: 'Teaching method deleted.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to delete teaching method.' });
  }
});

// --- WEEKLY SCHEDULE ---
router.get('/schedule', async (req, res) => {
  try {
    const schedule = await dbQuery('SELECT * FROM weekly_activities ORDER BY id ASC');
    return res.json(schedule);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch schedule.' });
  }
});

router.put('/schedule/:id', authenticateToken, requirePermission('Manage Student Cohorts'), async (req, res) => {
  const { id } = req.params;
  const { groupAActivity, groupBActivity, groupAMethodId, groupBMethodId, timeSlot, location, status } = req.body;
  try {
    const target = await dbGet('SELECT day FROM weekly_activities WHERE id = ?', [id]);
    await dbRun(
      'UPDATE weekly_activities SET groupAActivity = ?, groupBActivity = ?, groupAMethodId = ?, groupBMethodId = ?, timeSlot = ?, location = ?, status = ? WHERE id = ?',
      [groupAActivity, groupBActivity, groupAMethodId, groupBMethodId, timeSlot, location, status, id]
    );
    await logActivity(req.user.name, 'Updated Weekly Activity', `Day "${target?.day || id}"`, 'Success');
    return res.json({ message: 'Weekly activity updated.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update activity schedule.' });
  }
});

// --- DIGITAL COURSEWARE RESOURCES ---
router.get('/resources', async (req, res) => {
  try {
    const resources = await dbQuery('SELECT * FROM resources ORDER BY dateAdded DESC');
    return res.json(resources);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch resources.' });
  }
});

router.post('/resources', authenticateToken, requirePermission('Manage Courses'), async (req, res) => {
  const { id, title, fileName, fileSize, type, subject, cohort, methodId, url, description } = req.body;
  if (!id || !title || !type || !subject || !cohort || !url) {
    return res.status(400).json({ error: 'Title, type, subject, cohort, and URL are required.' });
  }
  try {
    const addedBy = req.user.name;
    const dateAdded = new Date().toISOString().split('T')[0];
    await dbRun(
      'INSERT INTO resources (id, title, fileName, fileSize, type, subject, cohort, methodId, url, description, addedBy, dateAdded, downloads) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, fileName || '', fileSize || 'N/A', type, subject, cohort, methodId || '', url, description || '', addedBy, dateAdded, 0]
    );
    await logActivity(req.user.name, 'Uploaded Resource', `File "${title}"`, 'Success');
    return res.status(201).json({ message: 'Resource created successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to add resource.' });
  }
});

router.delete('/resources/:id', authenticateToken, requirePermission('Manage Courses'), async (req, res) => {
  const { id } = req.params;
  try {
    const target = await dbGet('SELECT title FROM resources WHERE id = ?', [id]);
    await dbRun('DELETE FROM resources WHERE id = ?', [id]);
    await logActivity(req.user.name, 'Deleted Resource', `File "${target?.title || id}"`, 'Success');
    return res.json({ message: 'Resource deleted.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to delete resource.' });
  }
});

// --- STUDENTS ROSTER ---
router.get('/students', authenticateToken, async (req, res) => {
  try {
    let rows;
    if (req.user.role === 'SUPER_ADMIN') {
      rows = await dbQuery('SELECT * FROM students ORDER BY name ASC');
    } else {
      rows = await dbQuery(`
        SELECT s.* 
        FROM students s
        JOIN student_assignments sa ON s.id = sa.student_id
        WHERE sa.sub_admin_id = ?
        ORDER BY s.name ASC
      `, [req.user.id]);
    }
    const students = rows.map(r => ({
      ...r,
      strengths: JSON.parse(r.strengths || '[]'),
      focusAreas: JSON.parse(r.focusAreas || '[]')
    }));
    return res.json(students);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch students roster.' });
  }
});

// ==========================================
// 5. MEDIA SUBMISSIONS ROUTES
// ==========================================

// POST: Public submission of media
router.post('/submissions', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { submitter_name, submitter_email, teaching_method_id, description } = req.body;
    const file = req.file;

    if (!submitter_name || !teaching_method_id || !file) {
      // Clean up uploaded file if validation failed
      if (file) {
        fs.unlink(file.path, () => {});
      }
      return res.status(400).json({ error: 'Name, teaching method, and file are required.' });
    }

    try {
      // Verify teaching method exists
      const method = await dbGet('SELECT name FROM teaching_methods WHERE id = ?', [teaching_method_id]);
      if (!method) {
        fs.unlink(file.path, () => {});
        return res.status(400).json({ error: 'Teaching method does not exist.' });
      }

      const filePath = `/uploads/${file.filename}`;
      const cleanDesc = description || '';

      await dbRun(
        'INSERT INTO media_submissions (submitter_name, submitter_email, teaching_method_id, file_path, file_name, file_type, file_size, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [submitter_name, submitter_email || null, teaching_method_id, filePath, file.originalname, file.mimetype, file.size, cleanDesc, 'Pending']
      );

      await logActivity(submitter_name, 'Submitted Media', `For method "${method.name}"`, 'Pending Approval');

      return res.status(201).json({
        message: 'Thank you! Your media has been submitted successfully and is waiting for approval.'
      });
    } catch (error) {
      console.error('Submission error:', error);
      if (file) {
        fs.unlink(file.path, () => {});
      }
      return res.status(500).json({ error: 'Failed to record submission.' });
    }
  });
});

// GET: Public list of approved media submissions for a specific teaching method
router.get('/submissions/approved/:methodId', async (req, res) => {
  const { methodId } = req.params;
  try {
    const list = await dbQuery('SELECT id, submitter_name, file_path, file_name, file_type, description, created_at FROM media_submissions WHERE teaching_method_id = ? AND status = ? ORDER BY created_at DESC', [methodId, 'Approved']);
    return res.json(list);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch approved media.' });
  }
});

// GET: List all submissions (Admin Only)
router.get('/admin/submissions', authenticateToken, requirePermission('Manage Media Submissions'), async (req, res) => {
  try {
    const list = await dbQuery(`
      SELECT ms.*, tm.name as teaching_method_name 
      FROM media_submissions ms 
      LEFT JOIN teaching_methods tm ON ms.teaching_method_id = tm.id 
      ORDER BY ms.created_at DESC
    `);
    return res.json(list);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch submissions.' });
  }
});

// POST: Approve a submission
router.post('/admin/submissions/:id/approve', authenticateToken, requirePermission('Manage Media Submissions'), async (req, res) => {
  const { id } = req.params;
  try {
    const sub = await dbGet('SELECT ms.*, tm.name as method_name FROM media_submissions ms LEFT JOIN teaching_methods tm ON ms.teaching_method_id = tm.id WHERE ms.id = ?', [id]);
    if (!sub) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    await dbRun('UPDATE media_submissions SET status = ?, rejection_reason = NULL WHERE id = ?', ['Approved', id]);
    await logActivity(req.user.name, 'Approved Media Submission', `Submitted by "${sub.submitter_name}" for "${sub.method_name}"`, 'Success');

    return res.json({ message: 'Media submission approved successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to approve submission.' });
  }
});

// POST: Reject a submission
router.post('/admin/submissions/:id/reject', authenticateToken, requirePermission('Manage Media Submissions'), async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  try {
    const sub = await dbGet('SELECT ms.*, tm.name as method_name FROM media_submissions ms LEFT JOIN teaching_methods tm ON ms.teaching_method_id = tm.id WHERE ms.id = ?', [id]);
    if (!sub) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    await dbRun('UPDATE media_submissions SET status = ?, rejection_reason = ? WHERE id = ?', ['Rejected', reason || null, id]);
    await logActivity(req.user.name, 'Rejected Media Submission', `Submitted by "${sub.submitter_name}" for "${sub.method_name}"`, 'Success');

    return res.json({ message: 'Media submission rejected.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to reject submission.' });
  }
});

// DELETE: Delete a submission record (and unlinks file)
router.delete('/admin/submissions/:id', authenticateToken, requirePermission('Manage Media Submissions'), async (req, res) => {
  const { id } = req.params;
  try {
    const sub = await dbGet('SELECT * FROM media_submissions WHERE id = ?', [id]);
    if (!sub) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    // Delete record from DB
    await dbRun('DELETE FROM media_submissions WHERE id = ?', [id]);

    // Unlink file from local disk
    const fileName = path.basename(sub.file_path);
    const localFilePath = path.join(uploadsDir, fileName);
    fs.unlink(localFilePath, (err) => {
      if (err) console.warn('Failed to delete file from disk during sub cleanup:', err);
    });

    await logActivity(req.user.name, 'Deleted Media Record', `Submitted by "${sub.submitter_name}"`, 'Success');

    return res.json({ message: 'Submission record and physical file deleted successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to delete submission.' });
  }
});

// ==========================================
// 6. STUDENT COUNSELLING ENDPOINTS
// ==========================================

// GET: Admin - list students with role-based access control
router.get('/admin/students', authenticateToken, async (req, res) => {
  const canAccess = req.user.role === 'SUPER_ADMIN' || 
                    req.user.permissionsList.includes('View Students') || 
                    req.user.permissionsList.includes('Manage Students') ||
                    req.user.permissionsList.includes('View Counselling') || 
                    req.user.permissionsList.includes('Manage Counselling');
  if (!canAccess) {
    return res.status(403).json({ error: 'Permission denied. Requires student viewing access.' });
  }

  try {
    let rows;
    if (req.user.role === 'SUPER_ADMIN') {
      rows = await dbQuery(`
        SELECT 
          s.*,
          sa.sub_admin_id AS assignedSubAdminId,
          u.name AS assignedSubAdminName,
          (SELECT counselling_date FROM counselling_sessions WHERE student_id = s.id ORDER BY counselling_date DESC, id DESC LIMIT 1) AS latestCounsellingDate,
          (SELECT counsellor_name FROM counselling_sessions WHERE student_id = s.id ORDER BY counselling_date DESC, id DESC LIMIT 1) AS latestCounsellorName,
          (SELECT COUNT(*) FROM counselling_sessions WHERE student_id = s.id) AS counsellingSessionsCount
        FROM students s
        LEFT JOIN student_assignments sa ON s.id = sa.student_id
        LEFT JOIN users u ON sa.sub_admin_id = u.id
        ORDER BY s.name ASC
      `);
    } else {
      rows = await dbQuery(`
        SELECT 
          s.*,
          sa.sub_admin_id AS assignedSubAdminId,
          u.name AS assignedSubAdminName,
          (SELECT counselling_date FROM counselling_sessions WHERE student_id = s.id ORDER BY counselling_date DESC, id DESC LIMIT 1) AS latestCounsellingDate,
          (SELECT counsellor_name FROM counselling_sessions WHERE student_id = s.id ORDER BY counselling_date DESC, id DESC LIMIT 1) AS latestCounsellorName,
          (SELECT COUNT(*) FROM counselling_sessions WHERE student_id = s.id) AS counsellingSessionsCount
        FROM students s
        JOIN student_assignments sa ON s.id = sa.student_id
        JOIN users u ON sa.sub_admin_id = u.id
        WHERE sa.sub_admin_id = ?
        ORDER BY s.name ASC
      `, [req.user.id]);
    }
    const students = rows.map(r => ({
      ...r,
      strengths: JSON.parse(r.strengths || '[]'),
      focusAreas: JSON.parse(r.focusAreas || '[]')
    }));
    return res.json(students);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch students roster.' });
  }
});

// GET: Admin - get single student with assignment check
router.get('/admin/students/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const canAccess = req.user.role === 'SUPER_ADMIN' || 
                    req.user.permissionsList.includes('View Students') || 
                    req.user.permissionsList.includes('Manage Students') ||
                    req.user.permissionsList.includes('View Counselling') || 
                    req.user.permissionsList.includes('Manage Counselling');
  if (!canAccess) {
    return res.status(403).json({ error: 'Permission denied. Requires student viewing access.' });
  }

  try {
    if (req.user.role === 'SUB_ADMIN') {
      const assignment = await dbGet('SELECT 1 FROM student_assignments WHERE student_id = ? AND sub_admin_id = ?', [id, req.user.id]);
      if (!assignment) {
        await logActivity(req.user.name, 'Unauthorized Student Access Attempt', `Student ID: ${id}`, 'Denied');
        return res.status(403).json({ error: 'Access denied. You are not assigned to this student.' });
      }
    }

    const row = await dbGet(`
      SELECT 
        s.*,
        sa.sub_admin_id AS assignedSubAdminId,
        u.name AS assignedSubAdminName,
        (SELECT counselling_date FROM counselling_sessions WHERE student_id = s.id ORDER BY counselling_date DESC, id DESC LIMIT 1) AS latestCounsellingDate,
        (SELECT counsellor_name FROM counselling_sessions WHERE student_id = s.id ORDER BY counselling_date DESC, id DESC LIMIT 1) AS latestCounsellorName,
        (SELECT COUNT(*) FROM counselling_sessions WHERE student_id = s.id) AS counsellingSessionsCount
      FROM students s
      LEFT JOIN student_assignments sa ON s.id = sa.student_id
      LEFT JOIN users u ON sa.sub_admin_id = u.id
      WHERE s.id = ?
    `, [id]);

    if (!row) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    const student = {
      ...row,
      strengths: JSON.parse(row.strengths || '[]'),
      focusAreas: JSON.parse(row.focusAreas || '[]')
    };
    return res.json(student);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch student details.' });
  }
});

// POST: Admin - create student (creates student only once, prevents duplicate student IDs)
router.post('/admin/students', authenticateToken, requirePermission('Manage Students'), async (req, res) => {
  const { id: inputId, studentId, name, rollNumber, email, cohort, gpa, attendance, strengths, focusAreas, department, year, semester, section, phone, academicStatus, parentName, notes, batch } = req.body;
  
  if (!batch) {
    return res.status(400).json({ error: 'Please select a student batch.' });
  }
  if (!name) {
    return res.status(400).json({ error: "Please enter the student's full name." });
  }
  if (!rollNumber) {
    return res.status(400).json({ error: 'Roll Number / Student ID is required.' });
  }

  const studentEmail = email ? email.trim() : `${rollNumber.toLowerCase()}@dhanekula.ac.in`;
  const desiredId = (studentId || inputId || '').trim();

  try {
    // Check if roll number already exists in DB
    const existingRoll = await dbGet('SELECT id, name, rollNumber FROM students WHERE rollNumber = ?', [rollNumber]);
    if (existingRoll) {
      return res.status(400).json({
        error: `Student with roll number "${rollNumber}" already exists (${existingRoll.name}, ID: ${existingRoll.id}). You can directly record counselling notes for this student.`,
        duplicate: true,
        existingStudentId: existingRoll.id
      });
    }

    // If a custom ID was specified, check if ID exists
    if (desiredId) {
      const existingById = await dbGet('SELECT id, name, rollNumber FROM students WHERE id = ?', [desiredId]);
      if (existingById) {
        return res.status(400).json({
          error: `Student with ID "${desiredId}" already exists (${existingById.name}, Roll: ${existingById.rollNumber}). Duplicate student records are not allowed.`,
          duplicate: true,
          existingStudentId: existingById.id
        });
      }
    }

    const existingEmail = await dbGet('SELECT id FROM students WHERE email = ?', [studentEmail]);
    if (existingEmail) {
      return res.status(400).json({ error: `A student with email "${studentEmail}" already exists.` });
    }

    // Generate sequential unique Student ID if not provided: STU-000107
    let newId = desiredId;
    if (!newId) {
      const allStudents = await dbQuery("SELECT id FROM students");
      let maxNum = 100;
      for (const r of allStudents) {
        const match = r.id.match(/^(?:stu-|STU-)(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) {
            maxNum = num;
          }
        }
      }
      const nextNum = maxNum + 1;
      newId = `STU-${String(nextNum).padStart(6, '0')}`;
      
      while (await dbGet('SELECT id FROM students WHERE id = ?', [newId])) {
        maxNum++;
        newId = `STU-${String(maxNum + 1).padStart(6, '0')}`;
      }
    }

    const strJson = JSON.stringify(strengths || []);
    const focJson = JSON.stringify(focusAreas || []);

    await dbRun(
      `INSERT INTO students (
        id, name, rollNumber, email, cohort, gpa, attendance, strengths, focusAreas,
        department, year, semester, section, phone, academicStatus, parentName, notes, batch
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId, name, rollNumber, studentEmail, cohort || '', parseFloat(gpa) || 0.0, parseFloat(attendance) || 0.0,
        strJson, focJson, department || 'ECE', year || '3rd Year', semester || '1st Sem',
        section || 'A', phone || '', academicStatus || 'Regular', parentName || '', notes || '', batch
      ]
    );

    // If created by a Sub-Admin, automatically assign the student to that Sub-Admin
    if (req.user.role === 'SUB_ADMIN') {
      try {
        await dbRun(
          'INSERT INTO student_assignments (student_id, sub_admin_id, assigned_by) VALUES (?, ?, ?)',
          [newId, req.user.id, req.user.name]
        );
      } catch (assignErr) {
        console.warn('Auto-assignment for created student note:', assignErr);
      }
    }

    await logActivity(req.user.name, 'Created Student Record', `Roll: ${rollNumber} (ID: ${newId})`, 'Success');
    return res.status(201).json({ message: 'Student created successfully.', studentId: newId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to create student.' });
  }
});

// PUT: Admin - edit a student
router.put('/admin/students/:id', authenticateToken, requirePermission('Manage Students'), async (req, res) => {
  const { id } = req.params;
  const { name, rollNumber, email, cohort, gpa, attendance, strengths, focusAreas, department, year, semester, section, phone, academicStatus, parentName, notes, batch } = req.body;

  if (!batch) {
    return res.status(400).json({ error: 'Please select a student batch.' });
  }
  if (!name) {
    return res.status(400).json({ error: "Please enter the student's full name." });
  }
  if (!rollNumber) {
    return res.status(400).json({ error: 'Roll Number is required.' });
  }

  const studentEmail = email ? email.trim() : `${rollNumber.toLowerCase()}@dhanekula.ac.in`;

  try {
    if (req.user.role === 'SUB_ADMIN') {
      const assignment = await dbGet('SELECT 1 FROM student_assignments WHERE student_id = ? AND sub_admin_id = ?', [id, req.user.id]);
      if (!assignment) {
        await logActivity(req.user.name, 'Unauthorized Student Edit Attempt', `Student ID: ${id}`, 'Denied');
        return res.status(403).json({ error: 'Access denied. You are not assigned to this student.' });
      }
    }

    const target = await dbGet('SELECT id FROM students WHERE id = ?', [id]);
    if (!target) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    const conflictRoll = await dbGet('SELECT id FROM students WHERE rollNumber = ? AND batch = ? AND id != ?', [rollNumber, batch, id]);
    if (conflictRoll) {
      return res.status(400).json({ error: 'This roll number already exists in the selected batch.' });
    }

    const conflictEmail = await dbGet('SELECT id FROM students WHERE email = ? AND id != ?', [studentEmail, id]);
    if (conflictEmail) {
      return res.status(400).json({ error: `A student with email "${studentEmail}" already exists.` });
    }

    const strJson = JSON.stringify(strengths || []);
    const focJson = JSON.stringify(focusAreas || []);

    await dbRun(
      `UPDATE students SET 
        name = ?, rollNumber = ?, email = ?, cohort = ?, gpa = ?, attendance = ?, strengths = ?, focusAreas = ?,
        department = ?, year = ?, semester = ?, section = ?, phone = ?, academicStatus = ?, parentName = ?, notes = ?, batch = ?
      WHERE id = ?`,
      [
        name, rollNumber, studentEmail, cohort || '', parseFloat(gpa) || 0.0, parseFloat(attendance) || 0.0,
        strJson, focJson, department || 'ECE', year || '3rd Year', semester || '1st Sem',
        section || 'A', phone || '', academicStatus || 'Regular', parentName || '', notes || '', batch,
        id
      ]
    );

    await logActivity(req.user.name, 'Updated Student Record', `Roll: ${rollNumber}`, 'Success');
    return res.json({ message: 'Student details updated successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update student.' });
  }
});

// DELETE: Admin - delete a student
router.delete('/admin/students/:id', authenticateToken, requirePermission('Manage Students'), async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user.role === 'SUB_ADMIN') {
      const assignment = await dbGet('SELECT 1 FROM student_assignments WHERE student_id = ? AND sub_admin_id = ?', [id, req.user.id]);
      if (!assignment) {
        await logActivity(req.user.name, 'Unauthorized Student Delete Attempt', `Student ID: ${id}`, 'Denied');
        return res.status(403).json({ error: 'Access denied. You are not assigned to this student.' });
      }
    }

    const target = await dbGet('SELECT name, rollNumber FROM students WHERE id = ?', [id]);
    if (!target) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    await dbRun('DELETE FROM students WHERE id = ?', [id]);
    await logActivity(req.user.name, 'Archived Student Record', `Student "${target.name}" (Roll: ${target.rollNumber})`, 'Success');

    return res.json({ message: 'Student record deleted/archived successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to delete student.' });
  }
});

// GET: Admin - fetch counselling history for a student
router.get('/admin/students/:id/counselling', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const canAccess = req.user.role === 'SUPER_ADMIN' || 
                    req.user.permissionsList.includes('View Counselling') || 
                    req.user.permissionsList.includes('Manage Counselling');
  if (!canAccess) {
    return res.status(403).json({ error: 'Permission denied. Requires view counselling permission.' });
  }

  try {
    if (req.user.role === 'SUB_ADMIN') {
      const assignment = await dbGet('SELECT 1 FROM student_assignments WHERE student_id = ? AND sub_admin_id = ?', [id, req.user.id]);
      if (!assignment) {
        await logActivity(req.user.name, 'Unauthorized Counselling Access Attempt', `Student ID: ${id}`, 'Denied');
        return res.status(403).json({ error: 'Access denied. You are not assigned to this student.' });
      }
    }

    const history = await dbQuery('SELECT * FROM counselling_sessions WHERE student_id = ? ORDER BY counselling_date DESC, id DESC', [id]);
    return res.json(history);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch student counselling history.' });
  }
});

// POST: Admin - add a new dated counselling session (can be added multiple times without overwriting)
router.post('/admin/students/:id/counselling', authenticateToken, requirePermission('Manage Counselling'), async (req, res) => {
  const { id } = req.params;
  const { counselling_date, type, private_notes, student_concerns, guidance, action_items, follow_up_date, follow_up_required, status } = req.body;

  if (!counselling_date || !type || !private_notes) {
    return res.status(400).json({ error: 'Counselling Date, Counselling Category, and Discussion Notes are required.' });
  }

  try {
    if (req.user.role === 'SUB_ADMIN') {
      const assignment = await dbGet('SELECT 1 FROM student_assignments WHERE student_id = ? AND sub_admin_id = ?', [id, req.user.id]);
      if (!assignment) {
        await logActivity(req.user.name, 'Unauthorized Session Creation Attempt', `Student ID: ${id}`, 'Denied');
        return res.status(403).json({ error: 'Access denied. You are not assigned to this student.' });
      }
    }

    const student = await dbGet('SELECT name, rollNumber FROM students WHERE id = ?', [id]);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    const counsellorId = req.user.id;
    const counsellorName = req.user.name;

    await dbRun(
      `INSERT INTO counselling_sessions (
        student_id, counsellor_id, counsellor_name, counselling_date, type, private_notes,
        student_concerns, guidance, action_items, follow_up_date, follow_up_required, status,
        publish_to_home, allow_student_name_public, public_title, public_summary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, '', '')`,
      [
        id, counsellorId, counsellorName, counselling_date, type, private_notes,
        student_concerns || '', guidance || '', action_items || '', follow_up_date || '',
        follow_up_required || 'No', status || 'Completed'
      ]
    );

    await logActivity(req.user.name, 'Created Counselling Record', `Student: ${student.rollNumber}`, 'Success');

    return res.status(201).json({ message: 'Counselling session recorded successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to record counselling session.' });
  }
});

// PUT: Admin - edit a counselling session
router.put('/admin/counselling/:sessionId', authenticateToken, requirePermission('Manage Counselling'), async (req, res) => {
  const { sessionId } = req.params;
  const { counselling_date, type, private_notes, student_concerns, guidance, action_items, follow_up_date, follow_up_required, status } = req.body;

  if (!counselling_date || !type || !private_notes) {
    return res.status(400).json({ error: 'Counselling Date, Counselling Category, and Discussion Notes are required.' });
  }

  try {
    const session = await dbGet('SELECT student_id FROM counselling_sessions WHERE id = ?', [sessionId]);
    if (!session) {
      return res.status(404).json({ error: 'Counselling session not found.' });
    }

    if (req.user.role === 'SUB_ADMIN') {
      const assignment = await dbGet('SELECT 1 FROM student_assignments WHERE student_id = ? AND sub_admin_id = ?', [session.student_id, req.user.id]);
      if (!assignment) {
        await logActivity(req.user.name, 'Unauthorized Session Edit Attempt', `Session ID: ${sessionId}`, 'Denied');
        return res.status(403).json({ error: 'Access denied. You are not assigned to this student.' });
      }
    }

    const student = await dbGet('SELECT rollNumber FROM students WHERE id = ?', [session.student_id]);

    await dbRun(
      `UPDATE counselling_sessions SET 
        counselling_date = ?, type = ?, private_notes = ?, student_concerns = ?, guidance = ?,
        action_items = ?, follow_up_date = ?, follow_up_required = ?, status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        counselling_date, type, private_notes, student_concerns || '', guidance || '',
        action_items || '', follow_up_date || '', follow_up_required || 'No', status || 'Completed',
        sessionId
      ]
    );

    await logActivity(req.user.name, 'Updated Counselling Record', `Student: ${student?.rollNumber || session.student_id}`, 'Success');
    return res.json({ message: 'Counselling record updated successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update counselling session.' });
  }
});

// DELETE: Admin - delete a counselling session
router.delete('/admin/counselling/:sessionId', authenticateToken, requirePermission('Manage Counselling'), async (req, res) => {
  const { sessionId } = req.params;
  try {
    const session = await dbGet('SELECT student_id FROM counselling_sessions WHERE id = ?', [sessionId]);
    if (!session) {
      return res.status(404).json({ error: 'Counselling session not found.' });
    }

    if (req.user.role === 'SUB_ADMIN') {
      const assignment = await dbGet('SELECT 1 FROM student_assignments WHERE student_id = ? AND sub_admin_id = ?', [session.student_id, req.user.id]);
      if (!assignment) {
        await logActivity(req.user.name, 'Unauthorized Session Delete Attempt', `Session ID: ${sessionId}`, 'Denied');
        return res.status(403).json({ error: 'Access denied. You are not assigned to this student.' });
      }
    }

    const student = await dbGet('SELECT rollNumber FROM students WHERE id = ?', [session.student_id]);

    await dbRun('DELETE FROM counselling_sessions WHERE id = ?', [sessionId]);
    await logActivity(req.user.name, 'Deleted Counselling Record', `Student: ${student?.rollNumber || session.student_id}`, 'Success');

    return res.json({ message: 'Counselling record deleted successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to delete counselling session.' });
  }
});

// GET: Admin - list sub-admin student counts and assignments
router.get('/admin/assignments', authenticateToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const subAdmins = await dbQuery("SELECT id, name, email, username, status FROM users WHERE role = 'SUB_ADMIN'");
    const result = [];
    for (const sa of subAdmins) {
      const assignedStudents = await dbQuery(`
        SELECT s.id, s.name, s.rollNumber, s.batch, s.section 
        FROM students s 
        JOIN student_assignments sa_rel ON s.id = sa_rel.student_id 
        WHERE sa_rel.sub_admin_id = ?
        ORDER BY s.batch DESC, s.name ASC
      `, [sa.id]);
      result.push({
        ...sa,
        assignedCount: assignedStudents.length,
        students: assignedStudents
      });
    }
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch assignments.' });
  }
});

// GET: Admin - list assigned students for specific sub-admin
router.get('/admin/sub-admins/:id/assignments', authenticateToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  const { id } = req.params;
  try {
    const students = await dbQuery(`
      SELECT s.id, s.name, s.rollNumber, s.batch, s.section 
      FROM students s 
      JOIN student_assignments sa ON s.id = sa.student_id 
      WHERE sa.sub_admin_id = ?
      ORDER BY s.batch DESC, s.name ASC
    `, [id]);
    return res.json(students);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch sub-admin assignments.' });
  }
});

// POST: Admin - assign students to sub-admin
router.post('/admin/assignments', authenticateToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  const { subAdminId, studentIds, forceReassign, reason } = req.body;
  if (!subAdminId || !studentIds || !Array.isArray(studentIds)) {
    return res.status(400).json({ error: 'Sub-Admin ID and a list of Student IDs are required.' });
  }

  try {
    const subAdmin = await dbGet("SELECT id, name FROM users WHERE id = ? AND role = 'SUB_ADMIN'", [subAdminId]);
    if (!subAdmin) {
      return res.status(404).json({ error: 'Sub-Admin not found.' });
    }

    if (!forceReassign) {
      const existing = [];
      for (const sId of studentIds) {
        const assignment = await dbGet(`
          SELECT sa.*, s.name as student_name, s.rollNumber as student_roll, u.name as sub_admin_name
          FROM student_assignments sa
          JOIN students s ON sa.student_id = s.id
          JOIN users u ON sa.sub_admin_id = u.id
          WHERE sa.student_id = ? AND sa.sub_admin_id != ?
        `, [sId, subAdminId]);
        if (assignment) {
          existing.push({
            studentId: sId,
            studentName: assignment.student_name,
            studentRoll: assignment.student_roll,
            currentSubAdminId: assignment.sub_admin_id,
            currentSubAdminName: assignment.sub_admin_name
          });
        }
      }

      if (existing.length > 0) {
        return res.json({ hasConflicts: true, conflicts: existing });
      }
    }

    for (const sId of studentIds) {
      const student = await dbGet("SELECT name, rollNumber FROM students WHERE id = ?", [sId]);
      if (!student) continue;

      const prevAssignment = await dbGet(`
        SELECT sa.*, u.name as sub_admin_name 
        FROM student_assignments sa
        JOIN users u ON sa.sub_admin_id = u.id
        WHERE sa.student_id = ?
      `, [sId]);

      if (prevAssignment) {
        if (prevAssignment.sub_admin_id === parseInt(subAdminId, 10)) {
          continue;
        }

        await dbRun(`
          INSERT INTO assignment_history (
            student_id, student_name, student_roll, prev_sub_admin_id, prev_sub_admin_name,
            new_sub_admin_id, new_sub_admin_name, changed_by, reason
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          sId, student.name, student.rollNumber, prevAssignment.sub_admin_id, prevAssignment.sub_admin_name,
          subAdmin.id, subAdmin.name, req.user.name, reason || 'Reassignment'
        ]);

        await dbRun("DELETE FROM student_assignments WHERE student_id = ?", [sId]);
      } else {
        await dbRun(`
          INSERT INTO assignment_history (
            student_id, student_name, student_roll, prev_sub_admin_id, prev_sub_admin_name,
            new_sub_admin_id, new_sub_admin_name, changed_by, reason
          ) VALUES (?, ?, ?, NULL, NULL, ?, ?, ?, ?)
        `, [
          sId, student.name, student.rollNumber, subAdmin.id, subAdmin.name, req.user.name, reason || 'Initial Assignment'
        ]);
      }

      await dbRun(`
        INSERT INTO student_assignments (student_id, sub_admin_id, assigned_by)
        VALUES (?, ?, ?)
      `, [sId, subAdminId, req.user.name]);
    }

    await logActivity(req.user.name, 'Assigned Students', `Counsellor: ${subAdmin.name}, Students count: ${studentIds.length}`, 'Success');
    return res.status(200).json({ success: true, message: 'Students successfully assigned.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to assign students.' });
  }
});

// DELETE: Admin - remove student assignment
router.delete('/admin/assignments/:studentId', authenticateToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  const { studentId } = req.params;
  try {
    const student = await dbGet("SELECT name, rollNumber FROM students WHERE id = ?", [studentId]);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    const prevAssignment = await dbGet(`
      SELECT sa.*, u.name as sub_admin_name 
      FROM student_assignments sa
      JOIN users u ON sa.sub_admin_id = u.id
      WHERE sa.student_id = ?
    `, [studentId]);

    if (prevAssignment) {
      await dbRun(`
        INSERT INTO assignment_history (
          student_id, student_name, student_roll, prev_sub_admin_id, prev_sub_admin_name,
          new_sub_admin_id, new_sub_admin_name, changed_by, reason
        ) VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, 'Assignment Removed')
      `, [
        studentId, student.name, student.rollNumber, prevAssignment.sub_admin_id, prevAssignment.sub_admin_name,
        req.user.name
      ]);

      await dbRun("DELETE FROM student_assignments WHERE student_id = ?", [studentId]);
      await logActivity(req.user.name, 'Removed Student Assignment', `Student Roll: ${student.rollNumber}`, 'Success');
    }

    return res.json({ success: true, message: 'Student assignment removed.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to remove student assignment.' });
  }
});

// GET: Admin - list assignment history logs
router.get('/api/admin/assignments/history', authenticateToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const history = await dbQuery("SELECT * FROM assignment_history ORDER BY changed_at DESC");
    return res.json(history);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch assignment history.' });
  }
});

export default router;
