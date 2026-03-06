import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter } from "lucide-react";

export default function ContentCalendar() {
    return (
        <div className="space-y-6 max-w-6xl h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Content Calendar</h2>
                    <p className="text-muted-foreground text-sm">Schedule and manage multi-platform posts.</p>
                </div>
                <div className="flex gap-3">
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter by Pillar
                    </button>
                    <div className="flex border border-border rounded-md shadow-sm overflow-hidden h-9">
                        <button className="px-3 bg-card hover:bg-muted border-r border-border flex items-center justify-center">
                            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button className="px-4 text-sm font-semibold bg-background hover:bg-muted flex items-center justify-center text-foreground">
                            March 2026
                        </button>
                        <button className="px-3 bg-card hover:bg-muted border-l border-border flex items-center justify-center">
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-border bg-muted/30">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>
                {/* Calendar Grid Stub */}
                <div className="flex-1 grid grid-cols-7 grid-rows-5 bg-border gap-[1px]">
                    {Array.from({ length: 35 }).map((_, i) => {
                        const date = i - 1; // start mock from 1st on Monday
                        const isValid = date > 0 && date <= 31;
                        const hasPost = date === 6 || date === 12 || date === 21;

                        return (
                            <div key={i} className={`bg-card p-2 min-h-[100px] flex flex-col ${!isValid ? 'bg-muted/30' : ''}`}>
                                <span className={`text-sm font-medium ${isValid ? 'text-foreground' : 'text-muted-foreground/30'}`}>
                                    {isValid ? date : ''}
                                </span>
                                {hasPost && (
                                    <div className="mt-1 p-1.5 rounded bg-primary/10 border border-primary/20 text-xs font-medium text-primary group cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors line-clamp-2">
                                        {date === 6 ? "Why February Pruning Matters" :
                                            date === 12 ? "Oak Restoration Case" :
                                                "Spring Pest Advisory"}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
