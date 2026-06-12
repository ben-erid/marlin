import { Router } from 'express';
import { getBrowser } from '../lib/browser.js';
import { createSession, deleteSession, listSessions } from '../lib/sessions.js';
import { doLogin, getLoggedInUsername } from '../services/auth.js';

const router = Router();

interface ConnectBody {
  username: string;
  password: string;
}

// POST /api/auth/connect
router.post('/connect', async (req, res) => {
  const { username, password } = req.body as ConnectBody;

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  try {
    const browser = await getBrowser();
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
    });
    const page = await context.newPage();

    const success = await doLogin(page, username, password);
    if (!success) {
      await context.close();
      return res.status(401).json({ error: 'Login failed — check credentials' });
    }

    const loggedInAs = await getLoggedInUsername(page);
    const sessionId = createSession(context, loggedInAs || username);
    await page.close();

    console.log(`[auth] ${loggedInAs} connected — session ${sessionId}`);
    return res.json({ session_id: sessionId, message: `Logged in as ${loggedInAs || username}` });
  } catch (err) {
    console.error('[auth] connect error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/auth/disconnect
router.delete('/disconnect', (req, res) => {
  const sessionId = req.headers['x-session-id'] as string;
  if (!sessionId) {
    return res.status(400).json({ error: 'x-session-id header required' });
  }
  const deleted = deleteSession(sessionId);
  if (!deleted) {
    return res.status(404).json({ error: 'Session not found' });
  }
  console.log(`[auth] session ${sessionId} disconnected`);
  return res.json({ message: 'Session closed' });
});

// GET /api/auth/sessions
router.get('/sessions', (_req, res) => {
  res.json({ sessions: listSessions() });
});

export default router;
