import React from 'react';
import { useStore } from '../../store/useStore';
import { Play, Image as ImageIcon, Calendar, Download, Trash2 } from 'lucide-react';
import { MediaType } from '../../types';

export const Gallery = () => {
  const { generatedResults, setActiveResult, removeGeneratedResult } = useStore();

  const handleSelect = (id: string) => {
    setActiveResult(id); // Show in overlay
  };

  // Sort by newest first
  const sortedResults = [...generatedResults].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="w-full h-full bg-slate-900 overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-end border-b border-slate-700 pb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Project Gallery</h2>
            <p className="text-slate-400">View your generated designs, walkthroughs, and concepts.</p>
          </div>
          <div className="text-right text-sm text-slate-500">
            {sortedResults.length} Items
          </div>
        </div>

        {sortedResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
            <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
            <p>No designs generated yet.</p>
            <p className="text-xs mt-2">Use the Studio to generate your first concept.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedResults.map((result) => (
              <div 
                key={result.id} 
                className="group relative bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500/50 transition-all shadow-lg hover:shadow-blue-500/10 cursor-pointer"
                onClick={() => handleSelect(result.id)}
              >
                {/* Thumbnail / Media Preview */}
                <div className="aspect-video relative overflow-hidden bg-black">
                  {result.type === 'video' ? (
                    <>
                      <img 
                        src={result.thumbnailUrl || result.originalImage} 
                        alt={result.prompt} 
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 text-white fill-white ml-1" />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur border border-white/10 flex items-center gap-1">
                        <Play className="w-3 h-3" /> VIDEO
                      </div>
                    </>
                  ) : (
                    <img 
                      src={result.generatedUrl} 
                      alt={result.prompt} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <div className="flex justify-end gap-2 translate-y-4 group-hover:translate-y-0 transition-transform">
                      <button 
                        className="p-2 bg-slate-700/80 hover:bg-slate-600 rounded-full text-white backdrop-blur transition-colors"
                        onClick={(e) => { e.stopPropagation(); /* Download logic */ }}
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-200 rounded-full backdrop-blur transition-colors border border-red-500/30"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (removeGeneratedResult) removeGeneratedResult(result.id);
                        }}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-sm text-slate-200 line-clamp-2 mb-2 font-medium" title={result.prompt}>
                    {result.prompt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(result.timestamp).toLocaleDateString()}
                    </span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                      {result.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

