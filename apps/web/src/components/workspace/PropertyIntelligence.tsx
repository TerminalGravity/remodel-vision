import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Building2, Save, Map, Sun, GraduationCap, Footprints, AlertTriangle, FileText, RefreshCw, DollarSign, Home, Calendar, Loader2, Brain } from 'lucide-react';
import { PropertyMeta } from '../../types';
import { geminiService } from '../../services/geminiService';

export const PropertyIntelligence = () => {
  const {
    activePropertyMeta,
    activePropertyContext,
    propertyFetchStatus,
    propertyFetchErrors,
    updatePropertyMeta,
    fetchPropertyContext,
    activeProjectId,
    projects,
    addNotification,
    generationConfig
  } = useStore();
  const project = projects.find(p => p.id === activeProjectId);
  
  const [formData, setFormData] = useState<PropertyMeta>({
    zoning: '',
    lotSize: '',
    yearBuilt: '',
    sunExposure: '',
    schoolDistrict: '',
    walkScore: 0
  });

  const [integrationEnabled, setIntegrationEnabled] = useState(true);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (activePropertyMeta) {
      setFormData(activePropertyMeta);
    }
  }, [activePropertyMeta]);

  const handleSave = () => {
    updatePropertyMeta(formData);
    addNotification('success', 'Property Intelligence updated successfully');
  };

  const handleRefresh = () => {
    if (project?.config.location.address) {
      fetchPropertyContext(project.config.location.address);
    }
  };

  const generateInvestmentReport = async () => {
    if (!activePropertyContext && !activePropertyMeta) return;
    
    setAnalyzing(true);
    try {
      // Construct context
      const context = [
        `Address: ${project?.config.location.address}`,
        `Zoning: ${formData.zoning}`,
        `Year Built: ${formData.yearBuilt}`,
        `Lot Size: ${formData.lotSize}`,
        `Est Value: ${activePropertyContext?.valuation?.marketEstimate || 'Unknown'}`,
        `Walk Score: ${formData.walkScore}`
      ];

      const report = await geminiService.chat(
        context,
        "Generate a comprehensive Investment Feasibility Report. Analyze zoning constraints, potential value add from renovation, and rental yield potential. Be critical and cite risks.",
        true // Force Thinking Mode for report
      );

      setAnalysis(report ?? null);
      addNotification('success', 'Investment Report generated');
    } catch (err) {
      addNotification('error', 'Failed to generate report');
    } finally {
      setAnalyzing(false);
    }
  };

  const isLoading = propertyFetchStatus === 'loading';

  return (
    <div className="w-full h-full bg-slate-900 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-400" />
              Property Intelligence
            </h1>
            <p className="text-slate-400 mt-2">
              Manage geospatial and regulatory data for <span className="text-white font-medium">{project?.config.location.address}</span>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
              {isLoading ? 'Fetching...' : 'Refresh'}
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </div>

        {/* Enhanced Property Data (from Firecrawl) */}
        {activePropertyContext && (
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Home className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Property Overview</h3>
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                {activePropertyContext.metadata?.completeness || 0}% Complete
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-1">Bedrooms</p>
                <p className="text-2xl font-bold text-white">{activePropertyContext.details?.bedrooms || 'N/A'}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-1">Bathrooms</p>
                <p className="text-2xl font-bold text-white">{activePropertyContext.details?.bathrooms || 'N/A'}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-1">Living Area</p>
                <p className="text-2xl font-bold text-white">
                  {activePropertyContext.details?.livingArea?.value?.toLocaleString() || 'N/A'}
                  <span className="text-sm text-slate-400 ml-1">sqft</span>
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-1">Est. Value</p>
                <p className="text-2xl font-bold text-green-400">
                  ${(activePropertyContext.valuation?.marketEstimate || 0).toLocaleString()}
                </p>
              </div>
            </div>
            {activePropertyContext.sources && activePropertyContext.sources.length > 0 && (
              <p className="text-xs text-slate-500 mt-4">
                Data sources: {activePropertyContext.sources.map(s => s.source).join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Investment Analysis */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
           <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-purple-500/20 rounded-lg">
                 <Brain className="w-5 h-5 text-purple-400" />
               </div>
               <div>
                 <h3 className="text-lg font-semibold text-white">Investment Feasibility Report</h3>
                 <p className="text-xs text-slate-400">Deep Reasoning powered by Gemini 3 Pro</p>
               </div>
             </div>
             <button 
               onClick={generateInvestmentReport}
               disabled={analyzing}
               className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
             >
               {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
               {analyzing ? 'Reasoning...' : 'Generate Report'}
             </button>
           </div>
           
           {analysis ? (
             <div className="bg-slate-900 rounded-lg p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap border border-slate-700">
               {analysis}
             </div>
           ) : (
             <div className="bg-slate-900/50 rounded-lg p-8 text-center border border-dashed border-slate-700">
               <p className="text-slate-500 text-sm">Run analysis to identify risks, code compliance issues, and ROI potential.</p>
             </div>
           )}
        </div>

        {/* Integration Status */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex items-start gap-4">
          <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
             <FileText className="w-6 h-6" />
          </div>
          <div className="flex-1">
             <h3 className="text-lg font-semibold text-white mb-1">Context Integration</h3>
             <p className="text-slate-400 text-sm mb-4">
               This data is currently <span className="text-green-400 font-bold">{integrationEnabled ? 'ACTIVE' : 'INACTIVE'}</span> in the Gemini Chat context. 
               The AI will reference zoning laws and physical constraints when generating ideas.
             </p>
             <label className="flex items-center gap-3 cursor-pointer">
               <div className={`w-12 h-6 rounded-full p-1 transition-colors ${integrationEnabled ? 'bg-green-600' : 'bg-slate-700'}`} onClick={() => setIntegrationEnabled(!integrationEnabled)}>
                  <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${integrationEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
               </div>
               <span className="text-sm font-medium text-slate-300">Enable AI Context Injection</span>
             </label>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Regulatory */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
               <Map className="w-4 h-4" /> Regulatory & Land
             </h3>
             
             <div className="space-y-2">
               <label className="text-xs text-slate-500">Zoning Code</label>
               <input 
                 type="text" 
                 value={formData.zoning} 
                 onChange={(e) => setFormData({...formData, zoning: e.target.value})}
                 className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
               />
             </div>
             <div className="space-y-2">
               <label className="text-xs text-slate-500">Lot Size</label>
               <input 
                 type="text" 
                 value={formData.lotSize} 
                 onChange={(e) => setFormData({...formData, lotSize: e.target.value})}
                 className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
               />
             </div>
          </div>

           {/* Environmental */}
           <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
               <Sun className="w-4 h-4" /> Environmental
             </h3>
             
             <div className="space-y-2">
               <label className="text-xs text-slate-500">Sun Exposure / Orientation</label>
               <select 
                 value={formData.sunExposure} 
                 onChange={(e) => setFormData({...formData, sunExposure: e.target.value})}
                 className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
               >
                 <option value="North-Facing">North-Facing</option>
                 <option value="South-Facing">South-Facing</option>
                 <option value="East-Facing">East-Facing</option>
                 <option value="West-Facing">West-Facing</option>
                 <option value="Variable">Variable</option>
               </select>
             </div>
             <div className="space-y-2">
               <label className="text-xs text-slate-500">Year Built</label>
               <input 
                 type="text" 
                 value={formData.yearBuilt} 
                 onChange={(e) => setFormData({...formData, yearBuilt: e.target.value})}
                 className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
               />
             </div>
          </div>

          {/* Location Score */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
               <GraduationCap className="w-4 h-4" /> Community
             </h3>
             
             <div className="space-y-2">
               <label className="text-xs text-slate-500">School District</label>
               <input 
                 type="text" 
                 value={formData.schoolDistrict} 
                 onChange={(e) => setFormData({...formData, schoolDistrict: e.target.value})}
                 className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
               />
             </div>
          </div>
          
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
               <Footprints className="w-4 h-4" /> Walkability
             </h3>
             
             <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-4 ${formData.walkScore > 70 ? 'border-green-500 text-green-400' : 'border-yellow-500 text-yellow-400'}`}>
                  {formData.walkScore}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{formData.walkScore > 70 ? 'Walker\'s Paradise' : 'Car Dependent'}</p>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={formData.walkScore}
                    onChange={(e) => setFormData({...formData, walkScore: parseInt(e.target.value)})}
                    className="w-32 h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer mt-2"
                  />
                </div>
             </div>
          </div>
        </div>

        {/* Warning Zone */}
        <div className="border border-red-900/50 bg-red-900/10 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-200">
            <span className="font-bold">Disclaimer:</span> All property data is AI-estimated or retrieved from public records. Verify with local county records before construction.
          </p>
        </div>
      </div>
    </div>
  );
};
