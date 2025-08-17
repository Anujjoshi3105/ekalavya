import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { NavMenu } from "@/components/navbar/nav-menu";
import ThemeToggle from "@/components/navbar/theme-toggle";
import { navItems } from "@/constants";
import { Logo } from "@/components/navbar/logo";
import { NavSheet } from "@/components/navbar/nav-sheet";
import { Button } from "@/components/ui/button";

const Navbar = () => {
    return (
        <nav className="navbar">
            <Logo />
            <div className="flex items-center gap-4">
                <NavMenu className="md:block hidden" items={navItems} />
                <ThemeToggle />
                <SignedOut>
                    <SignInButton>
                        <Button variant="outline">Sign In</Button>
                    </SignInButton>
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
                <NavSheet />
            </div>
        </nav>
    )
}

export default Navbar
