export async function updatePassword(currentPassword: string, newPassword: string) {
  // Use the internal Next.js API proxy so cookies and authentication are forwarded correctly
  const res = await fetch(`/api/auth/update-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ CurrentPassword: currentPassword, NewPassword: newPassword }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Failed to update password: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
