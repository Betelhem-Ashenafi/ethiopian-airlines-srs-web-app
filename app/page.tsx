"use client"
import React from "react";

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CoverPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 overflow-hidden">
      {/* Subtle geometric pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23517842' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM2 6v4H0V6h4V4H0V0h6v6H2zm34 0v4h-2V6h4V4h-4V0h6v6h-2zM2 34v4H0v-4h4v-2H0V30h6v6H2zm34 30v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 30v4H0v-4h4v-2H0V26h6v6H2zm34 30v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 60v-4H0v4h4v2H0V56h6v6H2zM2 30v4H0v-4h4v-2H0V26h6v6H2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: "60px 60px",
        }}
      ></div>

      {/* Subtle accent gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFC107]/5 rounded-full mix-blend-multiply filter blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#517842]/5 rounded-full mix-blend-multiply filter blur-3xl"></div>

      <Card className="relative z-10 w-full max-w-2xl bg-white text-gray-800 shadow-2xl border border-gray-100 animate-scale-in">
        <CardHeader className="flex flex-col items-center text-center space-y-6 pb-8">
          <Image
            src="/ethiopian-airlines-logo.png"
            alt="Ethiopian Airlines Logo"
            width={140}
            height={140}
            className="drop-shadow-lg"
          />
          <div className="space-y-3">
            <CardTitle className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#517842] to-[#3d5a32] bg-clip-text text-transparent">
              Ethiopian Airlines
            </CardTitle>
            <div className="w-24 h-1 bg-gradient-to-r from-[#FFC107] via-[#FFD54F] to-[#FFC107] mx-auto rounded-full"></div>
            <CardDescription className="text-xl md:text-2xl text-gray-700 font-semibold">
              Defect Management System
            </CardDescription>
          </div>
          <p className="text-base md:text-lg text-gray-600 max-w-xl leading-relaxed pt-2">
            Empowering employees to report issues efficiently, ensuring a safer and more responsive operational
            environment through intelligent classification and real-time updates.
          </p>
        </CardHeader>
        <CardContent className="pb-8">
          <Button
            asChild
            className="group w-full h-14 bg-[#FFC107] hover:bg-[#FFD54F] text-[#517842] font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
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
              <span className="flex items-center justify-center gap-3">
                Launch Portal
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
