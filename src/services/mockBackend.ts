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
  AdminDashboardStats
} from '../../shared/types.ts';

// Initial seed data for static browser environment (e.g. GitHub Pages)
const DEFAULT_ADMIN: Admin = {
  id: 'a1000000-0000-0000-0000-000000000001',
  username: 'admin',
  name: 'Ritam Administrator',
  role: 'superadmin',
  created_at: new Date().toISOString()
};

const DEFAULT_TASKS: Task[] = [
  {
    id: 't1000000-0000-0000-0000-000000000001',
    name: 'Agartala Electronic Superstore Feedback Analysis',
    mock_business_name: 'SuperTech Electronics & Appliances',
    mock_location: 'Melarmath, Agartala, Tripura',
    mock_map_link: '/mock-map/t1000000-0000-0000-0000-000000000001',
    description: 'Educational mock map simulation for practicing objective consumer reviews and verified feedback.',
    total_slots: 5,
    claimed_slots: 0,
    completed_slots: 0,
    payment_per_completion: 15,
    start_date: '2026-09-01',
    end_date: '2026-11-30',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    comments_count: 5
  },
  {
    id: 't2000000-0000-0000-0000-000000000002',
    name: 'Tripura Tea & Bakery Retail Analysis',
    mock_business_name: 'Heritage Tea Lounge & Bakes',
    mock_location: 'Akhaura Road, Agartala, Tripura',
    mock_map_link: '/mock-map/t2000000-0000-0000-0000-000000000002',
    description: 'Practice simulated review submissions for customer hospitality, atmosphere, and service speed.',
    total_slots: 5,
    claimed_slots: 0,
    completed_slots: 0,
    payment_per_completion: 20,
    start_date: '2026-09-10',
    end_date: '2026-11-15',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    comments_count: 5
  }
];

const DEFAULT_COMMENTS: TaskComment[] = [
  {
    id: 'c101',
    task_id: 't1000000-0000-0000-0000-000000000001',
    comment_text: 'Excellent inventory of genuine electronics with quick demo from helpful sales staff. Great experience!',
    status: 'AVAILABLE',
    created_at: new Date().toISOString()
  },
  {
    id: 'c102',
    task_id: 't1000000-0000-0000-0000-000000000001',
    comment_text: 'Billing was transparent and the extended warranty policy was explained in full detail. Highly recommended.',
    status: 'AVAILABLE',
    created_at: new Date().toISOString()
  },
  {
    id: 'c103',
    task_id: 't1000000-0000-0000-0000-000000000001',
    comment_text: 'Clean showroom, well organized categories for mobile phones and laptops. Prompt customer assistance.',
    status: 'AVAILABLE',
    created_at: new Date().toISOString()
  },
  {
    id: 'c104',
    task_id: 't1000000-0000-0000-0000-000000000001',
    comment_text: 'Good pricing on home appliances and free delivery arranged within the specified timeframe.',
    status: 'AVAILABLE',
    created_at: new Date().toISOString()
  },
  {
    id: 'c105',
    task_id: 't1000000-0000-0000-0000-000000000001',
    comment_text: 'Professional after-sales technical support and honest guidance regarding product specs.',
    status: 'AVAILABLE',
    created_at: new Date().toISOString()
  },
  {
    id: 'c201',
    task_id: 't2000000-0000-0000-0000-000000000002',
    comment_text: 'Authentic local tea blends with freshly baked savory snacks. Quiet and peaceful reading environment.',
    status: 'AVAILABLE',
    created_at: new Date().toISOString()
  },
  {
    id: 'c202',
    task_id: 't2000000-0000-0000-0000-000000000002',
    comment_text: 'Very hygienic presentation, fresh aroma, and warm hospitality by the staff. Will visit again.',
    status: 'AVAILABLE',
    created_at: new Date().toISOString()
  },
  {
    id: 'c203',
    task_id: 't2000000-0000-0000-0000-000000000002',
    comment_text: 'Superb quality bakery items, especially the ginger cookies and artisan teas.',
    status: 'AVAILABLE',
    created_at: new Date().toISOString()
  }
];

class MockBrowserStorage {
  private get<T>(key: string, defaultVal: T): T {
    try {
      const stored = localStorage.getItem('ritam_' + key);
      return stored ? JSON.parse(stored) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private set<T>(key: string, val: T): void {
    try {
      localStorage.setItem('ritam_' + key, JSON.stringify(val));
    } catch {
      // quota exceeded or private mode
    }
  }

  public getUsers(): User[] {
    return this.get<User[]>('users', []);
  }

  public getTasks(): Task[] {
    return this.get<Task[]>('tasks', DEFAULT_TASKS);
  }

  public getComments(): TaskComment[] {
    return this.get<TaskComment[]>('comments', DEFAULT_COMMENTS);
  }

  public getClaims(): TaskClaim[] {
    return this.get<TaskClaim[]>('claims', []);
  }

  public getSubmissions(): SimulatedSubmission[] {
    return this.get<SimulatedSubmission[]>('submissions', []);
  }

  public getWallets(): Record<string, Wallet> {
    return this.get<Record<string, Wallet>>('wallets', {});
  }

  public getTransactions(): WalletTransaction[] {
    return this.get<WalletTransaction[]>('transactions', []);
  }

  public getWithdrawals(): WithdrawalRequest[] {
    return this.get<WithdrawalRequest[]>('withdrawals', []);
  }

  public getAuditLogs(): AuditLog[] {
    return this.get<AuditLog[]>('audit_logs', [
      {
        id: 'audit-001',
        admin_id: 'admin',
        admin_username: 'Ritam',
        action: 'SYSTEM_READY',
        target_type: 'SYSTEM',
        target_id: 'ALL',
        description: 'Static browser simulator ready with multi-slot support.',
        created_at: new Date().toISOString()
      }
    ]);
  }

  // --- ACTIONS ---
  public loginUser(whatsapp_number: string, password?: string): User {
    const cleanNumber = whatsapp_number.replace(/\D/g, '');
    const users = this.getUsers();
    let user = users.find(u => u.whatsapp_number === cleanNumber);

    if (!user) {
      // Auto-create for seamless demonstration on static hosting
      user = {
        id: 'u-' + Math.random().toString(36).substring(2, 9),
        whatsapp_number: cleanNumber,
        state: 'Tripura',
        city: 'Agartala',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };
      users.push(user);
      this.set('users', users);

      // Create initial wallet
      const wallets = this.getWallets();
      wallets[user.id] = {
        id: 'w-' + user.id,
        user_id: user.id,
        current_balance: 50,
        total_earned: 50,
        total_withdrawn: 0,
        updated_at: new Date().toISOString()
      };
      this.set('wallets', wallets);
    } else {
      user.last_login = new Date().toISOString();
      this.set('users', users);
    }

    return user;
  }

  public loginAdmin(username: string): Admin {
    return DEFAULT_ADMIN;
  }

  public claimTask(taskId: string, userId: string): { claim: TaskClaim & { comment_text: string } } {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found.');

    if (task.claimed_slots >= task.total_slots) {
      throw new Error('All slots for this task have been claimed.');
    }

    const claims = this.getClaims();
    const activeClaim = claims.find(c => c.task_id === taskId && c.user_id === userId && c.status === 'CLAIMED');
    if (activeClaim) {
      throw new Error('ACTIVE_CLAIM_EXISTS: You currently have an active task slot in progress. Please complete "I have completed this task" first before claiming another comment for this link.');
    }

    const comments = this.getComments();
    const availableComment = comments.find(c => c.task_id === taskId && c.status === 'AVAILABLE');
    if (!availableComment) {
      throw new Error('No more unique comments available in pool for this task.');
    }

    availableComment.status = 'ASSIGNED';
    this.set('comments', comments);

    const newClaim: TaskClaim = {
      id: 'claim-' + Math.random().toString(36).substring(2, 9),
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

    claims.push(newClaim);
    this.set('claims', claims);

    task.claimed_slots += 1;
    this.set('tasks', tasks);

    return {
      claim: {
        ...newClaim,
        comment_text: availableComment.comment_text
      }
    };
  }

  public completeAndClaimNext(taskId: string, userId: string): {
    completedClaim: TaskClaim;
    nextClaim?: TaskClaim & { comment_text: string };
    allCompleted?: boolean;
    message: string;
  } {
    const claims = this.getClaims();
    const activeClaim = claims.find(c => c.task_id === taskId && c.user_id === userId && c.status === 'CLAIMED');
    if (!activeClaim) {
      throw new Error('No active claim in progress found for this task.');
    }

    activeClaim.status = 'COMPLETED';
    activeClaim.completed_at = new Date().toISOString();
    this.set('claims', claims);

    // Credit simulated wallet immediately
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    const reward = task?.payment_per_completion || 15;

    const wallets = this.getWallets();
    if (!wallets[userId]) {
      wallets[userId] = {
        id: 'w-' + userId,
        user_id: userId,
        current_balance: 0,
        total_earned: 0,
        total_withdrawn: 0,
        updated_at: new Date().toISOString()
      };
    }
    wallets[userId].current_balance += reward;
    wallets[userId].total_earned += reward;
    wallets[userId].updated_at = new Date().toISOString();
    this.set('wallets', wallets);

    const txs = this.getTransactions();
    txs.unshift({
      id: 'tx-' + Math.random().toString(36).substring(2, 9),
      wallet_id: 'w-' + userId,
      user_id: userId,
      task_id: taskId,
      task_name: task?.name,
      type: 'CREDIT',
      amount: reward,
      balance_after: wallets[userId].current_balance,
      description: `Task review completed for "${task?.name || 'Task'}"`,
      status: 'COMPLETED',
      created_at: new Date().toISOString()
    });
    this.set('transactions', txs);

    if (task) {
      task.completed_slots += 1;
      this.set('tasks', tasks);
    }

    // Check if slots remain for next claim
    if (!task || task.claimed_slots >= task.total_slots) {
      return {
        completedClaim: activeClaim,
        allCompleted: true,
        message: 'Task completed and reward credited! All slots for this task are completed.'
      };
    }

    // Assign next available comment
    const comments = this.getComments();
    const nextComment = comments.find(c => c.task_id === taskId && c.status === 'AVAILABLE');
    if (!nextComment) {
      return {
        completedClaim: activeClaim,
        allCompleted: true,
        message: 'Task completed and reward credited! All comments in pool have been assigned.'
      };
    }

    nextComment.status = 'ASSIGNED';
    this.set('comments', comments);

    const nextClaim: TaskClaim = {
      id: 'claim-' + Math.random().toString(36).substring(2, 9),
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

    claims.push(nextClaim);
    this.set('claims', claims);

    task.claimed_slots += 1;
    this.set('tasks', tasks);

    return {
      completedClaim: activeClaim,
      nextClaim: {
        ...nextClaim,
        comment_text: nextComment.comment_text
      },
      message: 'Previous review completed! Next slot and comment have been assigned for this link.'
    };
  }

  public completeTaskClaim(claimId: string, userId: string): TaskClaim {
    const claims = this.getClaims();
    const claim = claims.find(c => c.id === claimId);
    if (!claim) throw new Error('Claim not found.');

    claim.status = 'COMPLETED';
    claim.completed_at = new Date().toISOString();
    this.set('claims', claims);

    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === claim.task_id);
    const reward = task?.payment_per_completion || 15;

    const wallets = this.getWallets();
    if (!wallets[userId]) {
      wallets[userId] = {
        id: 'w-' + userId,
        user_id: userId,
        current_balance: 0,
        total_earned: 0,
        total_withdrawn: 0,
        updated_at: new Date().toISOString()
      };
    }
    wallets[userId].current_balance += reward;
    wallets[userId].total_earned += reward;
    this.set('wallets', wallets);

    return claim;
  }

  public getWallet(userId: string): { wallet: Wallet; stats: UserFinancialStats } {
    const wallets = this.getWallets();
    const wallet = wallets[userId] || {
      id: 'w-' + userId,
      user_id: userId,
      current_balance: 50,
      total_earned: 50,
      total_withdrawn: 0,
      updated_at: new Date().toISOString()
    };

    const withdrawals = this.getWithdrawals().filter(w => w.user_id === userId);
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'PENDING').length;
    const approvedWithdrawals = withdrawals.filter(w => w.status === 'APPROVED').length;
    const rejectedWithdrawals = withdrawals.filter(w => w.status === 'REJECTED').length;

    return {
      wallet,
      stats: {
        currentBalance: wallet.current_balance,
        totalEarned: wallet.total_earned,
        totalWithdrawn: wallet.total_withdrawn,
        withdrawalCount: withdrawals.length,
        pendingWithdrawals,
        approvedWithdrawals,
        rejectedWithdrawals,
        pendingAmount: 0
      }
    };
  }
}

export const mockStorage = new MockBrowserStorage();

export function mockApiHandler(endpoint: string, options: RequestInit = {}): any {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : {};

  // Auth
  if (endpoint.startsWith('/api/auth/login-otp') || endpoint.startsWith('/api/auth/login')) {
    const user = mockStorage.loginUser(body.whatsapp_number || '8837366829');
    return {
      success: true,
      user,
      token: 'mock-user-token-' + user.id,
      role: 'user',
      message: 'Logged in successfully.'
    };
  }

  if (endpoint.startsWith('/api/auth/admin-login')) {
    const admin = mockStorage.loginAdmin(body.username || 'admin');
    return {
      success: true,
      admin,
      token: 'mock-admin-token',
      role: 'admin',
      message: 'Admin authorized.'
    };
  }

  if (endpoint.startsWith('/api/auth/register')) {
    const user = mockStorage.loginUser(body.whatsapp_number, body.password);
    return {
      success: true,
      user,
      token: 'mock-user-token-' + user.id,
      role: 'user',
      message: 'Registered successfully.'
    };
  }

  if (endpoint.startsWith('/api/auth/send-otp')) {
    return {
      success: true,
      message: 'OTP sent: 123456 (demo code)',
      cooldownSeconds: 60,
      mock_otp: '123456'
    };
  }

  if (endpoint.startsWith('/api/auth/verify-otp')) {
    return {
      success: true,
      message: 'OTP verified successfully.'
    };
  }

  if (endpoint === '/api/auth/me') {
    const token = localStorage.getItem('ritam_auth_token');
    const role = localStorage.getItem('ritam_auth_role');
    if (!token) throw new Error('Not authenticated.');
    if (role === 'admin') {
      return { role: 'admin', admin: mockStorage.loginAdmin('admin') };
    }
    const users = mockStorage.getUsers();
    const user = users[0] || mockStorage.loginUser('8837366829');
    return { role: 'user', user };
  }

  // Tasks
  if (endpoint === '/api/tasks' && method === 'GET') {
    return { tasks: mockStorage.getTasks() };
  }

  const taskMatch = endpoint.match(/\/api\/tasks\/([^/]+)$/);
  if (taskMatch && method === 'GET') {
    const task = mockStorage.getTasks().find(t => t.id === taskMatch[1]);
    if (!task) throw new Error('Task not found.');
    return { task };
  }

  const claimNextMatch = endpoint.match(/\/api\/tasks\/([^/]+)\/complete-and-claim-next/);
  if (claimNextMatch && method === 'POST') {
    const users = mockStorage.getUsers();
    const userId = users[0]?.id || 'demo-user';
    return mockStorage.completeAndClaimNext(claimNextMatch[1], userId);
  }

  const claimMatch = endpoint.match(/\/api\/tasks\/([^/]+)\/claim/);
  if (claimMatch && method === 'POST') {
    const users = mockStorage.getUsers();
    const userId = users[0]?.id || 'demo-user';
    return mockStorage.claimTask(claimMatch[1], userId);
  }

  const completeClaimMatch = endpoint.match(/\/api\/user\/claims\/([^/]+)\/complete/);
  if (completeClaimMatch && method === 'POST') {
    const users = mockStorage.getUsers();
    const userId = users[0]?.id || 'demo-user';
    const claim = mockStorage.completeTaskClaim(completeClaimMatch[1], userId);
    return { success: true, claim, message: 'Task completed successfully.' };
  }

  if (endpoint === '/api/user/claims' && method === 'GET') {
    return { claims: mockStorage.getClaims() };
  }

  // Wallet
  if (endpoint === '/api/user/wallet' && method === 'GET') {
    const users = mockStorage.getUsers();
    const userId = users[0]?.id || 'demo-user';
    return mockStorage.getWallet(userId);
  }

  // Admin Comments
  if (endpoint.startsWith('/api/admin/comments')) {
    return { comments: mockStorage.getComments() };
  }

  // Admin Submissions
  if (endpoint.startsWith('/api/admin/submissions')) {
    return { submissions: mockStorage.getSubmissions() };
  }

  // Admin Transactions
  if (endpoint.startsWith('/api/admin/transactions')) {
    return { transactions: mockStorage.getTransactions() };
  }

  // Withdrawals
  if (endpoint === '/api/user/withdrawals' || endpoint === '/api/admin/withdrawals') {
    return { withdrawals: mockStorage.getWithdrawals() };
  }

  // Admin Dashboard
  if (endpoint === '/api/admin/dashboard') {
    const tasks = mockStorage.getTasks();
    const users = mockStorage.getUsers();
    return {
      stats: {
        totalUsers: users.length,
        activeTasks: tasks.filter(t => t.status === 'active').length,
        totalSlots: tasks.reduce((sum, t) => sum + t.total_slots, 0),
        claimedSlots: tasks.reduce((sum, t) => sum + t.claimed_slots, 0),
        completedSlots: tasks.reduce((sum, t) => sum + t.completed_slots, 0),
        totalTransactions: 0,
        pendingWithdrawals: 0,
        approvedWithdrawals: 0,
        systemBalance: 50000
      }
    };
  }

  return { success: true };
}
