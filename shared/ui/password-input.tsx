"use client";

import { useState, type ComponentProps, type ReactElement } from "react";
import { joinClassNames } from "@/shared/lib/class-names";
import { INPUT_CLASS_NAME } from "./input";

type PasswordInputProps = Omit<ComponentProps<"input">, "type"> & {
  /** Toggle texts from the i18n dictionary (`common.showPassword` / `common.hidePassword`). */
  readonly toggleLabels: { readonly show: string; readonly hide: string };
};

export function PasswordInput({ className, toggleLabels, ...rest }: PasswordInputProps): ReactElement {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={isVisible ? "text" : "password"}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        className={joinClassNames(INPUT_CLASS_NAME, "pr-24", className)}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setIsVisible((value) => !value)}
        aria-pressed={isVisible}
        className="absolute inset-y-1.5 right-1.5 rounded-md px-3 text-sm text-steel transition-colors hover:text-paper"
      >
        {isVisible ? toggleLabels.hide : toggleLabels.show}
      </button>
    </div>
  );
}
