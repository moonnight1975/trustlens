import { useState, useEffect } from "react";
import { Search, Globe, ShieldCheck, FileSearch, Zap } from "lucide-react";

const MESSAGES = [
  "Scanning web sources...",
  "Querying Wikipedia...",
  "Checking Brave Search...",
  "Analyzing evidence snippets...",
  "Calculating trust score...",
  "Finalizing report...",
];

export function SearchAnimation() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-12 px-6 text-center">
      <div className="relative flex items-center justify-center">
        {/* Pulsing Rings */}
        <div className="absolute size-32 animate-ping rounded-full bg-primary/20" />
        <div className="absolute size-24 animate-pulse rounded-full bg-primary/30" />
        <div className="absolute size-16 animate-bounce rounded-full bg-primary/40" />
        
        {/* Center Icon */}
        <div className="relative z-10 nm-raised-sm gradient-primary size-16 rounded-full flex items-center justify-center text-white shadow-glow">
          <Search className="size-8 animate-pulse" />
        </div>
        
        {/* Orbiting Icons */}
        <div className="absolute size-48 animate-spin-slow">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 nm-raised-sm bg-white p-2 rounded-full text-primary shadow-sm">
            <Globe className="size-4" />
          </div>
          <div className="absolute top-1/2 -right-4 -translate-y-1/2 nm-raised-sm bg-white p-2 rounded-full text-primary shadow-sm">
            <ShieldCheck className="size-4" />
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 nm-raised-sm bg-white p-2 rounded-full text-primary shadow-sm">
            <FileSearch className="size-4" />
          </div>
          <div className="absolute top-1/2 -left-4 -translate-y-1/2 nm-raised-sm bg-white p-2 rounded-full text-primary shadow-sm">
            <Zap className="size-4" />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 max-w-xs">
        <h3 className="font-serif text-2xl text-fg">Verifying Claim</h3>
        <div className="h-6 overflow-hidden">
          <p className="text-muted text-sm animate-fade-in-up">
            {MESSAGES[msgIndex]}
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 2s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
