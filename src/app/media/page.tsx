"use client";

import { useState, useRef, useEffect } from "react";
import { ImageIcon, FolderHeart, Upload, Filter, Crop, Type, Layers, Trash2, X, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import * as fabric from "fabric";

interface MediaItem {
    id: string;
    url: string;
    name: string;
    type: string;
}

export default function MediaLibrary() {
    const [mediaList, setMediaList] = useState<MediaItem[]>([]);
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
    const [activePreset, setActivePreset] = useState<string>('instagram');
    const [frameColorIndex, setFrameColorIndex] = useState(0);
    const BRAND_COLORS = ['#006630', '#ffffff', '#518f35', '#c8570f'];

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newMedia: MediaItem[] = Array.from(files).map((file) => ({
            id: Math.random().toString(36).substring(7),
            url: URL.createObjectURL(file),
            name: file.name,
            type: file.type,
        }));

        setMediaList((prev) => [...newMedia, ...prev]);
        if (!selectedMedia) {
            setSelectedMedia(newMedia[0]);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveMedia = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setMediaList((prev) => prev.filter((m) => m.id !== id));
        if (selectedMedia?.id === id) {
            setSelectedMedia(null);
        }
    };

    // Initialize and update Canvas when an image is selected
    useEffect(() => {
        if (!canvasRef.current || !selectedMedia) return;

        // Do not run canvas on videos yet
        if (selectedMedia.type.startsWith('video/')) return;

        // Initialize Fabric Canvas
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: 800,
            height: 600,
            backgroundColor: '#f6f8f2' // Almstead background
        });
        setFabricCanvas(canvas);

        // Load Image into Canvas
        fabric.FabricImage.fromURL(selectedMedia.url, { crossOrigin: 'anonymous' })
            .then((img) => {
                // Initial scale
                const scale = Math.min(800 / img.width!, 600 / img.height!);
                img.scale(scale);

                // Center it
                img.set({
                    left: (800 - img.width! * scale) / 2,
                    top: (600 - img.height! * scale) / 2,
                    selectable: true,
                });

                // Tag it so we can find it easily during resize
                img.set('id', 'mainImage' as any);

                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.renderAll();
            })
            .catch((err) => console.error("Error loading image onto canvas:", err));

        // Initial default dimensions (1080x1080 scaled down for preview)
        canvas.setDimensions({ width: 500, height: 500 });

        return () => {
            canvas.dispose();
            setFabricCanvas(null);
            setActivePreset('instagram');
        };
    }, [selectedMedia]);

    // Editor Actions
    const addText = () => {
        if (!fabricCanvas) return;
        const text = new fabric.IText("Almstead Experts", {
            left: 100,
            top: 100,
            fontFamily: "Arial", // using standard font as fallback
            fill: "#006630", // Primary green
            fontSize: 40,
            fontWeight: "bold",
        });
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
        fabricCanvas.renderAll();
    };

    const addBrandOverlay = () => {
        if (!fabricCanvas) return;

        const objs = fabricCanvas.getObjects();
        const existingOverlay = objs.find(o => (o as any).id === 'brandFrame') as fabric.Rect;

        if (existingOverlay) {
            // Cycle color
            const nextIndex = (frameColorIndex + 1) % BRAND_COLORS.length;
            setFrameColorIndex(nextIndex);
            existingOverlay.set('stroke', BRAND_COLORS[nextIndex]);
            fabricCanvas.bringObjectToFront(existingOverlay); // keep on top
            fabricCanvas.renderAll();
        } else {
            // Add a mockup Almstead frame/overlay
            const rect = new fabric.Rect({
                left: 20,
                top: 20,
                width: fabricCanvas.width! - 40,
                height: fabricCanvas.height! - 40,
                fill: 'transparent',
                stroke: BRAND_COLORS[frameColorIndex],
                strokeWidth: 8,
                selectable: false, // Don't allow it to be moved easily
                evented: false,
            });
            // Tag it
            rect.set('id', 'brandFrame' as any);

            fabricCanvas.add(rect);
            fabricCanvas.bringObjectToFront(rect);
            fabricCanvas.renderAll();
        }
    };

    const applyGrayscaleFilter = () => {
        if (!fabricCanvas) return;
        const activeObj = fabricCanvas.getActiveObject();
        if (activeObj && activeObj.type === "image") {
            const img = activeObj as fabric.FabricImage;
            const filter = new fabric.filters.Grayscale();
            img.filters = [filter];
            img.applyFilters();
            fabricCanvas.renderAll();
        } else {
            alert("Please select the image first to apply a filter.");
        }
    };

    const applyPreset = (preset: string) => {
        if (!fabricCanvas) return;

        setActivePreset(preset);

        let targetWidth = 500;
        let targetHeight = 500;

        // Using scaled down values to fit the UI while keeping the aspect ratio
        if (preset === 'instagram') {
            targetWidth = 500;
            targetHeight = 500;
        } else if (preset === 'facebook') {
            targetWidth = 600;
            targetHeight = 315;
        } else if (preset === 'story') {
            targetWidth = 360;
            targetHeight = 640;
        }

        // Resize the canvas
        fabricCanvas.setDimensions({ width: targetWidth, height: targetHeight });

        // Center the main image again based on new canvas dimensions
        const objs = fabricCanvas.getObjects();
        const mainImg = objs.find(o => (o as any).id === 'mainImage');

        if (mainImg) {
            const currentScale = mainImg.scaleX || 1;
            mainImg.set({
                left: (targetWidth - (mainImg.width! * currentScale)) / 2,
                top: (targetHeight - (mainImg.height! * currentScale)) / 2,
            });
            mainImg.setCoords();
        }

        // Keep brand overlay attached to borders if it exists
        const overlay = objs.find(o => (o as any).id === 'brandFrame');
        if (overlay) {
            overlay.set({
                width: targetWidth - 40,
                height: targetHeight - 40
            });
            overlay.setCoords();
            fabricCanvas.bringObjectToFront(overlay);
        }

        fabricCanvas.renderAll();
    };

    const exportCanvas = () => {
        if (!fabricCanvas) return;
        const dataURL = fabricCanvas.toDataURL({
            format: 'jpeg',
            multiplier: 1,
            quality: 0.9
        });
        // Trigger download
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `almstead-post-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 max-w-6xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Media Library & Editor</h2>
                    <p className="text-muted-foreground text-sm">Access approved Almstead photos from Google Photos or upload new ones.</p>
                </div>
                <div className="flex gap-3">
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4">
                        <FolderHeart className="mr-2 h-4 w-4" />
                        Sync Album
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,video/*"
                        multiple
                    />
                    <button
                        onClick={handleUploadClick}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4"
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Media
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
                {/* Left: Gallery Thumbnail list */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm min-h-[500px] flex flex-col">
                        <h3 className="font-semibold text-sm mb-4 border-b border-border pb-2">Library</h3>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                            {mediaList.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm text-center">
                                    <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                                    <p>No media uploaded</p>
                                    <button
                                        onClick={handleUploadClick}
                                        className="mt-4 text-primary font-medium hover:underline"
                                    >
                                        Upload now
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {mediaList.map((media) => (
                                        <div
                                            key={media.id}
                                            onClick={() => setSelectedMedia(media)}
                                            className={cn(
                                                "relative group aspect-square rounded-md overflow-hidden border-2 cursor-pointer transition-all bg-muted",
                                                selectedMedia?.id === media.id ? "border-primary shadow-sm" : "border-transparent hover:border-primary/50"
                                            )}
                                        >
                                            {media.type.startsWith('video/') ? (
                                                <video src={media.url} className="w-full h-full object-cover" />
                                            ) : (
                                                <img src={media.url} alt={media.name} className="w-full h-full object-cover" />
                                            )}

                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end p-1">
                                                <button
                                                    onClick={(e) => handleRemoveMedia(media.id, e)}
                                                    className="h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Center/Right: Editor Workspace */}
                <div className="lg:col-span-9 grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* Editor Canvas */}
                    <div className="lg:col-span-3">
                        <div className="h-full min-h-[500px] w-full rounded-xl border border-border bg-muted/10 shadow-sm flex flex-col items-center justify-center overflow-hidden">
                            {selectedMedia ? (
                                <div className="flex flex-col w-full h-full">
                                    <div className="bg-card border-b border-border p-3 flex justify-between items-center bg-opacity-95">
                                        <span className="text-sm font-medium truncate max-w-[200px]">{selectedMedia.name}</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={exportCanvas}
                                                className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded font-medium shadow-sm hover:bg-primary/90 flex items-center gap-2 transition-colors"
                                            >
                                                <Download className="h-4 w-4" /> Download Result
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1 w-full flex justify-center items-center bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] bg-muted overflow-auto p-4">
                                        {selectedMedia.type.startsWith('video/') ? (
                                            <video src={selectedMedia.url} controls className="max-w-full max-h-full object-contain shadow-md" />
                                        ) : (
                                            <div className="border border-border shadow-xl bg-card">
                                                <canvas ref={canvasRef} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-64 w-64 md:h-96 md:w-96 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground bg-card">
                                    <div className="text-center">
                                        <ImageIcon className="mx-auto h-12 w-12 mb-3 text-muted-foreground/50" />
                                        <p className="text-sm font-medium">Fabric.js Canvas Area</p>
                                        <p className="text-xs mt-1">Select an image from library to edit</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Toolbar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className={cn("rounded-xl border border-border bg-card p-4 shadow-sm transition-opacity", !selectedMedia ? "opacity-50 pointer-events-none" : "opacity-100")}>
                            <h3 className="font-semibold text-sm mb-4">Editing Tools</h3>
                            <div className="flex flex-col space-y-2">
                                <button className="flex items-center justify-start gap-3 p-2 rounded-md hover:bg-muted text-sm font-medium text-foreground w-full transition-colors">
                                    <Crop className="h-4 w-4" /> Resize / Crop
                                </button>
                                <button onClick={applyGrayscaleFilter} className="flex items-center justify-start gap-3 p-2 rounded-md hover:bg-muted text-sm font-medium text-foreground w-full transition-colors">
                                    <Filter className="h-4 w-4" /> B&W Filter
                                </button>
                                <button onClick={addBrandOverlay} className="flex items-center justify-start gap-3 p-2 rounded-md hover:bg-muted text-sm font-medium text-foreground w-full transition-colors">
                                    <Layers className="h-4 w-4" /> Toggle Brand Frame
                                </button>
                                <button onClick={addText} className="flex items-center justify-start gap-3 p-2 rounded-md hover:bg-muted text-sm font-medium text-foreground w-full transition-colors">
                                    <Type className="h-4 w-4" /> Add Text
                                </button>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                            <h3 className="font-semibold text-sm mb-4">Export Presets</h3>
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                                    <input
                                        type="radio"
                                        name="preset"
                                        value="instagram"
                                        checked={activePreset === 'instagram'}
                                        onChange={() => applyPreset('instagram')}
                                        className="accent-primary h-4 w-4"
                                    />
                                    Instagram Square (1:1)
                                </label>
                                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                                    <input
                                        type="radio"
                                        name="preset"
                                        value="facebook"
                                        checked={activePreset === 'facebook'}
                                        onChange={() => applyPreset('facebook')}
                                        className="accent-primary h-4 w-4"
                                    />
                                    Facebook Link (1.91:1)
                                </label>
                                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                                    <input
                                        type="radio"
                                        name="preset"
                                        value="story"
                                        checked={activePreset === 'story'}
                                        onChange={() => applyPreset('story')}
                                        className="accent-primary h-4 w-4"
                                    />
                                    Story / Reel (9:16)
                                </label>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
