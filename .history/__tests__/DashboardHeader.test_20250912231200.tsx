import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DashboardHeader from "@/components/dashboard-header";
import { useAuth } from "@/components/auth-provider";
import { useTheme } from "next-themes";

// Mock useAuth to provide a fake user and logout function
jest.mock("@/components/auth-provider", () => ({
  useAuth: () => ({
    user: { fullName: "Demo User", role: "System Admin" },
    logout: jest.fn(),
  }),
}));

// Mock useTheme for theme toggling
jest.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: jest.fn() }),
}));

describe("DashboardHeader", () => {
  it("renders the header and user info", () => {
    render(<DashboardHeader />);
    expect(screen.getByText(/Defect Management Portal/i)).toBeInTheDocument();
    expect(screen.getByText(/Demo User/i)).toBeInTheDocument();
    expect(screen.getByText(/System Admin/i)).toBeInTheDocument();
  });

  it("shows the notification bell and theme toggle", () => {
    render(<DashboardHeader />);
    expect(screen.getByLabelText(/Notifications/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Toggle dark mode/i)).toBeInTheDocument();
  });

  it("calls setTheme when theme toggle is clicked", () => {
    const { setTheme } = useTheme();
    render(<DashboardHeader />);
    fireEvent.click(screen.getByLabelText(/Toggle dark mode/i));
    expect(setTheme).toHaveBeenCalled();
  });

  it("calls logout when logout is clicked", () => {
    const { logout } = useAuth();
    render(<DashboardHeader />);
    fireEvent.click(screen.getByText(/Logout/i));
    expect(logout).toHaveBeenCalled();
  });
});
