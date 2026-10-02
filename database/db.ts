import crypto from 'node:crypto';
import {
  User,
  Admin,
  Task,
  TaskComment,
  TaskClaim,
  SimulatedSubmission,
  Wallet,
  WalletTransaction,
  WithdrawalRequest,
  AuditLog,
  AppNotification,
  UserFinancialStats,
  AdminDashboardStats,
  WithdrawalStatus,
  TransactionType
} from '../shared/types.ts';

// Password Security Utility using Node.js crypto
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  if (!combinedHash || !combinedHash.includes(':')) return false;
  const [salt, originalHash] = combinedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

// In-Memory Database Store with Persistent Mock Fallback & Atomic Locking
class DatabaseStore {
  private users: Map<string, User & { password_hash: string }> = new Map();
  private admins: Map<string, Admin & { password_hash: string }> = new Map();
  private tasks: Map<string, Task> = new Map();
  private comments: Map<string, TaskComment> = new Map();
  private claims: Map<string, TaskClaim> = new Map();
  private submissions: Map<string, SimulatedSubmission> = new Map();
  private wallets: Map<string, Wallet> = new Map();
  private transactions: Map<string, WalletTransaction> = new Map();
  private withdrawals: Map<string, WithdrawalRequest> = new Map();
  private auditLogs: AuditLog[] = [];
  private notifications: AppNotification[] = [];
  
  // OTP Storage: key = whatsapp_number
  private otps: Map<string, {
    code: string;
    purpose: string;
    expiresAt: number;
    resendAvailableAt: number;
    attempts: number;
    verified?: boolean;
    verifiedAt?: number;
  }> = new Map();

  // Concurrency Mutex for Atomic Claiming
  private claimMutex: Promise<void> = Promise.resolve();

  // WhatsApp Gateway Configuration (supports Meta WhatsApp Cloud API / Simulation / Custom Webhook)
  private whatsappConfig = {
    provider: (process.env.WHATSAPP_PROVIDER || 'simulation') as 'meta_cloud' | 'simulation' | 'custom_webhook',
    meta_token: process.env.WHATSAPP_TOKEN || '',
    meta_phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    webhook_url: process.env.WHATSAPP_WEBHOOK_URL || '',
    enabled: process.env.WHATSAPP_ENABLED === 'true'
  };

  public getWhatsappConfig() {
    return {
      provider: this.whatsappConfig.provider,
      meta_phone_number_id: this.whatsappConfig.meta_phone_number_id,
      has_token: !!this.whatsappConfig.meta_token,
      webhook_url: this.whatsappConfig.webhook_url,
      enabled: this.whatsappConfig.enabled
    };
  }

  public getRawWhatsappConfig() {
    return this.whatsappConfig;
  }

  public updateWhatsappConfig(config: {
    provider?: 'meta_cloud' | 'simulation' | 'custom_webhook';
    meta_token?: string;
    meta_phone_number_id?: string;
    webhook_url?: string;
    enabled?: boolean;
  }) {
    if (config.provider !== undefined) this.whatsappConfig.provider = config.provider;
    if (config.meta_token !== undefined) this.whatsappConfig.meta_token = config.meta_token;
    if (config.meta_phone_number_id !== undefined) this.whatsappConfig.meta_phone_number_id = config.meta_phone_number_id;
    if (config.webhook_url !== undefined) this.whatsappConfig.webhook_url = config.webhook_url;
    if (config.enabled !== undefined) this.whatsappConfig.enabled = config.enabled;
    return this.getWhatsappConfig();
  }

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Master Admin: Ritam / Ritam@1234
    const adminId = 'a1000000-0000-0000-0000-000000000001';
    this.admins.set(adminId, {
      id: adminId,
      username: 'Ritam',
      name: 'Ritam Administrator',
      role: 'superadmin',
      password_hash: hashPassword('Ritam@1234'),
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    });

    // 2. Demo accounts removed as requested by user. Clean state for production & registration.

    // 3. Demo Task: ABC Business Educational Simulation
    const taskId = 't1000000-0000-0000-0000-000000000001';
    this.tasks.set(taskId, {
      id: taskId,
      name: 'ABC Business Educational Simulation',
      mock_business_name: 'ABC Enterprises (Agartala)',
      mock_location: 'Agartala, Tripura',
      mock_map_link: `/mock-map/${taskId}`,
      description: 'Educational simulation module to evaluate customer service responses, store cleanliness, and billing accuracy in a mock retail environment.',
      total_slots: 3,
      claimed_slots: 0,
      completed_slots: 0,
      payment_per_completion: 10,
      start_date: '2026-09-01',
      end_date: '2026-10-31',
      status: 'active',
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    });

    // 3 Sample Comments (Strictly ONE comment per user)
    const comment1Id = 'c1000000-0000-0000-0000-000000000001';
    const comment2Id = 'c1000000-0000-0000-0000-000000000002';
    const comment3Id = 'c1000000-0000-0000-0000-000000000003';

    this.comments.set(comment1Id, {
      id: comment1Id,
      task_id: taskId,
      comment_text: 'Sample 1: Exceptional customer guidance at the Agartala outlet. Staff explained product specifications clearly and the checkout was swift.',
      status: 'AVAILABLE',
      created_at: new Date().toISOString()
    });

    this.comments.set(comment2Id, {
      id: comment2Id,
      task_id: taskId,
      comment_text: 'Sample 2: Well-structured display counters with clear price tags. Friendly team members who promptly assisted with testing the equipment.',
      status: 'AVAILABLE',
      created_at: new Date().toISOString()
    });

    this.comments.set(comment3Id, {
      id: comment3Id,
      task_id: taskId,
      comment_text: 'Sample 3: Clean ambience, good parking arrangement, and genuine warranty documentation. A great simulated benchmark for local retail service.',
      status: 'AVAILABLE',
      created_at: new Date().toISOString()
    });

    // Add another educational simulation task for rich experience
    const task2Id = 't2000000-0000-0000-0000-000000000002';
    this.tasks.set(task2Id, {
      id: task2Id,
      name: 'NorthEast Tech Hub Simulation',
      mock_business_name: 'Highland Digital Works',
      mock_location: 'Shillong, Meghalaya',
      mock_map_link: `/mock-map/${task2Id}`,
      description: 'Educational exercise on digital agency review quality analysis, evaluating turn-around response and creative portfolios.',
      total_slots: 2,
      claimed_slots: 0,
      completed_slots: 0,
      payment_per_completion: 15,
      start_date: '2026-09-10',
      end_date: '2026-11-15',
      status: 'active',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    });

    this.comments.set('c2000000-0000-0000-0000-000000000001', {
      id: 'c2000000-0000-0000-0000-000000000001',
      task_id: task2Id,
      comment_text: 'Sample A: Impressive turn-around time on digital consultation requests. Very professional communication throughout.',
      status: 'AVAILABLE',
      created_at: new Date().toISOString()
    });

    this.comments.set('c2000000-0000-0000-0000-000000000002', {
      id: 'c2000000-0000-0000-0000-000000000002',
      task_id: task2Id,
      comment_text: 'Sample B: Creative presentation deck and transparent deliverables schedule. Highly structured educational showcase.',
      status: 'AVAILABLE',
      created_at: new Date().toISOString()
    });

    // Initial audit log
    this.auditLogs.push({
      id: 'audit-init-001',
      admin_id: adminId,
      admin_username: 'Ritam',
      action: 'SYSTEM_INIT',
      target_type: 'SYSTEM',
      target_id: 'SYSTEM',
      description: 'Educational Simulation Platform initialized with default security schemas and seed tasks.',
      created_at: new Date().toISOString()
    });
  }

  // --- MUTEX RUNNER FOR ATOMIC OPERATIONS ---
  private async withMutex<T>(operation: () => Promise<T> | T): Promise<T> {
    const prev = this.claimMutex;
    let unlock: () => void = () => {};
    this.claimMutex = new Promise(resolve => {
      unlock = resolve;
    });
    try {
      await prev;
      return await operation();
    } finally {
      unlock();
    }
  }

  // ==========================================
  // OTP MANAGEMENT
  // ==========================================
  public generateOtp(whatsapp: string, purpose: 'registration' | 'password_reset' | 'login' | 'withdrawal'): { code: string; cooldownSeconds: number } {
    const cleanNumber = String(whatsapp).replace(/\D/g, '');
    const existing = this.otps.get(cleanNumber);
    const now = Date.now();

    if (existing && existing.resendAvailableAt > now) {
      const waitSec = Math.ceil((existing.resendAvailableAt - now) / 1000);
      throw new Error(`Please wait ${waitSec}s before requesting a new OTP.`);
    }

    // In Mock Mode, provide 123456 as default demonstration code; support configurable environment
    const code = process.env.MOCK_OTP_MODE !== 'false' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    
    this.otps.set(cleanNumber, {
      code,
      purpose,
      expiresAt: now + 5 * 60 * 1000, // 5 minutes validity
      resendAvailableAt: now + 60 * 1000, // 60s cooldown
      attempts: 0,
      verified: false
    });

    return { code, cooldownSeconds: 60 };
  }

  public verifyOtp(
    whatsapp: string,
    code: string,
    purpose: 'registration' | 'password_reset' | 'login' | 'withdrawal',
    keepVerifiedStatus = false
  ): boolean {
    const cleanNumber = String(whatsapp).replace(/\D/g, '');
    const record = this.otps.get(cleanNumber);
    if (!record) {
      throw new Error('No active OTP found for this WhatsApp number. Please click "Send OTP" to receive a verification code.');
    }

    if (record.purpose !== purpose) {
      throw new Error(`OTP purpose mismatch (expected ${purpose}, received ${record.purpose}).`);
    }

    const now = Date.now();
    if (now > record.expiresAt) {
      this.otps.delete(cleanNumber);
      throw new Error('OTP has expired. Please request a fresh verification code.');
    }

    record.attempts += 1;
    if (record.attempts > 5) {
      this.otps.delete(cleanNumber);
      throw new Error('Maximum OTP verification attempts (5) exceeded. Please request a fresh OTP.');
    }

    if (record.code !== String(code).trim()) {
      throw new Error(`Invalid OTP code. Attempt ${record.attempts} of 5.`);
    }

    if (keepVerifiedStatus) {
      // Mark as verified so subsequent actions (like register completion) know it was verified
      record.verified = true;
      record.verifiedAt = Date.now();
    } else {
      // Single use: remove after successful verification
      this.otps.delete(cleanNumber);
    }
    return true;
  }

  public isOtpPreVerified(whatsapp: string, purpose: 'registration' | 'password_reset' | 'login' | 'withdrawal'): boolean {
    const cleanNumber = String(whatsapp).replace(/\D/g, '');
    const record = this.otps.get(cleanNumber);
    if (!record) return false;
    if (record.purpose !== purpose) return false;
    if (!record.verified) return false;
    // Must be verified within last 15 minutes
    if (!record.verifiedAt || Date.now() - record.verifiedAt > 15 * 60 * 1000) {
      this.otps.delete(cleanNumber);
      return false;
    }
    return true;
  }

  public consumePreVerifiedOtp(whatsapp: string, purpose: 'registration' | 'password_reset' | 'login' | 'withdrawal'): void {
    const cleanNumber = String(whatsapp).replace(/\D/g, '');
    const record = this.otps.get(cleanNumber);
    if (record && record.purpose === purpose) {
      this.otps.delete(cleanNumber);
    }
  }

  public getUserByWhatsApp(whatsapp: string): (User & { password_hash: string }) | null {
    const cleanNumber = String(whatsapp).replace(/\D/g, '');
    for (const u of this.users.values()) {
      if (u.whatsapp_number === cleanNumber) {
        return u;
      }
    }
    return null;
  }

  public async authenticateUserWithOtp(whatsapp_number: string, otp_code: string): Promise<User> {
    const cleanNumber = String(whatsapp_number).replace(/\D/g, '');
    if (!cleanNumber || cleanNumber.length < 10) {
      throw new Error('Please enter a valid 10-digit WhatsApp number.');
    }

    // Verify OTP code for login
    this.verifyOtp(cleanNumber, otp_code, 'login', false);

    const foundUser = this.getUserByWhatsApp(cleanNumber);
    if (!foundUser) {
      throw new Error(`No registered account found with +91 ${cleanNumber}. Please create an account.`);
    }

    if (foundUser.status === 'suspended') {
      throw new Error('Your account has been suspended by administration. Please contact support.');
    }

    foundUser.last_login = new Date().toISOString();
    return this.sanitizeUser(foundUser);
  }

  // ==========================================
  // AUTHENTICATION & USERS
  // ==========================================
  public async createUser(data: {
    whatsapp_number: string;
    state: string;
    city: string;
    password: string;
  }): Promise<User> {
    const cleanNumber = data.whatsapp_number.replace(/\D/g, '');
    if (!cleanNumber || cleanNumber.length < 10) {
      throw new Error('Please enter a valid 10-digit WhatsApp number.');
    }

    // Check unique WhatsApp number
    for (const u of this.users.values()) {
      if (u.whatsapp_number === cleanNumber) {
        throw new Error('An account already exists with this WhatsApp number. Please login.');
      }
    }

    const id = `u-${crypto.randomUUID()}`;
    const newUser: User & { password_hash: string } = {
      id,
      whatsapp_number: cleanNumber,
      state: data.state.trim(),
      city: data.city.trim(),
      password_hash: hashPassword(data.password),
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };

    this.users.set(id, newUser);

    // Create associated wallet
    const walletId = `w-${crypto.randomUUID()}`;
    this.wallets.set(id, {
      id: walletId,
      user_id: id,
      current_balance: 0,
      total_earned: 0,
      total_withdrawn: 0,
      updated_at: new Date().toISOString()
    });

    // Create welcome notification
    this.notifications.push({
      id: `notif-${crypto.randomUUID()}`,
      user_id: id,
      title: 'Welcome to Ritam Review Agency',
      message: 'Account successfully registered. Check out our educational review simulation tasks.',
      type: 'success',
      read: false,
      created_at: new Date().toISOString()
    });

    return this.sanitizeUser(newUser);
  }

  public async authenticateUser(whatsapp_number: string, password: string): Promise<User> {
    const cleanNumber = whatsapp_number.replace(/\D/g, '');
    let foundUser: (User & { password_hash: string }) | null = null;

    for (const u of this.users.values()) {
      if (u.whatsapp_number === cleanNumber) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      throw new Error('Invalid WhatsApp number or password.');
    }

    if (foundUser.status === 'suspended') {
      throw new Error('Your account has been suspended by administration. Please contact support.');
    }

    const valid = verifyPassword(password, foundUser.password_hash);
    if (!valid) {
      throw new Error('Invalid WhatsApp number or password.');
    }

    foundUser.last_login = new Date().toISOString();
    return this.sanitizeUser(foundUser);
  }

  public async authenticateAdmin(username: string, password: string): Promise<Admin> {
    let foundAdmin: (Admin & { password_hash: string }) | null = null;
    for (const a of this.admins.values()) {
      if (a.username.toLowerCase() === username.trim().toLowerCase()) {
        foundAdmin = a;
        break;
      }
    }

    if (!foundAdmin) {
      throw new Error('Invalid administrator credentials.');
    }

    const valid = verifyPassword(password, foundAdmin.password_hash);
    if (!valid) {
      throw new Error('Invalid administrator credentials.');
    }

    foundAdmin.last_login = new Date().toISOString();
    this.addAuditLog({
      admin_id: foundAdmin.id,
      admin_username: foundAdmin.username,
      action: 'ADMIN_LOGIN',
      target_type: 'ADMIN',
      target_id: foundAdmin.id,
      description: `Administrator ${foundAdmin.username} logged in successfully.`
    });

    return {
      id: foundAdmin.id,
      username: foundAdmin.username,
      name: foundAdmin.name,
      role: foundAdmin.role,
      created_at: foundAdmin.created_at,
      last_login: foundAdmin.last_login
    };
  }

  public async resetPassword(whatsapp_number: string, newPassword: string): Promise<void> {
    const cleanNumber = whatsapp_number.replace(/\D/g, '');
    let foundUser: (User & { password_hash: string }) | null = null;

    for (const u of this.users.values()) {
      if (u.whatsapp_number === cleanNumber) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      throw new Error('No account found with this WhatsApp number.');
    }

    foundUser.password_hash = hashPassword(newPassword);
    foundUser.updated_at = new Date().toISOString();

    this.notifications.push({
      id: `notif-${crypto.randomUUID()}`,
      user_id: foundUser.id,
      title: 'Password Reset Successful',
      message: 'Your account password was updated successfully. You can now log in with your new password.',
      type: 'warning',
      read: false,
      created_at: new Date().toISOString()
    });
  }

  public async resetPasswordWithOtp(whatsapp_number: string, newPassword: string): Promise<void> {
    return this.resetPassword(whatsapp_number, newPassword);
  }

  public sanitizeUser(user: User & { password_hash?: string }): User {
    const { password_hash, ...safe } = user;
    return safe;
  }

  public getUserById(id: string): User | null {
    const u = this.users.get(id);
    return u ? this.sanitizeUser(u) : null;
  }

  public getAllUsers(query?: string): User[] {
    const list = Array.from(this.users.values()).map(u => this.sanitizeUser(u));
    if (!query) return list;

    const q = query.toLowerCase().trim();
    return list.filter(u =>
      u.whatsapp_number.includes(q) ||
      u.id.toLowerCase().includes(q) ||
      u.city.toLowerCase().includes(q) ||
      u.state.toLowerCase().includes(q)
    );
  }

  public updateUserStatus(userId: string, status: 'active' | 'suspended', adminId: string): User {
    const u = this.users.get(userId);
    if (!u) throw new Error('User not found.');
    u.status = status;
    u.updated_at = new Date().toISOString();

    const admin = this.admins.get(adminId);
    this.addAuditLog({
      admin_id: adminId,
      admin_username: admin?.username || 'Ritam',
      action: status === 'suspended' ? 'USER_SUSPENDED' : 'USER_ACTIVATED',
      target_type: 'USER',
      target_id: userId,
      description: `User ${u.whatsapp_number} status changed to ${status}.`
    });

    return this.sanitizeUser(u);
  }

  public adminResetUserPassword(userId: string, newPassword: string, adminId: string): void {
    const u = this.users.get(userId);
    if (!u) throw new Error('User not found.');
    u.password_hash = hashPassword(newPassword);
    u.updated_at = new Date().toISOString();

    const admin = this.admins.get(adminId);
    this.addAuditLog({
      admin_id: adminId,
      admin_username: admin?.username || 'Ritam',
      action: 'ADMIN_PASSWORD_RESET',
      target_type: 'USER',
      target_id: userId,
      description: `Admin reset password for user ${u.whatsapp_number}.`
    });
  }

  // ==========================================
  // TASKS MANAGEMENT
  // ==========================================
  public getAllTasks(): Task[] {
    const tasks = Array.from(this.tasks.values());
    return tasks.map(t => {
      const taskComments = Array.from(this.comments.values()).filter(c => c.task_id === t.id);
      return {
        ...t,
        comments_count: taskComments.length
      };
    });
  }

  public getTaskById(id: string): Task | null {
    const task = this.tasks.get(id);
    if (!task) return null;
    const taskComments = Array.from(this.comments.values()).filter(c => c.task_id === task.id);
    return {
      ...task,
      comments_count: taskComments.length
    };
  }

  public createTask(data: {
    name: string;
    mock_business_name: string;
    mock_location: string;
    description: string;
    total_slots: number;
    payment_per_completion: number;
    start_date: string;
    end_date: string;
    comments: string[];
    adminId: string;
  }): Task {
    const id = `t-${crypto.randomUUID()}`;
    const newTask: Task = {
      id,
      name: data.name.trim(),
      mock_business_name: data.mock_business_name.trim(),
      mock_location: data.mock_location.trim(),
      mock_map_link: `/mock-map/${id}`,
      description: data.description.trim(),
      total_slots: data.total_slots,
      claimed_slots: 0,
      completed_slots: 0,
      payment_per_completion: Number(data.payment_per_completion),
      start_date: data.start_date,
      end_date: data.end_date,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      comments_count: data.comments.length
    };

    this.tasks.set(id, newTask);

    // Populate comments
    data.comments.forEach(text => {
      if (!text.trim()) return;
      const commentId = `c-${crypto.randomUUID()}`;
      this.comments.set(commentId, {
        id: commentId,
        task_id: id,
        comment_text: text.trim(),
        status: 'AVAILABLE',
        created_at: new Date().toISOString()
      });
    });

    const admin = this.admins.get(data.adminId);
    this.addAuditLog({
      admin_id: data.adminId,
      admin_username: admin?.username || 'admin',
      action: 'TASK_CREATED',
      target_type: 'TASK',
      target_id: id,
      description: `Task "${newTask.name}" created with ${newTask.total_slots} slots and ${data.comments.length} comments.`
    });

    return newTask;
  }

  public deleteTask(taskId: string, adminId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error('Simulation task not found.');
    }

    // Delete all comments associated with this task
    for (const [commentId, c] of this.comments.entries()) {
      if (c.task_id === taskId) {
        this.comments.delete(commentId);
      }
    }

    // Delete all claims associated with this task
    for (const [claimId, cl] of this.claims.entries()) {
      if (cl.task_id === taskId) {
        this.claims.delete(claimId);
      }
    }

    // Delete all submissions associated with this task
    for (const [subId, s] of this.submissions.entries()) {
      if (s.task_id === taskId) {
        this.submissions.delete(subId);
      }
    }

    // Delete the task itself
    this.tasks.delete(taskId);

    const admin = this.admins.get(adminId);
    this.addAuditLog({
      admin_id: adminId,
      admin_username: admin?.username || 'Ritam',
      action: 'TASK_DELETED',
      target_type: 'TASK',
      target_id: taskId,
      description: `Simulation task "${task.name}" and its mock map review link were permanently deleted.`
    });
  }

  // ==========================================
  // ATOMIC SLOT SYSTEM (ONE COMMENT = ONE USER)
  // ==========================================
  public async claimTaskSlot(taskId: string, userId: string): Promise<TaskClaim & { comment_text: string }> {
    return this.withMutex(async () => {
      // 1. Check user status
      const user = this.users.get(userId);
      if (!user) throw new Error('User not found.');
      if (user.status !== 'active') {
        throw new Error('Your account is not active. Cannot claim simulation tasks.');
      }

      // 2. Check task exists and is active
      const task = this.tasks.get(taskId);
      if (!task) throw new Error('Task not found.');
      if (task.status !== 'active') {
        throw new Error('Task is no longer active.');
      }

      // 3. Check available slots
      if (task.claimed_slots >= task.total_slots) {
        throw new Error('No slots available.');
      }

      // 4. A single user CAN claim multiple slots for the same task/link.
      // If they have an active UNCOMPLETED slot on this task, they must complete it first.
      for (const claim of this.claims.values()) {
        if (claim.task_id === taskId && claim.user_id === userId && claim.status === 'CLAIMED') {
          throw new Error('ACTIVE_CLAIM_EXISTS: You currently have an active task slot in progress. Please complete "I have completed this task" first before claiming another comment for this link.');
        }
      }

      // 5. Find one AVAILABLE comment for this task: ONE COMMENT = ONE USER
      let availableComment: TaskComment | null = null;
      for (const comment of this.comments.values()) {
        if (comment.task_id === taskId && comment.status === 'AVAILABLE') {
          availableComment = comment;
          break;
        }
      }

      if (!availableComment) {
        throw new Error('No sample comments available in pool for this task.');
      }

      // 6. Lock that comment & assign to user
      availableComment.status = 'ASSIGNED';
      availableComment.assigned_to_user_id = userId;
      availableComment.assigned_whatsapp = user.whatsapp_number;
      availableComment.assigned_at = new Date().toISOString();

      // 7. Create claim record: UNIQUE(task_id, comment_id)
      const claimId = `claim-${crypto.randomUUID()}`;
      const newClaim: TaskClaim = {
        id: claimId,
        task_id: taskId,
        user_id: userId,
        comment_id: availableComment.id,
        status: 'CLAIMED',
        claimed_at: new Date().toISOString(),
        task_name: task.name,
        mock_business_name: task.mock_business_name,
        payment_per_completion: task.payment_per_completion,
        comment_text: availableComment.comment_text
      };
      this.claims.set(claimId, newClaim);

      // 8. Increase claimed count
      task.claimed_slots += 1;
      task.updated_at = new Date().toISOString();

      // 9. Audit log entry
      this.addAuditLog({
        admin_id: 'SYSTEM',
        action: 'COMMENT_ASSIGNED',
        target_type: 'COMMENT',
        target_id: availableComment.id,
        description: `Comment ${availableComment.id} atomically assigned to User ${user.whatsapp_number} for task "${task.name}".`
      });

      return {
        ...newClaim,
        comment_text: availableComment.comment_text
      };
    });
  }

  public async completeTaskClaim(claimId: string, userId: string): Promise<TaskClaim> {
    return this.withMutex(async () => {
      const claim = this.claims.get(claimId);
      if (!claim) throw new Error('Claim not found.');
      if (claim.user_id !== userId) throw new Error('Unauthorized.');
      if (claim.status !== 'CLAIMED') {
        throw new Error('This task slot is already completed or submitted.');
      }

      claim.status = 'SUBMITTED';
      const task = this.tasks.get(claim.task_id);
      const user = this.users.get(userId);

      const submissionId = `sub-${crypto.randomUUID()}`;
      const submission: SimulatedSubmission = {
        id: submissionId,
        claim_id: claim.id,
        task_id: claim.task_id,
        user_id: userId,
        submitted_comment: claim.comment_text || 'Completed review simulation',
        proof_notes: 'I have completed this task',
        status: 'PENDING',
        submitted_at: new Date().toISOString(),
        task_name: task?.name,
        whatsapp_number: user?.whatsapp_number
      };
      this.submissions.set(submissionId, submission);

      return claim;
    });
  }

  public async completeTaskAndClaimNext(taskId: string, userId: string): Promise<{
    completedClaim: TaskClaim;
    nextClaim?: TaskClaim & { comment_text: string };
    allCompleted?: boolean;
    message: string;
  }> {
    return this.withMutex(async () => {
      const user = this.users.get(userId);
      if (!user) throw new Error('User not found.');

      // Find the active claim for this task
      let activeClaim: TaskClaim | null = null;
      for (const claim of this.claims.values()) {
        if (claim.task_id === taskId && claim.user_id === userId && claim.status === 'CLAIMED') {
          activeClaim = claim;
          break;
        }
      }

      if (!activeClaim) {
        throw new Error('No active claim in progress found for this task.');
      }

      // Complete active claim
      activeClaim.status = 'SUBMITTED';
      const task = this.tasks.get(taskId);
      const submissionId = `sub-${crypto.randomUUID()}`;
      const submission: SimulatedSubmission = {
        id: submissionId,
        claim_id: activeClaim.id,
        task_id: taskId,
        user_id: userId,
        submitted_comment: activeClaim.comment_text || 'Completed review simulation',
        proof_notes: 'I have completed this task',
        status: 'PENDING',
        submitted_at: new Date().toISOString(),
        task_name: task?.name,
        whatsapp_number: user.whatsapp_number
      };
      this.submissions.set(submissionId, submission);

      // Check if more slots and comments are available for this same task
      if (!task || task.claimed_slots >= task.total_slots) {
        return {
          completedClaim: activeClaim,
          allCompleted: true,
          message: 'Task completed! All available slots for this task have been claimed.'
        };
      }

      // Find next AVAILABLE comment
      let nextComment: TaskComment | null = null;
      for (const comment of this.comments.values()) {
        if (comment.task_id === taskId && comment.status === 'AVAILABLE') {
          nextComment = comment;
          break;
        }
      }

      if (!nextComment) {
        return {
          completedClaim: activeClaim,
          allCompleted: true,
          message: 'Task completed! All sample comments in the pool have been assigned.'
        };
      }

      // Assign next comment & lock next slot
      nextComment.status = 'ASSIGNED';
      nextComment.assigned_to_user_id = userId;
      nextComment.assigned_whatsapp = user.whatsapp_number;
      nextComment.assigned_at = new Date().toISOString();

      const newClaimId = `claim-${crypto.randomUUID()}`;
      const newClaim: TaskClaim = {
        id: newClaimId,
        task_id: taskId,
        user_id: userId,
        comment_id: nextComment.id,
        status: 'CLAIMED',
        claimed_at: new Date().toISOString(),
        task_name: task.name,
        mock_business_name: task.mock_business_name,
        payment_per_completion: task.payment_per_completion,
        comment_text: nextComment.comment_text
      };
      this.claims.set(newClaimId, newClaim);

      task.claimed_slots += 1;
      task.updated_at = new Date().toISOString();

      return {
        completedClaim: activeClaim,
        nextClaim: {
          ...newClaim,
          comment_text: nextComment.comment_text
        },
        message: 'Task completed! Next slot and comment have been assigned for this link.'
      };
    });
  }

  public getUserClaims(userId: string): TaskClaim[] {
    const list: TaskClaim[] = [];
    for (const c of this.claims.values()) {
      if (c.user_id === userId) {
        const task = this.tasks.get(c.task_id);
        const comment = this.comments.get(c.comment_id);
        list.push({
          ...c,
          task_name: task?.name || 'Simulation Task',
          mock_business_name: task?.mock_business_name || '',
          payment_per_completion: task?.payment_per_completion || 0,
          comment_text: comment?.comment_text || ''
        });
      }
    }
    return list.sort((a, b) => new Date(b.claimed_at).getTime() - new Date(a.claimed_at).getTime());
  }

  public getClaimById(claimId: string): TaskClaim | null {
    const c = this.claims.get(claimId);
    if (!c) return null;
    const task = this.tasks.get(c.task_id);
    const comment = this.comments.get(c.comment_id);
    return {
      ...c,
      task_name: task?.name,
      mock_business_name: task?.mock_business_name,
      payment_per_completion: task?.payment_per_completion,
      comment_text: comment?.comment_text
    };
  }

  // ==========================================
  // COMMENTS MANAGEMENT (ADMIN COMMENT POOL)
  // ==========================================
  public getAllComments(taskId?: string, status?: string): TaskComment[] {
    let list = Array.from(this.comments.values());
    if (taskId) {
      list = list.filter(c => c.task_id === taskId);
    }
    if (status) {
      list = list.filter(c => c.status === status);
    }
    return list;
  }

  public addCommentToTask(taskId: string, commentText: string, adminId: string): TaskComment {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found.');

    const commentId = `c-${crypto.randomUUID()}`;
    const newComment: TaskComment = {
      id: commentId,
      task_id: taskId,
      comment_text: commentText.trim(),
      status: 'AVAILABLE',
      created_at: new Date().toISOString()
    };
    this.comments.set(commentId, newComment);

    const admin = this.admins.get(adminId);
    this.addAuditLog({
      admin_id: adminId,
      admin_username: admin?.username || 'admin',
      action: 'COMMENT_ADDED',
      target_type: 'COMMENT',
      target_id: commentId,
      description: `New sample comment added to task "${task.name}".`
    });

    return newComment;
  }

  // ==========================================
  // SIMULATION SUBMISSIONS & VERIFICATION
  // ==========================================
  public async submitSimulation(claimId: string, submittedComment: string, proofNotes?: string): Promise<SimulatedSubmission> {
    const claim = this.claims.get(claimId);
    if (!claim) throw new Error('Claim not found.');
    if (claim.status !== 'CLAIMED') {
      throw new Error('This simulation claim has already been submitted or completed.');
    }

    const task = this.tasks.get(claim.task_id);
    const user = this.users.get(claim.user_id);

    const submissionId = `sub-${crypto.randomUUID()}`;
    const submission: SimulatedSubmission = {
      id: submissionId,
      claim_id: claimId,
      task_id: claim.task_id,
      user_id: claim.user_id,
      submitted_comment: submittedComment.trim(),
      proof_notes: proofNotes?.trim(),
      status: 'PENDING',
      submitted_at: new Date().toISOString(),
      task_name: task?.name,
      whatsapp_number: user?.whatsapp_number
    };

    this.submissions.set(submissionId, submission);
    claim.status = 'SUBMITTED';

    return submission;
  }

  public getAllSubmissions(status?: string): SimulatedSubmission[] {
    let list = Array.from(this.submissions.values()).map(sub => {
      const task = this.tasks.get(sub.task_id);
      const user = this.users.get(sub.user_id);
      return {
        ...sub,
        task_name: task?.name || 'Simulation Task',
        whatsapp_number: user?.whatsapp_number || 'N/A'
      };
    });

    if (status) {
      list = list.filter(s => s.status === status);
    }
    return list.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  }

  public async verifySubmission(submissionId: string, decision: 'VERIFIED' | 'REJECTED', notes: string, adminId: string): Promise<SimulatedSubmission> {
    return this.withMutex(async () => {
      const sub = this.submissions.get(submissionId);
      if (!sub) throw new Error('Submission not found.');
      if (sub.status === 'VERIFIED') {
        throw new Error('Simulation has already been verified.');
      }

      const claim = this.claims.get(sub.claim_id);
      const task = this.tasks.get(sub.task_id);
      const comment = claim ? this.comments.get(claim.comment_id) : null;
      const user = this.users.get(sub.user_id);
      const admin = this.admins.get(adminId);

      sub.status = decision;
      sub.verified_at = new Date().toISOString();
      sub.verified_by = adminId;
      sub.verification_notes = notes;

      if (decision === 'VERIFIED') {
        if (claim) {
          claim.status = 'COMPLETED';
          claim.completed_at = new Date().toISOString();
        }
        if (comment) {
          // Status: AVAILABLE -> ASSIGNED -> COMPLETED
          comment.status = 'COMPLETED';
          comment.completed_at = new Date().toISOString();
        }
        if (task) {
          task.completed_slots += 1;
        }

        // Ledger Entry: CREDIT payment_per_completion
        const reward = task?.payment_per_completion || 10;
        this.addWalletTransaction({
          user_id: sub.user_id,
          task_id: task?.id,
          task_name: task?.name,
          type: 'CREDIT',
          amount: reward,
          description: `Educational simulation verified for "${task?.name || 'Task'}"`
        });

        this.notifications.push({
          id: `notif-${crypto.randomUUID()}`,
          user_id: sub.user_id,
          title: 'Simulation Verified! ₹' + reward + ' Credited',
          message: `Your educational review submission for "${task?.name}" has been verified. ₹${reward} added to your simulated wallet.`,
          type: 'success',
          read: false,
          created_at: new Date().toISOString()
        });
      } else {
        if (claim) {
          claim.status = 'CANCELLED';
        }
        // If rejected, comment is NOT made available if completed rule, but here comment was assigned.
        this.notifications.push({
          id: `notif-${crypto.randomUUID()}`,
          user_id: sub.user_id,
          title: 'Simulation Not Verified',
          message: `Your submission for "${task?.name}" could not be verified. Reason: ${notes || 'Feedback did not match assigned guidelines'}.`,
          type: 'alert',
          read: false,
          created_at: new Date().toISOString()
        });
      }

      this.addAuditLog({
        admin_id: adminId,
        admin_username: admin?.username || 'admin',
        action: decision === 'VERIFIED' ? 'SUBMISSION_VERIFIED' : 'SUBMISSION_REJECTED',
        target_type: 'SUBMISSION',
        target_id: submissionId,
        description: `Simulation submission by ${user?.whatsapp_number} marked as ${decision}. Notes: ${notes}`
      });

      return sub;
    });
  }

  // ==========================================
  // WALLET & LEDGER SYSTEM
  // ==========================================
  // Rule: Never directly modify balance without ledger entry!
  public addWalletTransaction(data: {
    user_id: string;
    task_id?: string;
    task_name?: string;
    type: TransactionType;
    amount: number;
    description: string;
  }): WalletTransaction {
    let wallet = this.wallets.get(data.user_id);
    if (!wallet) {
      wallet = {
        id: `w-${crypto.randomUUID()}`,
        user_id: data.user_id,
        current_balance: 0,
        total_earned: 0,
        total_withdrawn: 0,
        updated_at: new Date().toISOString()
      };
      this.wallets.set(data.user_id, wallet);
    }

    let newBalance = wallet.current_balance;
    if (data.type === 'CREDIT') {
      newBalance += data.amount;
      wallet.total_earned += data.amount;
    } else if (data.type === 'WITHDRAWAL') {
      if (wallet.current_balance < data.amount) {
        throw new Error('Insufficient wallet balance.');
      }
      newBalance -= data.amount;
      wallet.total_withdrawn += data.amount;
    } else if (data.type === 'REVERSAL') {
      newBalance += data.amount; // Reversing previously deducted amount
      wallet.total_withdrawn = Math.max(0, wallet.total_withdrawn - data.amount);
    }

    wallet.current_balance = Number(newBalance.toFixed(2));
    wallet.updated_at = new Date().toISOString();

    const txId = `tx-${crypto.randomUUID()}`;
    const tx: WalletTransaction = {
      id: txId,
      wallet_id: wallet.id,
      user_id: data.user_id,
      task_id: data.task_id,
      task_name: data.task_name,
      type: data.type,
      amount: data.amount,
      balance_after: wallet.current_balance,
      description: data.description,
      status: 'COMPLETED',
      created_at: new Date().toISOString()
    };

    this.transactions.set(txId, tx);
    return tx;
  }

  public getUserWallet(userId: string): Wallet {
    let wallet = this.wallets.get(userId);
    if (!wallet) {
      wallet = {
        id: `w-${crypto.randomUUID()}`,
        user_id: userId,
        current_balance: 0,
        total_earned: 0,
        total_withdrawn: 0,
        updated_at: new Date().toISOString()
      };
      this.wallets.set(userId, wallet);
    }
    return wallet;
  }

  public getUserTransactions(userId: string): WalletTransaction[] {
    const list: WalletTransaction[] = [];
    for (const tx of this.transactions.values()) {
      if (tx.user_id === userId) {
        list.push(tx);
      }
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getAllTransactions(): WalletTransaction[] {
    return Array.from(this.transactions.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // ==========================================
  // WITHDRAWALS SYSTEM
  // ==========================================
  public async requestWithdrawal(userId: string, upi_id: string, amount: number, otp_code?: string): Promise<WithdrawalRequest> {
    return this.withMutex(async () => {
      const user = this.users.get(userId);
      if (!user) throw new Error('User not found.');
      if (user.status !== 'active') throw new Error('Account suspended.');

      // If OTP code is supplied, verify it for bank-level security
      if (otp_code) {
        this.verifyOtp(user.whatsapp_number, otp_code, 'withdrawal');
      }

      const wallet = this.getUserWallet(userId);
      if (wallet.current_balance < amount) {
        throw new Error('Insufficient wallet balance.');
      }

      const minWithdrawal = 20;
      if (amount < minWithdrawal) {
        throw new Error(`Minimum withdrawal amount is ₹${minWithdrawal}.`);
      }

      // Check if user has an existing pending withdrawal
      for (const w of this.withdrawals.values()) {
        if (w.user_id === userId && w.status === 'PENDING') {
          throw new Error('Withdrawal request already pending.');
        }
      }

      // Reserve funds in user balance
      wallet.current_balance = Number((wallet.current_balance - amount).toFixed(2));
      wallet.updated_at = new Date().toISOString();

      const requestId = `wd-${crypto.randomUUID()}`;
      const request: WithdrawalRequest = {
        id: requestId,
        user_id: userId,
        whatsapp_number: user.whatsapp_number,
        upi_id: upi_id.trim(),
        amount: Number(amount),
        status: 'PENDING',
        created_at: new Date().toISOString()
      };

      this.withdrawals.set(requestId, request);

      // Add a ledger entry recording the pending reservation
      const txId = `tx-${crypto.randomUUID()}`;
      this.transactions.set(txId, {
        id: txId,
        wallet_id: wallet.id,
        user_id: userId,
        type: 'WITHDRAWAL',
        amount: amount,
        balance_after: wallet.current_balance,
        description: `Withdrawal request #${requestId.slice(-6)} to UPI: ${upi_id} (PENDING)`,
        status: 'PENDING',
        created_at: new Date().toISOString()
      });

      return request;
    });
  }

  public getAllWithdrawals(status?: WithdrawalStatus, query?: string): WithdrawalRequest[] {
    let list = Array.from(this.withdrawals.values());
    if (status) {
      list = list.filter(w => w.status === status);
    }
    if (query) {
      const q = query.toLowerCase().trim();
      list = list.filter(w =>
        w.whatsapp_number.includes(q) ||
        w.upi_id.toLowerCase().includes(q) ||
        w.id.toLowerCase().includes(q) ||
        w.user_id.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getUserWithdrawals(userId: string): WithdrawalRequest[] {
    const list: WithdrawalRequest[] = [];
    for (const w of this.withdrawals.values()) {
      if (w.user_id === userId) {
        list.push(w);
      }
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async approveWithdrawal(requestId: string, adminId: string): Promise<WithdrawalRequest> {
    return this.withMutex(async () => {
      const req = this.withdrawals.get(requestId);
      if (!req) throw new Error('Withdrawal request not found.');
      if (req.status !== 'PENDING') {
        throw new Error(`Cannot approve request that is already ${req.status}.`);
      }

      const wallet = this.getUserWallet(req.user_id);
      const user = this.users.get(req.user_id);
      const admin = this.admins.get(adminId);

      req.status = 'APPROVED';
      req.approved_by = adminId;
      req.approved_at = new Date().toISOString();

      // Update wallet total_withdrawn
      wallet.total_withdrawn = Number((wallet.total_withdrawn + req.amount).toFixed(2));
      wallet.updated_at = new Date().toISOString();

      // Update transaction status
      for (const tx of this.transactions.values()) {
        if (tx.user_id === req.user_id && tx.description.includes(requestId.slice(-6))) {
          tx.status = 'COMPLETED';
          tx.description = `Simulated withdrawal to UPI ${req.upi_id} - Approved and recorded`;
        }
      }

      this.notifications.push({
        id: `notif-${crypto.randomUUID()}`,
        user_id: req.user_id,
        title: '✓ Successful Withdrawal Recorded',
        message: `Your withdrawal request of ₹${req.amount} to ${req.upi_id} has been approved and recorded in the system.`,
        type: 'success',
        read: false,
        created_at: new Date().toISOString()
      });

      this.addAuditLog({
        admin_id: adminId,
        admin_username: admin?.username || 'admin',
        action: 'WITHDRAWAL_APPROVED',
        target_type: 'WITHDRAWAL',
        target_id: requestId,
        description: `Admin confirmed payment record for withdrawal #${requestId} of ₹${req.amount} to UPI: ${req.upi_id}.`
      });

      return req;
    });
  }

  public async rejectWithdrawal(requestId: string, rejectionReason: string, adminId: string): Promise<WithdrawalRequest> {
    return this.withMutex(async () => {
      if (!rejectionReason || !rejectionReason.trim()) {
        throw new Error('Rejection reason is required.');
      }

      const req = this.withdrawals.get(requestId);
      if (!req) throw new Error('Withdrawal request not found.');
      if (req.status !== 'PENDING') {
        throw new Error(`Cannot reject request that is already ${req.status}.`);
      }

      const wallet = this.getUserWallet(req.user_id);
      const user = this.users.get(req.user_id);
      const admin = this.admins.get(adminId);

      req.status = 'REJECTED';
      req.rejected_by = adminId;
      req.rejected_at = new Date().toISOString();
      req.rejection_reason = rejectionReason.trim();

      // Return reserved funds back to user's wallet
      wallet.current_balance = Number((wallet.current_balance + req.amount).toFixed(2));
      wallet.updated_at = new Date().toISOString();

      // Record reversal transaction
      const txId = `tx-${crypto.randomUUID()}`;
      this.transactions.set(txId, {
        id: txId,
        wallet_id: wallet.id,
        user_id: req.user_id,
        type: 'REVERSAL',
        amount: req.amount,
        balance_after: wallet.current_balance,
        description: `Reversal for rejected withdrawal #${requestId.slice(-6)}. Reason: ${rejectionReason}`,
        status: 'COMPLETED',
        created_at: new Date().toISOString()
      });

      this.notifications.push({
        id: `notif-${crypto.randomUUID()}`,
        user_id: req.user_id,
        title: '✕ Withdrawal Rejected',
        message: `Your withdrawal of ₹${req.amount} was rejected. Reason: ${rejectionReason}. Amount restored to your wallet balance.`,
        type: 'alert',
        read: false,
        created_at: new Date().toISOString()
      });

      this.addAuditLog({
        admin_id: adminId,
        admin_username: admin?.username || 'admin',
        action: 'WITHDRAWAL_REJECTED',
        target_type: 'WITHDRAWAL',
        target_id: requestId,
        description: `Withdrawal #${requestId} rejected. Reason: ${rejectionReason}`
      });

      return req;
    });
  }

  // ==========================================
  // DYNAMIC STATS (CALCULATED DIRECTLY FROM DB)
  // ==========================================
  public getUserFinancialStats(userId: string): UserFinancialStats {
    const wallet = this.getUserWallet(userId);
    let withdrawalCount = 0;
    let approvedWithdrawals = 0;
    let rejectedWithdrawals = 0;
    let pendingWithdrawals = 0;
    let pendingAmount = 0;

    for (const w of this.withdrawals.values()) {
      if (w.user_id === userId) {
        withdrawalCount += 1;
        if (w.status === 'APPROVED') approvedWithdrawals += 1;
        else if (w.status === 'REJECTED') rejectedWithdrawals += 1;
        else if (w.status === 'PENDING') {
          pendingWithdrawals += 1;
          pendingAmount += w.amount;
        }
      }
    }

    return {
      currentBalance: wallet.current_balance,
      totalEarned: wallet.total_earned,
      totalWithdrawn: wallet.total_withdrawn,
      withdrawalCount,
      pendingWithdrawals,
      approvedWithdrawals,
      rejectedWithdrawals,
      pendingAmount
    };
  }

  public getUserTaskStats(userId: string) {
    let totalClaimed = 0;
    let completed = 0;
    let pending = 0;
    let rejected = 0;

    for (const c of this.claims.values()) {
      if (c.user_id === userId) {
        totalClaimed += 1;
        if (c.status === 'COMPLETED') completed += 1;
        else if (c.status === 'SUBMITTED' || c.status === 'CLAIMED') pending += 1;
        else if (c.status === 'CANCELLED') rejected += 1;
      }
    }

    return { totalClaimed, completed, pending, rejected };
  }

  public getAdminDashboardStats(): AdminDashboardStats {
    const totalUsers = this.users.size;
    let activeUsers = 0;
    for (const u of this.users.values()) {
      if (u.status === 'active') activeUsers++;
    }

    const totalTasks = this.tasks.size;
    let totalSlots = 0;
    let claimedSlots = 0;
    let completedSlots = 0;

    for (const t of this.tasks.values()) {
      totalSlots += t.total_slots;
      claimedSlots += t.claimed_slots;
      completedSlots += t.completed_slots;
    }

    const availableSlots = Math.max(0, totalSlots - claimedSlots);

    let completedSimulations = 0;
    let pendingSimulations = 0;
    for (const s of this.submissions.values()) {
      if (s.status === 'VERIFIED') completedSimulations++;
      else if (s.status === 'PENDING' || s.status === 'CHECKING') pendingSimulations++;
    }

    let totalWalletCredits = 0;
    for (const tx of this.transactions.values()) {
      if (tx.type === 'CREDIT' && tx.status === 'COMPLETED') {
        totalWalletCredits += tx.amount;
      }
    }

    let pendingWithdrawals = 0;
    let totalWithdrawn = 0;
    for (const w of this.withdrawals.values()) {
      if (w.status === 'PENDING') pendingWithdrawals++;
      else if (w.status === 'APPROVED') totalWithdrawn += w.amount;
    }

    // Daily breakdown for the last 7 days
    const dailyMap = new Map<string, { registrations: number; simulations: number; walletCredits: number; withdrawals: number }>();
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toISOString().split('T')[0];
      dailyMap.set(key, { registrations: 0, simulations: 0, walletCredits: 0, withdrawals: 0 });
    }

    // Populate daily stats
    for (const u of this.users.values()) {
      const dateKey = u.created_at.split('T')[0];
      if (dailyMap.has(dateKey)) {
        dailyMap.get(dateKey)!.registrations++;
      }
    }

    for (const s of this.submissions.values()) {
      const dateKey = s.submitted_at.split('T')[0];
      if (dailyMap.has(dateKey)) {
        dailyMap.get(dateKey)!.simulations++;
      }
    }

    for (const tx of this.transactions.values()) {
      const dateKey = tx.created_at.split('T')[0];
      if (dailyMap.has(dateKey) && tx.type === 'CREDIT') {
        dailyMap.get(dateKey)!.walletCredits += tx.amount;
      }
    }

    for (const w of this.withdrawals.values()) {
      if (w.status === 'APPROVED' && w.approved_at) {
        const dateKey = w.approved_at.split('T')[0];
        if (dailyMap.has(dateKey)) {
          dailyMap.get(dateKey)!.withdrawals += w.amount;
        }
      }
    }

    const dailyStats = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      ...data
    }));

    return {
      totalUsers,
      activeUsers,
      totalTasks,
      totalSlots,
      claimedSlots,
      availableSlots,
      completedSimulations,
      pendingSimulations,
      totalWalletCredits,
      pendingWithdrawals,
      totalWithdrawn,
      dailyStats
    };
  }

  // ==========================================
  // AUDIT LOGS & NOTIFICATIONS
  // ==========================================
  public addAuditLog(entry: Omit<AuditLog, 'id' | 'created_at'>): AuditLog {
    const log: AuditLog = {
      id: `audit-${crypto.randomUUID()}`,
      ...entry,
      created_at: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    // Keep last 500 logs
    if (this.auditLogs.length > 500) this.auditLogs.pop();
    return log;
  }

  public getAuditLogs(action?: string, limit: number = 50): AuditLog[] {
    let logs = this.auditLogs;
    if (action) {
      logs = logs.filter(l => l.action.toLowerCase().includes(action.toLowerCase()));
    }
    return logs.slice(0, limit);
  }

  public getUserNotifications(userId?: string): AppNotification[] {
    return this.notifications.filter(n => !n.user_id || n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public markNotificationAsRead(notifId: string): void {
    const notif = this.notifications.find(n => n.id === notifId);
    if (notif) notif.read = true;
  }
}

// Global Singleton Instance
export const db = new DatabaseStore();
