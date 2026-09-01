export default function DashboardLoading() {
  return (
    <div aria-label="Loading workspace" className="space-y-8 pb-10" role="status">
      <div className="h-64 animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.04]" />
      <div className="grid gap-3 sm:grid-cols-3">
        {["one", "two", "three"].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl border border-white/10 bg-white/[0.025]" />)}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {["one", "two", "three", "four"].map((item) => <div key={item} className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/[0.025]" />)}
      </div>
      <span className="sr-only">Loading your workspace</span>
    </div>
  );
}
