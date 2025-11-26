import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut,
  signInAnonymously
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  Wallet, Search, Award, User, Rocket, Briefcase, Hexagon, Activity, 
  ChevronRight, Sparkles, Lock, Bell, Bookmark, CheckCircle2, Globe, 
  Box, Cpu, Layers, Code2, ArrowLeft, Bot, ExternalLink,
  BrainCircuit, Lightbulb, Menu, X
} from 'lucide-react';

// --- CONFIGURATION ---
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app';
const apiKey = ""; // Injected by environment

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// --- GEMINI API UTILITY ---
const generateGeminiResponse = async (prompt) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Neural Link Offline.";
  } catch (e) {
    console.error(e);
    return "Error connecting to Intelligence Layer.";
  }
};

// --- MOCK DATA ---
const STATIC_BOUNTIES = [
  {
    id: "bounty_1",
    title: "DeFi Dashboard UI Component",
    sponsor: "Uniswap Grants",
    prize: "1,500 USDC",
    tags: ["Frontend", "React", "DeFi"],
    difficulty: "Intermediate",
    category: "Development",
    description: "Build a responsive, accessible dashboard component that visualizes liquidity pool data using Recharts and Tailwind CSS. Must support dark mode and mobile view.",
    requirements: ["React 18+", "TypeScript", "Web3.js knowledge"],
    isHot: true
  },
  {
    id: "bounty_2",
    title: "ZK Rollup Analysis",
    sponsor: "L2 Foundation",
    prize: "800 USDC",
    tags: ["Research", "L2", "Writing"],
    difficulty: "Advanced",
    category: "Content",
    description: "Write a comprehensive deep dive comparing Optimistic Rollups vs ZK Rollups.",
    requirements: ["Technical Writing", "L2 scaling knowledge"],
    isHot: false
  },
  {
    id: "bounty_3",
    title: "Smart Contract Audit",
    sponsor: "Security DAO",
    prize: "3,000 USDC",
    tags: ["Solidity", "Security"],
    difficulty: "Expert",
    category: "Audits",
    description: "Perform a comprehensive audit on our new Staking V2 contract.",
    requirements: ["Previous Audit Exp", "Solidity Expert"],
    isHot: true
  },
  {
    id: "bounty_4",
    title: "NFT Collection Art",
    sponsor: "Pixel Labs",
    prize: "500 USDC",
    tags: ["Design", "Creative"],
    difficulty: "Beginner",
    category: "Design",
    description: "Create a series of 5 banner assets for our upcoming 'CyberDrifters' NFT launch.",
    requirements: ["Figma/Photoshop", "Portfolio"],
    isHot: false
  }
];

const QUESTS = [
  { id: 1, title: "Web3 Fundamentals", subtitle: "Module 1: Blockchain Arch", progress: 100, status: "Completed", xp: 500 },
  { id: 2, title: "Smart Contract Dev", subtitle: "Module 2: Solidity & Vyper", progress: 45, status: "In Progress", xp: 1000 },
  { id: 3, title: "Full Stack DApp", subtitle: "Module 3: Frontend Integration", progress: 0, status: "Locked", xp: 750 }
];

// --- THEME ---
const THEME = {
  colors: {
    bg: "bg-[#05020D]",
    glass: "bg-[#0F172A]/60",
    primary: "text-[#3B82F6]",
    accent: "text-[#F43F5E]",
    border: "border-[#3B82F6]/30"
  }
};

// --- VISUAL COMPONENTS ---

const MetaverseBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#05020D]">
    <div 
      className="absolute bottom-[-20%] left-[-50%] right-[-50%] h-[80vh] opacity-30"
      style={{
        backgroundImage: `linear-gradient(transparent 0%, #3B82F6 100%), linear-gradient(90deg, rgba(59, 130, 246, 0.4) 1px, transparent 1px), linear-gradient(rgba(59, 130, 246, 0.4) 1px, transparent 1px)`,
        backgroundSize: '100% 100%, 60px 60px, 60px 60px',
        transform: 'perspective(600px) rotateX(60deg)',
        animation: 'gridMove 20s linear infinite',
      }}
    ></div>
    <div className="absolute top-[10%] left-[20%] w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-[#3B82F6] rounded-full blur-[120px] md:blur-[150px] opacity-10 animate-pulse"></div>
    <div className="absolute bottom-[20%] right-[10%] w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-[#8B5CF6] rounded-full blur-[100px] md:blur-[120px] opacity-10 animate-pulse delay-1000"></div>
    <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
    <style>{`
      @keyframes gridMove { 0% { background-position: 0 0; } 100% { background-position: 0 60px; } }
      .safe-pb { padding-bottom: env(safe-area-inset-bottom); }
    `}</style>
  </div>
);

const Toast = ({ message, show, onClose }) => {
  useEffect(() => { if (show) { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); } }, [show, onClose]);
  if (!show) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 md:top-auto md:left-auto md:bottom-10 md:right-6 z-[100] animate-in slide-in-from-top-4 md:slide-in-from-right-10 fade-in duration-300 w-[90%] max-w-md md:w-auto">
      <div className="bg-[#05020D]/95 border border-[#3B82F6] text-[#3B82F6] px-4 py-3 md:px-6 md:py-4 flex items-center gap-4 backdrop-blur-xl relative overflow-hidden rounded-lg shadow-2xl">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#3B82F6]"></div>
        <CheckCircle2 size={20} className="shrink-0" />
        <div>
          <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/70">System Notification</h4>
          <p className="text-sm font-bold leading-tight">{message}</p>
        </div>
      </div>
    </div>
  );
};

const HoloCard = ({ children, className = "", highlight = false, delay = 0, onClick }) => (
  <div 
    onClick={onClick}
    className={`
      relative group backdrop-blur-md border transition-all duration-300 overflow-hidden cursor-pointer rounded-xl
      ${highlight ? 'border-[#3B82F6] bg-[#3B82F6]/5 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : `border-[#3B82F6]/20 ${THEME.colors.glass} hover:border-[#3B82F6]/60 hover:bg-[#3B82F6]/10`}
      ${className}
      animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards
    `}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#3B82F6]/50 rounded-tl-md transition-colors group-hover:border-[#3B82F6]"></div>
    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#3B82F6]/50 rounded-br-md transition-colors group-hover:border-[#3B82F6]"></div>
    <div className="relative z-10 p-5 h-full flex flex-col">{children}</div>
  </div>
);

const PrimaryButton = ({ children, onClick, className = "", icon: Icon, loading, fullWidth = false }) => (
  <button 
    onClick={onClick}
    disabled={loading}
    className={`
      relative group overflow-hidden px-6 py-3 font-bold text-white transition-all active:scale-95 disabled:opacity-70 rounded-lg
      bg-[#3B82F6]/10 border border-[#3B82F6] hover:bg-[#3B82F6] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `}
  >
    <div className="relative flex items-center justify-center gap-2 z-10">
      {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : (Icon && <Icon size={18} />)}
      <span className="font-mono tracking-wider uppercase text-xs md:text-sm">{children}</span>
    </div>
    <div className="absolute inset-0 bg-[#3B82F6] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
  </button>
);

// --- SUBPAGES ---

const GrantDetails = ({ grant, onBack, triggerNotification, user }) => {
  const [aiAdvice, setAiAdvice] = useState(null);
  const [proposalDraft, setProposalDraft] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);

  const getAiHelp = async () => {
    setLoadingAi(true);
    const prompt = `Web3 bounty analysis for "${grant.title}". Description: ${grant.description}. Requirements: ${grant.requirements.join(', ')}. Provide 3 bullet points for a winning strategy.`;
    const response = await generateGeminiResponse(prompt);
    setAiAdvice(response);
    setLoadingAi(false);
  };

  const draftProposal = async () => {
    setLoadingDraft(true);
    const prompt = `Write a short bounty proposal for "${grant.title}". User: ${user?.displayName || "Dev"}. Skills: React, Web3. Tone: Professional. Max 100 words.`;
    const response = await generateGeminiResponse(prompt);
    setProposalDraft(response);
    setLoadingDraft(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-24 md:pb-12">
      <button onClick={onBack} className="flex items-center gap-2 text-[#3B82F6] hover:text-white mb-6 font-mono text-xs md:text-sm group pl-1">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> BACK TO FEED
      </button>

      <div className="border border-[#3B82F6]/30 bg-[#05020D]/80 p-6 md:p-8 relative overflow-hidden rounded-2xl shadow-2xl">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Hexagon size={150} className="text-[#3B82F6]" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-wrap gap-2 mb-4">
             <span className="bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30 px-2 py-1 text-[10px] md:text-xs font-mono uppercase rounded">{grant.category}</span>
             {grant.isHot && <span className="bg-[#F43F5E]/10 text-[#F43F5E] border border-[#F43F5E]/30 px-2 py-1 text-[10px] md:text-xs font-mono uppercase flex items-center gap-1 rounded"><Activity size={12}/> Priority</span>}
          </div>
          
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 leading-tight">{grant.title}</h1>
          <p className="text-[#3B82F6] font-mono text-xs md:text-sm mb-8">{grant.sponsor} • {grant.prize}</p>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="text-white font-mono text-xs uppercase tracking-widest border-b border-[#3B82F6]/30 pb-2 mb-3">Mission Brief</h3>
                <p className="text-[#94A3B8] text-sm md:text-base leading-relaxed">{grant.description}</p>
              </div>
              <div>
                <h3 className="text-white font-mono text-xs uppercase tracking-widest border-b border-[#3B82F6]/30 pb-2 mb-3">Requirements</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {grant.requirements?.map((req, i) => (
                    <li key={i} className="flex items-center gap-2 text-[#94A3B8] text-sm">
                      <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full"></div> {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI ASSISTANT CARD */}
              <div className="bg-[#3B82F6]/5 border border-[#3B82F6]/20 p-4 md:p-6 rounded-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="p-3 bg-[#3B82F6]/10 rounded-full border border-[#3B82F6]/20 shrink-0">
                    <Sparkles className="text-[#3B82F6]" size={20} />
                  </div>
                  <div className="flex-1 w-full">
                    <h4 className="text-white font-bold mb-1 text-sm md:text-base">Gemini Tactical Assistant</h4>
                    <p className="text-[#94A3B8] text-xs mb-4">AI-powered insights to boost your win probability.</p>
                    
                    <div className="flex flex-wrap gap-3 mb-4">
                        <button 
                           onClick={getAiHelp} 
                           disabled={loadingAi}
                           className="text-xs bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/50 px-3 py-2 rounded hover:bg-[#3B82F6] hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                           {loadingAi ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <BrainCircuit size={14} />}
                           Generate Strategy
                        </button>
                        <button 
                           onClick={draftProposal} 
                           disabled={loadingDraft}
                           className="text-xs bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/50 px-3 py-2 rounded hover:bg-[#3B82F6] hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                           {loadingDraft ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <Bot size={14} />}
                           Draft Proposal
                        </button>
                    </div>

                    {(aiAdvice || proposalDraft) && (
                      <div className="bg-[#05020D]/60 p-4 rounded-lg border border-[#3B82F6]/10 animate-in fade-in slide-in-from-bottom-2">
                        {aiAdvice && <div className="text-xs text-[#94A3B8] font-mono whitespace-pre-line mb-4">{aiAdvice}</div>}
                        {proposalDraft && (
                          <div className="relative">
                            <div className="text-xs text-[#94A3B8] font-mono whitespace-pre-line bg-black/20 p-3 rounded border border-white/5">{proposalDraft}</div>
                            <button onClick={() => { navigator.clipboard.writeText(proposalDraft); triggerNotification("Copied!"); }} className="absolute top-2 right-2 text-[10px] text-[#3B82F6] hover:text-white">COPY</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#05020D] border border-[#3B82F6]/30 p-6 text-center rounded-xl shadow-lg">
                 <div className="text-[10px] text-[#94A3B8] font-mono mb-1 uppercase tracking-wider">Total Reward</div>
                 <div className="text-2xl md:text-3xl text-white font-bold mb-6">{grant.prize}</div>
                 <PrimaryButton fullWidth onClick={() => triggerNotification("Redirecting to Portal...")}>
                   APPLY NOW
                 </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN SECTIONS ---

const EarnSection = ({ onGrantClick, triggerNotification, bookmarks, toggleBookmark, user }) => {
  const [filter, setFilter] = useState('All');
  const [neuralMatch, setNeuralMatch] = useState(null);
  const [loadingMatch, setLoadingMatch] = useState(false);
  
  const filteredBounties = filter === 'All' ? STATIC_BOUNTIES : STATIC_BOUNTIES.filter(b => b.category === filter);

  const handleNeuralMatch = async () => {
    if (!user) { triggerNotification("Connect Identity First"); return; }
    setLoadingMatch(true);
    const prompt = `User Skills: React, Solidity. Best match from: ${STATIC_BOUNTIES.map(b => b.title).join(", ")}? One sentence.`;
    const response = await generateGeminiResponse(prompt);
    setNeuralMatch(response);
    setLoadingMatch(false);
  };

  return (
    <div className="space-y-8 md:space-y-12 pb-32 animate-in fade-in duration-700">
      <div className="relative border border-[#3B82F6]/30 bg-[#05020D]/60 p-6 md:p-12 overflow-hidden group rounded-2xl">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
             <div className="w-2 h-2 bg-[#3B82F6] rounded-full animate-pulse"></div>
             <span className="text-[#3B82F6] font-mono text-[10px] md:text-xs uppercase tracking-[0.2em]">Live Opportunities</span>
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-none tracking-tight">
            BUILD THE <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] via-white to-[#3B82F6]">NEXT WEB</span>
          </h2>
          
          <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/20 p-4 rounded-lg max-w-lg mb-8 backdrop-blur-md">
             <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-bold flex items-center gap-2 text-xs md:text-sm"><BrainCircuit size={16} className="text-[#3B82F6]" /> Neural Match</h3>
                <button onClick={handleNeuralMatch} disabled={loadingMatch} className="text-[10px] md:text-xs bg-[#3B82F6] text-white px-3 py-1 rounded hover:bg-[#2563EB] disabled:opacity-50 font-mono uppercase transition-colors">
                  {loadingMatch ? "Scanning..." : "Find Match"}
                </button>
             </div>
             <p className="text-xs text-[#94A3B8] line-clamp-2">{neuralMatch || "AI matching engine ready. Scan for optimal bounties."}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
             <PrimaryButton onClick={() => document.getElementById('bounty-grid').scrollIntoView({behavior: 'smooth'})} icon={Cpu}>Start Building</PrimaryButton>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-3 no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {['All', 'Development', 'Content', 'Design', 'Audits'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 md:px-6 py-2 text-xs font-mono uppercase tracking-wider border transition-all whitespace-nowrap rounded-full ${filter === f ? 'bg-[#3B82F6] text-white border-[#3B82F6] shadow-lg' : 'bg-transparent text-[#94A3B8] border-[#3B82F6]/30 hover:border-[#3B82F6] hover:text-[#3B82F6]'}`}>
            {f}
          </button>
        ))}
      </div>

      <div id="bounty-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {filteredBounties.map((bounty, idx) => (
          <HoloCard key={bounty.id} delay={idx * 100} highlight={bounty.isHot} className="group hover:scale-[1.01] transform transition-transform active:scale-95" onClick={() => onGrantClick(bounty)}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3 md:gap-4">
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-[#3B82F6]/10 flex items-center justify-center border border-[#3B82F6]/30 relative rounded-lg shrink-0">
                    <Hexagon size={20} className="text-[#3B82F6]" />
                 </div>
                 <div>
                   <p className="text-[10px] text-[#3B82F6] font-mono uppercase tracking-wider mb-1 flex items-center gap-2">{bounty.sponsor} {bounty.isHot && <Activity size={10} className="text-[#F43F5E]" />}</p>
                   <h3 className="font-bold text-white text-base md:text-lg leading-tight group-hover:text-[#3B82F6] transition-colors line-clamp-1">{bounty.title}</h3>
                 </div>
              </div>
              <button onClick={(e) => toggleBookmark(e, bounty.id)} className={`p-2 hover:bg-[#3B82F6]/10 transition-colors rounded-full ${bookmarks.includes(bounty.id) ? 'text-[#3B82F6]' : 'text-[#3B82F6]/30'}`}>
                <Bookmark size={18} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {bounty.tags.slice(0,3).map(tag => (
                <span key={tag} className="px-2 py-1 bg-[#3B82F6]/5 border border-[#3B82F6]/20 text-[10px] text-[#94A3B8] font-mono rounded-md">{tag}</span>
              ))}
            </div>
            <div className="mt-auto pt-4 border-t border-[#3B82F6]/20 flex justify-between items-center relative">
               <div className="flex items-center gap-2 text-[10px] md:text-xs font-mono text-[#94A3B8]"><Layers size={12} /><span className="uppercase">{bounty.difficulty}</span></div>
               <div className="text-white font-bold font-mono text-sm md:text-base">{bounty.prize}</div>
            </div>
          </HoloCard>
        ))}
      </div>
    </div>
  );
};

const LearnSection = ({ triggerNotification }) => {
  const [aiPlan, setAiPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGeneratePlan = async (topic) => {
    setLoading(true);
    triggerNotification("Creating Study Plan...");
    const prompt = `3-step learning path for beginner in "${topic}" Web3. Format: 1. [Title]: [Desc], 2. [Title]: [Desc]... Concise.`;
    const response = await generateGeminiResponse(prompt);
    setAiPlan({topic, content: response});
    setLoading(false);
  };

  return (
    <div className="space-y-8 md:space-y-12 pb-32 animate-in fade-in duration-700">
      <div className="border-b border-[#3B82F6]/30 pb-4">
         <h2 className="text-3xl md:text-4xl font-bold text-white">SKILL <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]">FORGE</span></h2>
      </div>

      <div className="bg-[#05020D] border border-[#3B82F6]/30 p-4 md:p-6 rounded-xl relative overflow-hidden">
         <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 bg-[#3B82F6]/20 rounded-full border border-[#3B82F6]/50 shrink-0 hidden sm:block"><Lightbulb className="text-[#3B82F6]" size={24} /></div>
            <div className="flex-1 w-full">
               <h3 className="text-white font-bold mb-2 text-lg">Skill Uplink ✨</h3>
               <p className="text-sm text-[#94A3B8] mb-4">Generate a custom study plan instantly.</p>
               <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
                  {['Solidity', 'Rust', 'Zero Knowledge', 'Tokenomics'].map(topic => (
                    <button key={topic} onClick={() => handleGeneratePlan(topic)} className="text-xs border border-[#3B82F6]/30 text-[#3B82F6] px-3 py-1.5 rounded whitespace-nowrap hover:bg-[#3B82F6] hover:text-white transition-colors">{topic}</button>
                  ))}
               </div>
               {loading && <div className="text-[#3B82F6] text-xs font-mono animate-pulse">Accessing Neural Network...</div>}
               {aiPlan && !loading && (
                 <div className="bg-[#3B82F6]/5 p-4 rounded border border-[#3B82F6]/20 animate-in zoom-in-95">
                    <h4 className="text-white text-xs font-bold mb-2 uppercase tracking-wider">Protocol: {aiPlan.topic}</h4>
                    <div className="text-[#94A3B8] text-xs md:text-sm whitespace-pre-line font-mono">{aiPlan.content}</div>
                 </div>
               )}
            </div>
         </div>
      </div>

      <div className="space-y-4">
        {QUESTS.map((quest, idx) => (
          <div key={quest.id} className="relative group">
             {idx !== QUESTS.length - 1 && <div className="absolute left-[28px] top-14 bottom-[-20px] w-[1px] bg-[#3B82F6]/20 z-0 hidden sm:block"></div>}
             <div onClick={() => quest.status !== 'Locked' ? triggerNotification(`Initializing Module...`) : triggerNotification("Locked")} className={`relative z-10 flex items-center gap-4 p-4 border transition-all cursor-pointer overflow-hidden rounded-xl ${quest.status === 'Locked' ? 'border-[#3B82F6]/10 bg-[#05020D]/60 opacity-60' : 'border-[#3B82F6]/30 bg-[#05020D]/80 hover:border-[#3B82F6]'}`}>
                <div className="w-12 h-12 md:w-14 md:h-14 border border-[#3B82F6]/50 flex items-center justify-center bg-[#05020D] rounded-lg shrink-0">
                   {quest.status === 'Locked' ? <Lock size={20} className="text-[#3B82F6]/50" /> : <Box size={24} className="text-[#3B82F6]" />}
                </div>
                <div className="flex-1 min-w-0">
                   <h4 className="text-white font-bold text-sm md:text-lg font-mono truncate">{quest.title}</h4>
                   <p className="text-[10px] md:text-xs text-[#3B82F6] font-mono uppercase tracking-wider mb-2">{quest.subtitle}</p>
                   <div className="h-1.5 w-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 relative rounded-full overflow-hidden">
                      <div className="h-full bg-[#3B82F6]" style={{ width: `${quest.progress}%` }}></div>
                   </div>
                </div>
                <div className="hidden sm:block text-right shrink-0">
                   <div className="text-[#3B82F6] font-bold text-sm md:text-lg font-mono">{quest.xp} XP</div>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProfileSection = ({ user, bookmarks, handleLogout }) => (
  <div className="space-y-8 pb-32 animate-in fade-in duration-700">
    <div className="relative mt-4 md:mt-12 p-1 border border-[#3B82F6]/30 rounded-2xl overflow-hidden">
       <div className="bg-[#05020D]/90 p-6 md:p-8 text-center relative overflow-hidden">
          <div className="relative inline-block mb-4 md:mb-6">
             <div className="w-20 h-20 md:w-28 md:h-28 border-2 border-[#3B82F6] p-1 relative rounded-full">
                <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="avatar" className="w-full h-full bg-[#1A1033] rounded-full" />
             </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white font-mono tracking-tight">{user.displayName || "Builder"}</h2>
          <p className="text-[#3B82F6] text-[10px] md:text-xs font-mono uppercase tracking-widest mb-6">{user.email || "Wallet Connected"}</p>
          <div className="grid grid-cols-3 gap-px bg-[#3B82F6]/30 border border-[#3B82F6]/30 rounded-lg overflow-hidden">
             <div className="bg-[#05020D] p-3 md:p-4"><div className="text-[8px] md:text-[10px] text-[#94A3B8] font-mono uppercase mb-1">Bookmarks</div><div className="text-white font-bold font-mono text-lg md:text-xl">{bookmarks.length}</div></div>
             <div className="bg-[#05020D] p-3 md:p-4"><div className="text-[8px] md:text-[10px] text-[#94A3B8] font-mono uppercase mb-1">Reputation</div><div className="text-[#3B82F6] font-bold font-mono text-lg md:text-xl">100%</div></div>
             <div className="bg-[#05020D] p-3 md:p-4"><div className="text-[8px] md:text-[10px] text-[#94A3B8] font-mono uppercase mb-1">Applied</div><div className="text-white font-bold font-mono text-lg md:text-xl">0</div></div>
          </div>
       </div>
    </div>
    <div className="flex justify-center">
       <button onClick={handleLogout} className="text-xs text-red-500 font-mono border border-red-500/30 px-4 py-2 hover:bg-red-500/10 rounded-md w-full md:w-auto">DISCONNECT IDENTITY</button>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('earn');
  const [currentView, setCurrentView] = useState('main');
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'profile', 'data');
        const unsubscribeDoc = onSnapshot(userRef, (docSnap) => { if (docSnap.exists()) setBookmarks(docSnap.data().bookmarks || []); });
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) await setDoc(userRef, { bookmarks: [], email: currentUser.email || 'anon' });
        return () => unsubscribeDoc();
      } else {
        setUser(null);
        setBookmarks([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const triggerNotification = (msg) => { setToastMessage(msg); setShowToast(true); };

  const toggleBookmark = async (e, id) => {
    e.stopPropagation();
    if (!user) { triggerNotification("Connect Identity First"); setShowLoginModal(true); return; }
    const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
    if (bookmarks.includes(id)) { await updateDoc(userRef, { bookmarks: arrayRemove(id) }); triggerNotification("Removed"); } 
    else { await updateDoc(userRef, { bookmarks: arrayUnion(id) }); triggerNotification("Saved"); }
  };

  const handleGrantClick = (grant) => { setSelectedGrant(grant); setCurrentView('detail'); window.scrollTo(0,0); };
  const handleBack = () => { setCurrentView('main'); setSelectedGrant(null); };
  const handleGoogleLogin = async () => { try { await signInWithPopup(auth, googleProvider); setShowLoginModal(false); triggerNotification("Identity Verified"); } catch (e) { triggerNotification("Auth Error"); } };
  const handleWalletLogin = async () => { try { await signInAnonymously(auth); setShowLoginModal(false); triggerNotification("Wallet Connected (Anon)"); } catch (e) { triggerNotification("Error"); } };
  const handleLogout = async () => { await signOut(auth); triggerNotification("Disconnected"); setIsMenuOpen(false); };

  return (
    <div className={`min-h-screen ${THEME.colors.bg} font-sans selection:bg-[#3B82F6] selection:text-white overflow-x-hidden`}>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      <MetaverseBackground />
      <Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />

      {/* Mobile Bottom Dock */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-50 safe-pb">
        <div className="bg-[#05020D]/90 backdrop-blur-xl border border-[#3B82F6]/30 rounded-2xl p-2 flex justify-between shadow-2xl items-center">
          {[{id:'earn', icon:Briefcase, label:'Earn'}, {id:'learn', icon:Rocket, label:'Learn'}, {id:'belong', icon:User, label:'Me'}].map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setCurrentView('main'); }} className={`flex-1 flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === item.id ? 'text-white' : 'text-[#94A3B8]'}`}>
              <item.icon size={20} className={activeTab === item.id ? 'text-[#3B82F6] mb-1' : 'mb-1'} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 lg:w-72 h-screen fixed left-0 top-0 border-r border-[#3B82F6]/20 bg-[#05020D]/60 backdrop-blur-md z-50 p-6">
        <h1 className="text-2xl font-bold text-white font-mono mb-8 flex items-center gap-2"><Globe size={24} className="text-[#3B82F6]" /> WEB3<span className="text-[#3B82F6]">_ADDA</span></h1>
        <div className="space-y-4">
          {[{id:'earn', label:'Earn', icon:Briefcase}, {id:'learn', label:'Learn', icon:Rocket}, {id:'belong', label:'Identity', icon:User}].map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setCurrentView('main'); }} className={`w-full text-left px-4 py-3 border-l-2 transition-all font-mono text-sm uppercase flex items-center gap-3 ${activeTab === item.id ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-white' : 'border-transparent text-[#94A3B8] hover:text-white hover:bg-white/5'}`}>
              <item.icon size={16} /> {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="md:ml-64 lg:ml-72 relative min-h-screen">
        <header className="sticky top-0 z-40 p-4 md:px-8 flex justify-between items-center backdrop-blur-sm bg-[#05020D]/50 border-b border-[#3B82F6]/10">
          <div className="md:hidden"><h1 className="text-lg font-bold font-mono text-white flex items-center gap-2"><Globe size={20} className="text-[#3B82F6]" /> WEB3<span className="text-[#3B82F6]">_ADDA</span></h1></div>
          <div className="hidden md:block w-full max-w-sm relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B82F6]/50" size={16} />
             <input type="text" placeholder="SEARCH PROTOCOL..." className="w-full bg-[#3B82F6]/5 border border-[#3B82F6]/20 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#3B82F6] font-mono placeholder:text-[#3B82F6]/30" />
          </div>
          <div className="flex gap-3">
            {user ? (
              <button onClick={() => { setActiveTab('belong'); setCurrentView('main'); }} className="flex items-center gap-2 border border-[#3B82F6]/30 px-3 py-1.5 bg-[#3B82F6]/10 rounded-lg hover:bg-[#3B82F6]/20 transition-colors">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-mono text-[#3B82F6] hidden sm:inline">{user.displayName || "Wallet"}</span>
                <User size={16} className="text-[#3B82F6] sm:hidden" />
              </button>
            ) : (
              <PrimaryButton onClick={() => setShowLoginModal(true)} className="!px-4 !py-2 text-xs">CONNECT</PrimaryButton>
            )}
          </div>
        </header>

        <main className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
          {currentView === 'detail' && selectedGrant ? (
            <GrantDetails grant={selectedGrant} onBack={handleBack} triggerNotification={triggerNotification} user={user} />
          ) : (
            <>
              {activeTab === 'earn' && <EarnSection onGrantClick={handleGrantClick} triggerNotification={triggerNotification} bookmarks={bookmarks} toggleBookmark={toggleBookmark} user={user} />}
              {activeTab === 'learn' && <LearnSection triggerNotification={triggerNotification} />}
              {activeTab === 'belong' && (user ? <ProfileSection user={user} bookmarks={bookmarks} handleLogout={handleLogout} /> : <div className="flex flex-col items-center justify-center py-20"><div className="w-16 h-16 bg-[#3B82F6]/10 rounded-full flex items-center justify-center mb-4 border border-[#3B82F6]/30"><Lock size={32} className="text-[#3B82F6]" /></div><h2 className="text-white text-lg mb-2 font-mono uppercase">Access Restricted</h2><p className="text-[#94A3B8] text-sm mb-6 text-center max-w-xs">Connect your identity to access your builder profile.</p><PrimaryButton onClick={() => setShowLoginModal(true)}>INITIALIZE IDENTITY</PrimaryButton></div>)}
            </>
          )}
        </main>
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#05020D] border border-[#3B82F6] p-6 md:p-8 text-center relative shadow-[0_0_50px_rgba(59,130,246,0.2)] rounded-2xl">
            <div className="absolute top-4 right-4"><button onClick={() => setShowLoginModal(false)}><X size={20} className="text-[#94A3B8] hover:text-white" /></button></div>
            <div className="w-12 h-12 bg-[#3B82F6]/20 rounded-full flex items-center justify-center mx-auto mb-4"><Wallet size={24} className="text-[#3B82F6]" /></div>
            <h2 className="text-lg font-bold text-white mb-6 font-mono uppercase tracking-widest">Connect Node</h2>
            <div className="space-y-3">
              <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 py-3 border border-white/10 hover:border-[#3B82F6] text-white bg-[#1A1033] hover:bg-[#3B82F6]/10 rounded-lg transition-all text-sm font-bold"><div className="w-4 h-4 rounded-full bg-red-500"></div> GOOGLE IDENTITY</button>
              <button onClick={handleWalletLogin} className="w-full flex items-center justify-center gap-3 py-3 border border-white/10 hover:border-[#3B82F6] text-white bg-[#1A1033] hover:bg-[#3B82F6]/10 rounded-lg transition-all text-sm font-bold"><div className="w-4 h-4 rounded-full bg-blue-500"></div> WALLET CONNECT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
