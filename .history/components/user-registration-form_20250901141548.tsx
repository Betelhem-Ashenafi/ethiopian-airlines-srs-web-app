"use client"

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface User {
  employeeID: string;
  fullName: string;
  email: string;
  role: string;
  createdAt?: string;
  isActive?: boolean;
}

export default function UserRegistrationForm({ onUserRegistered }: { onUserRegistered?: (user: User) => void }) {
  const [form, setForm] = useState({
    employeeID: "",
    fullName: "",
    email: "",
    role: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      setSuccess(data.message);
      if (onUserRegistered && data.user) onUserRegistered(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4 max-w-md mx-auto" onSubmit={handleSubmit}>
      <Input name="employeeID" placeholder="Employee ID" value={form.employeeID} onChange={handleChange} required />
      <Input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required />
      <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <select name="role" value={form.role} onChange={handleChange} required className="w-full border rounded px-3 py-2">
        <option value="">Select Role</option>
        <option value="System Admin">System Admin</option>
        <option value="Department Admin">Department Admin</option>
        <option value="Employee">Employee</option>
      </select>
      <Input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
      <Button type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</Button>
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-500">{success}</div>}
    </form>
  );
}
