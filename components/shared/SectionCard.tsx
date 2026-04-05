import { cn } from "@/lib/utils";

interface SectionCardProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ eyebrow, title, description, children, className }: SectionCardProps) {
  return (
    <section className={cn("premium-panel p-7 md:p-9", className)}>
      <div className="mb-7 space-y-3">
        {eyebrow ? <p className="premium-eyebrow">{eyebrow}</p> : null}
        <h2 className="type-title">{title}</h2>
        {description ? <p className="max-w-2xl text-base leading-7 text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
