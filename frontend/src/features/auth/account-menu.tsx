import { LogOut, UserRound } from "lucide-react";
import { cn } from "cn";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { signOut } from "./actions";

/** The header's account button: who is signed in, and the way out. */
export function AccountMenu({ email }: { email: string }) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="Account"
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon-lg" }),
          "rounded-full",
        )}
      >
        <UserRound />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 gap-1 p-2">
        <PopoverHeader className="px-2 py-1.5">
          <PopoverTitle className="text-xs font-normal text-muted-foreground">
            Signed in as
          </PopoverTitle>
          <p className="truncate font-medium" title={email}>
            {email}
          </p>
        </PopoverHeader>
        <form action={signOut} className="border-t pt-1">
          <Button
            type="submit"
            variant="ghost"
            size="lg"
            className="w-full justify-start px-2"
          >
            <LogOut />
            Sign out
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
