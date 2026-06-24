import { Link } from "wouter";
import { Show } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";

export function PublicHeader() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center group-hover:bg-primary/90 transition-colors">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-xl text-primary tracking-tight">Certfolio</span>
          </Link>

          <div className="flex items-center gap-4">
            <Show when="signed-out">
              <Link href="/sign-in">
                <Button variant="ghost" className="font-medium hidden sm:inline-flex text-muted-foreground hover:text-foreground">
                  Sign in
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="font-medium bg-primary hover:bg-primary/90 shadow-sm text-white">
                  Create Portfolio
                </Button>
              </Link>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard">
                <Button variant="outline" className="gap-2 font-medium border-gray-200">
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  <span className="hidden sm:inline">Go to Dashboard</span>
                  <span className="sm:hidden">Dashboard</span>
                </Button>
              </Link>
            </Show>
          </div>
        </div>
      </div>
    </header>
  );
}