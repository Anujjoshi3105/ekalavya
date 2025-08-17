import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Logo } from "./logo";
import { NavMenu } from "./nav-menu";
import { navItems } from "@/constants";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export const NavSheet = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <Logo />
        <div className="flex flex-col space-y-2 my-auto mx-2">
          {navItems.map(({label, href}) => 
            <Button asChild key={label} variant="ghost">
              <Link href={href}>{label}</Link>
            </Button>
          )}
          <SignedOut>
            <SignInButton>
              <Button variant="outline" className="mt-4">Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </SheetContent>
    </Sheet>
  );
};
