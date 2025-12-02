export interface UserSession {
  userId: string;
  state: 'IDLE' | 'WAITING_FOR_MESSAGE_TO_CHECK';
  lastActivity: number;
  createdAt: number;
}

export class SessionManager {
  private sessions: Map<string, UserSession> = new Map();
  private readonly SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Clean up expired sessions every 2 minutes
    setInterval(() => this.cleanupSessions(), 2 * 60 * 1000);
  }

  getSession(userId: string): UserSession {
    const session = this.sessions.get(userId);
    if (session) {
      session.lastActivity = Date.now();
      return session;
    }

    // Create new session
    const newSession: UserSession = {
      userId,
      state: 'IDLE',
      lastActivity: Date.now(),
      createdAt: Date.now()
    };
    
    this.sessions.set(userId, newSession);
    return newSession;
  }

  updateSessionState(userId: string, state: UserSession['state']): void {
    const session = this.getSession(userId);
    session.state = state;
    session.lastActivity = Date.now();
  }

  isWaitingForMessage(userId: string): boolean {
    const session = this.getSession(userId);
    return session.state === 'WAITING_FOR_MESSAGE_TO_CHECK';
  }

  resetSession(userId: string): void {
    const session = this.getSession(userId);
    session.state = 'IDLE';
    session.lastActivity = Date.now();
  }

  private cleanupSessions(): void {
    const now = Date.now();
    for (const [userId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.SESSION_TIMEOUT) {
        this.sessions.delete(userId);
        console.log(`🧹 Cleaned up expired session for user: ${userId}`);
      }
    }
  }

  getSessionCount(): number {
    return this.sessions.size;
  }
}