import React, { useState } from 'react';
import { X, Download, Share2, ArrowLeftRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const ResultOverlay = () => {
  const { generatedResults, activeResultId, setActiveResult } = useStore();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const result = activeResultId ? generatedResults.find(r => r.id === activeResultId) : null;

  // Sorting: Newest first to match Gallery
  const sortedResults = [...generatedResults].sort((a, b) => b.timestamp - a.timestamp);
  const currentIndex = sortedResults.findIndex(r => r.id === activeResultId);
  
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextResult = sortedResults[currentIndex + 1];
    if (currentIndex < sortedResults.length - 1 && nextResult) {
       setActiveResult(nextResult.id);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevResult = sortedResults[currentIndex - 1];
    if (currentIndex > 0 && prevResult) {
       setActiveResult(prevResult.id);
    }
  };

  if (!result) return null;

  const handleDrag = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
    const x = clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setSliderPosition(percentage);
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full z-50 bg-black/90 flex items-center justify-center p-8 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl max-w-6xl w-full flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-blue-400" />
              Comparison View
            </h2>
            <p className="text-xs text-slate-400">Drag slider to compare original vs proposal</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm text-white transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm text-white transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <div className="w-px h-8 bg-slate-700 mx-2" />
            <button 
              onClick={() => setActiveResult(null)}
              className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-full text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content - Comparison Slider */}
        <div className="flex-1 overflow-hidden relative bg-slate-950 select-none group flex items-center">
            {/* Nav Prev */}
            {currentIndex > 0 && (
                <button 
                  onClick={handlePrev}
                  className="absolute left-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 hover:scale-110 transition-all border border-white/10 backdrop-blur"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
            )}

            {/* Nav Next */}
            {currentIndex < sortedResults.length - 1 && (
                <button 
                  onClick={handleNext}
                  className="absolute right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 hover:scale-110 transition-all border border-white/10 backdrop-blur"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            )}

          <div 
            className="w-full h-full relative cursor-col-resize"
            onMouseMove={(e) => isDragging && handleDrag(e)}
            onTouchMove={(e) => isDragging && handleDrag(e)}
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchEnd={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onClick={handleDrag}
          >
             {/* Base Image (Generated/After) */}
            <img 
              src={result.generatedUrl} 
              alt="After" 
              className="absolute top-0 left-0 w-full h-full object-contain" 
            />
            
            {/* Overlay Image (Original/Before) - Clipped */}
            <div 
              className="absolute top-0 left-0 h-full w-full overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              {result.originalImage && (
                <img 
                  src={result.originalImage} 
                  alt="Before" 
                  className="absolute top-0 left-0 max-w-none h-full w-full object-contain"
                  style={{ width: '100vw', maxWidth: '100%' }}
                />
              )}
              {/* Force the inner image to match the container's full size even when clipped */}
               <div className="absolute inset-0 border-r-2 border-white/50 shadow-[0_0_20px_rgba(0,0,0,0.5)]"></div>
            </div>

            {/* Slider Handle */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 hover:bg-blue-400 transition-colors"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg border-2 border-slate-900">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
            </div>
            
            {/* Labels */}
            <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded text-sm font-bold backdrop-blur">
              BEFORE
            </div>
            <div className="absolute top-4 right-4 bg-blue-600/90 text-white px-3 py-1 rounded text-sm font-bold backdrop-blur">
              AFTER
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-between items-center">
          <p className="text-sm text-slate-300">
            <span className="font-semibold text-blue-400">Prompt Used:</span> {result.prompt}
          </p>
          <div className="text-xs text-slate-500 flex items-center gap-4">
            <span>{currentIndex + 1} of {sortedResults.length}</span>
            <span>Generated by {result.type === 'video' ? 'Veo' : 'Gemini 3 Pro'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
