import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import Github from "./icons/github";
import { LogOut } from "lucide-react";

export default function Header() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();

  const buttonContent = isLoading ? (
    <Spinner />
  ) : isAuthenticated ? (
    <>
      <LogOut />
      <span>Logout</span>
    </>
  ) : (
    <>
      <Github />
      <span>Sign in</span>
    </>
  );

  const handleButtonClick = () => {
    if (!isLoading) {
      if (isAuthenticated) {
        void signOut();
      } else {
        void signIn("github");
      }
    }
  };

  return (
    <header className="flex justify-end items-center h-12 border-b border-border px-1.5">
      <Button onClick={handleButtonClick} disabled={isLoading} className="w-24">
        {buttonContent}
      </Button>
    </header>
  );
}
