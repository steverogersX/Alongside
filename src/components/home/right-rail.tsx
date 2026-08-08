import { ShellRail } from "@/components/shell";
import { ActivityFeed } from "@/components/home/activity-feed";

export function RightRail() {
  return (
    <ShellRail>
      <h2 className="eyebrow pb-1">Activity</h2>
      <ActivityFeed />
    </ShellRail>
  );
}
