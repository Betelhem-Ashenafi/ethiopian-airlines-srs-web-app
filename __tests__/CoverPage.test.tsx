import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CoverPage from "@/app/page";

describe("CoverPage (Landing Page)", () => {
  it("renders the logo, title, and description", () => {
    render(<CoverPage />);
    expect(screen.getByAltText(/Ethiopian Airlines Logo/i)).toBeInTheDocument();
    expect(screen.getByText(/Ethiopian Airlines/i)).toBeInTheDocument();
    expect(screen.getByText(/Defect Management System/i)).toBeInTheDocument();
    expect(screen.getByText(/Empowering employees to report issues efficiently/i)).toBeInTheDocument();
  });

  it("renders the Launch Portal button", () => {
    render(<CoverPage />);
    expect(screen.getByRole("link", { name: /Launch Portal/i })).toBeInTheDocument();
  });

  it("sets sessionStorage when Launch Portal is clicked", () => {
    render(<CoverPage />);
    const launchLink = screen.getByRole("link", { name: /Launch Portal/i });
    // Mock sessionStorage
    const setItemMock = jest.fn();
    Object.defineProperty(window, "sessionStorage", {
      value: { setItem: setItemMock },
      writable: true,
    });
    fireEvent.click(launchLink);
    expect(setItemMock).toHaveBeenCalledWith("fromLaunch", "1");
  });
});
