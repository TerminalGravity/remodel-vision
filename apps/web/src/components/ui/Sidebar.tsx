import React, { useRef, useEffect, useState } from 'react';
import { Send, Upload, Box, Sparkles, Loader2, User, Bot, Briefcase, ChevronLeft, Settings, Building2, Cuboid, Video, Image as ImageIcon, Mic, Zap, Brain, MonitorPlay, FileText, Paperclip, X, File } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { geminiService } from '../../services/geminiService';
import { buildGenerationContext } from '../../services/generationContextBuilder';
import { generateDesignVisualization } from '../../services/designGeneration';
import { parseDesignIntent, mergeDesignSpecs } from '../../services/designIntentParser';
import { AppStatus, AppViewMode } from '../../types';
import { Button } from '@remodelvision/ui';
import type { DesignSpecification, RenderingConfig } from '../../types/generation';
import { FloorPlanWizard } from '../workspace/FloorPlanWizard';
import { ProjectSettings } from './ProjectSettings';

// Premium Tooltip Component
interface TooltipProps {
  children?: React.ReactNode;
  content: string;
}

const Tooltip = ({ children, content }: TooltipProps) => {
  return (
    <div className="relative group flex items-center">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-card text-foreground text-[10px] rounded-lg border border-border shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50 backdrop-blur-sm">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border"></div>
      </div>
    </div>
  );
};

export const Sidebar = () => {
  const {
    messages, addMessage, status, setStatus,
    setCaptureRequest, setModelUrl,
    projectContext, updateProjectContext,
    projects, activeProjectId, setViewMode, addNotification,
    activePropertyContext, selectedRoom, workspaceView, setWorkspaceView,
    generationConfig, updateGenerationConfig,
    activeMediaType, setActiveMediaType,
    addGeneratedResult,
    referenceImages, addReferenceImage
  } = useStore();
  
  const [input, setInput] = useState('');
  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState(false);
  const [isFloorPlanWizardOpen, setIsFloorPlanWizardOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ id: string; name: string; type: string; size: number; preview?: string; base64?: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  
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
      const customEvent = e as CustomEvent<any>;
      const detail = customEvent.detail;
      const snapshotBase64 = typeof detail === 'string' ? detail : detail.image;
      const cameraState = typeof detail === 'object' ? detail.camera : null;
      
      try {
        // New Pipeline: Use Gemini 3 Generation Context if we have camera state and property context
        if (activeMediaType === 'image' && cameraState && activePropertyContext) {
           // Base Design Spec from project settings
           const baseDesignSpec: DesignSpecification = {
             style: activeProject?.config.style || 'Modern',
             elements: {},
             preserveElements: [],
             mood: ['warm', 'inviting']
           };

           // Parse user input to extract specific design intents
           const parsedIntent = await parseDesignIntent(
             input || '',
             activeProject?.config.style || 'Modern',
             selectedRoom || 'room'
           );

           // Merge parsed intent with base spec
           const designSpec = mergeDesignSpecs(baseDesignSpec, parsedIntent);

           // Construct Rendering Config from settings
           const renderingConfig: RenderingConfig = {
             lighting: {
               time: 'afternoon',
               style: 'natural'
             },
             camera: {
               angle: 'eye-level',
               focusDepth: 'deep'
             },
             quality: {
               resolution: generationConfig.resolution === '4k' ? '4k' : '2k',
               aspectRatio: generationConfig.aspectRatio as '16:9' | '4:3' | '1:1',
               style: 'photorealistic'
             }
           };

           // Build the full generation context from property data + camera state
           const context = buildGenerationContext(
             activePropertyContext,
             cameraState,
             selectedRoom || '',
             designSpec,
             referenceImages, // Now populated from user uploads
             renderingConfig,
             snapshotBase64
           );

           // Generate using Gemini 3 Pro Image - returns GeneratedResult directly
           const generatedResult = await generateDesignVisualization(context, {
             negativePrompt: 'blurry, distorted, unrealistic lighting'
           });

           // Add the generated result to the gallery
           addGeneratedResult(generatedResult); 

           addMessage({
            role: 'model',
            content: `I've generated a high-fidelity render based on your viewpoint and project style guide.`
           });
           setStatus(AppStatus.READY);
           addNotification('success', 'Generation completed successfully');

        } else {
           // Legacy/Fallback Pipeline (or Video)
            const result = await geminiService.generateMedia(
              activeMediaType,
              snapshotBase64, 
              input || "Renovate this space", 
              projectContext,
              generationConfig,
              activeProject?.config
            );
            
            const newResult = {
              id: Math.random().toString(36).substring(7),
              originalImage: snapshotBase64,
              generatedUrl: result.url,
              thumbnailUrl: result.thumbnail,
              type: activeMediaType,
              prompt: input,
              timestamp: Date.now()
            };
    
            addGeneratedResult(newResult as any);
            
            addMessage({
              role: 'model',
              content: `I've generated a ${activeMediaType === 'video' ? 'cinematic walkthrough' : 'high-fidelity render'} based on your viewpoint and project style guide.`
            });
            setStatus(AppStatus.READY);
            addNotification('success', 'Generation completed successfully');
        }
      } catch (err) {
        console.error("Generation failed:", err);
        addMessage({ role: 'system', content: "Failed to generate media. Please try again." });
        setStatus(AppStatus.ERROR);
        addNotification('error', 'Generation failed. Please check API connection.');
      }
    };

    window.addEventListener('canvas-snapshot', handleSnapshot);
    return () => window.removeEventListener('canvas-snapshot', handleSnapshot);
  }, [input, projectContext, activeProject, activeMediaType, generationConfig, addGeneratedResult, addMessage, setStatus, addNotification, activePropertyContext, selectedRoom]);

  const handleSendMessage = async () => {
    if (!input.trim() && attachedFiles.length === 0) return;

    // Build message content with attached files info
    const fileNames = attachedFiles.map(f => f.name);
    const messageContent = attachedFiles.length > 0
      ? `${input}${input ? '\n' : ''}[Attached: ${fileNames.join(', ')}]`
      : input;

    addMessage({ role: 'user', content: messageContent });
    const currentInput = input;
    const currentAttachments = [...attachedFiles];
    setInput('');
    setAttachedFiles([]);

    // Check if visual generation request
    const isVisualRequest =
      currentInput.toLowerCase().includes('visualize') ||
      currentInput.toLowerCase().includes('render') ||
      currentInput.toLowerCase().includes('animate') ||
      currentInput.toLowerCase().includes('generate');

    if (isVisualRequest) {
      if (workspaceView !== 'DESIGN') {
        setWorkspaceView('DESIGN');
        // Give time for view to switch before capturing
        setTimeout(() => {
          setStatus(activeMediaType === 'video' ? AppStatus.GENERATING_VIDEO : AppStatus.GENERATING_IMAGE);
          addMessage({ role: 'system', content: `Capturing view for ${activeMediaType}... Applying "${activeProject?.config.style || 'Modern'}" style filter.` });
          setCaptureRequest(true);
        }, 500);
      } else {
        setStatus(activeMediaType === 'video' ? AppStatus.GENERATING_VIDEO : AppStatus.GENERATING_IMAGE);
        addMessage({ role: 'system', content: `Capturing view for ${activeMediaType}... Applying "${activeProject?.config.style || 'Modern'}" style filter.` });
        setCaptureRequest(true);
      }
    } else {
      // Normal chat (with Thinking Mode support)
      // Include image attachments for Gemini Vision analysis
      const imageAttachments = currentAttachments
        .filter(f => f.type.startsWith('image/') && f.base64)
        .map(f => f.base64 as string);

      const response = await geminiService.chat(
        messages.map(m => `${m.role}: ${m.content}`),
        currentInput,
        generationConfig.thinkingMode,
        imageAttachments.length > 0 ? imageAttachments : undefined
      );
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

  // Handle reference image uploads for design elements
  const handleReferenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;

      // Extract element type from filename or prompt user
      // Format: "countertop.jpg" → element = "countertop"
      const elementName = file.name.replace(/\.[^/.]+$/, '').toLowerCase();
      const validElements = ['countertop', 'backsplash', 'cabinets', 'flooring', 'lighting', 'fixtures', 'appliances'];

      const element = validElements.find(e => elementName.includes(e)) || 'inspiration';

      addReferenceImage(element, base64.split(',')[1] || base64);
      addMessage({
        role: 'system',
        content: `Added reference image for "${element}" element. This will guide the AI generation.`
      });
      addNotification('success', `Reference added: ${element}`);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  // Handle chat context file attachments
  const handleChatFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: typeof attachedFiles = [];

    for (const file of Array.from(files)) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        addNotification('error', `File "${file.name}" exceeds 10MB limit`);
        continue;
      }

      const reader = new FileReader();
      const fileData = await new Promise<{ base64: string; preview?: string }>((resolve) => {
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          resolve({
            base64: base64.split(',')[1] || base64,
            preview: file.type.startsWith('image/') ? base64 : undefined
          });
        };
        reader.readAsDataURL(file);
      });

      newAttachments.push({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        preview: fileData.preview,
        base64: fileData.base64
      });
    }

    setAttachedFiles(prev => [...prev, ...newAttachments]);

    if (newAttachments.length > 0) {
      addNotification('success', `${newAttachments.length} file(s) attached for context`);
    }

    // Reset input
    e.target.value = '';
  };

  // Remove attached file
  const removeAttachedFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <div className="w-[420px] h-full bg-card/95 backdrop-blur-xl border-l border-border flex flex-col shadow-2xl z-20 flex-shrink-0 relative">
        {/* Editor Header - Premium Glass Design */}
        <div className="bg-secondary/30 border-b border-border">
          <div className="p-5 pb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(AppViewMode.DASHBOARD)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-copper mb-4 transition-colors pl-0 hover:bg-transparent group"
            >
              <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
            </Button>

            <div className="flex items-center gap-4 mb-2">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-copper/20 to-copper-dark/20 border border-copper/30 flex items-center justify-center shadow-lg shadow-copper/10">
                <Briefcase className="w-5 h-5 text-copper" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-base text-foreground leading-tight truncate">{activeProject?.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{activeProject?.config.style}</p>
              </div>
            </div>
          </div>

          {/* Workspace Navigation Tabs - Refined */}
          <div className="flex px-5 gap-1 text-xs font-medium">
            <button
              onClick={() => setWorkspaceView('DESIGN')}
              className={`flex items-center gap-2 px-3 py-3 rounded-t-lg transition-all ${workspaceView === 'DESIGN' ? 'bg-card text-copper border-t border-l border-r border-border -mb-px' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
            >
              <Cuboid className="w-3.5 h-3.5" />
              Studio
            </button>
            <button
              onClick={() => setWorkspaceView('SETTINGS')}
              className={`flex items-center gap-2 px-3 py-3 rounded-t-lg transition-all ${workspaceView === 'SETTINGS' ? 'bg-card text-copper border-t border-l border-r border-border -mb-px' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>
             <button
              onClick={() => setWorkspaceView('INTELLIGENCE')}
              className={`flex items-center gap-2 px-3 py-3 rounded-t-lg transition-all ${workspaceView === 'INTELLIGENCE' ? 'bg-card text-copper border-t border-l border-r border-border -mb-px' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Data
            </button>
            <button
              onClick={() => setWorkspaceView('GALLERY')}
              className={`flex items-center gap-2 px-3 py-3 rounded-t-lg transition-all ${workspaceView === 'GALLERY' ? 'bg-card text-copper border-t border-l border-r border-border -mb-px' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Gallery
            </button>
          </div>
        </div>
        
        {/* Messages Area - Premium Chat Design */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-md ${
                msg.role === 'user' ? 'bg-copper shadow-copper/20' :
                msg.role === 'model' ? 'bg-gradient-to-br from-copper-light to-copper shadow-copper/20' : 'bg-secondary'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-background" /> :
                 msg.role === 'model' ? <Sparkles className="w-4 h-4 text-background" /> :
                 <Bot className="w-4 h-4 text-muted-foreground" />}
              </div>

              <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user' ? 'bg-copper text-background rounded-tr-md shadow-lg shadow-copper/20' :
                  msg.role === 'system' ? 'bg-secondary/50 border border-border text-muted-foreground italic text-xs py-2 rounded-xl' :
                  'glass text-foreground rounded-tl-md'
                }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted-foreground/60 mt-1.5 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Status Bar - Premium Animated */}
        {status !== AppStatus.IDLE && status !== AppStatus.READY && (
          <div className="px-5 py-3 bg-copper/10 border-t border-copper/20 flex items-center gap-3 text-xs text-copper">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-medium">
              {status === AppStatus.ANALYZING_CONTEXT ? 'Analyzing Blueprints...' :
               status === AppStatus.GENERATING_VIDEO ? 'Animating Walkthrough with Veo...' :
               'Rendering 4K Visualization...'}
            </span>
          </div>
        )}

        {/* Media Studio Controls - Premium Design */}
        <div className="bg-secondary/30 border-t border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.15em]">Media Studio</span>
            <div className="flex bg-card rounded-xl p-1 border border-border shadow-inner">
              <button
                onClick={() => setActiveMediaType('image')}
                className={`p-2 rounded-lg transition-all ${activeMediaType === 'image' ? 'bg-copper text-background shadow-md shadow-copper/20' : 'text-muted-foreground hover:text-foreground'}`}
                title="Image Mode"
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveMediaType('video')}
                className={`p-2 rounded-lg transition-all ${activeMediaType === 'video' ? 'bg-copper text-background shadow-md shadow-copper/20' : 'text-muted-foreground hover:text-foreground'}`}
                title="Video Mode"
              >
                <Video className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveMediaType('audio')}
                className={`p-2 rounded-lg transition-all ${activeMediaType === 'audio' ? 'bg-copper text-background shadow-md shadow-copper/20' : 'text-muted-foreground hover:text-foreground'}`}
                title="Audio Mode"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
             <div className="flex items-center justify-between bg-card border border-border rounded-xl px-3 py-2">
               <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Ratio</span>
               <select
                 value={generationConfig.aspectRatio}
                 onChange={(e) => updateGenerationConfig({ aspectRatio: e.target.value as any })}
                 className="bg-transparent text-xs text-foreground focus:outline-none text-right cursor-pointer font-medium"
               >
                 <option value="16:9">16:9</option>
                 <option value="4:3">4:3</option>
                 <option value="1:1">1:1</option>
               </select>
             </div>
             <div className="flex items-center justify-between bg-card border border-border rounded-xl px-3 py-2">
               <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Res</span>
               <select
                 value={generationConfig.resolution}
                 onChange={(e) => updateGenerationConfig({ resolution: e.target.value as any })}
                 className="bg-transparent text-xs text-foreground focus:outline-none text-right cursor-pointer font-medium"
               >
                 <option value="4k">4K</option>
                 <option value="2k">2K</option>
               </select>
             </div>
          </div>

          <div className="flex items-center justify-between mb-4 px-1">
             <label className="flex items-center gap-2.5 cursor-pointer group">
               <div className={`w-4 h-4 rounded-md border-2 transition-all flex items-center justify-center ${generationConfig.thinkingMode ? 'bg-copper border-copper' : 'border-muted-foreground/40 bg-transparent'}`}>
                 {generationConfig.thinkingMode && <div className="w-1.5 h-1.5 bg-background rounded-sm" />}
               </div>
               <input
                 type="checkbox"
                 checked={generationConfig.thinkingMode}
                 onChange={(e) => updateGenerationConfig({ thinkingMode: e.target.checked })}
                 className="hidden"
               />
               <span className={`text-xs ${generationConfig.thinkingMode ? 'text-copper font-medium' : 'text-muted-foreground group-hover:text-foreground'}`}>Deep Reasoning</span>
             </label>
             {generationConfig.thinkingMode ? (
               <Brain className="w-4 h-4 text-copper" />
             ) : (
               <Zap className="w-4 h-4 text-muted-foreground/50" />
             )}
          </div>

          {/* Attached Files Preview - Premium Design */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 p-3 bg-card rounded-xl border border-border">
              {attachedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 bg-secondary rounded-lg px-2.5 py-2 text-xs group/chip"
                >
                  {file.preview ? (
                    <img src={file.preview} alt={file.name} className="w-7 h-7 rounded-md object-cover" />
                  ) : (
                    <File className="w-4 h-4 text-muted-foreground" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-foreground truncate max-w-[120px]">{file.name}</span>
                    <span className="text-muted-foreground/60 text-[10px]">{formatFileSize(file.size)}</span>
                  </div>
                  <button
                    onClick={() => removeAttachedFile(file.id)}
                    className="p-1 hover:bg-card rounded-md opacity-60 group-hover/chip:opacity-100 transition-all"
                    title="Remove attachment"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input with Attachment Button - Premium Style */}
          <div className="relative group">
            <input
              ref={chatFileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt,.json,.csv"
              multiple
              className="hidden"
              onChange={handleChatFileAttach}
            />

            <Tooltip content="Attach files for context">
              <button
                type="button"
                onClick={() => chatFileInputRef.current?.click()}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </Tooltip>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={activeMediaType === 'video' ? "Describe camera movement..." : "Describe changes..."}
              className="w-full bg-card border border-border rounded-xl pl-12 pr-14 py-3.5 text-sm focus:outline-none focus:border-copper/50 focus:ring-2 focus:ring-copper/20 text-foreground placeholder-muted-foreground transition-all"
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() && attachedFiles.length === 0}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 bg-copper hover:bg-copper-dark text-background rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-copper/20 btn-press"
            >
              {activeMediaType === 'video' ? <MonitorPlay className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            </button>
          </div>

          {/* File Uploads Row - Premium Buttons */}
          <div className="flex gap-2 mt-3">
             <Tooltip content="Upload Floorplan (PDF/Image)">
               <label className="flex-1 flex items-center justify-center gap-2 text-[10px] bg-card hover:bg-secondary text-muted-foreground hover:text-foreground py-2 rounded-lg cursor-pointer transition-all border border-border hover:border-copper/30">
                <Upload className="w-3 h-3" />
                <span>Plan</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
             </Tooltip>

             <Tooltip content="Upload 3D Scan (.glb)">
              <label className="flex-1 flex items-center justify-center gap-2 text-[10px] bg-card hover:bg-secondary text-muted-foreground hover:text-foreground py-2 rounded-lg cursor-pointer transition-all border border-border hover:border-copper/30">
                <Box className="w-3 h-3" />
                <span>Model</span>
                <input type="file" accept=".glb,.gltf" className="hidden" onChange={handleFileUpload} />
              </label>
             </Tooltip>

             <Tooltip content="Reference Image (name as countertop.jpg, cabinets.png, etc.)">
              <label className="flex-1 flex items-center justify-center gap-2 text-[10px] bg-card hover:bg-secondary text-muted-foreground hover:text-foreground py-2 rounded-lg cursor-pointer transition-all border border-border hover:border-copper/30">
                <Sparkles className="w-3 h-3" />
                <span>Ref{Object.keys(referenceImages).length > 0 && ` (${Object.keys(referenceImages).length})`}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleReferenceUpload} />
              </label>
             </Tooltip>
          </div>
        </div>
      </div>
      {/* Project Settings Modal */}
      {isProjectSettingsOpen && (
        <ProjectSettings onClose={() => setIsProjectSettingsOpen(false)} />
      )}

      {/* Floor Plan Wizard Modal */}
      {isFloorPlanWizardOpen && (
        <FloorPlanWizard onClose={() => setIsFloorPlanWizardOpen(false)} />
      )}
    </>
  );
};
