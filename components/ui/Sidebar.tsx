import React, { useRef, useEffect, useState } from 'react';
import { Send, Upload, Box, Sparkles, Loader2, User, Bot, Briefcase, ChevronLeft, Settings, Info, Building2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { geminiService } from '../../services/geminiService';
import { AppStatus, AppViewMode } from '../../types';
import { ProjectSettings } from './ProjectSettings';

export const Sidebar = () => {
  const { 
    messages, addMessage, status, setStatus, 
    setCaptureRequest, setModelUrl, 
    projectContext, updateProjectContext, setGeneratedResult,
    projects, activeProjectId, setViewMode, addNotification,
    activePropertyMeta
  } = useStore();
  
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
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
      setStatus(AppStatus.GENERATING_IMAGE);
      addMessage({ role: 'system', content: `Capturing view... Applying "${activeProject?.config.style}" style filter.` });
      setCaptureRequest(true); 
    } else {
      // Normal chat
      const response = await geminiService.chat(messages.map(m => `${m.role}: ${m.content}`), currentInput);
      addMessage({ role: 'model', content: response });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
      const url = URL.createObjectURL(file);
      setModelUrl(url);
      addMessage({ role: 'system', content: `Loaded 3D Model: ${file.name}` });
      addNotification('success', '3D Model loaded successfully');
    } else if (file.type.startsWith('image/')) {
      setStatus(AppStatus.ANALYZING_CONTEXT);
      addMessage({ role: 'user', content: `Uploaded context image: ${file.name}` });
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        try {
          const analysis = await geminiService.analyzeContext(base64.split(',')[1], "Identify rooms and constraints.");
          updateProjectContext(analysis);
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
      <div className="w-[400px] h-full bg-slate-900 border-l border-slate-700 flex flex-col shadow-2xl z-20 flex-shrink-0 relative">
        {/* Editor Header */}
        <div className="p-4 border-b border-slate-700 bg-slate-800">
          <button 
            onClick={() => setViewMode(AppViewMode.DASHBOARD)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-3 transition-colors"
          >
            <ChevronLeft className="w-3 h-3" /> Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-400" />
               </div>
               <div>
                 <h2 className="text-sm font-bold text-white leading-tight">{activeProject?.name}</h2>
                 <p className="text-xs text-slate-400">{activeProject?.config.style}</p>
               </div>
            </div>
            
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-600"
              title="Project Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Property Intelligence Card */}
        {activePropertyMeta && (
          <div className="mx-4 mt-4 bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              <Building2 className="w-3 h-3 text-purple-400" />
              Property Intelligence
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900 rounded p-2">
                <span className="text-slate-500 block">Zoning</span>
                <span className="text-slate-200 font-medium">{activePropertyMeta.zoning}</span>
              </div>
              <div className="bg-slate-900 rounded p-2">
                <span className="text-slate-500 block">Lot Size</span>
                <span className="text-slate-200 font-medium">{activePropertyMeta.lotSize}</span>
              </div>
              <div className="bg-slate-900 rounded p-2">
                <span className="text-slate-500 block">Year Built</span>
                <span className="text-slate-200 font-medium">{activePropertyMeta.yearBuilt}</span>
              </div>
              <div className="bg-slate-900 rounded p-2">
                <span className="text-slate-500 block">Sun Exposure</span>
                <span className="text-slate-200 font-medium">{activePropertyMeta.sunExposure}</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-700 text-[10px] text-slate-500 flex justify-between">
               <span>Walk Score: {activePropertyMeta.walkScore}</span>
               <span className="italic">Data source: Gemini AI</span>
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
             <label className="flex items-center gap-2 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-md cursor-pointer transition-colors border border-slate-600 hover:border-slate-500">
              <Upload className="w-3 h-3" />
              <span>Upload Plans</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
            <label className="flex items-center gap-2 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-md cursor-pointer transition-colors border border-slate-600 hover:border-slate-500">
              <Box className="w-3 h-3" />
              <span>Load GLB</span>
              <input type="file" accept=".glb,.gltf" className="hidden" onChange={handleFileUpload} />
            </label>
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
            <button 
              onClick={handleSendMessage}
              className="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-500 rounded-md text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!input.trim()}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Settings Modal */}
      {showSettings && <ProjectSettings onClose={() => setShowSettings(false)} />}
    </>
  );
};