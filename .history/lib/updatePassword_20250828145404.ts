// lib/updatePassword.ts

/**
 * Calls the backend to update the current user's password.
 * @param newPassword The new password to set
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function updatePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
  const response = await fetch("http://sv/api/auth/update-password", {
        method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ currentPassword, newPassword }),
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
