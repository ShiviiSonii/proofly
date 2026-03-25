"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  className?: string;
  label?: string;
  iconOnly?: boolean;
};

export function LogoutButton({ className, label = "Logout", iconOnly = false }: LogoutButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size={iconOnly ? "icon" : "default"}
      aria-label={label}
      className={cn(className)}
      onClick={() => signOut({ callbackUrl: "/sign-in" })}
    >
      {iconOnly ? <LogOut className="size-4" /> : label}
    </Button>
  );
}
