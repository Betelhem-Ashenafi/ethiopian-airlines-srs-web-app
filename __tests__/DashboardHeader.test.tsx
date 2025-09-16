// Mock Radix DropdownMenu to always render its children
jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSeparator: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));
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
    // Open user dropdown menu
    const userMenuButton = screen.getAllByRole("button").find(btn => btn.textContent?.includes("Toggle user menu") || btn.querySelector(".sr-only"));
    if (userMenuButton) {
      fireEvent.click(userMenuButton);
    }
    expect(screen.getByText(/Demo User/i)).toBeInTheDocument();
    expect(screen.getByText(/System Admin/i)).toBeInTheDocument();
  });

  it("shows the notification bell and theme toggle", () => {
    render(<DashboardHeader />);
    expect(screen.getByLabelText(/Notifications/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Toggle dark mode/i)).toBeInTheDocument();
  });

  it("calls setTheme when theme toggle is clicked", () => {
    // Spy on setTheme mock
    const setThemeMock = jest.fn();
    jest.spyOn(require("next-themes"), "useTheme").mockReturnValue({ theme: "light", setTheme: setThemeMock });
    render(<DashboardHeader />);
    fireEvent.click(screen.getByLabelText(/Toggle dark mode/i));
    expect(setThemeMock).toHaveBeenCalled();
  });

  it("calls logout when logout is clicked", () => {
    const logoutMock = jest.fn();
    jest.spyOn(require("@/components/auth-provider"), "useAuth").mockReturnValue({
      user: { fullName: "Demo User", role: "System Admin" },
      logout: logoutMock,
    });
    render(<DashboardHeader />);
    // Open user dropdown menu
    const userMenuButton = screen.getAllByRole("button").find(btn => btn.textContent?.includes("Toggle user menu") || btn.querySelector(".sr-only"));
    if (userMenuButton) {
      fireEvent.click(userMenuButton);
    }
    fireEvent.click(screen.getByText(/Logout/i));
    expect(logoutMock).toHaveBeenCalled();
  });
});
