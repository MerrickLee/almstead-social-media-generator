"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter, User, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Post } from "@/lib/db";

export default function ContentCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/posts?year=${year}&month=${month + 1}`);
                if (res.ok) {
                    const data = await res.json();
                    setPosts(data);
                }
            } catch (err) {
                console.error("Failed to fetch posts:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, [year, month]);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // Calendar grid data
    const days = [];
    // Padding for days from previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push({ day: null, date: null });
    }
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i).toISOString().split('T')[0];
        const dayPosts = posts.filter(p => p.created_at.startsWith(date));
        days.push({ day: i, date, posts: dayPosts });
    }

    return (
        <div className="space-y-6 max-w-6xl h-full flex flex-col relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <CalendarIcon className="h-6 w-6 text-primary" /> Content Calendar
                    </h2>
                    <p className="text-muted-foreground text-sm">Review posts submitted via the generator.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex border border-border rounded-md shadow-sm overflow-hidden h-9">
                        <button 
                            onClick={prevMonth}
                            className="px-3 bg-card hover:bg-muted border-r border-border flex items-center justify-center transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <div className="px-4 text-sm font-semibold bg-background flex items-center justify-center text-foreground min-w-[140px]">
                            {monthNames[month]} {year}
                        </div>
                        <button 
                            onClick={nextMonth}
                            className="px-3 bg-card hover:bg-muted border-l border-border flex items-center justify-center transition-colors"
                        >
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
                
                {/* Calendar Grid */}
                <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-border gap-[1px]">
                    {days.map((d, i) => (
                        <div key={i} className={cn(
                            "bg-card p-2 min-h-[120px] flex flex-col transition-colors",
                            !d.day ? 'bg-muted/10' : 'hover:bg-muted/5'
                        )}>
                            <span className={cn(
                                "text-sm font-medium mb-1",
                                d.day ? 'text-foreground' : 'text-muted-foreground/30'
                            )}>
                                {d.day}
                            </span>
                            <div className="space-y-1 overflow-y-auto max-h-[100px] scrollbar-hide">
                                {d.posts?.map((post) => (
                                    <div 
                                        key={post.id}
                                        onClick={() => setSelectedPost(post)}
                                        className={cn(
                                            "p-1.5 rounded border text-[10px] font-medium cursor-pointer transition-all hover:scale-[1.02] shadow-sm",
                                            post.workflow === 'merrick' 
                                                ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100" 
                                                : "bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
                                        )}
                                    >
                                        <div className="flex items-center gap-1 mb-1">
                                            <div className="h-1.5 w-1.5 rounded-full bg-current" />
                                            <span className="truncate">{post.author_name || 'Almstead'}</span>
                                        </div>
                                        <p className="line-clamp-2 leading-tight opacity-80" dangerouslySetInnerHTML={{ __html: post.text }} />
                                        {post.image_urls?.[0] && (
                                            <div className="mt-1 h-8 w-full rounded overflow-hidden bg-muted">
                                                <img src={post.image_urls[0]} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {/* Fill remaining slots to make a 6-row grid if needed */}
                    {Array.from({ length: Math.max(0, 35 - days.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-muted/10 p-2 min-h-[120px]" />
                    ))}
                </div>
            </div>

            {/* Post Detail Modal */}
            {selectedPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
                            <div>
                                <h3 className="font-bold text-lg">Post Details</h3>
                                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <User className="h-3 w-3" /> Submitted by <span className="font-semibold text-foreground">{selectedPost.author_name} ({selectedPost.author_email})</span>
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedPost(null)}
                                className="p-2 rounded-full hover:bg-muted transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
                            {/* Images */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {selectedPost.image_urls.map((url, i) => (
                                    <div key={i} className="aspect-square rounded-xl overflow-hidden border border-border bg-muted relative group">
                                        <img src={url} alt={`Post image ${i+1}`} className="w-full h-full object-cover" />
                                        <a 
                                            href={url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold"
                                        >
                                            View Full Image
                                        </a>
                                    </div>
                                ))}
                            </div>

                            {/* Caption */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4" /> Final Caption
                                </h4>
                                <div 
                                    className="p-4 rounded-xl bg-muted/30 border border-border text-sm leading-relaxed whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{ __html: selectedPost.text }}
                                />
                            </div>

                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Workflow</p>
                                    <p className="text-sm font-semibold capitalize">{selectedPost.workflow}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Brand Pillar</p>
                                    <p className="text-sm font-semibold capitalize">{selectedPost.pillar || 'General'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Submission Date</p>
                                    <p className="text-sm font-semibold">{new Date(selectedPost.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-border bg-muted/20 flex justify-end">
                            <button 
                                onClick={() => setSelectedPost(null)}
                                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-md hover:bg-primary/90 transition-all"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
