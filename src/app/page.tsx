"use client";

import { useState, useRef, useEffect } from "react";
import { ImageIcon, FolderHeart, Upload, Filter, Crop, Type, Layers, Trash2, X, Download, Settings2, Undo2, ArrowUp, ArrowDown, AlignCenter, Grid3x3, Grid2X2 } from "lucide-react";
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
    const [exportQuality, setExportQuality] = useState<number>(1);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
    const [activePreset, setActivePreset] = useState<string>('instagram');
    const [frameColorIndex, setFrameColorIndex] = useState(0);
    const [showGrid, setShowGrid] = useState<boolean>(false);
    const [gridSize, setGridSize] = useState<number>(50);
    const BRAND_COLORS = ['#006630', '#ffffff', '#518f35', '#c8570f'];

    // Layer Management State
    interface LayerData {
        id: string;
        displayName: string;
        fabricObj: fabric.Object;
    }
    const [layersList, setLayersList] = useState<LayerData[]>([]);

    const updateLayersList = (canvas: fabric.Canvas) => {
        const objs = canvas.getObjects();
        // Reverse so topmost layer is at the top of the UI list
        const parsedLayers = objs.map((obj) => {
            const id = (obj as any).id || obj.type;
            let displayName = id;
            if (obj.type === 'textbox' || obj.type === 'i-text') {
                displayName = `Text: "${(obj as any).text?.substring(0, 10)}..."`;
            } else if (id === 'mainImage') {
                displayName = "Background Image";
            } else if (id === 'brandFrame') {
                displayName = "Brand Frame";
            } else if (id === 'darkOverlay') {
                displayName = "Dark Overlay";
            } else if (id === 'brandLogo') {
                displayName = "Almstead Logo";
            }
            return { id, displayName, fabricObj: obj };
        }).reverse();

        setLayersList(parsedLayers);
    };

    // Undo History State
    const historyRef = useRef<string[]>([]);
    const historyIndexRef = useRef<number>(-1);
    const isUndoingRef = useRef<boolean>(false);

    const saveHistory = (canvas: fabric.Canvas) => {
        if (isUndoingRef.current) return;

        // Save relevant custom properties so they aren't lost on loadFromJson
        const rawJson = canvas.toObject(['id', 'selectable', 'evented', 'strokeUniform', 'crossOrigin']);
        // Exclude grid lines from history so they don't corrupt the undo stack
        if (rawJson.objects) {
            rawJson.objects = rawJson.objects.filter((o: any) => o.id !== 'gridLine');
        }
        const json = JSON.stringify(rawJson);

        // Prevent duplicate consecutive states
        if (historyIndexRef.current >= 0 && historyRef.current[historyIndexRef.current] === json) {
            return;
        }

        // If we previously undid something and now make a new change, wipe the future redo history
        if (historyRef.current.length > historyIndexRef.current + 1) {
            historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
        }

        historyRef.current.push(json);
        historyIndexRef.current++;

        // Keep memory capped at 30 states
        if (historyRef.current.length > 30) {
            historyRef.current.shift();
            historyIndexRef.current--;
        }

        updateLayersList(canvas);
    };

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
                // Scale it fit nicely within the 500x500 canvas we immediately set synchronously
                const scale = Math.min(500 / img.width!, 500 / img.height!);
                img.scale(scale);

                // Center it absolute relative to the current viewport dimension
                img.set({ selectable: true });
                canvas.viewportCenterObject(img);
                img.setCoords();

                // Tag it so we can find it easily during resize
                img.set('id', 'mainImage' as any);

                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.renderAll();

                // Save Initial State for Undo
                setTimeout(() => {
                    historyRef.current = [];
                    historyIndexRef.current = -1;
                    saveHistory(canvas);

                    // Attach Canvas event listeners to track user edits
                    canvas.on('object:added', () => saveHistory(canvas));
                    canvas.on('object:modified', () => saveHistory(canvas));
                    canvas.on('object:removed', () => saveHistory(canvas));
                }, 100);
            })
            .catch((err) => console.error("Error loading image onto canvas:", err));

        // Initial default dimensions (1080x1080 scaled down for preview)
        canvas.setDimensions({ width: 500, height: 500 });

        // Render Grid if enabled
        const drawGrid = () => {
            // Remove old grid lines
            const objects = canvas.getObjects();
            const gridLines = objects.filter(o => (o as any).id === 'gridLine');
            gridLines.forEach(line => canvas.remove(line));

            if (!showGrid) return;

            const w = canvas.width!;
            const h = canvas.height!;

            const lineOptions = {
                stroke: 'rgba(0,0,0,0.2)',
                strokeWidth: 1,
                selectable: false,
                evented: false,
                interactive: false,
                hoverCursor: 'default',
                id: 'gridLine' as any,
                excludeFromExport: true // Key property so it doesn't get saved
            };

            for (let i = 0; i < (w / gridSize); i++) {
                const x = i * gridSize;
                canvas.add(new fabric.Line([x, 0, x, h], lineOptions));
            }
            for (let j = 0; j < (h / gridSize); j++) {
                const y = j * gridSize;
                canvas.add(new fabric.Line([0, y, w, y], lineOptions));
            }

            // Bring grid to absolute front so it sits over elements
            const newGridLines = canvas.getObjects().filter(o => (o as any).id === 'gridLine');
            newGridLines.forEach(line => {
                if (typeof (line as any).bringForward === 'function') {
                    canvas.bringObjectToFront(line);
                }
            });
            canvas.renderAll();
        };
        drawGrid();

        // Bind selection event to trigger react rerenders for active state styling
        canvas.on('selection:created', () => { setLayersList([...layersList]); });
        canvas.on('selection:updated', () => { setLayersList([...layersList]); });
        canvas.on('selection:cleared', () => { setLayersList([...layersList]); });

        return () => {
            canvas.dispose();
            setFabricCanvas(null);
            // Dont reset preset so we don't flash UI
        };
    }, [selectedMedia, showGrid, gridSize]);

    // Editor Actions
    const addText = () => {
        if (!fabricCanvas) return;

        const activeObj = fabricCanvas.getActiveObject();
        // If text is selected, cycle its color
        if (activeObj && (activeObj.type === "i-text" || activeObj.type === "textbox")) {
            const currentFill = activeObj.get('fill') as string;
            const currentIndex = BRAND_COLORS.indexOf(currentFill);
            const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % BRAND_COLORS.length;

            activeObj.set('fill', BRAND_COLORS[nextIndex]);
            fabricCanvas.renderAll();
            saveHistory(fabricCanvas);
        } else {
            // Otherwise add new Textbox (handles wrapping and cursor scaling better than IText)
            const text = new fabric.Textbox("Almstead Experts", {
                left: 100,
                top: 100,
                width: 300,
                fontFamily: "'Spline Sans', sans-serif",
                fill: BRAND_COLORS[0], // Primary green
                fontSize: 40,
                fontWeight: "bold",
                splitByGrapheme: true,
            });
            fabricCanvas.add(text);
            fabricCanvas.setActiveObject(text);
            fabricCanvas.renderAll();
            saveHistory(fabricCanvas);
        }
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
            saveHistory(fabricCanvas);
        } else {
            // Add a mockup Almstead frame/overlay
            const rect = new fabric.Rect({
                originX: 'center',
                originY: 'center',
                left: fabricCanvas.width! / 2,
                top: fabricCanvas.height! / 2,
                width: fabricCanvas.width! - 40,
                height: fabricCanvas.height! - 40,
                rx: 16,
                ry: 16,
                fill: 'transparent',
                stroke: BRAND_COLORS[frameColorIndex],
                strokeWidth: 8,
                selectable: true, // Allow user to reposition/scale
                evented: true,
                strokeUniform: true // Keeps border width consistent if scaled
            });
            // Tag it
            rect.set('id', 'brandFrame' as any);

            fabricCanvas.add(rect);
            fabricCanvas.bringObjectToFront(rect);
            fabricCanvas.renderAll();
            saveHistory(fabricCanvas);
        }
    };

    const toggleDarkOverlay = () => {
        if (!fabricCanvas) return;

        const objs = fabricCanvas.getObjects();
        const existingDarkOverlay = objs.find(o => (o as any).id === 'darkOverlay') as fabric.Rect;

        if (existingDarkOverlay) {
            // Toggle opacity to hide/show
            const newOpacity = existingDarkOverlay.opacity === 0 ? 0.4 : 0;
            existingDarkOverlay.set('opacity', newOpacity);
            fabricCanvas.renderAll();
            saveHistory(fabricCanvas);
        } else {
            // Create full width black Rect
            const rect = new fabric.Rect({
                originX: 'center',
                originY: 'center',
                left: fabricCanvas.width! / 2,
                top: fabricCanvas.height! / 2,
                width: fabricCanvas.width!,
                height: fabricCanvas.height!,
                fill: '#000000',
                opacity: 0.4,
                selectable: false,
                evented: false,
            });
            rect.set('id', 'darkOverlay' as any);

            // We want it above the image but below the frames/text
            // Insert it at index 1 (0 is usually the main image if nothing else re-ordered it)
            // But to be safe, find the main image index and put it right after.
            const mainImgIndex = objs.findIndex(o => (o as any).id === 'mainImage');
            if (mainImgIndex !== -1) {
                fabricCanvas.insertAt(mainImgIndex + 1, rect);
            } else {
                fabricCanvas.add(rect);
                fabricCanvas.sendObjectToBack(rect);
            }
            fabricCanvas.renderAll();
            saveHistory(fabricCanvas);
        }
    };

    const addLogo = () => {
        if (!fabricCanvas) return;

        const logoUrl = "https://almstead.mystagingwebsite.com/wp-content/uploads/2025/11/horizontal-almstead-logo-3.svg";

        fabric.FabricImage.fromURL(logoUrl, { crossOrigin: 'anonymous' })
            .then((img) => {
                // Scale logo to a reasonable default size
                const scale = 200 / img.width!;
                img.scale(scale);

                img.set({
                    left: 40,
                    top: 40,
                    selectable: true,
                });

                img.set('id', 'brandLogo' as any);

                fabricCanvas.add(img);
                fabricCanvas.bringObjectToFront(img);
                fabricCanvas.setActiveObject(img);
                fabricCanvas.renderAll();
                saveHistory(fabricCanvas);
            })
            .catch((err) => console.error("Error loading logo onto canvas:", err));
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
            saveHistory(fabricCanvas);
        } else {
            alert("Please select the image first to apply a filter.");
        }
    };

    const deleteSelected = () => {
        if (!fabricCanvas) return;
        const activeObjects = fabricCanvas.getActiveObjects();
        if (activeObjects.length > 0) {
            activeObjects.forEach(obj => {
                // Prevent deleting the main image or essential backgrounds if we wanted to lock them
                if ((obj as any).id !== 'mainImage') {
                    fabricCanvas.remove(obj);
                } else {
                    alert("Cannot delete the background image.");
                }
            });
            fabricCanvas.discardActiveObject();
            fabricCanvas.renderAll();
            saveHistory(fabricCanvas);
        } else {
            alert("Please select an item (text, logo, or frame) to delete.");
        }
    };

    const centerSelected = () => {
        if (!fabricCanvas) return;
        const activeObjs = fabricCanvas.getActiveObjects();
        if (activeObjs.length > 0) {
            activeObjs.forEach(obj => {
                fabricCanvas.viewportCenterObject(obj);
                obj.setCoords();
            });
            fabricCanvas.renderAll();
            saveHistory(fabricCanvas);
        } else {
            alert("Please select an item (text, logo, or frame) to center.");
        }
    };

    const undo = () => {
        if (!fabricCanvas || historyIndexRef.current <= 0) return;

        isUndoingRef.current = true;
        historyIndexRef.current -= 1;
        const previousState = historyRef.current[historyIndexRef.current];

        fabricCanvas.loadFromJSON(previousState, () => {
            fabricCanvas.renderAll();
            updateLayersList(fabricCanvas);
            isUndoingRef.current = false;
        });
    };

    const moveLayerUp = (obj: fabric.Object) => {
        if (!fabricCanvas) return;
        // In v6, these methods exist on the object itself
        if (typeof (obj as any).bringForward === 'function') {
            (obj as any).bringForward();
        } else if (typeof (fabricCanvas as any).bringObjectForward === 'function') {
            (fabricCanvas as any).bringObjectForward(obj);
        }
        fabricCanvas.renderAll();
        // Force layer UI update since saveHistory checks might abort
        updateLayersList(fabricCanvas);
        saveHistory(fabricCanvas);
    };

    const moveLayerDown = (obj: fabric.Object) => {
        if (!fabricCanvas) return;

        // Prevent moving completely behind the main image
        const currentIndex = fabricCanvas.getObjects().indexOf(obj);
        const mainImgIndex = fabricCanvas.getObjects().findIndex(o => (o as any).id === 'mainImage');

        if (currentIndex > mainImgIndex + 1 || (currentIndex === mainImgIndex + 1 && mainImgIndex === -1)) {
            if (typeof (obj as any).sendBackwards === 'function') {
                (obj as any).sendBackwards();
            } else if (typeof (fabricCanvas as any).sendObjectBackwards === 'function') {
                (fabricCanvas as any).sendObjectBackwards(obj);
            }
            fabricCanvas.renderAll();
            // Force layer UI update
            updateLayersList(fabricCanvas);
            saveHistory(fabricCanvas);
        }
    };

    const selectLayer = (obj: fabric.Object) => {
        if (!fabricCanvas) return;
        fabricCanvas.setActiveObject(obj);
        fabricCanvas.renderAll();
        // Force re-render to highlight selection in UI
        setLayersList([...layersList]);
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
        const frameOverlay = objs.find(o => (o as any).id === 'brandFrame');
        if (frameOverlay) {
            frameOverlay.set({
                left: targetWidth / 2,
                top: targetHeight / 2,
                width: targetWidth - 40,
                height: targetHeight - 40,
                scaleX: 1, // Reset scaling if the user dragged to resize it
                scaleY: 1
            });
            frameOverlay.setCoords();
            fabricCanvas.bringObjectToFront(frameOverlay);
        }

        const darkOverlay = objs.find(o => (o as any).id === 'darkOverlay');
        if (darkOverlay) {
            darkOverlay.set({
                left: targetWidth / 2,
                top: targetHeight / 2,
                width: targetWidth,
                height: targetHeight,
            });
            darkOverlay.setCoords();
        }

        fabricCanvas.renderAll();
        saveHistory(fabricCanvas);
    };

    const exportCanvas = () => {
        if (!fabricCanvas) return;
        const dataURL = fabricCanvas.toDataURL({
            format: 'jpeg',
            multiplier: exportQuality, // 1x = standard, 2x = high-res, 3x = print
            quality: 0.95,
            // Exclude objects with excludeFromExport: true (like grid lines)
            // This is default behavior for toDataURL, but good to be aware.
        });
        // Trigger download
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `almstead-post-${Date.now()}-q${exportQuality}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 max-w-6xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Image Brander</h2>
                    <p className="text-muted-foreground text-sm">Give your image the best branding it can possibly have in the Tree Service Industry</p>
                </div>
                <div className="flex gap-3">
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
                                        <div className="flex gap-2 items-center">
                                            <select
                                                className="text-xs bg-muted text-foreground border border-border px-2 py-1.5 rounded outline-none"
                                                value={exportQuality}
                                                onChange={(e) => setExportQuality(Number(e.target.value))}
                                            >
                                                <option value={1}>Standard Quality (1x)</option>
                                                <option value={2}>High Quality (2x)</option>
                                                <option value={3}>Maximum Quality (3x)</option>
                                            </select>
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
                                <button onClick={toggleDarkOverlay} className="flex items-center justify-start gap-3 p-2 rounded-md hover:bg-muted text-sm font-medium text-foreground w-full transition-colors">
                                    <Crop className="h-4 w-4" /> Toggle Dark Overlay
                                </button>
                                <button onClick={applyGrayscaleFilter} className="flex items-center justify-start gap-3 p-2 rounded-md hover:bg-muted text-sm font-medium text-foreground w-full transition-colors">
                                    <Filter className="h-4 w-4" /> B&W Filter
                                </button>
                                <button onClick={addBrandOverlay} className="flex items-center justify-start gap-3 p-2 rounded-md hover:bg-muted text-sm font-medium text-foreground w-full transition-colors">
                                    <Layers className="h-4 w-4" /> Toggle Brand Frame
                                </button>
                                <button onClick={addLogo} className="flex items-center justify-start gap-3 p-2 rounded-md hover:bg-muted text-sm font-medium text-foreground w-full transition-colors">
                                    <ImageIcon className="h-4 w-4" /> Add Logo
                                </button>
                                <button onClick={addText} className="flex items-center justify-start gap-3 p-2 rounded-md hover:bg-muted text-sm font-medium text-foreground w-full transition-colors">
                                    <Type className="h-4 w-4" /> Add / Style Text
                                </button>
                                <button onClick={centerSelected} className="flex items-center justify-start gap-3 p-2 rounded-md hover:bg-muted text-sm font-medium text-foreground w-full transition-colors">
                                    <AlignCenter className="h-4 w-4" /> Center Selected
                                </button>
                                <div className="border-t border-border my-2"></div>

                                <button onClick={() => setShowGrid(!showGrid)} className={cn("flex items-center justify-start gap-3 p-2 rounded-md hover:bg-muted text-sm font-medium w-full transition-colors", showGrid ? "bg-primary/10 text-primary border border-primary/20" : "text-foreground")}>
                                    <Grid3x3 className="h-4 w-4" /> {showGrid ? 'Hide Alignment Grid' : 'Show Alignment Grid'}
                                </button>
                                {showGrid && (
                                    <button onClick={() => setGridSize(prev => prev === 50 ? 20 : 50)} className="flex items-center justify-start gap-3 p-2 rounded-md hover:bg-muted text-sm font-medium text-foreground w-full transition-colors bg-muted/30 ml-2 border-l border-primary/30">
                                        <Grid2X2 className="h-4 w-4" /> Switch Grid Size ({gridSize}px)
                                    </button>
                                )}

                                <div className="border-t border-border my-2"></div>
                                <button onClick={deleteSelected} className="flex items-center justify-start gap-3 p-2 rounded-md hover:bg-destructive/10 text-destructive text-sm font-medium w-full transition-colors">
                                    <Trash2 className="h-4 w-4" /> Delete Selected
                                </button>
                                <button onClick={undo} className="flex items-center justify-start gap-3 p-2 rounded-md hover:bg-muted text-sm font-medium text-foreground w-full transition-colors">
                                    <Undo2 className="h-4 w-4" /> Undo
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

                        {selectedMedia && layersList.length > 0 && (
                            <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col max-h-[300px]">
                                <h3 className="font-semibold text-sm mb-4">Layers</h3>
                                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                    {layersList.map((layer, idx) => {
                                        const isActive = fabricCanvas?.getActiveObject() === layer.fabricObj;
                                        const isBottom = idx === layersList.length - 1;
                                        const isTop = idx === 0;

                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => selectLayer(layer.fabricObj)}
                                                className={cn(
                                                    "flex items-center justify-between p-2 rounded-md text-sm border cursor-pointer transition-colors",
                                                    isActive ? "bg-primary/10 border-primary shadow-sm" : "bg-muted border-transparent hover:border-border"
                                                )}
                                            >
                                                <span className="truncate flex-1 font-medium">{layer.displayName}</span>

                                                {layer.id !== 'mainImage' && (
                                                    <div className="flex gap-1 ml-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); moveLayerUp(layer.fabricObj); }}
                                                            disabled={isTop}
                                                            className="p-1 hover:bg-background rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                                                        >
                                                            <ArrowUp className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); moveLayerDown(layer.fabricObj); }}
                                                            disabled={isBottom}
                                                            className="p-1 hover:bg-background rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                                                        >
                                                            <ArrowDown className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
