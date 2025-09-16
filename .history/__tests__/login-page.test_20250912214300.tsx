import { render, fireEvent, screen } from "@testing-library/react";
import LoginPage from "@/app/login/page";
import * as auth from "@/lib/auth";

jest.mock("@/lib/auth");

describe("LoginPage", () => {
  it("shows error for empty fields", async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByText(/login/i));
    expect(screen.getByText(/please enter/i)).toBeInTheDocument();
  });

  it("calls login and shows success", async () => {
    (auth.login as jest.Mock).mockResolvedValue({ success: true, user: { email: "demo@example.com" } });
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "demo@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password" } });
    fireEvent.click(screen.getByText(/login/i));
    // Add assertions for success (e.g., redirect or message)
  });

  it("shows error on failed login", async () => {
    (auth.login as jest.Mock).mockResolvedValue({ success: false, error: "Invalid credentials" });
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "demo@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "wrong" } });
    fireEvent.click(screen.getByText(/login/i));
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
