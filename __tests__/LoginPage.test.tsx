// Mock Next.js router hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), back: jest.fn(), forward: jest.fn(), refresh: jest.fn(), }),
  usePathname: () => '/login',
}));
// Mock the AuthProvider so its async restoreUser effect doesn't run in tests
jest.mock('@/components/auth-provider', () => {
  const React = require('react');
  return {
    AuthProvider: ({ children }: any) => React.createElement(React.Fragment, null, children),
    useAuth: () => ({ login: jest.fn(), logout: jest.fn(), user: null }),
  };
});
import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginPage from "@/app/login/page";
import { AuthProvider } from "@/components/auth-provider";
import * as auth from "@/lib/auth";

jest.mock("@/lib/auth");

describe("LoginPage", () => {
  it("renders the login form", async () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );
    // Ensure key elements are present
    expect(screen.getByLabelText(/employee id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it("calls login and resolves successfully", async () => {
    (auth.login as jest.Mock).mockResolvedValue({ success: true, user: { employeeId: "EMP-001" } });
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );
    fireEvent.change(screen.getByLabelText(/employee id/i), { target: { value: "EMP-001" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password" } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    // Wait for auth.login to have been called
    await waitFor(() => expect(auth.login).toHaveBeenCalled());
  });

  it("shows error on failed login", async () => {
    (auth.login as jest.Mock).mockResolvedValue({ success: false, error: "Invalid credentials" });
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );
    fireEvent.change(screen.getByLabelText(/employee id/i), { target: { value: "EMP-001" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
