
import React, { useState, useRef } from 'react';
import { Upload, FileText, Loader2, Check, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { floorPlanService } from '../../services/floorPlanService';
import { Button, Card } from '@remodelvision/ui';
import { RoomContext } from '../../types/property';
import { v4 as uuidv4 } from 'uuid';

export const FloorPlanWizard = ({ onClose }: { onClose: () => void }) => {
  const { setProcessingFloorPlan, updatePropertyRooms, addNotification, activePropertyContext } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setStatus('idle');
    }
  };

  const processFloorPlan = async () => {
    if (!preview || !activePropertyContext) return;

    try {
      setStatus('processing');
      setProcessingFloorPlan(true);

      // 1. Extract Layouts (Tier 3)
      const layouts = await floorPlanService.extractRoomLayout(preview);

      if (layouts.length === 0) {
        throw new Error("No rooms detected in the image. Please try a clearer floor plan.");
      }

      // 2. Convert to RoomContext
      const newRooms: RoomContext[] = layouts.map(layout => ({
        id: layout.id || uuidv4(),
        propertyId: activePropertyContext.id,
        name: layout.name || 'Unknown Room',
        type: (layout.type as any) || 'other', // Cast to RoomType
        floor: 1, // Default to floor 1 for now
        // Approximate geometric bounds from walls
        dimensions: {
            width: 10, // Placeholder, calculated from walls ideally
            length: 10,
            height: layout.ceilingHeight || 9,
            sqft: 100
        },
        position: { x: 0, y: 0, z: 0 }, // Will need auto-layout or use layout coords
        layout: layout // Attach the detailed layout
      }));

      // 3. Update Store
      updatePropertyRooms(newRooms);
      
      setStatus('success');
      addNotification('success', `Successfully extracted ${newRooms.length} rooms from floor plan!`);
      
      // Close after delay
      setTimeout(() => {
        setProcessingFloorPlan(false);
        onClose();
      }, 1500);

    } catch (error) {
      console.error("Floor plan processing failed", error);
      setStatus('error');
      setErrorMsg(error instanceof Error ? error.message : "Failed to process floor plan");
      setProcessingFloorPlan(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-slate-900 border-slate-700 p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Import Floor Plan
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>

        <div className="space-y-6">
          {/* Upload Area */}
          {!preview ? (
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition-all group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 text-slate-500 mb-3 group-hover:text-blue-400 transition-colors" />
                <p className="mb-2 text-sm text-slate-400"><span className="font-semibold text-white">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-slate-500">PNG, JPG or PDF (MAX. 10MB)</p>
              </div>
              <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
            </label>
          ) : (
            <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden border border-slate-700">
              <img src={preview} alt="Floor plan preview" className="w-full h-full object-contain opacity-80" />
              {status === 'processing' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                  <span className="text-sm font-medium text-blue-200">Analyzing Geometry...</span>
                </div>
              )}
              {status === 'success' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-900/80 backdrop-blur-[2px]">
                  <Check className="w-10 h-10 text-white mb-2" />
                  <span className="text-lg font-bold text-white">Complete!</span>
                </div>
              )}
            </div>
          )}

          {/* Status Messages */}
          {status === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-800/50 rounded-lg text-red-200 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button 
              onClick={onClose}
              disabled={status === 'processing'}
              className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <Button 
              onClick={processFloorPlan}
              disabled={!file || status === 'processing' || status === 'success'}
              className="gap-2 bg-blue-600 hover:bg-blue-500"
            >
              {status === 'processing' ? 'Processing...' : 'Generate 3D Model'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

