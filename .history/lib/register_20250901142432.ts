// lib/register.ts
import { User } from "./data";

export interface RegisterUserInput {
  employeeID: string;
  fullName: string;
  email: string;
  role: User["role"];
  password: string;
  department?: string;
}

export async function registerUser(input: RegisterUserInput): Promise<{ message: string }> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Registration failed");
  return data;
}
