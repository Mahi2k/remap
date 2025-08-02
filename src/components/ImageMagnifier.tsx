import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCw, X } from 'lucide-react';

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
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(100);
    setRotation(0);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95">
        {/* Header with controls */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
          <div className="text-white">
            <h3 className="text-lg font-semibold">{imageTitle}</h3>
            <p className="text-sm text-white/70">Zoom: {zoom}%</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 300}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRotate}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <RotateCw className="h-4 w-4" />
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
        <div className="flex items-center justify-center w-full h-full overflow-hidden p-16">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="max-w-none transition-transform duration-200 ease-in-out cursor-move"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                maxHeight: zoom <= 100 ? '100%' : 'none',
                maxWidth: zoom <= 100 ? '100%' : 'none',
              }}
              draggable={false}
            />
          </div>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex gap-2 bg-black/50 rounded-full px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(50)}
              className="text-white hover:bg-white/20 text-xs"
            >
              50%
            </Button>
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
              onClick={() => setZoom(150)}
              className="text-white hover:bg-white/20 text-xs"
            >
              150%
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(200)}
              className="text-white hover:bg-white/20 text-xs"
            >
              200%
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};