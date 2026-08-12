import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Award,
  Calendar,
  Sparkles,
  PieChart,
  Users,
} from 'lucide-react';

interface ReportsViewProps {
  onOpenCopilot: (prompt?: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onOpenCopilot }) => {
  const handleExportPDF = () => {
    const reportText = `=====================================================
EVENTOS EXECUTIVE ANALYTICS REPORT - 2026
Generated: ${new Date().toLocaleDateString()}
-----------------------------------------------------
Annual Gross Revenue: SAR 18,450,000
Average Gross Operating Margin: 34.2%
Completed Flagship Premieres: 12 Events
Client Retention Index: 96.8%
-----------------------------------------------------
Top Performing Operations Leads:
1. Tariq Al-Mansoor (Riyadh Gala Lead) - 98.4 Rating
2. Elena Rostova (Diriyah Auto Expo) - 96.2 Rating
3. Sara Al-Otaibi (KAICC Tech Summit) - 95.8 Rating
=====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Eventos_Executive_Report_2026.txt`;
    a.click();
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-100 font-display">
            Reports & Operational Analytics
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Revenue trends, client satisfaction scores, contractor yield benchmarks, and quarterly reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenCopilot('Analyze annual revenue performance and outline strategic expansion recommendations.')}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/10"
          >
            <Sparkles className="w-4 h-4 fill-slate-950 stroke-none" />
            AI Analytics Forecast
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs transition-all"
          >
            <Download className="w-4 h-4 text-amber-400" />
            Export Executive Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-slate-400 font-medium">Annual Gross Revenue</p>
          <p className="text-2xl font-black text-slate-100 mt-1 font-display">SAR 18.45M</p>
          <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18.4% YOY
          </p>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-slate-400 font-medium">Average Operating Margin</p>
          <p className="text-2xl font-black text-amber-300 mt-1 font-display">34.2%</p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Target: 30%</p>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-slate-400 font-medium">Completed Premieres</p>
          <p className="text-2xl font-black text-slate-100 mt-1 font-display">12 Premieres</p>
          <p className="text-[11px] text-emerald-400 font-medium mt-1">100% On-Time</p>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-slate-400 font-medium">Client Retention Index</p>
          <p className="text-2xl font-black text-emerald-400 mt-1 font-display">96.8%</p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">GEA, SDAIA & Aramco</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue SVG Line Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-display">
              Quarterly Revenue vs Target (SAR Millions)
            </h3>
            <span className="text-xs text-emerald-300 font-bold bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 backdrop-blur-md">
              Q1 - Q4 2026
            </span>
          </div>

          <div className="h-64 flex items-end justify-between gap-4 pt-8 px-4 relative">
            {/* Grid background lines */}
            <div className="absolute inset-x-0 top-1/4 border-b border-white/5" />
            <div className="absolute inset-x-0 top-2/4 border-b border-white/5" />
            <div className="absolute inset-x-0 top-3/4 border-b border-white/5" />

            {[
              { quarter: 'Q1 2026', revenue: 3.8, target: 3.5, height: '55%' },
              { quarter: 'Q2 2026', revenue: 4.2, target: 4.0, height: '65%' },
              { quarter: 'Q3 2026', revenue: 4.9, target: 4.5, height: '78%' },
              { quarter: 'Q4 2026 (Est.)', revenue: 5.55, target: 5.0, height: '92%' },
            ].map((q) => (
              <div key={q.quarter} className="flex-1 flex flex-col items-center gap-2 relative z-10 h-full justify-end">
                <span className="text-xs font-bold text-amber-300 font-display">SAR {q.revenue}M</span>
                <div
                  className="w-12 bg-gradient-to-t from-amber-600 via-amber-500 to-amber-300 rounded-t-xl transition-all hover:scale-105 shadow-lg shadow-amber-500/20 border-t border-amber-200/40"
                  style={{ height: q.height }}
                />
                <span className="text-[11px] font-semibold text-slate-300 mt-2">{q.quarter}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers Leaderboard */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 font-display">
            <Award className="w-4 h-4 text-amber-400" /> Leaderboard Operations
          </h3>

          <div className="space-y-3 text-xs">
            {[
              { name: 'Tariq Al-Mansoor', role: 'Royal Gala Lead Producer', rating: 98.4, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250' },
              { name: 'Elena Rostova', role: 'Diriyah Auto Expo Ops Lead', rating: 96.2, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250' },
              { name: 'Sara Al-Otaibi', role: 'A/V Tech Chief', rating: 95.8, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250' },
            ].map((lead, idx) => (
              <div key={idx} className="p-3 glass-card rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-extrabold text-amber-300 text-sm font-display">#{idx + 1}</span>
                  <img src={lead.avatar} alt={lead.name} className="w-7 h-7 rounded-lg object-cover ring-1 ring-white/20" />
                  <div>
                    <p className="font-bold text-slate-100">{lead.name}</p>
                    <p className="text-[10px] text-slate-400">{lead.role}</p>
                  </div>
                </div>
                <span className="font-extrabold text-emerald-400 font-display">{lead.rating}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
