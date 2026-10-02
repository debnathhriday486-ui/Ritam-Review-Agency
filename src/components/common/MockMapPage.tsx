import React from 'react';
import { 
  Building2, 
  MapPin, 
  CheckCircle, 
  Star, 
  ExternalLink, 
  Info,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { BRAND_CONFIG, Task } from '../../../shared/types.ts';

interface MockMapPageProps {
  taskId: string;
  task?: Task | null;
  onBack: () => void;
}

export const MockMapPage: React.FC<MockMapPageProps> = ({ taskId, task, onBack }) => {
  const businessName = task?.mock_business_name || 'ABC Enterprises (Simulated)';
  const location = task?.mock_location || 'Agartala, Tripura';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-fade-in">
      {/* Educational Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-amber-300 font-semibold text-sm tracking-wide uppercase">
            EDUCATIONAL SIMULATION ONLY — NEVER POST ON REAL GOOGLE MAPS
          </h4>
          <p className="text-zinc-300 text-xs mt-1 leading-relaxed">
            This internal mock map page simulates an interactive business directory environment for training purposes.
            No live data is fetched from or submitted to Google Maps or any 3rd party review directory.
          </p>
        </div>
      </div>

      {/* Header bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
          Mock Map ID: {taskId.slice(0, 12)}
        </span>
      </div>

      {/* Mock Map Canvas Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
        {/* Simulated Map Visual Display */}
        <div className="relative h-64 sm:h-80 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col items-center justify-center border-b border-zinc-800 p-6 overflow-hidden">
          {/* Simulated Map Grid lines */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#71717a_1px,transparent_1px)] [background-size:24px_24px]"></div>
          
          {/* Simulated Roads/Vectors */}
          <div className="absolute w-[140%] h-1 bg-zinc-700/30 rotate-12 -translate-y-8"></div>
          <div className="absolute w-[140%] h-1.5 bg-zinc-700/20 -rotate-25 translate-y-12"></div>
          <div className="absolute h-[140%] w-1 bg-zinc-700/25 rotate-45"></div>

          {/* Map Pin Marker */}
          <div className="relative z-10 flex flex-col items-center animate-bounce-subtle">
            <div className="px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-700 text-xs font-semibold text-zinc-100 shadow-xl mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              {businessName}
            </div>
            <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-950 flex items-center justify-center shadow-2xl ring-4 ring-zinc-100/20">
              <MapPin className="w-6 h-6 text-zinc-900" />
            </div>
            <div className="w-4 h-1.5 bg-black/60 rounded-full blur-[2px] mt-1"></div>
          </div>

          <div className="absolute bottom-3 left-4 bg-zinc-900/90 border border-zinc-800 rounded-lg px-2.5 py-1 text-[11px] text-zinc-400">
            Lat: 23.8315° N | Long: 91.2868° E (Simulated Coords)
          </div>
          <div className="absolute bottom-3 right-4 bg-zinc-900/90 border border-zinc-800 rounded-lg px-2.5 py-1 text-[11px] text-emerald-400 font-medium">
            Status: Open (Simulated Hours: 09:30 AM - 08:30 PM)
          </div>
        </div>

        {/* Business Profile Details */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">{businessName}</h1>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  Mock Profile
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-400 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                  {location}
                </span>
                <span>•</span>
                <span className="text-zinc-300">Regional Retail & Service Simulator</span>
              </div>
            </div>

            {/* Simulated Rating summary */}
            <div className="flex items-center gap-3 bg-zinc-950/70 border border-zinc-800 p-3 rounded-2xl w-fit">
              <div className="text-3xl font-extrabold text-white">4.8</div>
              <div>
                <div className="flex text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Based on 142 simulated reviews</div>
              </div>
            </div>
          </div>

          {/* Educational Simulated Reviews Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-200">Simulated Community Reviews</h3>
              <span className="text-xs text-zinc-500">Internal database samples</span>
            </div>

            <div className="space-y-3">
              {[
                {
                  name: 'Rahul Debbarma',
                  rating: 5,
                  time: '2 days ago',
                  text: 'Clean counter, polite behaviour by the sales attendants, and transparent billing. Recommended local outlet.',
                  likes: 12
                },
                {
                  name: 'Ananya Roy',
                  rating: 5,
                  time: '1 week ago',
                  text: 'Prompt response when inquiring about product availability. The shop is well ventilated and well situated.',
                  likes: 8
                },
                {
                  name: 'Subrata Paul',
                  rating: 4,
                  time: '2 weeks ago',
                  text: 'Good stock variety and authentic product warranty stamps. Quick checkout during evening rush.',
                  likes: 5
                }
              ].map((rev, idx) => (
                <div key={idx} className="bg-zinc-950/50 border border-zinc-800/80 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-300">
                        {rev.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-zinc-200">{rev.name}</div>
                        <div className="text-[11px] text-zinc-500">{rev.time} (Simulated)</div>
                      </div>
                    </div>
                    <div className="flex text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">{rev.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Educational Note Footer */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 text-center">
            Notice: All business names, ratings, and comments presented here are purely fictional educational artifacts.
            {BRAND_CONFIG.name} does not sell, promote, or alter reviews on external commercial platforms.
          </div>
        </div>
      </div>
    </div>
  );
};
