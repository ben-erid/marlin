import { v4 as uuidv4 } from 'uuid';
import type { BrowserContext } from 'playwright';

const SESSION_TTL = parseInt(process.env.SESSION_TTL_MS || '1800000');

interface Session {
  id: string;
  context: BrowserContext;
  username: string;
  lastAccess: number;
}

const sessions = new Map<string, Session>();

// Cleanup expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.lastAccess > SESSION_TTL) {
      session.context.close().catch(() => {});
      sessions.delete(id);
      console.log(`[session] expired: ${id}`);
    }
  }
}, 5 * 60_000);

export function createSession(context: BrowserContext, username: string): string {
  const id = uuidv4();
  sessions.set(id, { id, context, username, lastAccess: Date.now() });
  return id;
}

export function getSession(id: string): Session | null {
  const session = sessions.get(id);
  if (!session) return null;
  session.lastAccess = Date.now();
  return session;
}

export function deleteSession(id: string): boolean {
  const session = sessions.get(id);
  if (session) {
    session.context.close().catch(() => {});
    sessions.delete(id);
    return true;
  }
  return false;
}

export function listSessions(): Array<{ id: string; username: string; age: number }> {
  const now = Date.now();
  return [...sessions.values()].map(s => ({
    id: s.id,
    username: s.username,
    age: Math.round((now - s.lastAccess) / 1000),
  }));
}
