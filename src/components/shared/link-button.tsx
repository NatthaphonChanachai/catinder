import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type LinkButtonProps = ComponentProps<typeof Button> & {
  href: string;
};

/** Button that renders as a locale-aware Link anchor instead of a native <button>. */
export function LinkButton({ href, ...props }: LinkButtonProps) {
  return <Button nativeButton={false} render={<Link href={href} />} {...props} />;
}
