import React, { useRef, useEffect, useState } from 'react';
import { Send, Upload, Box, Sparkles, Loader2, User, Bot, Briefcase, ChevronLeft, Settings, Building2, Layout, Cuboid } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { geminiService } from '../../services/geminiService';
import { AppStatus, AppViewMode, WorkspaceView } from '../../types';
import { Button } from '@remodelvision/ui';

// Simple Tooltip Component
interface TooltipProps {
  children?: React.ReactNode;
  content: string;
}

const Tooltip = ({ children, content }: TooltipProps) => {
  return (
    <div className="relative group flex items-center">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
      </div>
    </div>
  );
};

export const Sidebar = () => {
  const { 
    messages, addMessage, status, setStatus, 
    setCaptureRequest, setModelUrl, 
    projectContext, updateProjectContext, setGeneratedResult,
    projects, activeProjectId, setViewMode, addNotification,
    activePropertyMeta, workspaceView, setWorkspaceView
  } = useStore();
  
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const activeProject = projects.find(p => p.id === activeProjectId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listener for the canvas snapshot event
  useEffect(() => {
    const handleSnapshot = async (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const snapshotBase64 = customEvent.detail;
      
      try {
        const generatedUrl = await geminiService.generateRemodel(
          snapshotBase64, 
          input || "Renovate this space", 
          projectContext, 
          activeProject?.config
        );
        
        setGeneratedResult({
          originalImage: snapshotBase64,
          generatedImage: generatedUrl,
          prompt: input
        });
        
        addMessage({
          role: 'model',
          content: "I've generated a visualization based on your viewpoint and project style guide."
        });
        setStatus(AppStatus.READY);
        addNotification('success', 'Render completed successfully');
      } catch (err) {
        addMessage({ role: 'system', content: "Failed to generate image. Please try again." });
        setStatus(AppStatus.ERROR);
        addNotification('error', 'Render failed. Please check API connection.');
      }
    };

    window.addEventListener('canvas-snapshot', handleSnapshot);
    return () => window.removeEventListener('canvas-snapshot', handleSnapshot);
  }, [input, projectContext, activeProject]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    addMessage({ role: 'user', content: input });
    const currentInput = input;
    setInput('');
    
    // If asking to visualize, trigger capture
    if (currentInput.toLowerCase().includes('visualize') || currentInput.toLowerCase().includes('render') || currentInput.toLowerCase().includes('imagine')) {
      if (workspaceView !== 'DESIGN') {
        setWorkspaceView('DESIGN');
        // Give time for view to switch before capturing
        setTimeout(() => {
          setStatus(AppStatus.GENERATING_IMAGE);
          addMessage({ role: 'system', content: `Capturing view... Applying "${activeProject?.config.style || 'Modern'}" style filter.` });
          setCaptureRequest(true); 
        }, 500);
      } else {
        setStatus(AppStatus.GENERATING_IMAGE);
        addMessage({ role: 'system', content: `Capturing view... Applying "${activeProject?.config.style}" style filter.` });
        setCaptureRequest(true); 
      }
    } else {
      // Normal chat
      const response = await geminiService.chat(messages.map(m => `${m.role}: ${m.content}`), currentInput);
      addMessage({ role: 'model', content: response || '' });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
      const url = URL.createObjectURL(file);
      setModelUrl(url);
      setWorkspaceView('DESIGN');
      addMessage({ role: 'system', content: `Loaded 3D Model: ${file.name}` });
      addNotification('success', '3D Model loaded successfully');
    } else if (file.type.startsWith('image/')) {
      setStatus(AppStatus.ANALYZING_CONTEXT);
      addMessage({ role: 'user', content: `Uploaded context image: ${file.name}` });
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        try {
          const analysis = await geminiService.analyzeContext(base64.split(',')[1] || '', "Identify rooms and constraints.");
          updateProjectContext(analysis || '');
          addMessage({ role: 'model', content: `Analyzed Plan: ${analysis}` });
          setStatus(AppStatus.READY);
          addNotification('success', 'Blueprint analyzed');
        } catch (err) {
          setStatus(AppStatus.ERROR);
          addMessage({ role: 'system', content: "Error analyzing image." });
          addNotification('error', 'Analysis failed');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div className="w-[400px] h-full bg-slate-900 border-l border-slate-700 flex flex-col shadow-2xl z-20 flex-shrink-0 relative transition-all">
        {/* Editor Header */}
        <div className="bg-slate-800 border-b border-slate-700">
          <div className="p-4 pb-2">
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(AppViewMode.DASHBOARD)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-3 transition-colors pl-0 hover:bg-transparent"
            >
              <ChevronLeft className="w-3 h-3" /> Back to Dashboard
            </Button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white leading-tight">{activeProject?.name}</h2>
                <p className="text-xs text-slate-400">{activeProject?.config.style}</p>
              </div>
            </div>
          </div>

          {/* Workspace Navigation Tabs */}
          <div className="flex px-4 gap-4 text-xs font-medium border-t border-slate-700/50">
            <button 
              onClick={() => setWorkspaceView('DESIGN')}
              className={`flex items-center gap-2 py-3 border-b-2 transition-all ${workspaceView === 'DESIGN' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              <Cuboid className="w-3.5 h-3.5" />
              Studio
            </button>
            <button 
              onClick={() => setWorkspaceView('SETTINGS')}
              className={`flex items-center gap-2 py-3 border-b-2 transition-all ${workspaceView === 'SETTINGS' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>
             <button 
              onClick={() => setWorkspaceView('INTELLIGENCE')}
              className={`flex items-center gap-2 py-3 border-b-2 transition-all ${workspaceView === 'INTELLIGENCE' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Data
            </button>
          </div>
        </div>
        
        {/* Property Intelligence Widget (Only show if not on Intelligence Page to save space) */}
        {activePropertyMeta && workspaceView !== 'INTELLIGENCE' && (
          <div className="mx-4 mt-4 bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs mb-2">
               <div className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                 <Building2 className="w-3 h-3 text-purple-400" />
                 Context
               </div>
               <span className="text-[10px] text-green-400 bg-green-900/20 px-1.5 py-0.5 rounded border border-green-900/50">Active</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900 rounded p-1.5 px-2">
                <span className="text-slate-500 block text-[10px]">Zoning</span>
                <span className="text-slate-200">{activePropertyMeta.zoning}</span>
              </div>
               <div className="bg-slate-900 rounded p-1.5 px-2">
                <span className="text-slate-500 block text-[10px]">Year Built</span>
                <span className="text-slate-200">{activePropertyMeta.yearBuilt}</span>
              </div>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                msg.role === 'user' ? 'bg-blue-600' : 
                msg.role === 'model' ? 'bg-purple-600' : 'bg-slate-600'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : 
                 msg.role === 'model' ? <Sparkles className="w-4 h-4 text-white" /> : 
                 <Bot className="w-4 h-4 text-white" />}
              </div>
              
              <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 
                  msg.role === 'system' ? 'bg-slate-800/80 border border-slate-700 text-slate-400 italic text-xs py-2' : 
                  'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Status Bar */}
        {status !== AppStatus.IDLE && status !== AppStatus.READY && (
          <div className="px-4 py-2 bg-slate-800/50 border-t border-slate-700 flex items-center gap-2 text-xs text-blue-300 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            {status === AppStatus.ANALYZING_CONTEXT ? 'Analyzing Blueprints...' : 'Rendering 3D Vision...'}
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-slate-800 border-t border-slate-700 space-y-3">
          {/* Tools */}
          <div className="flex gap-2">
             <Tooltip content="Upload Floorplan (PDF/Image)">
               <label className="flex items-center gap-2 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-md cursor-pointer transition-colors border border-slate-600 hover:border-slate-500">
                <Upload className="w-3 h-3" />
                <span>Plan</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
             </Tooltip>
             
             <Tooltip content="Upload 3D Scan (.glb)">
              <label className="flex items-center gap-2 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-md cursor-pointer transition-colors border border-slate-600 hover:border-slate-500">
                <Box className="w-3 h-3" />
                <span>Model</span>
                <input type="file" accept=".glb,.gltf" className="hidden" onChange={handleFileUpload} />
              </label>
             </Tooltip>
          </div>

          {/* Text Input */}
          <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Describe your design changes..."
              className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-white placeholder-slate-500 transition-all"
            />
            <Button 
              size="icon"
              onClick={handleSendMessage}
              className="absolute right-2 top-2 h-8 w-8 bg-blue-600 hover:bg-blue-500"
              disabled={!input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
