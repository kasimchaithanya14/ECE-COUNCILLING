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
      featured: !!r.featured,
      videoUrl: r.videoUrl || undefined
    }));
    return res.json(methods);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch teaching methods.' });
  }
});

router.post('/methods', authenticateToken, requirePermission('Manage Teaching Methods'), async (req, res) => {
  const { id, name, cohort, implementation, expectedOutcome, detailedDescription, category, tags, materialsCount, featured, videoUrl } = req.body;
  if (!id || !name || !category) {
    return res.status(400).json({ error: 'ID, name, and category are required.' });
  }

  const finalVideoUrl = videoUrl && typeof videoUrl === 'string' && videoUrl.trim() ? videoUrl.trim() : null;

  try {
    const tagStr = JSON.stringify(tags || []);
    const featVal = featured ? 1 : 0;
    const cohortVal = cohort || 'Unified Learning Cohort';
    await dbRun(
      'INSERT INTO teaching_methods (id, name, cohort, implementation, expectedOutcome, detailedDescription, category, tags, materialsCount, featured, videoUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, cohortVal, implementation || '', expectedOutcome || '', detailedDescription || '', category, tagStr, materialsCount || 0, featVal, finalVideoUrl]
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
  const { name, cohort, implementation, expectedOutcome, detailedDescription, category, tags, materialsCount, featured, videoUrl } = req.body;
  try {
    const existing = await dbGet('SELECT * FROM teaching_methods WHERE id = ?', [id]);

    const tagStr = JSON.stringify(tags || []);
    const featVal = featured ? 1 : 0;
    const cohortVal = cohort || 'Unified Learning Cohort';

    let finalVideoUrl = existing ? existing.videoUrl : null;
    if (videoUrl !== undefined) {
      finalVideoUrl = videoUrl && typeof videoUrl === 'string' && videoUrl.trim() ? videoUrl.trim() : null;
    }

    if (!existing) {
      await dbRun(
        'INSERT INTO teaching_methods (id, name, cohort, implementation, expectedOutcome, detailedDescription, category, tags, materialsCount, featured, videoUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, name || 'Teaching Method', cohortVal, implementation || '', expectedOutcome || '', detailedDescription || '', category || 'Innovative', tagStr, materialsCount || 0, featVal, finalVideoUrl]
      );
    } else {
      await dbRun(
        'UPDATE teaching_methods SET name = ?, cohort = ?, implementation = ?, expectedOutcome = ?, detailedDescription = ?, category = ?, tags = ?, materialsCount = ?, featured = ?, videoUrl = ? WHERE id = ?',
        [name, cohortVal, implementation, expectedOutcome, detailedDescription, category, tagStr, materialsCount, featVal, finalVideoUrl, id]
      );
    }

    await logActivity(req.user.name, 'Updated Teaching Method', `Method "${name}"`, 'Success');
    return res.json({ message: 'Teaching method updated.', method: { id, name, cohort: cohortVal, implementation, expectedOutcome, detailedDescription, category, tags: tags || [], materialsCount, featured: !!featVal, videoUrl: finalVideoUrl } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update teaching method.' });
  }
});

// Dedicated Admin-Only Route for YouTube Video Management
router.put('/methods/:id/video', authenticateToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { videoUrl } = req.body;
  try {
    const target = await dbGet('SELECT * FROM teaching_methods WHERE id = ?', [id]);
    if (!target) {
      return res.status(404).json({ error: 'Teaching method not found.' });
    }
    const cleanUrl = videoUrl ? videoUrl.trim() : null;
    await dbRun('UPDATE teaching_methods SET videoUrl = ? WHERE id = ?', [cleanUrl, id]);
    await logActivity(req.user.name, 'Updated Video Link', `Method "${target.name}" YouTube link updated by Admin`, 'Success');
    return res.json({ message: 'YouTube video link updated successfully.', videoUrl: cleanUrl });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update video link.' });
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
router.get('/admin/assignments/history', authenticateToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const history = await dbQuery("SELECT * FROM assignment_history ORDER BY changed_at DESC");
    return res.json(history);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch assignment history.' });
  }
});

// =========================================================
// 7. INNOVATIVE TEACHING–LEARNING METHODS WORKFLOW ROUTES
// =========================================================

// --- A. TEACHING TASKS (Super Admin Assigns, Sub Admin Views) ---

// POST: Super Admin creates/assigns a new task (Single, Selective, or All Sub-Admins)
router.post('/teaching-tasks', authenticateToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  const { sub_admin_id, sub_admin_ids, assign_all, topic, description, department, date, time, no_of_faculty } = req.body;

  if (!topic || !date || !time) {
    return res.status(400).json({ error: 'Topic Name, Target Date, and Target Time are required.' });
  }

  try {
    let targetSubAdminIds = [];

    if (assign_all === true || sub_admin_ids === 'all' || sub_admin_id === 'all') {
      const allSubAdmins = await dbQuery("SELECT id, name, email FROM users WHERE role = 'SUB_ADMIN' AND status = 'Active'");
      if (!allSubAdmins || allSubAdmins.length === 0) {
        return res.status(400).json({ error: 'No active Sub-Admins found to assign.' });
      }
      targetSubAdminIds = allSubAdmins.map(u => u.id);
    } else if (Array.isArray(sub_admin_ids) && sub_admin_ids.length > 0) {
      targetSubAdminIds = sub_admin_ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    } else if (sub_admin_id) {
      const singleId = parseInt(sub_admin_id, 10);
      if (!isNaN(singleId)) {
        targetSubAdminIds = [singleId];
      }
    }

    if (targetSubAdminIds.length === 0) {
      return res.status(400).json({ error: 'Please select at least one Sub-Admin (Faculty Coordinator).' });
    }

    const facultyCount = Math.max(1, parseInt(no_of_faculty, 10) || 1);
    const dept = department || 'ECE';

    const createdTasks = [];
    const assignedNames = [];

    for (const sId of targetSubAdminIds) {
      const subAdmin = await dbGet('SELECT id, name, email FROM users WHERE id = ?', [sId]);
      if (subAdmin) {
        const result = await dbRun(
          `INSERT INTO teaching_tasks (
            super_admin_id, sub_admin_id, topic, description, department, date, time, no_of_faculty, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
          [req.user.id, sId, topic, description || '', dept, date, time, facultyCount]
        );
        createdTasks.push(result.id);
        assignedNames.push(subAdmin.name);
      }
    }

    if (createdTasks.length === 0) {
      return res.status(404).json({ error: 'Selected Sub-Admins could not be found.' });
    }

    await logActivity(
      req.user.name,
      'Assigned Teaching Task',
      `Assigned "${topic}" to ${assignedNames.length} Sub-Admin(s): ${assignedNames.join(', ')} (${dept})`,
      'Success'
    );

    return res.status(201).json({
      message: assignedNames.length === 1
        ? `Task successfully assigned to ${assignedNames[0]}.`
        : `Task successfully assigned to ${assignedNames.length} Faculty Coordinators (${assignedNames.join(', ')}).`,
      ids: createdTasks,
      id: createdTasks[0],
      count: createdTasks.length
    });
  } catch (error) {
    console.error('Error creating teaching task:', error);
    return res.status(500).json({ error: 'Failed to create and assign teaching task.' });
  }
});

// GET: List teaching tasks (Super Admin sees all; Sub Admin sees their assigned tasks)
router.get('/teaching-tasks', authenticateToken, async (req, res) => {
  try {
    let rows;
    if (req.user.role === 'SUPER_ADMIN') {
      rows = await dbQuery(`
        SELECT 
          tt.*,
          u.name AS sub_admin_name,
          u.email AS sub_admin_email,
          u.username AS sub_admin_username,
          su.name AS super_admin_name,
          ts.id AS submission_id,
          ts.date AS submission_date,
          ts.time AS submission_time,
          ts.file_path AS submission_file_path,
          ts.file_name AS submission_file_name,
          ts.file_size AS submission_file_size,
          ts.file_type AS submission_file_type,
          ts.description AS submission_description,
          ts.status AS submission_status,
          ts.feedback AS submission_feedback,
          ts.created_at AS submitted_at,
          ts.approved_at AS submission_approved_at,
          (SELECT COUNT(*) FROM teaching_submissions WHERE task_id = tt.id) AS submissions_count,
          (SELECT id FROM teaching_submissions WHERE task_id = tt.id ORDER BY id DESC LIMIT 1) AS latest_submission_id
        FROM teaching_tasks tt
        LEFT JOIN users u ON tt.sub_admin_id = u.id
        LEFT JOIN users su ON tt.super_admin_id = su.id
        LEFT JOIN (
          SELECT ts1.*
          FROM teaching_submissions ts1
          INNER JOIN (
            SELECT task_id, MAX(id) AS max_id
            FROM teaching_submissions
            WHERE task_id IS NOT NULL
            GROUP BY task_id
          ) ts2 ON ts1.id = ts2.max_id
        ) ts ON tt.id = ts.task_id
        ORDER BY tt.created_at DESC
      `);
    } else {
      rows = await dbQuery(`
        SELECT 
          tt.*,
          u.name AS sub_admin_name,
          u.email AS sub_admin_email,
          u.username AS sub_admin_username,
          su.name AS super_admin_name,
          ts.id AS submission_id,
          ts.date AS submission_date,
          ts.time AS submission_time,
          ts.file_path AS submission_file_path,
          ts.file_name AS submission_file_name,
          ts.file_size AS submission_file_size,
          ts.file_type AS submission_file_type,
          ts.description AS submission_description,
          ts.status AS submission_status,
          ts.feedback AS submission_feedback,
          ts.created_at AS submitted_at,
          ts.approved_at AS submission_approved_at,
          (SELECT COUNT(*) FROM teaching_submissions WHERE task_id = tt.id AND sub_admin_id = ?) AS submissions_count,
          (SELECT id FROM teaching_submissions WHERE task_id = tt.id AND sub_admin_id = ? ORDER BY id DESC LIMIT 1) AS latest_submission_id
        FROM teaching_tasks tt
        LEFT JOIN users u ON tt.sub_admin_id = u.id
        LEFT JOIN users su ON tt.super_admin_id = su.id
        LEFT JOIN (
          SELECT ts1.*
          FROM teaching_submissions ts1
          INNER JOIN (
            SELECT task_id, MAX(id) AS max_id
            FROM teaching_submissions
            WHERE task_id IS NOT NULL
            GROUP BY task_id
          ) ts2 ON ts1.id = ts2.max_id
        ) ts ON tt.id = ts.task_id
        WHERE tt.sub_admin_id = ?
        ORDER BY tt.created_at DESC
      `, [req.user.id, req.user.id, req.user.id]);
    }
    return res.json(rows);
  } catch (error) {
    console.error('Error fetching teaching tasks:', error);
    return res.status(500).json({ error: 'Failed to fetch teaching tasks.' });
  }
});

// PUT: Super Admin edits a task
router.put('/teaching-tasks/:id', authenticateToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { sub_admin_id, topic, description, department, date, time, no_of_faculty, status } = req.body;

  try {
    const task = await dbGet('SELECT * FROM teaching_tasks WHERE id = ?', [id]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const facultyCount = Math.max(1, parseInt(no_of_faculty, 10) || task.no_of_faculty);
    const assignedSubAdmin = sub_admin_id || task.sub_admin_id;

    await dbRun(
      `UPDATE teaching_tasks SET 
        sub_admin_id = ?, topic = ?, description = ?, department = ?, date = ?, time = ?, no_of_faculty = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        assignedSubAdmin,
        topic || task.topic,
        description !== undefined ? description : task.description,
        department || task.department,
        date || task.date,
        time || task.time,
        facultyCount,
        status || task.status,
        id
      ]
    );

    await logActivity(req.user.name, 'Updated Teaching Task', `Task "${topic || task.topic}" (ID: ${id})`, 'Success');
    return res.json({ message: 'Teaching task updated successfully.' });
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ error: 'Failed to update teaching task.' });
  }
});

// DELETE: Super Admin deletes a task
router.delete('/teaching-tasks/:id', authenticateToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  const { id } = req.params;
  try {
    const task = await dbGet('SELECT topic FROM teaching_tasks WHERE id = ?', [id]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    await dbRun('DELETE FROM teaching_tasks WHERE id = ?', [id]);
    await logActivity(req.user.name, 'Deleted Teaching Task', `Task "${task.topic}"`, 'Success');

    return res.json({ message: 'Teaching task deleted successfully.' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({ error: 'Failed to delete task.' });
  }
});

// --- B. TEACHING SUBMISSIONS (Sub Admin Submits, Super Admin Tracks & Approves) ---

// POST: Sub Admin submits their work with uploaded file
router.post('/teaching-submissions', authenticateToken, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `File upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { task_id, topic, date, time, no_of_faculty, department, description } = req.body;
    const file = req.file;

    if (!topic || !description || !file) {
      if (file) {
        fs.unlink(file.path, () => {});
      }
      return res.status(400).json({ error: 'Topic name, method details/description, and an uploaded file are required.' });
    }

    try {
      const now = new Date();
      const subDate = date || now.toISOString().split('T')[0];
      const subTime = time || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const facultyCount = Math.max(1, parseInt(no_of_faculty, 10) || 1);
      const dept = department || 'ECE';
      const filePath = `/uploads/${file.filename}`;

      let superAdminId = 1;
      let linkedTaskId = null;

      if (task_id && task_id !== 'none') {
        const task = await dbGet('SELECT * FROM teaching_tasks WHERE id = ?', [task_id]);
        if (task) {
          linkedTaskId = task.id;
          superAdminId = task.super_admin_id || 1;
          // Automatically mark task status as Submitted
          await dbRun("UPDATE teaching_tasks SET status = 'Submitted', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [task.id]);
        }
      } else {
        const superAdminUser = await dbGet("SELECT id FROM users WHERE role = 'SUPER_ADMIN' LIMIT 1");
        if (superAdminUser) {
          superAdminId = superAdminUser.id;
        }
      }

      const result = await dbRun(
        `INSERT INTO teaching_submissions (
          task_id, super_admin_id, sub_admin_id, topic, date, time, no_of_faculty, department,
          description, file_path, file_name, file_type, file_size, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted')`,
        [
          linkedTaskId,
          superAdminId,
          req.user.id,
          topic,
          subDate,
          subTime,
          facultyCount,
          dept,
          description,
          filePath,
          file.originalname,
          file.mimetype,
          file.size
        ]
      );

      await logActivity(
        req.user.name,
        'Submitted Innovative Method',
        `Topic: "${topic}" (Faculty: ${facultyCount}, File: ${file.originalname})`,
        'Submitted'
      );

      return res.status(201).json({
        message: 'Innovative Teaching–Learning Method submitted successfully and sent for Super Admin review!',
        id: result.id
      });
    } catch (error) {
      console.error('Error recording teaching submission:', error);
      if (file) {
        fs.unlink(file.path, () => {});
      }
      return res.status(500).json({ error: 'Failed to record teaching submission.' });
    }
  });
});

// GET: List submissions (Super Admin views all; Sub Admin views only their own submissions)
router.get('/teaching-submissions', authenticateToken, async (req, res) => {
  try {
    let rows;
    if (req.user.role === 'SUPER_ADMIN') {
      rows = await dbQuery(`
        SELECT 
          ts.*,
          u.name AS sub_admin_name,
          u.email AS sub_admin_email,
          u.username AS sub_admin_username,
          tt.topic AS task_topic,
          tt.status AS task_status
        FROM teaching_submissions ts
        LEFT JOIN users u ON ts.sub_admin_id = u.id
        LEFT JOIN teaching_tasks tt ON ts.task_id = tt.id
        ORDER BY ts.created_at DESC
      `);
    } else {
      rows = await dbQuery(`
        SELECT 
          ts.*,
          u.name AS sub_admin_name,
          u.email AS sub_admin_email,
          u.username AS sub_admin_username,
          tt.topic AS task_topic,
          tt.status AS task_status
        FROM teaching_submissions ts
        LEFT JOIN users u ON ts.sub_admin_id = u.id
        LEFT JOIN teaching_tasks tt ON ts.task_id = tt.id
        WHERE ts.sub_admin_id = ?
        ORDER BY ts.created_at DESC
      `, [req.user.id]);
    }
    return res.json(rows);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return res.status(500).json({ error: 'Failed to fetch submissions.' });
  }
});

// GET: Super Admin Tracking Table Data (Returns all 8 required columns + metadata)
router.get('/teaching-submissions/tracking', authenticateToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    // 1. Fetch all assigned tasks and submissions combined
    const submissions = await dbQuery(`
      SELECT 
        ts.id,
        ts.task_id,
        ts.date,
        ts.time,
        ts.topic,
        ts.no_of_faculty,
        ts.department,
        ts.description,
        ts.file_path,
        ts.file_name,
        ts.file_type,
        ts.file_size,
        ts.status,
        ts.feedback,
        ts.created_at,
        ts.approved_at,
        u.name AS sub_admin_name,
        u.email AS sub_admin_email,
        u.username AS sub_admin_username
      FROM teaching_submissions ts
      LEFT JOIN users u ON ts.sub_admin_id = u.id
      ORDER BY ts.created_at DESC
    `);

    // 2. Format with 1-based Serial Number (S.No)
    const formattedTrackingList = submissions.map((sub, index) => ({
      s_no: index + 1,
      id: sub.id,
      task_id: sub.task_id,
      date: sub.date,
      time: sub.time,
      topic: sub.topic,
      no_of_faculty: sub.no_of_faculty,
      sub_admin_name: sub.sub_admin_name || 'Sub Admin',
      department: sub.department || 'ECE',
      sub_admin_display: `${sub.sub_admin_name || 'Sub Admin'} (${sub.department || 'ECE'})`,
      status: sub.status,
      description: sub.description,
      file_path: sub.file_path,
      file_name: sub.file_name,
      file_type: sub.file_type,
      file_size: sub.file_size,
      feedback: sub.feedback,
      created_at: sub.created_at,
      approved_at: sub.approved_at
    }));

    return res.json(formattedTrackingList);
  } catch (error) {
    console.error('Error fetching tracking submissions:', error);
    return res.status(500).json({ error: 'Failed to fetch tracking data.' });
  }
});

// POST: Super Admin Approves a submission
router.post('/teaching-submissions/:id/approve', authenticateToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { feedback } = req.body;

  try {
    const sub = await dbGet(`
      SELECT ts.*, u.name AS sub_admin_name 
      FROM teaching_submissions ts 
      LEFT JOIN users u ON ts.sub_admin_id = u.id 
      WHERE ts.id = ?
    `, [id]);

    if (!sub) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Update submission status to Approved
    await dbRun(
      'UPDATE teaching_submissions SET status = ?, feedback = ?, approved_at = ? WHERE id = ?',
      ['Approved', feedback || 'Approved for Public Showcase', nowStr, id]
    );

    // If associated with a task, also mark the task as Approved
    if (sub.task_id) {
      await dbRun(
        "UPDATE teaching_tasks SET status = 'Approved', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [sub.task_id]
      );
    }

    await logActivity(
      req.user.name,
      'Approved Innovative Teaching Method',
      `Topic: "${sub.topic}" by Sub-Admin "${sub.sub_admin_name}"`,
      'Approved'
    );

    return res.json({
      message: `"${sub.topic}" has been approved and published to the public showcase!`,
      approved_at: nowStr
    });
  } catch (error) {
    console.error('Error approving submission:', error);
    return res.status(500).json({ error: 'Failed to approve submission.' });
  }
});

// POST: Super Admin Rejects a submission
router.post('/teaching-submissions/:id/reject', authenticateToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { feedback } = req.body;

  try {
    const sub = await dbGet(`
      SELECT ts.*, u.name AS sub_admin_name 
      FROM teaching_submissions ts 
      LEFT JOIN users u ON ts.sub_admin_id = u.id 
      WHERE ts.id = ?
    `, [id]);

    if (!sub) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    await dbRun(
      'UPDATE teaching_submissions SET status = ?, feedback = ? WHERE id = ?',
      ['Rejected', feedback || 'Requires revision and re-submission.', id]
    );

    if (sub.task_id) {
      await dbRun(
        "UPDATE teaching_tasks SET status = 'Pending', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [sub.task_id]
      );
    }

    await logActivity(
      req.user.name,
      'Rejected Innovative Teaching Method',
      `Topic: "${sub.topic}" by Sub-Admin "${sub.sub_admin_name}"`,
      'Rejected'
    );

    return res.json({ message: 'Submission rejected and feedback recorded.' });
  } catch (error) {
    console.error('Error rejecting submission:', error);
    return res.status(500).json({ error: 'Failed to reject submission.' });
  }
});

// DELETE: Super Admin deletes a submission
router.delete('/teaching-submissions/:id', authenticateToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  const { id } = req.params;
  try {
    const sub = await dbGet('SELECT * FROM teaching_submissions WHERE id = ?', [id]);
    if (!sub) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    await dbRun('DELETE FROM teaching_submissions WHERE id = ?', [id]);

    // Unlink physical file
    if (sub.file_path) {
      const fileName = path.basename(sub.file_path);
      const localFilePath = path.join(uploadsDir, fileName);
      fs.unlink(localFilePath, (err) => {
        if (err) console.warn('Failed to delete submission file from disk:', err);
      });
    }

    await logActivity(req.user.name, 'Deleted Submission Record', `Topic: "${sub.topic}"`, 'Success');

    return res.json({ message: 'Submission permanently deleted.' });
  } catch (error) {
    console.error('Error deleting submission:', error);
    return res.status(500).json({ error: 'Failed to delete submission.' });
  }
});

// --- C. PUBLIC MAIN PAGE SHOWCASE (Accessible to all visitors) ---

// GET: Public list of all uploaded Innovative Teaching-Learning Methods (visible to all on main page)
router.get('/teaching-submissions/showcase', async (req, res) => {
  try {
    const showcaseMethods = await dbQuery(`
      SELECT 
        ts.id,
        ts.topic,
        ts.date,
        ts.time,
        ts.no_of_faculty,
        ts.department,
        ts.description,
        ts.file_path,
        ts.file_name,
        ts.file_type,
        ts.file_size,
        ts.status,
        ts.approved_at,
        ts.created_at,
        u.name AS faculty_lead_name,
        u.email AS faculty_lead_email,
        u.username AS faculty_lead_username
      FROM teaching_submissions ts
      LEFT JOIN users u ON ts.sub_admin_id = u.id
      WHERE ts.status IN ('Approved', 'Submitted')
      ORDER BY CASE WHEN ts.status = 'Approved' THEN 0 ELSE 1 END, ts.id DESC
    `);

    return res.json(showcaseMethods);
  } catch (error) {
    console.error('Error fetching public showcase:', error);
    return res.status(500).json({ error: 'Failed to load innovative methods showcase.' });
  }
});

// GET: Public list of all assigned teaching tasks with live sub-admin completion status (visible to all on main page)
router.get('/teaching-tasks/public', async (req, res) => {
  try {
    const tasks = await dbQuery(`
      SELECT 
        tt.id,
        tt.topic,
        tt.description,
        tt.department,
        tt.date,
        tt.time,
        tt.no_of_faculty,
        tt.status,
        tt.created_at,
        tt.updated_at,
        u.name AS sub_admin_name,
        u.email AS sub_admin_email,
        u.username AS sub_admin_username,
        su.name AS super_admin_name,
        ts.id AS submission_id,
        ts.date AS submission_date,
        ts.time AS submission_time,
        ts.file_path AS submission_file_path,
        ts.file_name AS submission_file_name,
        ts.file_size AS submission_file_size,
        ts.file_type AS submission_file_type,
        ts.description AS submission_description,
        ts.status AS submission_status,
        ts.feedback AS submission_feedback,
        ts.created_at AS submitted_at,
        ts.approved_at AS submission_approved_at
      FROM teaching_tasks tt
      LEFT JOIN users u ON tt.sub_admin_id = u.id
      LEFT JOIN users su ON tt.super_admin_id = su.id
      LEFT JOIN (
        SELECT ts1.*
        FROM teaching_submissions ts1
        INNER JOIN (
          SELECT task_id, MAX(id) AS max_id
          FROM teaching_submissions
          WHERE task_id IS NOT NULL
          GROUP BY task_id
        ) ts2 ON ts1.id = ts2.max_id
      ) ts ON tt.id = ts.task_id
      ORDER BY 
        CASE 
          WHEN tt.status = 'Approved' OR ts.status = 'Approved' THEN 1
          WHEN tt.status = 'Submitted' OR ts.status = 'Submitted' THEN 2
          ELSE 3
        END,
        tt.id DESC
    `);

    return res.json(tasks);
  } catch (error) {
    console.error('Error fetching public teaching tasks:', error);
    return res.status(500).json({ error: 'Failed to load public teaching tasks.' });
  }
});

export default router;

