export default function Work() {
  const history = [
    {
      company: "Notion",
      role: "Product Designer",
      period: "2023 — Present",
      description: "Designing AI products and core editing experiences."
    },
    {
      company: "Campsite",
      role: "Co-founder",
      period: "2022 — 2023",
      description: "Founded and designed a communication platform for remote teams. Handled product design, frontend engineering, and brand."
    },
    {
      company: "GitHub",
      role: "Staff Product Designer",
      period: "2018 — 2022",
      description: "Led design for GitHub Mobile (iOS & Android). Helped build the new design system (Primer) and various other initiatives."
    },
    {
      company: "Spectrum",
      role: "Product Designer",
      period: "2017 — 2018",
      description: "Early employee. Designed the core community platform. Acquired by GitHub."
    },
    {
      company: "Facebook",
      role: "Product Designer",
      period: "2015 — 2017",
      description: "Designed payments experiences in Messenger and Facebook."
    }
  ];

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Work</h1>
        <p className="text-muted-foreground text-lg">
          My career journey and the teams I've been lucky to work with.
        </p>
      </div>

      <div className="space-y-8">
        {history.map((item, i) => (
          <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 group p-2 -mx-2 rounded-lg hover:bg-secondary/40 transition-colors">
            <div className="w-32 flex-shrink-0 text-sm text-muted-foreground font-mono">
              {item.period}
            </div>
            <div className="flex-1 space-y-1.5">
              <h3 className="text-lg font-semibold text-primary transition-colors">
                {item.company}
              </h3>
              <div className="text-sm font-medium text-primary/80 mb-1">
                {item.role}
              </div>
              <p className="text-muted-foreground leading-relaxed text-base">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="pt-8 border-t">
        <h2 className="text-lg font-semibold mb-4">Contact</h2>
        <p className="text-muted-foreground mb-4">
          I'm occasionally open to consulting work or speaking engagements.
        </p>
        <a href="mailto:hello@example.com" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          Get in touch
        </a>
      </div>
    </div>
  );
}
