interface ComingSoonProps {
  title: string;
  description?: string;
}

/** Placeholder for a page whose feature is not built yet. Never shows sample data. */
export const ComingSoon = ({ title, description = "Próximamente." }: ComingSoonProps) => {
  return (
    <section className="flex flex-col items-center justify-center gap-2 py-10">
      <h1 className="display-l text-ink">{title}</h1>
      <p className="text-ink-muted">{description}</p>
    </section>
  );
};
