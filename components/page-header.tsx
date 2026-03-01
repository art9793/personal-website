export function PageHeader({ title, subtitle, children }: {
  title: string; subtitle?: string; children?: React.ReactNode
}) {
  return (
    <div>
      <h1 className="text-xl md:text-2xl font-medium tracking-tight text-gray-1100">
        {title}
      </h1>
      {children && <div className="mt-1">{children}</div>}
      {subtitle && (
        <p className="mt-4 text-base text-gray-600 leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
