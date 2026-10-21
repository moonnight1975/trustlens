import { useEffect, useState } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

export function ScoreRadar({ points }: { points: { metric: string; value: number }[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || points.length < 3) return null;
  return (
    <div className="h-72 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={points} outerRadius="70%">
          <PolarGrid stroke="#d5dced" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: "#1b2340", fontSize: 12 }} />
          <Radar dataKey="value" stroke="#4338ca" fill="#4338ca" fillOpacity={0.25} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
