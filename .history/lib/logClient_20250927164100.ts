// logClient.ts: Send logs to the backend API
export async function logEvent({ type, action, message, data, user }: {
  type: 'info' | 'error' | 'warn',
  action: string,
  message: string,
  data?: any,
  user?: any
}) {
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, action, message, data, user })
    });
  } catch (err) {
    // Fallback to console if network fails
    console.error('Failed to send log to backend', err);
  }
}
