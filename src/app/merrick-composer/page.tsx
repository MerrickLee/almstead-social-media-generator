"use client";

import { useState, useRef } from "react";
import { Sparkles, Leaf, CloudRain, Smile, Users, Image as ImageIcon, Upload, ArrowRight, CheckCircle2, Wand2, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const pillars = [
    { id: "science", name: "Science of Landscapes", icon: Leaf },
    { id: "conditions", name: "Current Conditions", icon: CloudRain },
    { id: "customers", name: "Happy Customers", icon: Smile },
    { id: "employees", name: "Employee Spotlights", icon: Users },
];

const mockAIGenerations: Record<string, string[]> = {
    science: [
        "Why February Pruning Matters ❄️🌿\n\nDormant season pruning improves structural integrity and reduces disease risk. Our ISA-certified arborists know exactly how to assess your canopy before the spring flush. Schedule your winter assessment today to ensure a healthy season!\n\n#ScienceOfLandscapes #CertifiedArborist #PlantHealthCare #Almstead",
        "Did you know tree roots continue to grow even when the canopy is dormant? 🌱 Winter is the perfect time for soil decompaction and root collar excavations. Secure the long-term health of your historic trees with Almstead's advanced soil science team.\n\n#ScienceOfLandscapes #RootHealth",
        "Preserving mature trees requires more than just water and sunlight. Our tailored nutrient management programs provide essential micro-nutrients specifically formulated for the tri-state area. Ask us about our organic compost teas! 🌳🧪\n\n#PlantScience #Almstead #TreeCare"
    ],
    conditions: [
        "⚠️ Winter Storm Warning ⚠️\n\nHeavy snowfall and ice accumulation are expected this weekend. Heavy ice loads can cause significant branch failure. Stay safe and keep clear of large limbs. If you experience storm damage, Almstead's emergency response team is ready to help 24/7.\n\n#CurrentConditions #StormPrep #Almstead#TreeCare",
        "Spring is arriving early! 🌷 With warmer temperatures approaching, it's time to start thinking about pest management. We are currently monitoring for overwintering specific pests in the area. Contact your Almstead arborist for a preventative inspection.\n\n#SpringPrep #PlantHealthCare #CurrentConditions",
        "Drought stress from last summer may still be affecting your hemlocks and rhododendrons. 🍂 Even in winter, anti-desiccant sprays can protect evergreens from harsh winter winds that cause leaf burn. Reach out today for an evaluation.\n\n#WinterCare #Arborist"
    ],
    customers: [
        "Another beautiful property transformation in the books! 🏡✨ Look at the amazing difference our plant health care team made for this historic estate. There is nothing more rewarding than seeing our clients fall back in love with their landscapes.\n\n#HappyCustomers #Landscaping #AlmsteadTree",
        "\"The Almstead crew was incredibly professional and left our property cleaner than they found it!\" 🌟\n\nThank you to our amazing clients for trusting us with your most valuable natural assets. Swipe to see the precision pruning work completed today!\n\n#CustomerTestimonial #TreeService #Excellence",
        "We love getting to watch the gardens we care for thrive year after year! 🌺 Here’s a snapshot from a satisfied customer's beautiful backyard oasis, maintained by our customized ornamental care program.\n\n#HappyCustomers #GardenCare #Almstead"
    ],
    employees: [
        "👷‍♂️ Employee Spotlight: Meet John! 👷‍♂️\n\nJohn is one of our ISA Certified Arborists and has been with Almstead for over 10 years. His expertise in diagnostic pathology makes him an invaluable part of our team. When he's not inspecting trees, he's volunteering at the local arboretum.\n\n#EmployeeSpotlight #TeamAlmstead #Arborist",
        "Safety first, always! 🧗‍♀️ Huge shoutout to our climbing crews who navigate challenging canopies every day with precision and care. They are the true athletes of the industry. Thank you for your hard work!\n\n#TreeClimber #TreeCareIndustry #EmployeeSpotlight",
        "Congratulations to Sarah from our Plant Health Care division on receiving her state pesticide applicator license! 🎓🌿 We are so proud of our team's commitment to continuing education and environmental safety.\n\n#TeamAlmstead #CareerGrowth #PHC"
    ]
};

export default function StartPost() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState<number>(1);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Step 1 State
    const [mediaList, setMediaList] = useState<{ type: 'upload' | 'google', url: string, name: string, file?: File }[]>([]);

    // Step 2 State
    const [selectedPillar, setSelectedPillar] = useState<string | null>(null);

    // Step 3 State
    const [cloudinaryUrls, setCloudinaryUrls] = useState<string[]>([]);
    const [generatedOptions, setGeneratedOptions] = useState<string[]>([]);
    const [customCaption, setCustomCaption] = useState<string>("");

    // Success State
    const [isSuccess, setIsSuccess] = useState(false);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const processFiles = (files: File[]) => {
        if (files.length === 0) return;

        // Limit to 3 files total combined with existing
        const availableSlots = 3 - mediaList.length;
        const filesToAdd = files.slice(0, availableSlots);

        if (filesToAdd.length > 0) {
            const newMedia = filesToAdd.map(f => ({
                type: 'upload' as const,
                url: URL.createObjectURL(f),
                name: f.name,
                file: f
            }));
            setMediaList(prev => [...prev, ...newMedia]);
        }

        // Optional: immediately jump to step 2 if they select at least 1 image
        setStep(2);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        processFiles(files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (mediaList.length < 3) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (mediaList.length >= 3) return;

        const files = Array.from(e.dataTransfer.files);
        processFiles(files);
    };

    const handleMediaUpload = async (): Promise<string[]> => {
        if (cloudinaryUrls.length > 0) return cloudinaryUrls;

        setIsUploading(true);
        try {
            const urls = await Promise.all(
                mediaList.map(async (media) => {
                    if (media.file) return uploadToCloudinary(media.file);
                    return media.url;
                })
            );
            setCloudinaryUrls(urls);
            return urls;
        } catch (err: any) {
            console.error("Media upload failed:", err);
            throw new Error(`Media Upload Failed: ${err.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleGenerate = async (uploadedUrls: string[]) => {
        if (!selectedPillar) return;
        setIsGenerating(true);
        try {
            const pillarName = pillars.find(p => p.id === selectedPillar)?.name || selectedPillar;

            const response = await fetch('/api/caption', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ images: uploadedUrls, pillar: pillarName })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to generate captions.");
            }

            const data = await response.json();
            if (data.options && Array.isArray(data.options)) {
                setGeneratedOptions(data.options);
            } else {
                throw new Error("Invalid response from caption API");
            }
        } catch (error: any) {
            console.error("Error generating captions:", error);
            alert(`Caption Generation Error: ${error.message}`);
            // Use mock as fallback
            setGeneratedOptions(mockAIGenerations[selectedPillar] || []);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRequestAI = async () => {
        try {
            const urls = await handleMediaUpload();
            await handleGenerate(urls);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const selectOption = (text: string) => {
        setCustomCaption(text);
    };

    // Upload a single file directly to Cloudinary from the browser
    const uploadToCloudinary = async (file: File): Promise<string> => {
        const timestamp = Math.round(Date.now() / 1000);
        const folder = 'almstead_social_drafts';
        const paramsToSign = { timestamp, folder };

        // Get a signature from our server (keeps API secret safe)
        const signRes = await fetch('/api/cloudinary-sign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paramsToSign }),
        });
        if (!signRes.ok) throw new Error('Failed to get upload signature');
        const { signature } = await signRes.json();

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey!);
        formData.append('timestamp', String(timestamp));
        formData.append('folder', folder);
        formData.append('signature', signature);

        const uploadRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
            { method: 'POST', body: formData }
        );

        if (!uploadRes.ok) {
            const errorData = await uploadRes.json();
            console.error('Cloudinary upload error details:', errorData);
            throw new Error(`Cloudinary upload failed: ${errorData.error?.message || uploadRes.statusText}`);
        }

        const uploadData = await uploadRes.json();
        return uploadData.secure_url as string;
    };

    const handleFinish = async () => {
        setIsGenerating(true);
        try {
            // Ensure media is uploaded if it wasn't done via AI suggestion
            const uploadedUrls = await handleMediaUpload();

            const payloadData = {
                text: customCaption.replace(/\n/g, '<br />'),
                imageUrls: uploadedUrls,
                pillar: selectedPillar
            };

            console.log("Submitting payload to proxy:", payloadData);

            const response = await fetch('/api/merrick-zapier', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payloadData)
            });

            if (!response.ok) throw new Error("Failed backend proxy submission");

            setIsSuccess(true);
            setTimeout(() => { router.push('/'); }, 3000);

        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to submit post");
            setIsGenerating(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm animate-in fade-in duration-500">
                <div className="flex flex-col items-center justify-center space-y-6 text-center animate-in zoom-in-95 duration-700 delay-150 fill-mode-both">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                        <div className="relative bg-primary text-primary-foreground p-6 rounded-full shadow-2xl">
                            <CheckCircle2 className="w-16 h-16" />
                        </div>
                    </div>
                    <div className="space-y-2 max-w-sm">
                        <h2 className="text-3xl font-extrabold tracking-tight">Post Sent!</h2>
                        <p className="text-muted-foreground text-lg">Your post has been successfully submitted for review and approval.</p>
                    </div>
                    <div className="mt-8 flex items-center justify-center gap-2 text-primary">
                        <Leaf className="w-5 h-5 animate-pulse" />
                        <span className="font-semibold text-sm tracking-widest uppercase animate-pulse">Redirecting to Dashboard</span>
                        <Leaf className="w-5 h-5 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto py-4">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-foreground flex justify-center items-center gap-3">
                    <PenTool className="h-8 w-8 text-primary" /> Send to Merrick
                </h2>
                <p className="text-muted-foreground">Follow the steps below to generate an Almstead-branded social media post.</p>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center justify-center gap-2 mb-8">
                <div className={cn("px-4 py-2 rounded-full text-sm font-semibold transition-colors", step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    1. Media
                </div>
                <div className="h-0.5 w-12 bg-border">
                    <div className={cn("h-full bg-primary transition-all", step >= 2 ? "w-full" : "w-0")}></div>
                </div>
                <div className={cn("px-4 py-2 rounded-full text-sm font-semibold transition-colors", step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    2. Pillar
                </div>
                <div className="h-0.5 w-12 bg-border">
                    <div className={cn("h-full bg-primary transition-all", step >= 3 ? "w-full" : "w-0")}></div>
                </div>
                <div className={cn("px-4 py-2 rounded-full text-sm font-semibold transition-colors", step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    3. AI Caption
                </div>
            </div>

            {/* Step 1: Media Selection */}
            {step === 1 && (
                <div className="rounded-xl border border-border bg-card shadow-sm p-8 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div>
                        <h3 className="text-xl font-bold mb-2">Select Visual Content</h3>
                        <p className="text-muted-foreground text-sm">Every great post starts with a photo or video. Upload an image or select directly from our shared albums.</p>
                    </div>

                    <div className="grid sm:grid-cols-1 gap-4 max-w-2xl mx-auto">

                        <button
                            onClick={handleUploadClick}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            disabled={mediaList.length >= 3}
                            className={cn(
                                "flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all gap-4 outline-none",
                                mediaList.length >= 3 ? "opacity-50 cursor-not-allowed border-muted bg-muted/10" :
                                    isDragging ? "border-primary bg-primary/10 scale-[1.02] shadow-sm" : "border-border hover:border-primary hover:bg-primary/5"
                            )}
                        >
                            <div className="p-4 rounded-full bg-green-100 text-green-600">
                                <Upload className="h-8 w-8" />
                            </div>
                            <div>
                                <h4 className="font-bold">Upload Local Media</h4>
                                <p className="text-xs text-muted-foreground mt-1">Select up to 3 files (Images or Video)</p>
                            </div>
                        </button>
                        <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*,video/*"
                        />
                    </div>
                </div>
            )}

            {/* Step 2: Content Pillar */}
            {step === 2 && (
                <div className="rounded-xl border border-border bg-card shadow-sm p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">

                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold">Selected Media ({mediaList.length}/3)</h3>
                            {mediaList.length < 3 && (
                                <button onClick={() => setStep(1)} className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                                    <Upload className="h-4 w-4" /> Add More
                                </button>
                            )}
                        </div>
                        {mediaList.map((media, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border">
                                <div className="h-16 w-16 bg-card rounded border flex items-center justify-center shrink-0">
                                    {media.type === 'upload' ? (
                                        <img src={media.url} alt={`Upload Preview ${idx + 1}`} className="h-full w-full object-cover rounded" />
                                    ) : (
                                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-medium truncate">{media.name}</p>
                                    <p className="text-xs text-muted-foreground uppercase">{media.type} media selected</p>
                                </div>
                                <button
                                    onClick={() => setMediaList(prev => prev.filter((_, i) => i !== idx))}
                                    className="text-sm text-destructive font-medium hover:underline px-2"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <h3 className="text-xl font-bold mb-2">Choose Content Pillar</h3>
                        <p className="text-muted-foreground text-sm">Which brand pillar does this content represent?</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {pillars.map((p) => {
                            const isSelected = selectedPillar === p.id;
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedPillar(p.id)}
                                    className={cn(
                                        "flex flex-col items-start gap-3 p-6 rounded-xl border-2 transition-all text-left",
                                        isSelected
                                            ? "border-primary bg-primary/5 shadow-md"
                                            : "border-border bg-card hover:bg-muted"
                                    )}
                                >
                                    <div className={cn("p-2 rounded-lg", isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                                        <p.icon className="h-5 w-5" />
                                    </div>
                                    <span className="font-bold">{p.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            disabled={!selectedPillar || isGenerating}
                            onClick={async () => {
                                try {
                                    setStep(3);
                                } catch (err: any) {
                                    console.error("Transition to Step 3 failed:", err);
                                    alert(err.message || "Failed to proceed to next step.");
                                }
                            }}
                            className="inline-flex items-center justify-center rounded-md text-sm font-bold transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-11 px-8 disabled:opacity-50"
                        >
                            Next: Review & Caption <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: AI Generation & Review */}
            {step === 3 && (
                <div className="rounded-xl border border-border bg-card shadow-sm p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="text-center">
                        <h3 className="text-xl font-bold mb-2">Review & Caption</h3>
                        <p className="text-muted-foreground text-sm">Write your caption below, or use AI to generate creative variations.</p>
                    </div>

                    <div className="space-y-6">
                        {/* AI Suggestions Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-sm">AI Suggestions</h4>
                                {generatedOptions.length === 0 && !isGenerating && !isUploading && (
                                    <button
                                        onClick={handleRequestAI}
                                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
                                    >
                                        <Sparkles className="h-3.5 w-3.5" /> Get AI Ideas
                                    </button>
                                )}
                            </div>

                            {(isUploading || isGenerating) ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-3 rounded-xl bg-muted/20 border border-dashed">
                                    <Wand2 className="h-6 w-6 animate-bounce text-primary" />
                                    <p className="text-sm font-medium animate-pulse">
                                        {isUploading ? "Uploading media to Cloudinary..." : "Generating creative options..."}
                                    </p>
                                </div>
                            ) : generatedOptions.length > 0 ? (
                                <div className="grid md:grid-cols-3 gap-4">
                                    {generatedOptions.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => selectOption(opt)}
                                            className="text-left p-4 rounded-xl border border-border hover:border-primary hover:shadow-md transition-all text-xs flex flex-col items-start gap-2 bg-card"
                                        >
                                            <span className="text-[10px] font-bold uppercase text-primary mb-1 inline-block">Option {i + 1}</span>
                                            <span className="line-clamp-6 leading-relaxed">{opt}</span>
                                            <span className="text-primary text-[10px] font-bold mt-auto pt-2 hover:underline">Use this draft →</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 rounded-xl bg-muted/10 border border-dashed text-center">
                                    <p className="text-xs text-muted-foreground">Click "Get AI Ideas" to generate suggestions based on your media and brand pillar.</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 pt-4 border-t">
                            <label className="font-bold flex items-center justify-between text-sm">
                                Final Caption
                                <span className="text-[10px] font-normal text-muted-foreground">Edit suggestions or write your own</span>
                            </label>
                            <textarea
                                className="w-full min-h-[150px] p-4 rounded-xl border border-input bg-background resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm text-sm"
                                placeholder="Your post caption..."
                                value={customCaption}
                                onChange={(e) => setCustomCaption(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <button onClick={() => setStep(2)} className="text-sm text-muted-foreground hover:text-foreground font-medium">
                                ← Back
                            </button>

                            <button
                                onClick={handleFinish}
                                disabled={isGenerating || isUploading || !customCaption.trim()}
                                className="inline-flex items-center justify-center rounded-md text-sm font-bold transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-11 px-8 disabled:opacity-50"
                            >
                                {isGenerating || isUploading ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="mr-2 h-5 w-5" /> Send for Approval
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}



