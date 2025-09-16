// lib/updatePassword.ts

/**
 * Calls the backend to update the current user's password.
 * @param newPassword The new password to set
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function updatePassword(currentPassword: string, newPassword: string, userId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const body: any = { currentPassword, newPassword };
    if (userId) body.userId = userId;
    const response = await fetch("/api/auth/update-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: errorText || "Failed to update password." };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Network error." };
  }
}
