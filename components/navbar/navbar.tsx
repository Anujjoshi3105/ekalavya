import { Logo } from "./logo";
import ThemeToggle from "./theme-toggle";
import { NavSheet } from "./nav-sheet";

export default function Navbar() {
  return (
    <nav className="fixed z-10 top-6 inset-x-4 h-14 xs:h-16 bg-background/50 backdrop-blur-sm border dark:border-slate-700/70 max-w-screen-xl mx-auto rounded-full">
      <div className="h-full flex items-center justify-between mx-auto px-4">
        <Logo />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="md:hidden">
            <NavSheet />
          </div>
        </div>
      </div>
    </nav>
  );
};
