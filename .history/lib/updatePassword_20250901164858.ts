export async function updatePassword(currentPassword: string, newPassword: string) {
  const res = await fetch("http://svdcbas02:8212/api/auth/update-password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // keeps session login from backend
    body: JSON.stringify({ CurrentPassword: currentPassword, NewPassword: newPassword }),
  });

  if (!res.ok) {
    throw new Error(`Failed to update password: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
