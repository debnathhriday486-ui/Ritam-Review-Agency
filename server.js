var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// database/db.ts
import crypto from "node:crypto";
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1e3, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}
function verifyPassword(password, combinedHash) {
  if (!combinedHash || !combinedHash.includes(":")) return false;
  const [salt, originalHash] = combinedHash.split(":");
  const hash = crypto.pbkdf2Sync(password, salt, 1e3, 64, "sha512").toString("hex");
  return hash === originalHash;
}
var DatabaseStore, db;
var init_db = __esm({
  "database/db.ts"() {
    DatabaseStore = class {
      constructor() {
        this.users = /* @__PURE__ */ new Map();
        this.admins = /* @__PURE__ */ new Map();
        this.tasks = /* @__PURE__ */ new Map();
        this.comments = /* @__PURE__ */ new Map();
        this.claims = /* @__PURE__ */ new Map();
        this.submissions = /* @__PURE__ */ new Map();
        this.wallets = /* @__PURE__ */ new Map();
        this.transactions = /* @__PURE__ */ new Map();
        this.withdrawals = /* @__PURE__ */ new Map();
        this.auditLogs = [];
        this.notifications = [];
        // OTP Storage: key = whatsapp_number
        this.otps = /* @__PURE__ */ new Map();
        // Concurrency Mutex for Atomic Claiming
        this.claimMutex = Promise.resolve();
        // WhatsApp Gateway Configuration (supports Meta WhatsApp Cloud API / Simulation / Custom Webhook)
        this.whatsappConfig = {
          provider: process.env.WHATSAPP_PROVIDER || "simulation",
          meta_token: process.env.WHATSAPP_TOKEN || "",
          meta_phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
          webhook_url: process.env.WHATSAPP_WEBHOOK_URL || "",
          enabled: process.env.WHATSAPP_ENABLED === "true"
        };
        this.seedInitialData();
      }
      getWhatsappConfig() {
        return {
          provider: this.whatsappConfig.provider,
          meta_phone_number_id: this.whatsappConfig.meta_phone_number_id,
          has_token: !!this.whatsappConfig.meta_token,
          webhook_url: this.whatsappConfig.webhook_url,
          enabled: this.whatsappConfig.enabled
        };
      }
      getRawWhatsappConfig() {
        return this.whatsappConfig;
      }
      updateWhatsappConfig(config) {
        if (config.provider !== void 0) this.whatsappConfig.provider = config.provider;
        if (config.meta_token !== void 0) this.whatsappConfig.meta_token = config.meta_token;
        if (config.meta_phone_number_id !== void 0) this.whatsappConfig.meta_phone_number_id = config.meta_phone_number_id;
        if (config.webhook_url !== void 0) this.whatsappConfig.webhook_url = config.webhook_url;
        if (config.enabled !== void 0) this.whatsappConfig.enabled = config.enabled;
        return this.getWhatsappConfig();
      }
      seedInitialData() {
        const adminId = "a1000000-0000-0000-0000-000000000001";
        this.admins.set(adminId, {
          id: adminId,
          username: "Ritam",
          name: "Ritam Administrator",
          role: "superadmin",
          password_hash: hashPassword("Ritam@1234"),
          created_at: new Date(Date.now() - 30 * 864e5).toISOString()
        });
        const taskId = "t1000000-0000-0000-0000-000000000001";
        this.tasks.set(taskId, {
          id: taskId,
          name: "ABC Business Educational Simulation",
          mock_business_name: "ABC Enterprises (Agartala)",
          mock_location: "Agartala, Tripura",
          mock_map_link: `/mock-map/${taskId}`,
          description: "Educational simulation module to evaluate customer service responses, store cleanliness, and billing accuracy in a mock retail environment.",
          total_slots: 3,
          claimed_slots: 0,
          completed_slots: 0,
          payment_per_completion: 10,
          start_date: "2026-09-01",
          end_date: "2026-10-31",
          status: "active",
          created_at: new Date(Date.now() - 3 * 864e5).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        });
        const comment1Id = "c1000000-0000-0000-0000-000000000001";
        const comment2Id = "c1000000-0000-0000-0000-000000000002";
        const comment3Id = "c1000000-0000-0000-0000-000000000003";
        this.comments.set(comment1Id, {
          id: comment1Id,
          task_id: taskId,
          comment_text: "Sample 1: Exceptional customer guidance at the Agartala outlet. Staff explained product specifications clearly and the checkout was swift.",
          status: "AVAILABLE",
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
        this.comments.set(comment2Id, {
          id: comment2Id,
          task_id: taskId,
          comment_text: "Sample 2: Well-structured display counters with clear price tags. Friendly team members who promptly assisted with testing the equipment.",
          status: "AVAILABLE",
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
        this.comments.set(comment3Id, {
          id: comment3Id,
          task_id: taskId,
          comment_text: "Sample 3: Clean ambience, good parking arrangement, and genuine warranty documentation. A great simulated benchmark for local retail service.",
          status: "AVAILABLE",
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
        const task2Id = "t2000000-0000-0000-0000-000000000002";
        this.tasks.set(task2Id, {
          id: task2Id,
          name: "NorthEast Tech Hub Simulation",
          mock_business_name: "Highland Digital Works",
          mock_location: "Shillong, Meghalaya",
          mock_map_link: `/mock-map/${task2Id}`,
          description: "Educational exercise on digital agency review quality analysis, evaluating turn-around response and creative portfolios.",
          total_slots: 2,
          claimed_slots: 0,
          completed_slots: 0,
          payment_per_completion: 15,
          start_date: "2026-09-10",
          end_date: "2026-11-15",
          status: "active",
          created_at: new Date(Date.now() - 2 * 864e5).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        });
        this.comments.set("c2000000-0000-0000-0000-000000000001", {
          id: "c2000000-0000-0000-0000-000000000001",
          task_id: task2Id,
          comment_text: "Sample A: Impressive turn-around time on digital consultation requests. Very professional communication throughout.",
          status: "AVAILABLE",
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
        this.comments.set("c2000000-0000-0000-0000-000000000002", {
          id: "c2000000-0000-0000-0000-000000000002",
          task_id: task2Id,
          comment_text: "Sample B: Creative presentation deck and transparent deliverables schedule. Highly structured educational showcase.",
          status: "AVAILABLE",
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
        this.auditLogs.push({
          id: "audit-init-001",
          admin_id: adminId,
          admin_username: "Ritam",
          action: "SYSTEM_INIT",
          target_type: "SYSTEM",
          target_id: "SYSTEM",
          description: "Educational Simulation Platform initialized with default security schemas and seed tasks.",
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      // --- MUTEX RUNNER FOR ATOMIC OPERATIONS ---
      async withMutex(operation) {
        const prev = this.claimMutex;
        let unlock = () => {
        };
        this.claimMutex = new Promise((resolve) => {
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
      generateOtp(whatsapp, purpose) {
        const cleanNumber = String(whatsapp).replace(/\D/g, "");
        const existing = this.otps.get(cleanNumber);
        const now = Date.now();
        if (existing && existing.resendAvailableAt > now) {
          const waitSec = Math.ceil((existing.resendAvailableAt - now) / 1e3);
          throw new Error(`Please wait ${waitSec}s before requesting a new OTP.`);
        }
        const code = process.env.MOCK_OTP_MODE !== "false" ? "123456" : Math.floor(1e5 + Math.random() * 9e5).toString();
        this.otps.set(cleanNumber, {
          code,
          purpose,
          expiresAt: now + 5 * 60 * 1e3,
          // 5 minutes validity
          resendAvailableAt: now + 60 * 1e3,
          // 60s cooldown
          attempts: 0,
          verified: false
        });
        return { code, cooldownSeconds: 60 };
      }
      verifyOtp(whatsapp, code, purpose, keepVerifiedStatus = false) {
        const cleanNumber = String(whatsapp).replace(/\D/g, "");
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
          throw new Error("OTP has expired. Please request a fresh verification code.");
        }
        record.attempts += 1;
        if (record.attempts > 5) {
          this.otps.delete(cleanNumber);
          throw new Error("Maximum OTP verification attempts (5) exceeded. Please request a fresh OTP.");
        }
        if (record.code !== String(code).trim()) {
          throw new Error(`Invalid OTP code. Attempt ${record.attempts} of 5.`);
        }
        if (keepVerifiedStatus) {
          record.verified = true;
          record.verifiedAt = Date.now();
        } else {
          this.otps.delete(cleanNumber);
        }
        return true;
      }
      isOtpPreVerified(whatsapp, purpose) {
        const cleanNumber = String(whatsapp).replace(/\D/g, "");
        const record = this.otps.get(cleanNumber);
        if (!record) return false;
        if (record.purpose !== purpose) return false;
        if (!record.verified) return false;
        if (!record.verifiedAt || Date.now() - record.verifiedAt > 15 * 60 * 1e3) {
          this.otps.delete(cleanNumber);
          return false;
        }
        return true;
      }
      consumePreVerifiedOtp(whatsapp, purpose) {
        const cleanNumber = String(whatsapp).replace(/\D/g, "");
        const record = this.otps.get(cleanNumber);
        if (record && record.purpose === purpose) {
          this.otps.delete(cleanNumber);
        }
      }
      getUserByWhatsApp(whatsapp) {
        const cleanNumber = String(whatsapp).replace(/\D/g, "");
        for (const u of this.users.values()) {
          if (u.whatsapp_number === cleanNumber) {
            return u;
          }
        }
        return null;
      }
      async authenticateUserWithOtp(whatsapp_number, otp_code) {
        const cleanNumber = String(whatsapp_number).replace(/\D/g, "");
        if (!cleanNumber || cleanNumber.length < 10) {
          throw new Error("Please enter a valid 10-digit WhatsApp number.");
        }
        this.verifyOtp(cleanNumber, otp_code, "login", false);
        const foundUser = this.getUserByWhatsApp(cleanNumber);
        if (!foundUser) {
          throw new Error(`No registered account found with +91 ${cleanNumber}. Please create an account.`);
        }
        if (foundUser.status === "suspended") {
          throw new Error("Your account has been suspended by administration. Please contact support.");
        }
        foundUser.last_login = (/* @__PURE__ */ new Date()).toISOString();
        return this.sanitizeUser(foundUser);
      }
      // ==========================================
      // AUTHENTICATION & USERS
      // ==========================================
      async createUser(data) {
        const cleanNumber = data.whatsapp_number.replace(/\D/g, "");
        if (!cleanNumber || cleanNumber.length < 10) {
          throw new Error("Please enter a valid 10-digit WhatsApp number.");
        }
        for (const u of this.users.values()) {
          if (u.whatsapp_number === cleanNumber) {
            throw new Error("An account already exists with this WhatsApp number. Please login.");
          }
        }
        const id = `u-${crypto.randomUUID()}`;
        const newUser = {
          id,
          whatsapp_number: cleanNumber,
          state: data.state.trim(),
          city: data.city.trim(),
          password_hash: hashPassword(data.password),
          status: "active",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString(),
          last_login: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.users.set(id, newUser);
        const walletId = `w-${crypto.randomUUID()}`;
        this.wallets.set(id, {
          id: walletId,
          user_id: id,
          current_balance: 0,
          total_earned: 0,
          total_withdrawn: 0,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        });
        this.notifications.push({
          id: `notif-${crypto.randomUUID()}`,
          user_id: id,
          title: "Welcome to Ritam Review Agency",
          message: "Account successfully registered. Check out our educational review simulation tasks.",
          type: "success",
          read: false,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
        return this.sanitizeUser(newUser);
      }
      async authenticateUser(whatsapp_number, password) {
        const cleanNumber = whatsapp_number.replace(/\D/g, "");
        let foundUser = null;
        for (const u of this.users.values()) {
          if (u.whatsapp_number === cleanNumber) {
            foundUser = u;
            break;
          }
        }
        if (!foundUser) {
          throw new Error("Invalid WhatsApp number or password.");
        }
        if (foundUser.status === "suspended") {
          throw new Error("Your account has been suspended by administration. Please contact support.");
        }
        const valid = verifyPassword(password, foundUser.password_hash);
        if (!valid) {
          throw new Error("Invalid WhatsApp number or password.");
        }
        foundUser.last_login = (/* @__PURE__ */ new Date()).toISOString();
        return this.sanitizeUser(foundUser);
      }
      async authenticateAdmin(username, password) {
        let foundAdmin = null;
        for (const a of this.admins.values()) {
          if (a.username.toLowerCase() === username.trim().toLowerCase()) {
            foundAdmin = a;
            break;
          }
        }
        if (!foundAdmin) {
          throw new Error("Invalid administrator credentials.");
        }
        const valid = verifyPassword(password, foundAdmin.password_hash);
        if (!valid) {
          throw new Error("Invalid administrator credentials.");
        }
        foundAdmin.last_login = (/* @__PURE__ */ new Date()).toISOString();
        this.addAuditLog({
          admin_id: foundAdmin.id,
          admin_username: foundAdmin.username,
          action: "ADMIN_LOGIN",
          target_type: "ADMIN",
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
      async resetPassword(whatsapp_number, newPassword) {
        const cleanNumber = whatsapp_number.replace(/\D/g, "");
        let foundUser = null;
        for (const u of this.users.values()) {
          if (u.whatsapp_number === cleanNumber) {
            foundUser = u;
            break;
          }
        }
        if (!foundUser) {
          throw new Error("No account found with this WhatsApp number.");
        }
        foundUser.password_hash = hashPassword(newPassword);
        foundUser.updated_at = (/* @__PURE__ */ new Date()).toISOString();
        this.notifications.push({
          id: `notif-${crypto.randomUUID()}`,
          user_id: foundUser.id,
          title: "Password Reset Successful",
          message: "Your account password was updated successfully. You can now log in with your new password.",
          type: "warning",
          read: false,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      async resetPasswordWithOtp(whatsapp_number, newPassword) {
        return this.resetPassword(whatsapp_number, newPassword);
      }
      sanitizeUser(user) {
        const { password_hash, ...safe } = user;
        return safe;
      }
      getUserById(id) {
        const u = this.users.get(id);
        return u ? this.sanitizeUser(u) : null;
      }
      getAllUsers(query) {
        const list = Array.from(this.users.values()).map((u) => this.sanitizeUser(u));
        if (!query) return list;
        const q = query.toLowerCase().trim();
        return list.filter(
          (u) => u.whatsapp_number.includes(q) || u.id.toLowerCase().includes(q) || u.city.toLowerCase().includes(q) || u.state.toLowerCase().includes(q)
        );
      }
      updateUserStatus(userId, status, adminId) {
        const u = this.users.get(userId);
        if (!u) throw new Error("User not found.");
        u.status = status;
        u.updated_at = (/* @__PURE__ */ new Date()).toISOString();
        const admin = this.admins.get(adminId);
        this.addAuditLog({
          admin_id: adminId,
          admin_username: admin?.username || "Ritam",
          action: status === "suspended" ? "USER_SUSPENDED" : "USER_ACTIVATED",
          target_type: "USER",
          target_id: userId,
          description: `User ${u.whatsapp_number} status changed to ${status}.`
        });
        return this.sanitizeUser(u);
      }
      adminResetUserPassword(userId, newPassword, adminId) {
        const u = this.users.get(userId);
        if (!u) throw new Error("User not found.");
        u.password_hash = hashPassword(newPassword);
        u.updated_at = (/* @__PURE__ */ new Date()).toISOString();
        const admin = this.admins.get(adminId);
        this.addAuditLog({
          admin_id: adminId,
          admin_username: admin?.username || "Ritam",
          action: "ADMIN_PASSWORD_RESET",
          target_type: "USER",
          target_id: userId,
          description: `Admin reset password for user ${u.whatsapp_number}.`
        });
      }
      // ==========================================
      // TASKS MANAGEMENT
      // ==========================================
      getAllTasks() {
        const tasks = Array.from(this.tasks.values());
        return tasks.map((t) => {
          const taskComments = Array.from(this.comments.values()).filter((c) => c.task_id === t.id);
          return {
            ...t,
            comments_count: taskComments.length
          };
        });
      }
      getTaskById(id) {
        const task = this.tasks.get(id);
        if (!task) return null;
        const taskComments = Array.from(this.comments.values()).filter((c) => c.task_id === task.id);
        return {
          ...task,
          comments_count: taskComments.length
        };
      }
      createTask(data) {
        const id = `t-${crypto.randomUUID()}`;
        const newTask = {
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
          status: "active",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString(),
          comments_count: data.comments.length
        };
        this.tasks.set(id, newTask);
        data.comments.forEach((text) => {
          if (!text.trim()) return;
          const commentId = `c-${crypto.randomUUID()}`;
          this.comments.set(commentId, {
            id: commentId,
            task_id: id,
            comment_text: text.trim(),
            status: "AVAILABLE",
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          });
        });
        const admin = this.admins.get(data.adminId);
        this.addAuditLog({
          admin_id: data.adminId,
          admin_username: admin?.username || "admin",
          action: "TASK_CREATED",
          target_type: "TASK",
          target_id: id,
          description: `Task "${newTask.name}" created with ${newTask.total_slots} slots and ${data.comments.length} comments.`
        });
        return newTask;
      }
      deleteTask(taskId, adminId) {
        const task = this.tasks.get(taskId);
        if (!task) {
          throw new Error("Simulation task not found.");
        }
        for (const [commentId, c] of this.comments.entries()) {
          if (c.task_id === taskId) {
            this.comments.delete(commentId);
          }
        }
        for (const [claimId, cl] of this.claims.entries()) {
          if (cl.task_id === taskId) {
            this.claims.delete(claimId);
          }
        }
        for (const [subId, s] of this.submissions.entries()) {
          if (s.task_id === taskId) {
            this.submissions.delete(subId);
          }
        }
        this.tasks.delete(taskId);
        const admin = this.admins.get(adminId);
        this.addAuditLog({
          admin_id: adminId,
          admin_username: admin?.username || "Ritam",
          action: "TASK_DELETED",
          target_type: "TASK",
          target_id: taskId,
          description: `Simulation task "${task.name}" and its mock map review link were permanently deleted.`
        });
      }
      // ==========================================
      // ATOMIC SLOT SYSTEM (ONE COMMENT = ONE USER)
      // ==========================================
      async claimTaskSlot(taskId, userId) {
        return this.withMutex(async () => {
          const user = this.users.get(userId);
          if (!user) throw new Error("User not found.");
          if (user.status !== "active") {
            throw new Error("Your account is not active. Cannot claim simulation tasks.");
          }
          const task = this.tasks.get(taskId);
          if (!task) throw new Error("Task not found.");
          if (task.status !== "active") {
            throw new Error("Task is no longer active.");
          }
          if (task.claimed_slots >= task.total_slots) {
            throw new Error("No slots available.");
          }
          for (const claim of this.claims.values()) {
            if (claim.task_id === taskId && claim.user_id === userId && claim.status === "CLAIMED") {
              throw new Error('ACTIVE_CLAIM_EXISTS: You currently have an active task slot in progress. Please complete "I have completed this task" first before claiming another comment for this link.');
            }
          }
          let availableComment = null;
          for (const comment of this.comments.values()) {
            if (comment.task_id === taskId && comment.status === "AVAILABLE") {
              availableComment = comment;
              break;
            }
          }
          if (!availableComment) {
            throw new Error("No sample comments available in pool for this task.");
          }
          availableComment.status = "ASSIGNED";
          availableComment.assigned_to_user_id = userId;
          availableComment.assigned_whatsapp = user.whatsapp_number;
          availableComment.assigned_at = (/* @__PURE__ */ new Date()).toISOString();
          const claimId = `claim-${crypto.randomUUID()}`;
          const newClaim = {
            id: claimId,
            task_id: taskId,
            user_id: userId,
            comment_id: availableComment.id,
            status: "CLAIMED",
            claimed_at: (/* @__PURE__ */ new Date()).toISOString(),
            task_name: task.name,
            mock_business_name: task.mock_business_name,
            payment_per_completion: task.payment_per_completion,
            comment_text: availableComment.comment_text
          };
          this.claims.set(claimId, newClaim);
          task.claimed_slots += 1;
          task.updated_at = (/* @__PURE__ */ new Date()).toISOString();
          this.addAuditLog({
            admin_id: "SYSTEM",
            action: "COMMENT_ASSIGNED",
            target_type: "COMMENT",
            target_id: availableComment.id,
            description: `Comment ${availableComment.id} atomically assigned to User ${user.whatsapp_number} for task "${task.name}".`
          });
          return {
            ...newClaim,
            comment_text: availableComment.comment_text
          };
        });
      }
      async completeTaskClaim(claimId, userId) {
        return this.withMutex(async () => {
          const claim = this.claims.get(claimId);
          if (!claim) throw new Error("Claim not found.");
          if (claim.user_id !== userId) throw new Error("Unauthorized.");
          if (claim.status !== "CLAIMED") {
            throw new Error("This task slot is already completed or submitted.");
          }
          claim.status = "SUBMITTED";
          const task = this.tasks.get(claim.task_id);
          const user = this.users.get(userId);
          const submissionId = `sub-${crypto.randomUUID()}`;
          const submission = {
            id: submissionId,
            claim_id: claim.id,
            task_id: claim.task_id,
            user_id: userId,
            submitted_comment: claim.comment_text || "Completed review simulation",
            proof_notes: "I have completed this task",
            status: "PENDING",
            submitted_at: (/* @__PURE__ */ new Date()).toISOString(),
            task_name: task?.name,
            whatsapp_number: user?.whatsapp_number
          };
          this.submissions.set(submissionId, submission);
          return claim;
        });
      }
      async completeTaskAndClaimNext(taskId, userId) {
        return this.withMutex(async () => {
          const user = this.users.get(userId);
          if (!user) throw new Error("User not found.");
          let activeClaim = null;
          for (const claim of this.claims.values()) {
            if (claim.task_id === taskId && claim.user_id === userId && claim.status === "CLAIMED") {
              activeClaim = claim;
              break;
            }
          }
          if (!activeClaim) {
            throw new Error("No active claim in progress found for this task.");
          }
          activeClaim.status = "SUBMITTED";
          const task = this.tasks.get(taskId);
          const submissionId = `sub-${crypto.randomUUID()}`;
          const submission = {
            id: submissionId,
            claim_id: activeClaim.id,
            task_id: taskId,
            user_id: userId,
            submitted_comment: activeClaim.comment_text || "Completed review simulation",
            proof_notes: "I have completed this task",
            status: "PENDING",
            submitted_at: (/* @__PURE__ */ new Date()).toISOString(),
            task_name: task?.name,
            whatsapp_number: user.whatsapp_number
          };
          this.submissions.set(submissionId, submission);
          if (!task || task.claimed_slots >= task.total_slots) {
            return {
              completedClaim: activeClaim,
              allCompleted: true,
              message: "Task completed! All available slots for this task have been claimed."
            };
          }
          let nextComment = null;
          for (const comment of this.comments.values()) {
            if (comment.task_id === taskId && comment.status === "AVAILABLE") {
              nextComment = comment;
              break;
            }
          }
          if (!nextComment) {
            return {
              completedClaim: activeClaim,
              allCompleted: true,
              message: "Task completed! All sample comments in the pool have been assigned."
            };
          }
          nextComment.status = "ASSIGNED";
          nextComment.assigned_to_user_id = userId;
          nextComment.assigned_whatsapp = user.whatsapp_number;
          nextComment.assigned_at = (/* @__PURE__ */ new Date()).toISOString();
          const newClaimId = `claim-${crypto.randomUUID()}`;
          const newClaim = {
            id: newClaimId,
            task_id: taskId,
            user_id: userId,
            comment_id: nextComment.id,
            status: "CLAIMED",
            claimed_at: (/* @__PURE__ */ new Date()).toISOString(),
            task_name: task.name,
            mock_business_name: task.mock_business_name,
            payment_per_completion: task.payment_per_completion,
            comment_text: nextComment.comment_text
          };
          this.claims.set(newClaimId, newClaim);
          task.claimed_slots += 1;
          task.updated_at = (/* @__PURE__ */ new Date()).toISOString();
          return {
            completedClaim: activeClaim,
            nextClaim: {
              ...newClaim,
              comment_text: nextComment.comment_text
            },
            message: "Task completed! Next slot and comment have been assigned for this link."
          };
        });
      }
      getUserClaims(userId) {
        const list = [];
        for (const c of this.claims.values()) {
          if (c.user_id === userId) {
            const task = this.tasks.get(c.task_id);
            const comment = this.comments.get(c.comment_id);
            list.push({
              ...c,
              task_name: task?.name || "Simulation Task",
              mock_business_name: task?.mock_business_name || "",
              payment_per_completion: task?.payment_per_completion || 0,
              comment_text: comment?.comment_text || ""
            });
          }
        }
        return list.sort((a, b) => new Date(b.claimed_at).getTime() - new Date(a.claimed_at).getTime());
      }
      getClaimById(claimId) {
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
      getAllComments(taskId, status) {
        let list = Array.from(this.comments.values());
        if (taskId) {
          list = list.filter((c) => c.task_id === taskId);
        }
        if (status) {
          list = list.filter((c) => c.status === status);
        }
        return list;
      }
      addCommentToTask(taskId, commentText, adminId) {
        const task = this.tasks.get(taskId);
        if (!task) throw new Error("Task not found.");
        const commentId = `c-${crypto.randomUUID()}`;
        const newComment = {
          id: commentId,
          task_id: taskId,
          comment_text: commentText.trim(),
          status: "AVAILABLE",
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.comments.set(commentId, newComment);
        const admin = this.admins.get(adminId);
        this.addAuditLog({
          admin_id: adminId,
          admin_username: admin?.username || "admin",
          action: "COMMENT_ADDED",
          target_type: "COMMENT",
          target_id: commentId,
          description: `New sample comment added to task "${task.name}".`
        });
        return newComment;
      }
      // ==========================================
      // SIMULATION SUBMISSIONS & VERIFICATION
      // ==========================================
      async submitSimulation(claimId, submittedComment, proofNotes) {
        const claim = this.claims.get(claimId);
        if (!claim) throw new Error("Claim not found.");
        if (claim.status !== "CLAIMED") {
          throw new Error("This simulation claim has already been submitted or completed.");
        }
        const task = this.tasks.get(claim.task_id);
        const user = this.users.get(claim.user_id);
        const submissionId = `sub-${crypto.randomUUID()}`;
        const submission = {
          id: submissionId,
          claim_id: claimId,
          task_id: claim.task_id,
          user_id: claim.user_id,
          submitted_comment: submittedComment.trim(),
          proof_notes: proofNotes?.trim(),
          status: "PENDING",
          submitted_at: (/* @__PURE__ */ new Date()).toISOString(),
          task_name: task?.name,
          whatsapp_number: user?.whatsapp_number
        };
        this.submissions.set(submissionId, submission);
        claim.status = "SUBMITTED";
        return submission;
      }
      getAllSubmissions(status) {
        let list = Array.from(this.submissions.values()).map((sub) => {
          const task = this.tasks.get(sub.task_id);
          const user = this.users.get(sub.user_id);
          return {
            ...sub,
            task_name: task?.name || "Simulation Task",
            whatsapp_number: user?.whatsapp_number || "N/A"
          };
        });
        if (status) {
          list = list.filter((s) => s.status === status);
        }
        return list.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
      }
      async verifySubmission(submissionId, decision, notes, adminId) {
        return this.withMutex(async () => {
          const sub = this.submissions.get(submissionId);
          if (!sub) throw new Error("Submission not found.");
          if (sub.status === "VERIFIED") {
            throw new Error("Simulation has already been verified.");
          }
          const claim = this.claims.get(sub.claim_id);
          const task = this.tasks.get(sub.task_id);
          const comment = claim ? this.comments.get(claim.comment_id) : null;
          const user = this.users.get(sub.user_id);
          const admin = this.admins.get(adminId);
          sub.status = decision;
          sub.verified_at = (/* @__PURE__ */ new Date()).toISOString();
          sub.verified_by = adminId;
          sub.verification_notes = notes;
          if (decision === "VERIFIED") {
            if (claim) {
              claim.status = "COMPLETED";
              claim.completed_at = (/* @__PURE__ */ new Date()).toISOString();
            }
            if (comment) {
              comment.status = "COMPLETED";
              comment.completed_at = (/* @__PURE__ */ new Date()).toISOString();
            }
            if (task) {
              task.completed_slots += 1;
            }
            const reward = task?.payment_per_completion || 10;
            this.addWalletTransaction({
              user_id: sub.user_id,
              task_id: task?.id,
              task_name: task?.name,
              type: "CREDIT",
              amount: reward,
              description: `Educational simulation verified for "${task?.name || "Task"}"`
            });
            this.notifications.push({
              id: `notif-${crypto.randomUUID()}`,
              user_id: sub.user_id,
              title: "Simulation Verified! \u20B9" + reward + " Credited",
              message: `Your educational review submission for "${task?.name}" has been verified. \u20B9${reward} added to your simulated wallet.`,
              type: "success",
              read: false,
              created_at: (/* @__PURE__ */ new Date()).toISOString()
            });
          } else {
            if (claim) {
              claim.status = "CANCELLED";
            }
            this.notifications.push({
              id: `notif-${crypto.randomUUID()}`,
              user_id: sub.user_id,
              title: "Simulation Not Verified",
              message: `Your submission for "${task?.name}" could not be verified. Reason: ${notes || "Feedback did not match assigned guidelines"}.`,
              type: "alert",
              read: false,
              created_at: (/* @__PURE__ */ new Date()).toISOString()
            });
          }
          this.addAuditLog({
            admin_id: adminId,
            admin_username: admin?.username || "admin",
            action: decision === "VERIFIED" ? "SUBMISSION_VERIFIED" : "SUBMISSION_REJECTED",
            target_type: "SUBMISSION",
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
      addWalletTransaction(data) {
        let wallet = this.wallets.get(data.user_id);
        if (!wallet) {
          wallet = {
            id: `w-${crypto.randomUUID()}`,
            user_id: data.user_id,
            current_balance: 0,
            total_earned: 0,
            total_withdrawn: 0,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          this.wallets.set(data.user_id, wallet);
        }
        let newBalance = wallet.current_balance;
        if (data.type === "CREDIT") {
          newBalance += data.amount;
          wallet.total_earned += data.amount;
        } else if (data.type === "WITHDRAWAL") {
          if (wallet.current_balance < data.amount) {
            throw new Error("Insufficient wallet balance.");
          }
          newBalance -= data.amount;
          wallet.total_withdrawn += data.amount;
        } else if (data.type === "REVERSAL") {
          newBalance += data.amount;
          wallet.total_withdrawn = Math.max(0, wallet.total_withdrawn - data.amount);
        }
        wallet.current_balance = Number(newBalance.toFixed(2));
        wallet.updated_at = (/* @__PURE__ */ new Date()).toISOString();
        const txId = `tx-${crypto.randomUUID()}`;
        const tx = {
          id: txId,
          wallet_id: wallet.id,
          user_id: data.user_id,
          task_id: data.task_id,
          task_name: data.task_name,
          type: data.type,
          amount: data.amount,
          balance_after: wallet.current_balance,
          description: data.description,
          status: "COMPLETED",
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.transactions.set(txId, tx);
        return tx;
      }
      getUserWallet(userId) {
        let wallet = this.wallets.get(userId);
        if (!wallet) {
          wallet = {
            id: `w-${crypto.randomUUID()}`,
            user_id: userId,
            current_balance: 0,
            total_earned: 0,
            total_withdrawn: 0,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          this.wallets.set(userId, wallet);
        }
        return wallet;
      }
      getUserTransactions(userId) {
        const list = [];
        for (const tx of this.transactions.values()) {
          if (tx.user_id === userId) {
            list.push(tx);
          }
        }
        return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      getAllTransactions() {
        return Array.from(this.transactions.values()).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      // ==========================================
      // WITHDRAWALS SYSTEM
      // ==========================================
      async requestWithdrawal(userId, upi_id, amount, otp_code) {
        return this.withMutex(async () => {
          const user = this.users.get(userId);
          if (!user) throw new Error("User not found.");
          if (user.status !== "active") throw new Error("Account suspended.");
          if (otp_code) {
            this.verifyOtp(user.whatsapp_number, otp_code, "withdrawal");
          }
          const wallet = this.getUserWallet(userId);
          if (wallet.current_balance < amount) {
            throw new Error("Insufficient wallet balance.");
          }
          const minWithdrawal = 20;
          if (amount < minWithdrawal) {
            throw new Error(`Minimum withdrawal amount is \u20B9${minWithdrawal}.`);
          }
          for (const w of this.withdrawals.values()) {
            if (w.user_id === userId && w.status === "PENDING") {
              throw new Error("Withdrawal request already pending.");
            }
          }
          wallet.current_balance = Number((wallet.current_balance - amount).toFixed(2));
          wallet.updated_at = (/* @__PURE__ */ new Date()).toISOString();
          const requestId = `wd-${crypto.randomUUID()}`;
          const request = {
            id: requestId,
            user_id: userId,
            whatsapp_number: user.whatsapp_number,
            upi_id: upi_id.trim(),
            amount: Number(amount),
            status: "PENDING",
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          this.withdrawals.set(requestId, request);
          const txId = `tx-${crypto.randomUUID()}`;
          this.transactions.set(txId, {
            id: txId,
            wallet_id: wallet.id,
            user_id: userId,
            type: "WITHDRAWAL",
            amount,
            balance_after: wallet.current_balance,
            description: `Withdrawal request #${requestId.slice(-6)} to UPI: ${upi_id} (PENDING)`,
            status: "PENDING",
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          });
          return request;
        });
      }
      getAllWithdrawals(status, query) {
        let list = Array.from(this.withdrawals.values());
        if (status) {
          list = list.filter((w) => w.status === status);
        }
        if (query) {
          const q = query.toLowerCase().trim();
          list = list.filter(
            (w) => w.whatsapp_number.includes(q) || w.upi_id.toLowerCase().includes(q) || w.id.toLowerCase().includes(q) || w.user_id.toLowerCase().includes(q)
          );
        }
        return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      getUserWithdrawals(userId) {
        const list = [];
        for (const w of this.withdrawals.values()) {
          if (w.user_id === userId) {
            list.push(w);
          }
        }
        return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      async approveWithdrawal(requestId, adminId) {
        return this.withMutex(async () => {
          const req = this.withdrawals.get(requestId);
          if (!req) throw new Error("Withdrawal request not found.");
          if (req.status !== "PENDING") {
            throw new Error(`Cannot approve request that is already ${req.status}.`);
          }
          const wallet = this.getUserWallet(req.user_id);
          const user = this.users.get(req.user_id);
          const admin = this.admins.get(adminId);
          req.status = "APPROVED";
          req.approved_by = adminId;
          req.approved_at = (/* @__PURE__ */ new Date()).toISOString();
          wallet.total_withdrawn = Number((wallet.total_withdrawn + req.amount).toFixed(2));
          wallet.updated_at = (/* @__PURE__ */ new Date()).toISOString();
          for (const tx of this.transactions.values()) {
            if (tx.user_id === req.user_id && tx.description.includes(requestId.slice(-6))) {
              tx.status = "COMPLETED";
              tx.description = `Simulated withdrawal to UPI ${req.upi_id} - Approved and recorded`;
            }
          }
          this.notifications.push({
            id: `notif-${crypto.randomUUID()}`,
            user_id: req.user_id,
            title: "\u2713 Successful Withdrawal Recorded",
            message: `Your withdrawal request of \u20B9${req.amount} to ${req.upi_id} has been approved and recorded in the system.`,
            type: "success",
            read: false,
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          });
          this.addAuditLog({
            admin_id: adminId,
            admin_username: admin?.username || "admin",
            action: "WITHDRAWAL_APPROVED",
            target_type: "WITHDRAWAL",
            target_id: requestId,
            description: `Admin confirmed payment record for withdrawal #${requestId} of \u20B9${req.amount} to UPI: ${req.upi_id}.`
          });
          return req;
        });
      }
      async rejectWithdrawal(requestId, rejectionReason, adminId) {
        return this.withMutex(async () => {
          if (!rejectionReason || !rejectionReason.trim()) {
            throw new Error("Rejection reason is required.");
          }
          const req = this.withdrawals.get(requestId);
          if (!req) throw new Error("Withdrawal request not found.");
          if (req.status !== "PENDING") {
            throw new Error(`Cannot reject request that is already ${req.status}.`);
          }
          const wallet = this.getUserWallet(req.user_id);
          const user = this.users.get(req.user_id);
          const admin = this.admins.get(adminId);
          req.status = "REJECTED";
          req.rejected_by = adminId;
          req.rejected_at = (/* @__PURE__ */ new Date()).toISOString();
          req.rejection_reason = rejectionReason.trim();
          wallet.current_balance = Number((wallet.current_balance + req.amount).toFixed(2));
          wallet.updated_at = (/* @__PURE__ */ new Date()).toISOString();
          const txId = `tx-${crypto.randomUUID()}`;
          this.transactions.set(txId, {
            id: txId,
            wallet_id: wallet.id,
            user_id: req.user_id,
            type: "REVERSAL",
            amount: req.amount,
            balance_after: wallet.current_balance,
            description: `Reversal for rejected withdrawal #${requestId.slice(-6)}. Reason: ${rejectionReason}`,
            status: "COMPLETED",
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          });
          this.notifications.push({
            id: `notif-${crypto.randomUUID()}`,
            user_id: req.user_id,
            title: "\u2715 Withdrawal Rejected",
            message: `Your withdrawal of \u20B9${req.amount} was rejected. Reason: ${rejectionReason}. Amount restored to your wallet balance.`,
            type: "alert",
            read: false,
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          });
          this.addAuditLog({
            admin_id: adminId,
            admin_username: admin?.username || "admin",
            action: "WITHDRAWAL_REJECTED",
            target_type: "WITHDRAWAL",
            target_id: requestId,
            description: `Withdrawal #${requestId} rejected. Reason: ${rejectionReason}`
          });
          return req;
        });
      }
      // ==========================================
      // DYNAMIC STATS (CALCULATED DIRECTLY FROM DB)
      // ==========================================
      getUserFinancialStats(userId) {
        const wallet = this.getUserWallet(userId);
        let withdrawalCount = 0;
        let approvedWithdrawals = 0;
        let rejectedWithdrawals = 0;
        let pendingWithdrawals = 0;
        let pendingAmount = 0;
        for (const w of this.withdrawals.values()) {
          if (w.user_id === userId) {
            withdrawalCount += 1;
            if (w.status === "APPROVED") approvedWithdrawals += 1;
            else if (w.status === "REJECTED") rejectedWithdrawals += 1;
            else if (w.status === "PENDING") {
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
      getUserTaskStats(userId) {
        let totalClaimed = 0;
        let completed = 0;
        let pending = 0;
        let rejected = 0;
        for (const c of this.claims.values()) {
          if (c.user_id === userId) {
            totalClaimed += 1;
            if (c.status === "COMPLETED") completed += 1;
            else if (c.status === "SUBMITTED" || c.status === "CLAIMED") pending += 1;
            else if (c.status === "CANCELLED") rejected += 1;
          }
        }
        return { totalClaimed, completed, pending, rejected };
      }
      getAdminDashboardStats() {
        const totalUsers = this.users.size;
        let activeUsers = 0;
        for (const u of this.users.values()) {
          if (u.status === "active") activeUsers++;
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
          if (s.status === "VERIFIED") completedSimulations++;
          else if (s.status === "PENDING" || s.status === "CHECKING") pendingSimulations++;
        }
        let totalWalletCredits = 0;
        for (const tx of this.transactions.values()) {
          if (tx.type === "CREDIT" && tx.status === "COMPLETED") {
            totalWalletCredits += tx.amount;
          }
        }
        let pendingWithdrawals = 0;
        let totalWithdrawn = 0;
        for (const w of this.withdrawals.values()) {
          if (w.status === "PENDING") pendingWithdrawals++;
          else if (w.status === "APPROVED") totalWithdrawn += w.amount;
        }
        const dailyMap = /* @__PURE__ */ new Map();
        const now = /* @__PURE__ */ new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 864e5);
          const key = d.toISOString().split("T")[0];
          dailyMap.set(key, { registrations: 0, simulations: 0, walletCredits: 0, withdrawals: 0 });
        }
        for (const u of this.users.values()) {
          const dateKey = u.created_at.split("T")[0];
          if (dailyMap.has(dateKey)) {
            dailyMap.get(dateKey).registrations++;
          }
        }
        for (const s of this.submissions.values()) {
          const dateKey = s.submitted_at.split("T")[0];
          if (dailyMap.has(dateKey)) {
            dailyMap.get(dateKey).simulations++;
          }
        }
        for (const tx of this.transactions.values()) {
          const dateKey = tx.created_at.split("T")[0];
          if (dailyMap.has(dateKey) && tx.type === "CREDIT") {
            dailyMap.get(dateKey).walletCredits += tx.amount;
          }
        }
        for (const w of this.withdrawals.values()) {
          if (w.status === "APPROVED" && w.approved_at) {
            const dateKey = w.approved_at.split("T")[0];
            if (dailyMap.has(dateKey)) {
              dailyMap.get(dateKey).withdrawals += w.amount;
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
      addAuditLog(entry) {
        const log = {
          id: `audit-${crypto.randomUUID()}`,
          ...entry,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.auditLogs.unshift(log);
        if (this.auditLogs.length > 500) this.auditLogs.pop();
        return log;
      }
      getAuditLogs(action, limit = 50) {
        let logs = this.auditLogs;
        if (action) {
          logs = logs.filter((l) => l.action.toLowerCase().includes(action.toLowerCase()));
        }
        return logs.slice(0, limit);
      }
      getUserNotifications(userId) {
        return this.notifications.filter((n) => !n.user_id || n.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      markNotificationAsRead(notifId) {
        const notif = this.notifications.find((n) => n.id === notifId);
        if (notif) notif.read = true;
      }
    };
    db = new DatabaseStore();
  }
});

// server/services/whatsapp.ts
var whatsapp_exports = {};
__export(whatsapp_exports, {
  dispatchWhatsAppOtp: () => dispatchWhatsAppOtp
});
async function dispatchWhatsAppOtp(whatsappNumber, otpCode, purpose) {
  const cleanNumber = String(whatsappNumber).replace(/\D/g, "");
  const recipient = cleanNumber.startsWith("91") && cleanNumber.length === 12 ? cleanNumber : `91${cleanNumber.slice(-10)}`;
  const purposeName = purpose === "login" ? "Login" : purpose === "password_reset" ? "Password Reset" : purpose === "withdrawal" ? "Withdrawal Authorization" : "Account Registration";
  const textBody = `*RITAM REVIEW AGENCY*
Your verification OTP for ${purposeName} is: *${otpCode}*
Valid for 5 minutes. Do not share this code with anyone.`;
  const whatsappWebUrl = `https://api.whatsapp.com/send?phone=${recipient}&text=${encodeURIComponent(textBody)}`;
  const config = db.getRawWhatsappConfig();
  if (config.enabled && config.provider === "meta_cloud" && config.meta_token && config.meta_phone_number_id) {
    try {
      const response = await fetch(`https://graph.facebook.com/v20.0/${config.meta_phone_number_id}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.meta_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipient,
          type: "text",
          text: {
            preview_url: false,
            body: textBody
          }
        })
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        return {
          sent: true,
          channel: "meta_cloud",
          message: `Live WhatsApp message dispatched to +${recipient} via Meta Cloud API.`,
          whatsapp_web_url: whatsappWebUrl
        };
      } else {
        return {
          sent: false,
          channel: "simulation",
          message: `Meta API notice: ${data?.error?.message || "Check recipient credentials"}. Falling back to on-screen OTP.`,
          whatsapp_web_url: whatsappWebUrl,
          error: data?.error?.message
        };
      }
    } catch (err) {
      return {
        sent: false,
        channel: "simulation",
        message: "Network issue contacting WhatsApp API. Falling back to on-screen OTP.",
        whatsapp_web_url: whatsappWebUrl,
        error: err.message
      };
    }
  }
  if (config.enabled && config.provider === "custom_webhook" && config.webhook_url) {
    try {
      const response = await fetch(config.webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: recipient,
          otp: otpCode,
          purpose,
          text: textBody
        })
      });
      if (response.ok) {
        return {
          sent: true,
          channel: "custom_webhook",
          message: `WhatsApp OTP dispatched to custom gateway for +${recipient}.`,
          whatsapp_web_url: whatsappWebUrl
        };
      }
    } catch {
    }
  }
  return {
    sent: true,
    channel: "simulation",
    message: `Generated OTP ${otpCode} for +${recipient}. Ready for on-screen entry or direct WhatsApp launch.`,
    whatsapp_web_url: whatsappWebUrl
  };
}
var init_whatsapp = __esm({
  "server/services/whatsapp.ts"() {
    init_db();
  }
});

// server/server.ts
import dotenv from "dotenv";
import path from "path";
import express2 from "express";
import { fileURLToPath } from "url";

// server/app.ts
import express from "express";

// server/controllers/auth.ts
init_db();

// server/utils/jwt.ts
import crypto2 from "node:crypto";
var JWT_SECRET = process.env.JWT_SECRET || "ritam_review_agency_educational_super_secure_key_2026";
function signToken(payload, expiresInHours = 72) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const exp = Math.floor(Date.now() / 1e3) + expiresInHours * 3600;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString("base64url");
  const signature = crypto2.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}
function verifyToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto2.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (Date.now() / 1e3 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// server/controllers/auth.ts
init_whatsapp();
async function sendOtp(req, res) {
  try {
    const { whatsapp_number, purpose } = req.body;
    if (!whatsapp_number) {
      return res.status(400).json({ error: "WhatsApp number is required." });
    }
    const cleanNumber = String(whatsapp_number).replace(/\D/g, "");
    if (cleanNumber.length < 10) {
      return res.status(400).json({ error: "Please enter a valid 10-digit WhatsApp phone number." });
    }
    const validPurpose = ["registration", "password_reset", "login", "withdrawal"].includes(purpose) ? purpose : "registration";
    const existingUser = db.getUserByWhatsApp(cleanNumber);
    if (validPurpose === "login" || validPurpose === "password_reset") {
      if (!existingUser) {
        return res.status(404).json({
          error: `No registered account found with +91 ${cleanNumber}. Please create an account first.`
        });
      }
      if (existingUser.status === "suspended") {
        return res.status(403).json({
          error: "Your account has been suspended by administration. Please contact support."
        });
      }
    } else if (validPurpose === "registration") {
      if (existingUser) {
        return res.status(400).json({
          error: `An account already exists with WhatsApp number +91 ${cleanNumber}. Please log in.`
        });
      }
    }
    const otpResult = db.generateOtp(cleanNumber, validPurpose);
    const dispatchResult = await dispatchWhatsAppOtp(cleanNumber, otpResult.code, validPurpose);
    return res.json({
      success: true,
      message: `Verification OTP sent to +91 ${cleanNumber}.`,
      cooldownSeconds: otpResult.cooldownSeconds,
      mock_otp: otpResult.code,
      delivery_channel: dispatchResult.channel,
      whatsapp_web_url: dispatchResult.whatsapp_web_url,
      delivery_note: dispatchResult.message
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Failed to send OTP." });
  }
}
async function verifyOtpOnly(req, res) {
  try {
    const { whatsapp_number, otp_code, purpose } = req.body;
    if (!whatsapp_number || !otp_code) {
      return res.status(400).json({ error: "WhatsApp number and OTP code are required." });
    }
    const cleanNumber = String(whatsapp_number).replace(/\D/g, "");
    const validPurpose = ["registration", "password_reset", "login", "withdrawal"].includes(purpose) ? purpose : "registration";
    db.verifyOtp(cleanNumber, String(otp_code), validPurpose, true);
    return res.json({ success: true, message: "OTP verified successfully." });
  } catch (err) {
    return res.status(400).json({ error: err.message || "OTP verification failed." });
  }
}
async function loginWithOtp(req, res) {
  try {
    const { whatsapp_number, otp_code } = req.body;
    if (!whatsapp_number || !otp_code) {
      return res.status(400).json({ error: "WhatsApp number and OTP verification code are required." });
    }
    const cleanNumber = String(whatsapp_number).replace(/\D/g, "");
    const user = await db.authenticateUserWithOtp(cleanNumber, String(otp_code));
    const token = signToken({
      userId: user.id,
      role: "user",
      whatsapp: user.whatsapp_number
    });
    return res.json({
      success: true,
      user,
      token,
      message: "Logged in successfully via WhatsApp OTP verification."
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "OTP Login failed." });
  }
}
async function register(req, res) {
  try {
    const { whatsapp_number, state, city, password, confirm_password } = req.body;
    if (!whatsapp_number || !state || !city || !password || !confirm_password) {
      return res.status(400).json({ error: "All registration fields (WhatsApp number, state, city, password) are required." });
    }
    if (password !== confirm_password) {
      return res.status(400).json({ error: "Password and confirm password do not match." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }
    const cleanNumber = String(whatsapp_number).replace(/\D/g, "");
    if (cleanNumber.length < 10) {
      return res.status(400).json({ error: "Please enter a valid 10-digit WhatsApp number." });
    }
    const existing = db.getUserByWhatsApp(cleanNumber);
    if (existing) {
      return res.status(400).json({ error: `An account already exists with WhatsApp number +91 ${cleanNumber}. Please log in.` });
    }
    const newUser = await db.createUser({
      whatsapp_number: cleanNumber,
      state: String(state).trim(),
      city: String(city).trim(),
      password: String(password)
    });
    const token = signToken({
      userId: newUser.id,
      role: "user",
      whatsapp: newUser.whatsapp_number
    });
    return res.status(201).json({
      success: true,
      user: newUser,
      token,
      message: "Account created successfully! Welcome to Ritam Review Agency."
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Registration failed." });
  }
}
async function login(req, res) {
  try {
    const { whatsapp_number, password } = req.body;
    if (!whatsapp_number || !password) {
      return res.status(400).json({ error: "WhatsApp number and password are required." });
    }
    const user = await db.authenticateUser(String(whatsapp_number), String(password));
    const token = signToken({
      userId: user.id,
      role: "user",
      whatsapp: user.whatsapp_number
    });
    return res.json({
      success: true,
      user,
      token,
      message: "Logged in successfully."
    });
  } catch (err) {
    return res.status(401).json({ error: err.message || "Login failed." });
  }
}
async function adminLogin(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }
    const admin = await db.authenticateAdmin(String(username), String(password));
    const token = signToken({
      adminId: admin.id,
      role: admin.role,
      username: admin.username
    });
    return res.json({
      success: true,
      admin,
      token,
      message: "Admin authenticated successfully."
    });
  } catch (err) {
    return res.status(401).json({ error: err.message || "Admin authentication failed." });
  }
}
async function forgotPassword(req, res) {
  try {
    const { whatsapp_number, new_password, confirm_password } = req.body;
    if (!whatsapp_number || !new_password || !confirm_password) {
      return res.status(400).json({ error: "WhatsApp number and new passwords are required." });
    }
    if (new_password !== confirm_password) {
      return res.status(400).json({ error: "New password and confirm password do not match." });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }
    const cleanNumber = String(whatsapp_number).replace(/\D/g, "");
    await db.resetPassword(cleanNumber, String(new_password));
    return res.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password."
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Password reset failed." });
  }
}
async function getMe(req, res) {
  try {
    if (!req.auth) {
      return res.status(401).json({ error: "Not authenticated." });
    }
    if (req.auth.userId) {
      const user = db.getUserById(req.auth.userId);
      if (!user) return res.status(404).json({ error: "User not found." });
      return res.json({ role: "user", user });
    }
    if (req.auth.adminId) {
      return res.json({
        role: "admin",
        admin: {
          id: req.auth.adminId,
          username: req.auth.username,
          role: req.auth.role
        }
      });
    }
    return res.status(401).json({ error: "Invalid session." });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to retrieve profile." });
  }
}

// server/controllers/tasks.ts
init_db();
async function listTasks(req, res) {
  try {
    const tasks = db.getAllTasks();
    return res.json({ tasks });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to fetch tasks." });
  }
}
async function getTask(req, res) {
  try {
    const { taskId } = req.params;
    const task = db.getTaskById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }
    return res.json({ task });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to fetch task." });
  }
}
async function createTask(req, res) {
  try {
    const {
      name,
      mock_business_name,
      mock_location,
      description,
      total_slots,
      payment_per_completion,
      start_date,
      end_date,
      comments
    } = req.body;
    if (!name || !mock_business_name || !mock_location || !total_slots || !payment_per_completion) {
      return res.status(400).json({ error: "Please provide all required task fields." });
    }
    const commentArray = Array.isArray(comments) ? comments : typeof comments === "string" ? comments.split("\n").filter((c) => c.trim()) : [];
    if (commentArray.length === 0) {
      return res.status(400).json({ error: "Please provide at least one sample comment for the comment pool." });
    }
    const adminId = req.auth?.adminId || "a1000000-0000-0000-0000-000000000001";
    const task = db.createTask({
      name,
      mock_business_name,
      mock_location,
      description: description || "Educational simulation task",
      total_slots: Number(total_slots),
      payment_per_completion: Number(payment_per_completion),
      start_date: start_date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      end_date: end_date || new Date(Date.now() + 30 * 864e5).toISOString().split("T")[0],
      comments: commentArray,
      adminId
    });
    return res.status(201).json({ success: true, task });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Failed to create task." });
  }
}
async function claimTask(req, res) {
  try {
    const { taskId } = req.params;
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Please log in to claim a simulation task." });
    }
    const claim = await db.claimTaskSlot(taskId, userId);
    return res.json({
      success: true,
      claim,
      message: "Simulation task claimed successfully! 1 unique sample comment has been assigned to your account."
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Failed to claim task slot." });
  }
}
async function getMyClaims(req, res) {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required." });
    }
    const claims = db.getUserClaims(userId);
    return res.json({ claims });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to fetch user claims." });
  }
}
async function getClaimDetails(req, res) {
  try {
    const { claimId } = req.params;
    const claim = db.getClaimById(claimId);
    if (!claim) {
      return res.status(404).json({ error: "Claim record not found." });
    }
    return res.json({ claim });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to fetch claim details." });
  }
}
async function deleteTask(req, res) {
  try {
    const { taskId } = req.params;
    const adminId = req.auth?.adminId || "a1000000-0000-0000-0000-000000000001";
    db.deleteTask(taskId, adminId);
    return res.json({
      success: true,
      message: "Simulation task and mock review link deleted successfully."
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Failed to delete task." });
  }
}
async function completeTaskClaim(req, res) {
  try {
    const { claimId } = req.params;
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Please log in to complete your task." });
    }
    const claim = await db.completeTaskClaim(claimId, userId);
    return res.json({
      success: true,
      claim,
      message: "Task marked as completed! Submitted for verification."
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Failed to complete task slot." });
  }
}
async function completeAndClaimNext(req, res) {
  try {
    const { taskId } = req.params;
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Please log in to claim task slots." });
    }
    const result = await db.completeTaskAndClaimNext(taskId, userId);
    return res.json({
      success: true,
      ...result
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Failed to complete task and claim next." });
  }
}

// server/controllers/comments.ts
init_db();
async function listCommentPool(req, res) {
  try {
    const { taskId, status } = req.query;
    const comments = db.getAllComments(
      taskId ? String(taskId) : void 0,
      status ? String(status) : void 0
    );
    const tasks = db.getAllTasks();
    const taskMap = new Map(tasks.map((t) => [t.id, t.name]));
    const enriched = comments.map((c) => ({
      ...c,
      task_name: taskMap.get(c.task_id) || "Simulation Task"
    }));
    return res.json({ comments: enriched });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to list comment pool." });
  }
}
async function addCommentToPool(req, res) {
  try {
    const { task_id, comment_text } = req.body;
    if (!task_id || !comment_text || !comment_text.trim()) {
      return res.status(400).json({ error: "Task ID and comment text are required." });
    }
    const adminId = req.auth?.adminId || "a1000000-0000-0000-0000-000000000001";
    const newComment = db.addCommentToTask(task_id, comment_text, adminId);
    return res.status(201).json({
      success: true,
      comment: newComment,
      message: "Sample comment added to task comment pool."
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Failed to add comment." });
  }
}

// server/controllers/submissions.ts
init_db();
async function submitSimulation(req, res) {
  try {
    const { claim_id, submitted_comment, proof_notes } = req.body;
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required." });
    }
    if (!claim_id || !submitted_comment) {
      return res.status(400).json({ error: "Claim ID and submitted comment text are required." });
    }
    const submission = await db.submitSimulation(claim_id, submitted_comment, proof_notes);
    return res.status(201).json({
      success: true,
      submission,
      message: "Simulation submitted successfully! Internal status: PENDING VERIFICATION."
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Submission failed." });
  }
}
async function listSubmissions(req, res) {
  try {
    const { status } = req.query;
    const submissions = db.getAllSubmissions(status ? String(status) : void 0);
    return res.json({ submissions });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to list submissions." });
  }
}
async function reviewSubmission(req, res) {
  try {
    const { submissionId } = req.params;
    const { decision, notes } = req.body;
    if (!decision || decision !== "VERIFIED" && decision !== "REJECTED") {
      return res.status(400).json({ error: "Decision must be VERIFIED or REJECTED." });
    }
    const adminId = req.auth?.adminId || "a1000000-0000-0000-0000-000000000001";
    const updated = await db.verifySubmission(submissionId, decision, notes || "", adminId);
    return res.json({
      success: true,
      submission: updated,
      message: `Submission marked as ${decision}.`
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Verification update failed." });
  }
}

// server/controllers/wallet.ts
init_db();
async function getMyWallet(req, res) {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required." });
    }
    const wallet = db.getUserWallet(userId);
    const transactions = db.getUserTransactions(userId);
    const stats = db.getUserFinancialStats(userId);
    return res.json({
      wallet,
      transactions,
      stats
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to fetch wallet." });
  }
}
async function listAllTransactions(req, res) {
  try {
    const transactions = db.getAllTransactions();
    return res.json({ transactions });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to list transactions." });
  }
}

// server/controllers/withdrawals.ts
init_db();
init_whatsapp();
async function sendWithdrawalOtp(req, res) {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required." });
    }
    const user = db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    const otpResult = db.generateOtp(user.whatsapp_number, "withdrawal");
    const dispatchResult = await dispatchWhatsAppOtp(user.whatsapp_number, otpResult.code, "withdrawal");
    return res.json({
      success: true,
      message: `Withdrawal authorization OTP sent to registered WhatsApp +91 ${user.whatsapp_number}.`,
      cooldownSeconds: otpResult.cooldownSeconds,
      mock_otp: otpResult.code,
      delivery_channel: dispatchResult.channel,
      whatsapp_web_url: dispatchResult.whatsapp_web_url,
      delivery_note: dispatchResult.message
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Failed to send withdrawal OTP." });
  }
}
async function requestWithdrawal(req, res) {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required." });
    }
    const { upi_id, amount } = req.body;
    if (!upi_id || !amount) {
      return res.status(400).json({ error: "UPI ID and withdrawal amount are required." });
    }
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: "Please enter a valid withdrawal amount." });
    }
    const request = await db.requestWithdrawal(
      userId,
      String(upi_id),
      numericAmount
    );
    return res.status(201).json({
      success: true,
      withdrawal: request,
      message: "Withdrawal request registered with status PENDING. Awaiting admin payment recording."
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Failed to request withdrawal." });
  }
}
async function getMyWithdrawals(req, res) {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required." });
    }
    const withdrawals = db.getUserWithdrawals(userId);
    const stats = db.getUserFinancialStats(userId);
    return res.json({
      withdrawals,
      stats: {
        totalWithdrawn: stats.totalWithdrawn,
        withdrawalCount: stats.withdrawalCount,
        approvedCount: stats.approvedWithdrawals,
        rejectedCount: stats.rejectedWithdrawals,
        pendingCount: stats.pendingWithdrawals,
        pendingAmount: stats.pendingAmount
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to fetch withdrawals." });
  }
}
async function listAllWithdrawals(req, res) {
  try {
    const { status, q } = req.query;
    const withdrawals = db.getAllWithdrawals(
      status ? String(status) : void 0,
      q ? String(q) : void 0
    );
    let totalPending = 0;
    let totalApproved = 0;
    let totalRejected = 0;
    let pendingCount = 0;
    for (const w of withdrawals) {
      if (w.status === "PENDING") {
        totalPending += w.amount;
        pendingCount++;
      } else if (w.status === "APPROVED") {
        totalApproved += w.amount;
      } else if (w.status === "REJECTED") {
        totalRejected += w.amount;
      }
    }
    return res.json({
      withdrawals,
      summary: {
        totalPending,
        totalApproved,
        totalRejected,
        pendingCount
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to list withdrawals." });
  }
}
async function approveWithdrawal(req, res) {
  try {
    const { withdrawalId } = req.params;
    const adminId = req.auth?.adminId || "a1000000-0000-0000-0000-000000000001";
    const updated = await db.approveWithdrawal(withdrawalId, adminId);
    return res.json({
      success: true,
      withdrawal: updated,
      message: "Withdrawal marked as APPROVED. Ledger updated successfully."
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Failed to approve withdrawal." });
  }
}
async function rejectWithdrawal(req, res) {
  try {
    const { withdrawalId } = req.params;
    const { rejection_reason } = req.body;
    if (!rejection_reason || !rejection_reason.trim()) {
      return res.status(400).json({ error: "Rejection reason is required." });
    }
    const adminId = req.auth?.adminId || "a1000000-0000-0000-0000-000000000001";
    const updated = await db.rejectWithdrawal(withdrawalId, rejection_reason, adminId);
    return res.json({
      success: true,
      withdrawal: updated,
      message: "Withdrawal REJECTED. Reserved funds restored to user wallet."
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Failed to reject withdrawal." });
  }
}

// server/controllers/admin.ts
init_db();
async function getDashboardStats(req, res) {
  try {
    const stats = db.getAdminDashboardStats();
    return res.json({ stats });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to fetch admin stats." });
  }
}
async function listUsers(req, res) {
  try {
    const { q } = req.query;
    const users = db.getAllUsers(q ? String(q) : void 0);
    const enrichedUsers = users.map((u) => {
      const fin = db.getUserFinancialStats(u.id);
      const tasks = db.getUserTaskStats(u.id);
      return {
        ...u,
        wallet_balance: fin.currentBalance,
        total_earned: fin.totalEarned,
        total_withdrawn: fin.totalWithdrawn,
        withdrawal_count: fin.withdrawalCount,
        completed_tasks: tasks.completed
      };
    });
    return res.json({ users: enrichedUsers });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to list users." });
  }
}
async function getUserProfile(req, res) {
  try {
    const { userId } = req.params;
    const user = db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    const financial = db.getUserFinancialStats(userId);
    const taskStats = db.getUserTaskStats(userId);
    const claims = db.getUserClaims(userId);
    const withdrawals = db.getUserWithdrawals(userId);
    const transactions = db.getUserTransactions(userId);
    return res.json({
      user,
      financial,
      taskStats,
      recentClaims: claims.slice(0, 5),
      recentWithdrawals: withdrawals.slice(0, 5),
      recentTransactions: transactions.slice(0, 5)
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to fetch user profile." });
  }
}
async function toggleUserStatus(req, res) {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    if (status !== "active" && status !== "suspended") {
      return res.status(400).json({ error: "Status must be active or suspended." });
    }
    const adminId = req.auth?.adminId || "a1000000-0000-0000-0000-000000000001";
    const updated = db.updateUserStatus(userId, status, adminId);
    return res.json({
      success: true,
      user: updated,
      message: `User status changed to ${status}.`
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Failed to update user status." });
  }
}
async function adminResetPassword(req, res) {
  try {
    const { userId } = req.params;
    const { new_password } = req.body;
    if (!new_password || String(new_password).length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long." });
    }
    const adminId = req.auth?.adminId || "a1000000-0000-0000-0000-000000000001";
    db.adminResetUserPassword(userId, String(new_password), adminId);
    return res.json({
      success: true,
      message: "Password reset successfully for the user."
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Failed to reset password." });
  }
}
async function getAuditLogs(req, res) {
  try {
    const { action, limit } = req.query;
    const logs = db.getAuditLogs(
      action ? String(action) : void 0,
      limit ? Number(limit) : 50
    );
    return res.json({ logs });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to retrieve audit logs." });
  }
}
async function getNotifications(req, res) {
  try {
    const userId = req.auth?.userId;
    const notifs = db.getUserNotifications(userId);
    return res.json({ notifications: notifs });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to retrieve notifications." });
  }
}
async function markNotificationRead(req, res) {
  try {
    const { notifId } = req.params;
    db.markNotificationAsRead(notifId);
    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Failed to mark notification." });
  }
}
async function getWhatsappSettings(req, res) {
  try {
    const config = db.getWhatsappConfig();
    return res.json({ config });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to fetch WhatsApp config." });
  }
}
async function updateWhatsappSettings(req, res) {
  try {
    const { provider, meta_token, meta_phone_number_id, webhook_url, enabled } = req.body;
    const updated = db.updateWhatsappConfig({
      provider,
      meta_token,
      meta_phone_number_id,
      webhook_url,
      enabled
    });
    return res.json({ success: true, config: updated, message: "WhatsApp Gateway settings saved successfully." });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Failed to update WhatsApp settings." });
  }
}
async function testSendWhatsappMessage(req, res) {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone number is required for test dispatch." });
    const { dispatchWhatsAppOtp: dispatchWhatsAppOtp2 } = await Promise.resolve().then(() => (init_whatsapp(), whatsapp_exports));
    const result = await dispatchWhatsAppOtp2(phone, "123456", "login");
    return res.json({ success: true, result });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Test dispatch failed." });
  }
}

// server/controllers/ai.ts
import { GoogleGenAI } from "@google/genai";
var aiClient = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
var FALLBACK_SAMPLES = {
  retail: [
    "Prompt customer support and polite staff at the front desk. The billing process was smooth and hassle-free, with clear product warranty explanation.",
    "Well-organized display counters and clean ambience. Team members answered all technical queries patiently. Great simulated benchmark.",
    "Swift checkout experience and courteous assistance. All items were neatly packed and receipts were verified accurately."
  ],
  hospitality: [
    "Warm welcome at the reception and clean seating arrangements. Dining service was attentive and food presentation was top-notch.",
    "Comfortable ambience with quiet background acoustics. Staff ensured regular check-ins on our table without being intrusive.",
    "Efficient room turnover and helpful concierge staff. Very pleasant educational hospitality simulation experience."
  ],
  digital: [
    "Impressive responsiveness on creative brief inquiries. Communication was clear, timely, and milestones were accurately charted.",
    "Structured project presentation deck with transparent deliverable timelines. Demonstrates high agency standard in simulation test.",
    "Prompt technical consultation and proactive recommendations on website layout performance and user experience."
  ]
};
async function generateSampleComment(req, res) {
  try {
    const { business_name, business_type, context_notes } = req.body;
    const business = business_name || "ABC Enterprises";
    const type = business_type || "retail";
    let generatedText = "";
    if (process.env.GEMINI_API_KEY) {
      try {
        if (!aiClient) {
          aiClient = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: {
              headers: {
                "User-Agent": "aistudio-build"
              }
            }
          });
        }
        const prompt = `You are an educational writing tutor generating an objective, realistic sample customer feedback comment for an educational simulation exercise called "RITAM REVIEW AGENCY".
Business Name: ${business}
Business Category: ${type}
Context: ${context_notes || "General customer experience evaluation"}

Guidelines:
1. Write 2-3 sentences of balanced, constructive, realistic educational sample feedback.
2. Focus on aspects like staff courtesy, facility cleanliness, response time, or checkout efficiency.
3. Output ONLY the sample text. No preamble or quotes.`;
        const response = await aiClient.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt
        });
        generatedText = response.text?.trim() || "";
      } catch (geminiErr) {
        console.warn("Gemini API call failed, using fallback templates:", geminiErr);
      }
    }
    if (!generatedText) {
      const category = type.toLowerCase().includes("hotel") || type.toLowerCase().includes("restaurant") ? "hospitality" : type.toLowerCase().includes("tech") || type.toLowerCase().includes("digital") ? "digital" : "retail";
      const pool = FALLBACK_SAMPLES[category] || FALLBACK_SAMPLES.retail;
      const randomIndex = Math.floor(Math.random() * pool.length);
      generatedText = pool[randomIndex].replace(/ABC Enterprises/g, business);
    }
    return res.json({
      success: true,
      sample_comment: generatedText,
      disclaimer: "SIMULATED SAMPLE \u2014 NOT FOR REAL-WORLD POSTING",
      business_name: business
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to generate sample comment." });
  }
}

// server/middleware/auth.ts
init_db();
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required. Please log in." });
  }
  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Session expired or invalid token. Please log in again." });
  }
  req.auth = payload;
  next();
}
function requireUser(req, res, next) {
  requireAuth(req, res, () => {
    if (!req.auth?.userId) {
      return res.status(403).json({ error: "User access required." });
    }
    const user = db.getUserById(req.auth.userId);
    if (!user) {
      return res.status(404).json({ error: "User account not found." });
    }
    if (user.status === "suspended") {
      return res.status(403).json({ error: "Your account has been suspended by administration." });
    }
    next();
  });
}
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (!req.auth?.adminId || req.auth.role !== "admin" && req.auth.role !== "superadmin") {
      return res.status(403).json({ error: "Administrator access required." });
    }
    next();
  });
}

// server/app.ts
var app = express();
app.use(express.json());
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", agency: "RITAM REVIEW AGENCY", environment: "educational_simulator" });
});
app.post("/api/auth/send-otp", sendOtp);
app.post("/api/auth/verify-otp", verifyOtpOnly);
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.post("/api/auth/login-otp", loginWithOtp);
app.post("/api/auth/admin-login", adminLogin);
app.post("/api/auth/forgot-password", forgotPassword);
app.get("/api/auth/me", requireAuth, getMe);
app.get("/api/tasks", listTasks);
app.get("/api/tasks/:taskId", getTask);
app.post("/api/tasks", requireAdmin, createTask);
app.delete("/api/tasks/:taskId", requireAdmin, deleteTask);
app.post("/api/tasks/:taskId/claim", requireUser, claimTask);
app.get("/api/user/claims", requireUser, getMyClaims);
app.get("/api/user/claims/:claimId", requireUser, getClaimDetails);
app.post("/api/user/claims/:claimId/complete", requireUser, completeTaskClaim);
app.post("/api/tasks/:taskId/complete-and-claim-next", requireUser, completeAndClaimNext);
app.post("/api/submissions", requireUser, submitSimulation);
app.get("/api/admin/submissions", requireAdmin, listSubmissions);
app.post("/api/admin/submissions/:submissionId/review", requireAdmin, reviewSubmission);
app.get("/api/admin/comments", requireAdmin, listCommentPool);
app.post("/api/admin/comments", requireAdmin, addCommentToPool);
app.get("/api/user/wallet", requireUser, getMyWallet);
app.get("/api/admin/transactions", requireAdmin, listAllTransactions);
app.post("/api/withdrawals/send-otp", requireUser, sendWithdrawalOtp);
app.post("/api/withdrawals/request", requireUser, requestWithdrawal);
app.get("/api/user/withdrawals", requireUser, getMyWithdrawals);
app.get("/api/admin/withdrawals", requireAdmin, listAllWithdrawals);
app.post("/api/admin/withdrawals/:withdrawalId/approve", requireAdmin, approveWithdrawal);
app.post("/api/admin/withdrawals/:withdrawalId/reject", requireAdmin, rejectWithdrawal);
app.get("/api/admin/stats", requireAdmin, getDashboardStats);
app.get("/api/admin/users", requireAdmin, listUsers);
app.get("/api/admin/users/:userId", requireAdmin, getUserProfile);
app.post("/api/admin/users/:userId/status", requireAdmin, toggleUserStatus);
app.post("/api/admin/users/:userId/reset-password", requireAdmin, adminResetPassword);
app.get("/api/admin/audit-logs", requireAdmin, getAuditLogs);
app.get("/api/admin/whatsapp-settings", requireAdmin, getWhatsappSettings);
app.post("/api/admin/whatsapp-settings", requireAdmin, updateWhatsappSettings);
app.post("/api/admin/whatsapp-test", requireAdmin, testSendWhatsappMessage);
app.get("/api/notifications", requireAuth, getNotifications);
app.post("/api/notifications/:notifId/read", requireAuth, markNotificationRead);
app.post("/api/ai/generate-sample", generateSampleComment);

// server/server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var PORT = process.env.PORT || 3e3;
var distPath = path.resolve(__dirname, "../dist");
app.use(express2.static(distPath));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(distPath, "index.html"));
});
app.listen(PORT, () => {
  console.log(`[RITAM REVIEW AGENCY] Educational Server running on http://0.0.0.0:${PORT}`);
});
