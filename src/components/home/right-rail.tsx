import { ActivityFeed } from "@/components/home/activity-feed";

export function RightRail() {
  return (
    <aside className="hidden w-72 shrink-0 flex-col overflow-y-auto rounded-2xl border border-sidebar-border bg-sidebar p-4 shadow-sm xl:flex">
      <h2 className="eyebrow pb-1">Activity</h2>
      <ActivityFeed />
    </aside>
  );
}
