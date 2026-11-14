import clsx from "clsx";
import { initials } from "@/lib/format";

export function Avatar({
  name,
  avatar,
  className,
  textClassName,
}: {
  name: string;
  avatar?: string | null;
  className?: string;
  textClassName?: string;
}) {
  return (
    <span
      className={clsx(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet to-mint text-ink-950",
        className,
      )}
    >
      {avatar ? (
        <span
          role="img"
          aria-label={`${name} avatar`}
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${avatar})` }}
        />
      ) : (
        <span className={clsx("font-bold", textClassName)} aria-hidden="true">
          {initials(name)}
        </span>
      )}
    </span>
  );
}
