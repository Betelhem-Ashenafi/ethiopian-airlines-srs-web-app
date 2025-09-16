import { type User } from "./data";

export async function login(
  formData: FormData,
): Promise<{ success: boolean; user?: Omit<User, "password">; error?: string }> {
  const employeeId = formData.get("employeeId") as string;
  const password = formData.get("password") as string;

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // 🔑 sends cookies/session
      body: JSON.stringify({ employeeId, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: errorText || "Login failed." };
    }

    const data = await response.json();

    // normalize backend response into your expected format
    return {
      success: true,
      user: data.user, // make sure your backend returns { user: {...} }
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Network error." };
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch("https://172.20.97.149:7022/api/auth/logout", {
      method: "POST",
      credentials: "include", // 🔑 Sends cookies/session
    });
  } catch (err) {
    console.error("Logout failed", err);
  }
}
