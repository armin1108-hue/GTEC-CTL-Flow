import React from "react";
import { ShieldAlert, Cpu } from "lucide-react";

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and branding */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg text-white">
            <Cpu className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold tracking-wider text-blue-400">GTEC CTL</span>
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-2xs font-medium text-blue-300 ring-1 ring-inset ring-blue-500/20">
                MVP v1.0
              </span>
            </div>
            <h1 className="text-base font-bold text-slate-100 m-0 p-0 leading-none">
              GTEC CTL-Flow
            </h1>
          </div>
        </div>

        {/* Administrative Platform Title */}
        <div className="hidden md:flex items-center text-sm text-slate-300 font-medium">
          교수학습지원센터 프로그램 운영 및 성과관리 플랫폼
        </div>

        {/* PII Shield Notice */}
        <div className="flex items-center bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg text-amber-300 text-xs max-w-md">
          <ShieldAlert className="h-4 w-4 mr-2 text-amber-400 shrink-0" />
          <span className="leading-snug truncate md:whitespace-normal">
            <strong>개인정보 보호:</strong> 이름/학번/연락처 등 식별 정보는 입력 불가합니다.
          </span>
        </div>
      </div>
    </header>
  );
};
