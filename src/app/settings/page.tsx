import { Save, Link as LinkIcon, Building, Key, BellRing, Shield, Leaf } from "lucide-react";

export default function Settings() {
    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Global Settings</h2>
                    <p className="text-muted-foreground text-sm">Manage Almstead branding, platform integrations, and team permissions.</p>
                </div>
                <div className="flex gap-3">
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-5">
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-8 mt-6">
                <div className="lg:col-span-1 space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-secondary text-secondary-foreground">
                        <Building className="h-4 w-4" /> Brand & Voice
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                        <LinkIcon className="h-4 w-4" /> Connections
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                        <Key className="h-4 w-4" /> AI Integrations
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                        <Shield className="h-4 w-4" /> User Roles
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                        <BellRing className="h-4 w-4" /> Notifications
                    </button>
                </div>

                <div className="lg:col-span-3 space-y-8">
                    {/* Brand Identity Panel */}
                    <div className="rounded-xl border border-border bg-card shadow-sm p-6 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Leaf className="h-48 w-48 text-primary" />
                        </div>

                        <h3 className="text-lg font-semibold mb-6 relative z-10 text-foreground">Brand Identity Engine</h3>

                        <div className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Company Name</label>
                                <input
                                    type="text"
                                    defaultValue="Almstead Tree, Shrub & Lawn Care"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Brand Tone (AI Instructions)</label>
                                <textarea
                                    defaultValue="The Preferred Expert in the Science of Landscapes. Use a professional, highly knowledgeable, ISA-certified arboriculture tone. Avoid generic landscaping sales pitches. Emphasize plant health, safety, and community."
                                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-foreground">Color Palette Sync</label>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-primary border-2 border-border shadow-sm"></div>
                                        <span className="text-xs text-muted-foreground">Primary</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-accent border-2 border-border shadow-sm"></div>
                                        <span className="text-xs text-muted-foreground">Accent</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-destructive border-2 border-border shadow-sm"></div>
                                        <span className="text-xs text-muted-foreground">Alerts</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-secondary border-2 border-border shadow-sm"></div>
                                        <span className="text-xs text-muted-foreground">Secondary</span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">Currently synced with the Smackhappy Design Guidelines.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
