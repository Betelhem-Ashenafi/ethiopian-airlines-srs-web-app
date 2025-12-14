"use client"
import React from "react";

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function CoverPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gradient-et text-white p-4 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-et-green via-et-green-dark to-et-green opacity-90"></div>
      
      {/* Modern geometric pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23FFC107' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
          animation: "shimmer 20s linear infinite",
        }}
      ></div>

      {/* Floating gradient orbs for depth */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-et-gold rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-et-gold-light rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto px-4 animate-fade-in">
        <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
          <Image
            src="/ethiopian-airlines-logo.png"
            alt="Ethiopian Airlines Logo"
            width={200}
            height={200}
            className="drop-shadow-2xl animate-scale-in"
          />
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 tracking-tight text-et-gold drop-shadow-2xl leading-tight bg-gradient-to-r from-et-gold via-et-gold-light to-et-gold bg-clip-text text-transparent">
          Ethiopian Airlines
          <br />
          <span className="text-4xl md:text-6xl lg:text-7xl">Defect Management System</span>
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl mb-12 max-w-3xl leading-relaxed text-white/90 font-light">
          Empowering employees to report issues efficiently, ensuring a safer and more responsive operational
          environment through intelligent classification and real-time updates.
        </p>
        <Button
          asChild
          className="group bg-et-gold text-et-green hover:bg-et-gold-light px-12 py-8 text-lg md:text-xl font-bold rounded-full shadow-et-gold transition-all duration-300 hover:scale-110 hover:shadow-2xl transform"
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
            <span className="flex items-center gap-2">
              Launch Portal
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </a>
        </Button>
      </div>
    </div>
  )
}
