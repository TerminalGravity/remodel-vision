import React from 'react';
import { useStore } from '../../store/useStore';
import { Play, Image as ImageIcon, Calendar, Download, Trash2, Sparkles, ArrowRight } from 'lucide-react';
import { MediaType } from '../../types';

export const Gallery = () => {
  const { generatedResults, setActiveResult, removeGeneratedResult, setWorkspaceView } = useStore();

  const handleSelect = (id: string) => {
    setActiveResult(id);
  };

  // Sort by newest first
  const sortedResults = [...generatedResults].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="w-full h-full bg-background overflow-y-auto">
      <div className="max-w-7xl mx-auto px-8 py-10 space-y-10">
        {/* Header with Editorial Typography */}
        <header className="flex justify-between items-end border-b border-border pb-8 opacity-0 animate-fade-in-up">
          <div className="space-y-2">
            <p className="text-xs font-medium text-copper uppercase tracking-[0.2em]">Design Library</p>
            <h2 className="font-display text-4xl text-foreground tracking-tight">Project Gallery</h2>
            <p className="text-muted-foreground">View your generated designs, walkthroughs, and concepts.</p>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            {sortedResults.length} {sortedResults.length === 1 ? 'Item' : 'Items'}
          </div>
        </header>

        {sortedResults.length === 0 ? (
          /* Premium Empty State */
          <div className="flex flex-col items-center justify-center py-24 opacity-0 animate-fade-in-up animate-delay-100">
            <div className="relative mb-8">
              {/* Decorative rings */}
              <div className="absolute inset-0 w-32 h-32 rounded-full border border-border animate-pulse" />
              <div className="absolute inset-2 w-28 h-28 rounded-full border border-border/50" />
              <div className="w-32 h-32 rounded-full bg-secondary/30 flex items-center justify-center border border-border">
                <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
              </div>
            </div>

            <h3 className="font-display text-2xl text-foreground mb-3">No designs yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-8">
              Your generated visualizations, renders, and walkthroughs will appear here.
              Head to the Studio to create your first design.
            </p>

            <button
              onClick={() => setWorkspaceView('DESIGN')}
              className="flex items-center gap-2 px-6 py-3 bg-copper hover:bg-copper-dark text-background font-medium rounded-xl shadow-lg shadow-copper/25 hover:shadow-copper/40 transition-all btn-press"
            >
              <Sparkles className="w-4 h-4" />
              Open Studio
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Ghost Preview Cards */}
            <div className="mt-16 grid grid-cols-3 gap-4 opacity-20 pointer-events-none">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-48 aspect-video rounded-xl bg-secondary/50 border border-border animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
              ))}
            </div>
          </div>
        ) : (
          /* Gallery Grid - Premium Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedResults.map((result, index) => (
              <div
                key={result.id}
                className={`group relative glass rounded-2xl overflow-hidden hover:border-copper/30 transition-all shadow-lg hover:shadow-2xl hover:shadow-copper/10 cursor-pointer opacity-0 animate-fade-in-up`}
                style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
                onClick={() => handleSelect(result.id)}
              >
                {/* Thumbnail / Media Preview */}
                <div className="aspect-video relative overflow-hidden bg-background">
                  {result.type === 'video' ? (
                    <>
                      <img
                        src={result.thumbnailUrl || result.originalImage}
                        alt={result.prompt}
                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-background/20 backdrop-blur-md flex items-center justify-center border border-foreground/20 group-hover:scale-110 group-hover:bg-copper/30 transition-all shadow-lg">
                          <Play className="w-6 h-6 text-foreground fill-foreground ml-1" />
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 bg-background/60 backdrop-blur-sm text-copper text-[10px] font-bold px-2.5 py-1 rounded-full border border-copper/20 flex items-center gap-1 uppercase tracking-wider">
                        <Play className="w-2.5 h-2.5" /> Video
                      </div>
                    </>
                  ) : (
                    <>
                      <img
                        src={result.generatedUrl}
                        alt={result.prompt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-3 right-3 bg-background/60 backdrop-blur-sm text-foreground text-[10px] font-medium px-2.5 py-1 rounded-full border border-border uppercase tracking-wider">
                        Image
                      </div>
                    </>
                  )}

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                    <div className="flex justify-end gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <button
                        className="p-2.5 bg-card/80 hover:bg-secondary rounded-xl text-foreground backdrop-blur-sm transition-all border border-border hover:border-copper/30"
                        onClick={(e) => { e.stopPropagation(); }}
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl backdrop-blur-sm transition-all border border-red-500/20 hover:border-red-500/40"
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

                {/* Info - Premium Style */}
                <div className="p-5">
                  <p className="text-sm text-foreground line-clamp-2 mb-3 font-medium leading-relaxed" title={result.prompt}>
                    {result.prompt || 'Untitled Design'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(result.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
