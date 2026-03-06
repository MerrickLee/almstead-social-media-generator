import { Leaf, CloudRain, Smile, Users, Plus, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const pillars = {
    science: {
        name: "Science of Landscapes",
        description: "Demonstrate deep knowledge and ISA-certified expertise in arboriculture and landscape science.",
        icon: Leaf,
        color: "bg-primary text-primary-foreground",
        tags: ["Pruning", "Plant Health", "Soil Analysis", "Disease Guides"],
        recentPosts: [
            { id: 1, title: "Why February Pruning Matters", date: "Editing (2h ago)", status: "Draft" },
            { id: 2, title: "Identifying Emerald Ash Borer", date: "Scheduled for Mar 10", status: "Scheduled" }
        ]
    },
    conditions: {
        name: "Current Conditions",
        description: "Show real-time awareness of weather, environmental, and regional conditions.",
        icon: CloudRain,
        color: "bg-accent text-accent-foreground",
        tags: ["Weather alerts", "Soil moisture", "Storm prep", "Pest outbreaks"],
        recentPosts: [
            { id: 3, title: "Late Winter Winds Advisory", date: "Published on Mar 1", status: "Published" }
        ]
    },
    customers: {
        name: "Happy Customers",
        description: "Build social proof through real client success stories and project highlights.",
        icon: Smile,
        color: "bg-destructive text-destructive-foreground",
        tags: ["Before/After", "Testimonials", "Case Studies", "Reviews"],
        recentPosts: [
            { id: 4, title: "Oak Canopy Restoration", date: "Editing (1d ago)", status: "Draft" }
        ]
    },
    employees: {
        name: "Employee Spotlights",
        description: "Humanize the brand, celebrate team expertise, and support recruiting.",
        icon: Users,
        color: "bg-secondary text-secondary-foreground",
        tags: ["New Hires", "Certifications", "Milestones", "Safety"],
        recentPosts: []
    }
};

export default async function PillarPage({ params }: { params: { id: string } }) {
    // Wait for params in NextJS App Router
    const { id } = await params;

    const pillar = pillars[id as keyof typeof pillars];

    if (!pillar) {
        notFound();
    }

    const Icon = pillar.icon;

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
                <div className="flex flex-row items-center gap-4">
                    <div className={`p-3 rounded-xl ${pillar.color} shadow-sm`}>
                        <Icon className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">{pillar.name}</h2>
                        <p className="text-muted-foreground text-sm max-w-lg mt-1">{pillar.description}</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Link href={`/composer?pillar=${id}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-5">
                        <Plus className="mr-2 h-4 w-4" />
                        New Post
                    </Link>
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-10 px-4">
                        <Sparkles className="mr-2 h-4 w-4" />
                        AI Suggest Ideas
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 py-2">
                {pillar.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        {tag}
                    </span>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 mt-8">
                <div className="rounded-xl border border-border bg-card shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold text-lg">Content Sandbox</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                        Review your recent ideas, drafts, and scheduled posts configured strictly within the {pillar.name} brand guidelines.
                    </p>
                    {pillar.recentPosts.length > 0 ? (
                        <div className="space-y-3">
                            {pillar.recentPosts.map((post) => (
                                <div key={post.id} className="flex justify-between items-center p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted transition-colors cursor-pointer">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{post.title}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{post.date}</p>
                                    </div>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${post.status === 'Draft' ? 'bg-secondary text-secondary-foreground' :
                                            post.status === 'Scheduled' ? 'bg-accent/20 text-accent-foreground' :
                                                'bg-primary/10 text-primary'
                                        }`}>
                                        {post.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg bg-muted/10">
                            <p className="text-sm text-muted-foreground">No recent posts found for this pillar.</p>
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-border bg-card shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                        <Sparkles className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold text-lg">AI Prompt Guide</h3>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-4">
                        <p><strong>Brand Voice Rules:</strong> Scientific, Authoritative, Trustworthy, Community-Focused.</p>
                        <p><strong>Guardrails:</strong></p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>No generic landscaping advice—demonstrate certified expertise.</li>
                            <li>Reference Almstead by name or service area.</li>
                            <li>Must fit 100% within the <em>{pillar.name}</em> pillar constraints.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
