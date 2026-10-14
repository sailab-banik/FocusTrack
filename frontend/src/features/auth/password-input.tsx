"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** A password field with a button that shows what was typed. */
export function PasswordInput(
  props: Omit<React.ComponentProps<"input">, "type" | "className">,
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className="h-11 pr-12"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        aria-label="Show password"
        aria-pressed={visible}
        className="absolute top-1 right-1 text-muted-foreground"
        onClick={() => setVisible((shown) => !shown)}
      >
        {visible ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  );
}
