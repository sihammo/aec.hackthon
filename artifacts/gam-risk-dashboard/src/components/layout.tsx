import { ReactNode } from "react";
import { AppSidebar } from "./sidebar";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="px-5 py-4 pt-[32px] pb-[32px] pl-[24px] pr-[24px] min-h-full">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
