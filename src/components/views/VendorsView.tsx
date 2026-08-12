import React, { useState } from 'react';
import {
  Store,
  Star,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Plus,
  Search,
  X,
  Sparkles,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { VendorItem } from '../../types';

interface VendorsViewProps {
  vendors: VendorItem[];
  onAddVendor: (newVendor: VendorItem) => void;
  onOpenCopilot: (prompt?: string) => void;
}

export const VendorsView: React.FC<VendorsViewProps> = ({
  vendors,
  onAddVendor,
  onOpenCopilot,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<VendorItem | null>(vendors[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New vendor form
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<any>('A/V Production');
  const [newContact, setNewContact] = useState('');

  const filteredVendors = vendors.filter((v) =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    const created: VendorItem = {
      id: `vnd-${Date.now()}`,
      name: newName,
      category: newCategory,
      rating: 4.8,
      status: 'Active',
      contactPerson: newContact || 'Operations Manager',
      email: `${newName.toLowerCase().replace(/\s+/g, '')}@vendor.sa`,
      phone: '+966 50 000 1122',
      activeContracts: 1,
      qualityScore: 95,
      onTimeRate: 98,
      costVariance: 0.0,
      pendingQuotes: [],
    };
    onAddVendor(created);
    setShowAddModal(false);
    setNewName('');
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-100 font-display">
            Vendors & Supplier Scorecards
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Contractor performance scores, quote comparison matrices, on-time delivery metrics, and cost variances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              onOpenCopilot('Evaluate all supplier performance scorecards and highlight high-risk cost variance suppliers.')
            }
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/10"
          >
            <Sparkles className="w-4 h-4 fill-slate-950 stroke-none" />
            AI Supplier Audit
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/10"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Add Supplier
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full glass-input rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-white/[0.04] backdrop-blur-md border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="p-4">Vendor Partner</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Quality Score</th>
                  <th className="p-4">On-Time %</th>
                  <th className="p-4">Cost Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredVendors.map((vnd) => (
                  <tr
                    key={vnd.id}
                    onClick={() => setSelectedVendor(vnd)}
                    className={`hover:bg-white/[0.05] cursor-pointer transition-colors ${
                      selectedVendor?.id === vnd.id ? 'bg-indigo-500/15' : ''
                    }`}
                  >
                    <td className="p-4">
                      <div className="font-bold text-slate-100">{vnd.name}</div>
                      <div className="text-[10px] text-amber-300 font-medium flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-300" /> {vnd.rating} • {vnd.status}
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{vnd.category}</td>
                    <td className="p-4 font-bold text-emerald-400">{vnd.qualityScore}%</td>
                    <td className="p-4 font-bold text-slate-100">{vnd.onTimeRate}%</td>
                    <td className="p-4 font-bold">
                      <span
                        className={
                          vnd.costVariance > 10
                            ? 'text-rose-400'
                            : vnd.costVariance > 0
                            ? 'text-amber-300'
                            : 'text-emerald-400'
                        }
                      >
                        {vnd.costVariance > 0 ? `+${vnd.costVariance}%` : `${vnd.costVariance}%`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Vendor Scorecard Card */}
        {selectedVendor && (
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-display">Vendor Scorecard</h3>
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold backdrop-blur-md">
                {selectedVendor.status}
              </span>
            </div>

            <div>
              <h4 className="text-xl font-extrabold text-slate-100 font-display">{selectedVendor.name}</h4>
              <p className="text-xs text-slate-300 mt-0.5">{selectedVendor.category}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 glass-card rounded-xl">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Quality Index</p>
                <p className="text-xl font-black text-emerald-400 mt-1 font-display">{selectedVendor.qualityScore}%</p>
              </div>
              <div className="p-3 glass-card rounded-xl">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">On-Time Rate</p>
                <p className="text-xl font-black text-slate-100 mt-1 font-display">{selectedVendor.onTimeRate}%</p>
              </div>
            </div>

            {selectedVendor.costVariance > 10 && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-200 font-medium backdrop-blur-md">
                ⚠️ Cost Variance Warning: Exceeds budgeted allowance by +{selectedVendor.costVariance}%.
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
              <p className="font-bold text-slate-200">Contact Details:</p>
              <p className="text-slate-300">{selectedVendor.contactPerson} ({selectedVendor.email})</p>
              <p className="text-slate-300">{selectedVendor.phone}</p>
            </div>

            {selectedVendor.pendingQuotes.length > 0 && (
              <div className="pt-2 border-t border-white/10 space-y-2">
                <p className="text-xs font-bold text-amber-300 uppercase tracking-wider font-display">Pending Proposals</p>
                {selectedVendor.pendingQuotes.map((q) => (
                  <div key={q.id} className="p-2.5 glass-card rounded-xl text-xs space-y-1">
                    <p className="font-bold text-slate-100">{q.title}</p>
                    <p className="text-amber-300 font-bold">SAR {q.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400">{q.eventName}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="glass-card rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-slate-100 font-display">Add Supplier Partner</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-white/10 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LaserVision Middle East"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Primary Category</label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-400"
                >
                  <option value="A/V Production" className="bg-slate-950 text-slate-100">A/V Production</option>
                  <option value="Catering & Hospitality" className="bg-slate-950 text-slate-100">Catering & Hospitality</option>
                  <option value="Staging & Trussing" className="bg-slate-950 text-slate-100">Staging & Trussing</option>
                  <option value="Security & Staffing" className="bg-slate-950 text-slate-100">Security & Staffing</option>
                  <option value="Decor & Lighting" className="bg-slate-950 text-slate-100">Decor & Lighting</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Contact Representative</label>
                <input
                  type="text"
                  placeholder="e.g. Tariq Mansoor"
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl glass-btn text-slate-300 font-semibold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl glass-btn-amber font-bold shadow-lg"
                >
                  Add Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
