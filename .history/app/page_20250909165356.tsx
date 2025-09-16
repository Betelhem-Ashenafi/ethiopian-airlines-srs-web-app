"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCallback } from "react"

export default function CoverPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-et-green text-white p-4 overflow-hidden">
      {/* Subtle background pattern for visual interest */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM2 6v4H0V6h4V4H0V0h6v6H2zm34 0v4h-2V6h4V4h-4V0h6v6h-2zM2 34v4H0v-4h4v-2H0V30h6v6H2zm34 30v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 30v4H0v-4h4v-2H0V26h6v6H2zm34 30v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 60v-4H0v4h4v2H0V56h6v6H2zM2 30v4H0v-4h4v-2H0V26h6v6H2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: "60px 60px",
        }}
      ></div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto px-4">
        <Image
          src="/ethiopian-airlines-logo.png"
          alt="Ethiopian Airlines Logo"
          width={180}
          height={180}
          className="mb-10 drop-shadow-lg"
        />
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-et-gold drop-shadow-lg leading-tight">
          Ethiopian Airlines
          <br />
          Defect Management System
        </h1>
        <p className="text-xl md:text-2xl mb-12 max-w-3xl leading-relaxed text-gray-200">
          Empowering employees to report issues efficiently, ensuring a safer and more responsive operational
          environment through intelligent classification and real-time updates.
        </p>
        <Button
          asChild
          className="bg-et-gold text-et-green hover:bg-et-gold px-10 py-7 text-xl font-bold rounded-full shadow-xl transition-all duration-300 hover:scale-105 transform"
        >
          {/* Use a small client-side handler to mark this tab as coming from Launch. */}
          <a
            href="/login"
            onClick={() => {
              try {
                sessionStorage.setItem('fromLaunch', '1')
              } catch (e) {
                /* ignore */
              }
            }}
          >
            Launch Portal
          </a>
        </Button>
      </div>
    </div>
  )
}
