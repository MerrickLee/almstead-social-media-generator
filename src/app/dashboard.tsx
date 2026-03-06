import { Leaf, CloudRain, Smile, Users, TrendingUp, Calendar as CalendarIcon, Plus } from "lucide-react";
import Link from "next/link";

const pillars = [
  {
    name: "Science of Landscapes",
    description: "Educational posts, arboriculture, plant health care.",
    icon: Leaf,
    href: "/pillars/science",
    color: "bg-primary text-primary-foreground",
    count: 12
  },
  {
    name: "Current Conditions",
    description: "Weather impacts, regional conditions, storm prep.",
    icon: CloudRain,
    href: "/pillars/conditions",
    color: "bg-accent text-accent-foreground",
    count: 5
  },
  {
    name: "Happy Customers",
    description: "Before/after transformations, real client success.",
    icon: Smile,
    href: "/pillars/customers",
    color: "bg-destructive text-destructive-foreground",
    count: 8
  },
  {
    name: "Employee Spotlights",
    description: "Team milestones, certifications, new hires.",
    icon: Users,
    href: "/pillars/employees",
    color: "bg-secondary text-secondary-foreground",
    count: 3
  }
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Overview</h2>
          <p className="text-muted-foreground text-sm">Manage content and view performance across all 4 pillars.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/calendar" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Calendar
          </Link>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {pillars.map((pillar) => (
          <Link key={pillar.name} href={pillar.href} className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/50 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${pillar.color}`}>
                  <pillar.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{pillar.count} Posts</span>
              </div>
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{pillar.name}</h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{pillar.description}</p>
            </div>
            <div className="mt-4 flex items-center text-sm font-medium text-primary">
              Manage Pillar &rarr;
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Weekly Performance Stub */}
        <div className="col-span-full lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Weekly Performance</h3>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-muted/20">
            <p className="text-muted-foreground text-sm">Analytics Chart Integration (Phase 4)</p>
          </div>
        </div>

        {/* Quick Actions Stub */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Recent Drafts</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted transition-colors cursor-pointer">
              <div className="bg-primary/10 text-primary p-2 rounded-md">
                <Leaf className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Why February Pruning Matters</p>
                <p className="text-xs text-muted-foreground mt-1">Science of Landscapes • Edited 2h ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted transition-colors cursor-pointer">
              <div className="bg-destructive/10 text-destructive p-2 rounded-md">
                <Smile className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Oak Canopy Restoration</p>
                <p className="text-xs text-muted-foreground mt-1">Happy Customers • Edited 1d ago</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-6 text-sm text-primary font-medium hover:underline text-center">
            View All Drafts
          </button>
        </div>
      </div>
    </div>
  );
}
