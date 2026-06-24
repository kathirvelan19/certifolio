import { Link } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { LogOut, User, LayoutDashboard, PlusCircle, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { signOut } = useClerk();
  const { user } = useUser();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center group-hover:bg-primary/90 transition-colors">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="font-bold text-xl text-primary tracking-tight">Certfolio</span>
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium self-center transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/upload"
                className="text-muted-foreground hover:text-foreground hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium self-center transition-colors"
              >
                Upload
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/upload" className="hidden sm:flex items-center">
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                <PlusCircle className="h-4 w-4" />
                Add Certificate
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9 border border-gray-100">
                    <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.firstName?.charAt(0) || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.fullName && <p className="font-medium text-sm">{user.fullName}</p>}
                    {user?.primaryEmailAddress && (
                      <p className="w-[200px] truncate text-xs text-muted-foreground">
                        {user.primaryEmailAddress.emailAddress}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/dashboard" className="flex items-center w-full">
                    <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/settings" className="flex items-center w-full">
                    <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}