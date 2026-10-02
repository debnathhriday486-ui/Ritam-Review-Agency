import React, { useEffect, useState } from 'react';
import { api } from '../services/api.ts';
import { Task } from '../../shared/types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  MapPin,
  Star,
  ShieldAlert,
  ArrowLeft,
  Navigation,
  Compass,
  Layers,
  Phone,
  Clock,
  ThumbsUp,
  Share2,
  Trash2,
  AlertCircle
} from 'lucide-react';

interface MockMapPageProps {
  taskId: string;
  onBack: () => void;
}

export const MockMapPage: React.FC<MockMapPageProps> = ({ taskId, onBack }) => {
  const { role } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function fetchTask() {
      try {
        setLoading(true);
        const res = await api.getTask(taskId);
        setTask(res.task);
      } catch (err) {
        console.error('Failed to load task for mock map:', err);
        setTask(null);
      } finally {
        setLoading(false);
      }
    }
    fetchTask();
  }, [taskId]);

  const handleDeleteTaskFromMap = async () => {
    try {
      setDeleting(true);
      await api.deleteTask(taskId);
      onBack();
    } catch (err) {
      console.error('Failed to delete task from map view:', err);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-zinc-500 font-mono text-xs">
        Loading simulated location workspace...
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-8 text-center bg-zinc-900 border border-zinc-800 rounded-[18px] max-w-lg mx-auto space-y-4 my-8">
        <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-white">Simulation Task Not Found</h2>
        <p className="text-xs text-zinc-400">
          This mock map review link has either been deleted by the administrator or does not exist.
        </p>
        <button
          onClick={onBack}
          className="py-2.5 px-5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs shadow transition-all cursor-pointer"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  const businessName = task?.mock_business_name || 'Simulated Regional Business';
  const location = task?.mock_location || 'Agartala, Tripura';

  return (
    <div className="space-y-6">
      {/* Top Warning Banner - Strict Educational Simulation Badge */}
      <div className="p-4 rounded-[18px] bg-amber-950/40 border border-amber-800/80 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-extrabold text-xs uppercase tracking-wider block text-amber-300">
              EDUCATIONAL SIMULATION — NEVER CONNECT TO GOOGLE MAPS
            </span>
            <p className="text-[11px] text-amber-200/90 leading-tight">
              This interactive map interface is an entirely synthetic mock designed for task verification analysis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {role === 'admin' && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="py-1.5 px-3 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-xs font-semibold text-red-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Delete Link & Task</span>
            </button>
          )}

          <button
            onClick={onBack}
            className="self-start sm:self-auto py-1.5 px-3 rounded-xl bg-amber-900/60 hover:bg-amber-900 border border-amber-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Workspace</span>
          </button>
        </div>
      </div>

      {/* Admin Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-900 border border-red-900/60 rounded-[18px] shadow-2xl p-6 text-zinc-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Map Review Link</h3>
                <p className="text-xs text-zinc-400">Permanently delete this task and mock link</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300">
              Are you sure you want to delete this educational simulation for <strong className="text-white">"{businessName}"</strong>? This will remove the mock page and all assigned comments.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteTaskFromMap}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'CONFIRM DELETE'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mock Business Profile & Map Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Business Details & Sample Reviews */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800 text-[10px] font-mono text-zinc-300 mb-2">
                <span>SIMULATED LISTING</span>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">{businessName}</h1>
              <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                <span>{location}</span>
              </p>
            </div>

            {/* Rating summary */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/90">
              <div className="text-2xl font-black font-mono text-white">4.8</div>
              <div>
                <div className="flex items-center text-amber-400 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] text-zinc-400">
                  Based on 32 simulated customer ratings
                </span>
              </div>
            </div>

            {/* Quick meta buttons */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center gap-2 text-zinc-300">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Open: 9 AM - 8 PM</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center gap-2 text-zinc-300">
                <Compass className="w-3.5 h-3.5 text-zinc-500" />
                <span>Zone: Commercial</span>
              </div>
            </div>
          </div>

          {/* Mock Sample Reviews */}
          <div className="p-5 rounded-[18px] bg-zinc-900 border border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Mock Sample Reviews</span>
              <span className="text-[10px] text-zinc-400 font-mono">Fictional Data</span>
            </h3>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200">Rohit S. (Simulated)</span>
                  <div className="flex items-center text-amber-400 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                  "Courteous staff and transparent billing. Products were packaged carefully with warranty cards attached."
                </p>
                <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" />
                  <span>Verified Simulation Feedback</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200">Ananya D. (Simulated)</span>
                  <div className="flex items-center text-amber-400 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                  "Clean display counters, good parking space outside, and polite support for checking hardware compatibility."
                </p>
                <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" />
                  <span>Verified Simulation Feedback</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Mock Map Placeholder */}
        <div className="lg:col-span-7">
          <div className="relative rounded-[18px] bg-zinc-950 border border-zinc-800 shadow-xl overflow-hidden h-[480px] flex flex-col justify-between p-4">
            {/* Vector Map Canvas Placeholder */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#52525b_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Geometric Vector Road Grid */}
            <svg className="absolute inset-0 w-full h-full opacity-30 stroke-zinc-700" xmlns="http://www.w3.org/2000/svg">
              <path d="M 0 100 Q 250 80 500 120 T 1000 90" fill="none" strokeWidth="6" />
              <path d="M 0 250 Q 300 240 600 270 T 1000 240" fill="none" strokeWidth="8" />
              <path d="M 0 380 Q 200 400 500 360 T 1000 390" fill="none" strokeWidth="4" />
              <line x1="200" y1="0" x2="250" y2="500" strokeWidth="5" />
              <line x1="450" y1="0" x2="420" y2="500" strokeWidth="7" />
              <line x1="750" y1="0" x2="780" y2="500" strokeWidth="5" />
            </svg>

            {/* Top map controls */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-sm text-xs font-mono text-zinc-300 flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5 text-blue-400" />
                <span>Simulated Coordinates: 23.8315° N, 91.2868° E</span>
              </div>
              <div className="flex gap-1.5">
                <button
                  className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-white"
                  title="Layer simulation"
                >
                  <Layers className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Centered Map Pin */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="relative animate-bounce">
                <div className="w-10 h-10 rounded-full bg-red-600 border-2 border-white flex items-center justify-center text-white shadow-2xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="w-3 h-3 bg-red-600 rotate-45 -mt-1 mx-auto"></div>
              </div>
              <div className="mt-2 px-3 py-1.5 rounded-xl bg-zinc-900/95 border border-zinc-700 text-center shadow-xl backdrop-blur-md">
                <span className="font-bold text-xs text-white block">{businessName}</span>
                <span className="text-[10px] text-zinc-400 font-mono">SIMULATION POI</span>
              </div>
            </div>

            {/* Bottom status watermark */}
            <div className="relative z-10 flex items-center justify-between text-[11px] text-zinc-400 font-mono bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800 backdrop-blur-sm">
              <span>Map Mode: Educational Sandbox</span>
              <span>Google Maps Integration: Disabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
