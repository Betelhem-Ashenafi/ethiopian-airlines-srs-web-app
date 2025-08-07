"use server"

import { ro } from "date-fns/locale";
import { users, type User } from "./data"

export async function login(
  formData: FormData,
): Promise<{ success: boolean; user?: Omit<User, "password">; error?: string }> {
  const employeeId = formData.get("employeeId") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as User["role"]

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const user = users.find((u) => u.employeeId === employeeId && u.password === password && u.status === "Active"&& u.role===role )

  if (user) {
    // Return user data without the password
    const { password, ...userWithoutPassword } = user
    return { success: true, user: userWithoutPassword }
  } else {
    return { success: false, error: "Invalid Employee ID or password." }
  }
}

export async function logout(): Promise<void> {
  // In a real app, this would invalidate server-side session/token
  await new Promise((resolve) => setTimeout(resolve, 100))
  console.log("User logged out (simulated)")
}
