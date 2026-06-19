export const Footer = () => {
  return (
    <footer className="border-t border-rule mt-10">
      <div className="container mx-auto max-w-6xl px-6 py-7 flex flex-wrap items-center justify-between gap-3 font-mono text-xs tracking-[0.06em] text-muted-foreground">
        <span>© {new Date().getFullYear()} Andre Giske. All rights reserved.</span>
        <a
          href="#hero"
          className="text-primary hover:underline transition-colors"
        >
          Back to top ↑
        </a>
      </div>
    </footer>
  );
};
