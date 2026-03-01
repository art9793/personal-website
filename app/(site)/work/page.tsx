import { formatYearRange } from "@/lib/utils";
import { getWorkData } from "../../_lib/public-data";
import { PageHeader } from "@/components/page-header";

export const revalidate = 3600;

export const metadata = {
  title: "Work",
};

export default async function Page() {
  const { profile, workHistory } = await getWorkData();

  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.24)-theme(spacing.20))] md:min-h-[calc(100vh-theme(spacing.40))]">
      <div className="flex-shrink-0">
        <PageHeader title="Work" subtitle="My career journey and the teams I've been lucky to work with." />
      </div>

      <div className="space-y-6 md:space-y-8 mt-8 flex-1">
        {workHistory.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No work experience added yet.</p>
        ) : (
          workHistory.map((item) => (
            <div key={item.id} className="grid sm:grid-cols-[180px_minmax(0,1fr)] gap-3 sm:gap-x-4 items-start sm:items-baseline" data-testid={`work-${item.id}`}>
              <div className="text-sm text-muted-foreground/70 font-mono uppercase tracking-wider whitespace-nowrap">
                {formatYearRange(item.startDate, item.endDate || "")}
              </div>
              <div className="flex flex-col gap-2 sm:self-baseline">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-lg font-medium text-gray-1100 tracking-tight">{item.company}</h3>
                  <span className="text-muted-foreground/40">·</span>
                  <div className="text-sm text-muted-foreground">{item.role}</div>
                </div>
                <p className="text-muted-foreground leading-relaxed text-[15px] whitespace-pre-line">{item.description}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {profile?.email && profile.showEmail ? (
        <div className="pt-6 border-t mt-auto flex-shrink-0">
          <h2 className="text-lg font-semibold mb-3">Contact</h2>
          <p className="text-muted-foreground mb-4">
            I&apos;m occasionally open to consulting work or speaking engagements.
          </p>
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            data-testid="button-contact"
          >
            Get in touch
          </a>
        </div>
      ) : null}
    </div>
  );
}
