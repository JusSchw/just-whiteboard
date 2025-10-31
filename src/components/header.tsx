import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import Github from "./icons/github";
import { LogOut } from "lucide-react";
import { api } from "@convex/api";
import { Route } from "@/routes/__root";

export default function Header() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const user = useQuery(api.user.getUser);

  const buttonContent = isLoading ? (
    <Spinner />
  ) : isAuthenticated ? (
    <>
      <span>Logout</span>
      <LogOut />
    </>
  ) : (
    <>
      <span>Sign in</span>
      <Github />
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
    <header className="flex justify-between items-center h-12 border-b border-border px-1.5">
      <Route.Link to="/">
        <Avatar>
          <AvatarImage src={user?.image} />
          <AvatarFallback />
        </Avatar>
      </Route.Link>
      <Button
        onClick={handleButtonClick}
        disabled={isLoading}
        className="w-24"
        variant={"secondary"}
      >
        {buttonContent}
      </Button>
    </header>
  );
}
