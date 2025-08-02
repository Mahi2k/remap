import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, X } from 'lucide-react';

interface ImageMagnifierProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
  imageTitle: string;
}

export const ImageMagnifier = ({ 
  isOpen, 
  onClose, 
  imageSrc, 
  imageAlt, 
  imageTitle 
}: ImageMagnifierProps) => {
  const [zoom, setZoom] = useState(200);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset position when image changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      setImagePosition({ x: 0, y: 0 });
      setZoom(200);
    }
  }, [isOpen, imageSrc]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !imageRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Get mouse position relative to container
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate percentages
    const xPercent = mouseX / rect.width;
    const yPercent = mouseY / rect.height;
    
    // Calculate how much the image should move (inverse of mouse movement)
    const maxMoveX = (imageRef.current.clientWidth * (zoom / 100) - rect.width) / 2;
    const maxMoveY = (imageRef.current.clientHeight * (zoom / 100) - rect.height) / 2;
    
    const newX = -maxMoveX * (xPercent * 2 - 1);
    const newY = -maxMoveY * (yPercent * 2 - 1);
    
    setImagePosition({ x: newX, y: newY });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y,
    });
  };

  const handleMouseMoveWhileDragging = (e: React.MouseEvent) => {
    if (!isDragging) {
      handleMouseMove(e);
      return;
    }

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setImagePosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 50, 400));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 50, 100));
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -25 : 25;
    setZoom(prev => Math.max(100, Math.min(400, prev + delta)));
  };

  const handleReset = () => {
    setZoom(200);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 overflow-hidden">
        {/* Header with controls */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
          <div className="text-white">
            <h3 className="text-lg font-semibold">{imageTitle}</h3>
            <p className="text-sm text-white/70">Zoom: {zoom}% | Move mouse to pan or drag to move</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 100}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 400}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Reset
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClose}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Image container */}
        <div 
          ref={containerRef}
          className="relative w-full h-full overflow-hidden cursor-crosshair"
          onMouseMove={handleMouseMoveWhileDragging}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              ref={imageRef}
              src={imageSrc}
              alt={imageAlt}
              className="transition-transform duration-100 ease-out select-none"
              style={{
                transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${zoom / 100})`,
                transformOrigin: 'center center',
              }}
              draggable={false}
              onLoad={() => {
                // Reset position when image loads
                setImagePosition({ x: 0, y: 0 });
              }}
            />
          </div>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex gap-2 bg-black/50 rounded-full px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(100)}
              className="text-white hover:bg-white/20 text-xs"
            >
              100%
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(200)}
              className="text-white hover:bg-white/20 text-xs"
            >
              200%
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(300)}
              className="text-white hover:bg-white/20 text-xs"
            >
              300%
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(400)}
              className="text-white hover:bg-white/20 text-xs"
            >
              400%
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};