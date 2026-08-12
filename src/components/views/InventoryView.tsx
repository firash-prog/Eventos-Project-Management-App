import React, { useState } from 'react';
import {
  Box,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Plus,
  X,
  User,
  MapPin,
  Wrench,
  Sparkles,
} from 'lucide-react';
import { AssetItem } from '../../types';

interface InventoryViewProps {
  assets: AssetItem[];
  onAddAsset: (newAsset: AssetItem) => void;
  onUpdateAsset: (updatedAsset: AssetItem) => void;
  onOpenCopilot: (prompt?: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  assets,
  onAddAsset,
  onUpdateAsset,
  onOpenCopilot,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedAsset, setSelectedAsset] = useState<AssetItem | null>(assets[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Asset form
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<any>('A/V Equipment');
  const [newValue, setNewValue] = useState(150000);
  const [newLocation, setNewLocation] = useState('Central Warehouse');

  const filteredAssets = assets.filter((ast) => {
    const matchesSearch =
      ast.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ast.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || ast.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleToggleCheckOut = (asset: AssetItem) => {
    const isCheckedOut = asset.status === 'In Use' || asset.status === 'Checked Out';
    const updated: AssetItem = {
      ...asset,
      status: isCheckedOut ? 'Available' : 'In Use',
      currentAssignee: isCheckedOut ? undefined : 'Sara Al-Otaibi (A/V Manager)',
      history: [
        {
          date: new Date().toISOString().split('T')[0],
          action: isCheckedOut ? 'Checked In to Central Warehouse' : 'Checked Out for Site Operation',
          user: 'Current User',
        },
        ...asset.history,
      ],
    };
    onUpdateAsset(updated);
    if (selectedAsset && selectedAsset.id === asset.id) {
      setSelectedAsset(updated);
    }
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    const code = `AST-${newCategory.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const created: AssetItem = {
      id: `ast-${Date.now()}`,
      name: newName,
      category: newCategory,
      code,
      status: 'Available',
      location: newLocation,
      value: Number(newValue),
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${code}`,
      maintenanceDate: new Date().toISOString().split('T')[0],
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=400',
      history: [
        { date: new Date().toISOString().split('T')[0], action: 'Asset Registered in System', user: 'System Admin' },
      ],
    };
    onAddAsset(created);
    setShowAddModal(false);
    setNewName('');
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-100 font-display">
            Inventory & Asset Management
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Real-time equipment tracking, QR scanning, maintenance logs, and high-value hardware inventory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/10"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Register Asset
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 w-full">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search assets by name or serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-400"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="glass-input rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-400"
          >
            <option value="All" className="bg-slate-950 text-slate-100">All Categories</option>
            <option value="A/V Equipment" className="bg-slate-950 text-slate-100">A/V Equipment</option>
            <option value="Lighting" className="bg-slate-950 text-slate-100">Lighting</option>
            <option value="Staging" className="bg-slate-950 text-slate-100">Staging</option>
            <option value="Furniture" className="bg-slate-950 text-slate-100">Furniture</option>
          </select>
        </div>
      </div>

      {/* Grid: Directory Table & Asset Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Directory */}
        <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-white/[0.04] backdrop-blur-md border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="p-4">Asset & Serial</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Est. Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredAssets.map((ast) => (
                  <tr
                    key={ast.id}
                    onClick={() => setSelectedAsset(ast)}
                    className={`hover:bg-white/[0.05] cursor-pointer transition-colors ${
                      selectedAsset?.id === ast.id ? 'bg-indigo-500/15' : ''
                    }`}
                  >
                    <td className="p-4">
                      <div className="font-bold text-slate-100">{ast.name}</div>
                      <div className="text-[10px] font-mono text-amber-300 font-medium">{ast.code}</div>
                    </td>
                    <td className="p-4 text-slate-300">{ast.category}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          ast.status === 'In Use'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : ast.status === 'Available'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {ast.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">{ast.location}</td>
                    <td className="p-4 font-bold text-slate-100">SAR {ast.value.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Asset Drawer */}
        {selectedAsset && (
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-display">Asset Inspector</h3>
              <span className="text-xs font-mono text-amber-300 font-bold">{selectedAsset.code}</span>
            </div>

            {selectedAsset.imageUrl && (
              <img
                src={selectedAsset.imageUrl}
                alt={selectedAsset.name}
                className="w-full h-36 object-cover rounded-xl border border-white/15 shadow-md"
              />
            )}

            <div>
              <h4 className="text-base font-extrabold text-slate-100 font-display">{selectedAsset.name}</h4>
              <p className="text-xs text-slate-300 mt-0.5">{selectedAsset.category} • SAR {selectedAsset.value.toLocaleString()}</p>
            </div>

            {/* QR Code display */}
            <div className="p-3 glass-card rounded-xl flex items-center gap-3">
              <img src={selectedAsset.qrCode} alt="QR" className="w-16 h-16 rounded bg-white p-1 shadow-md shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-slate-100">QR Asset Tag Verified</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Scan at loading dock for instant check-in/out.</p>
              </div>
            </div>

            {/* Toggle Check Out */}
            <button
              onClick={() => handleToggleCheckOut(selectedAsset)}
              className="w-full glass-btn-amber font-bold py-2.5 rounded-xl text-xs transition-all shadow-lg"
            >
              {selectedAsset.status === 'In Use' ? 'Check In to Warehouse' : 'Check Out for Operations'}
            </button>

            {/* History Log */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-display">Asset Activity History</h5>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedAsset.history.map((h, idx) => (
                  <div key={idx} className="p-2 glass-card rounded-lg text-[11px]">
                    <p className="text-slate-200 font-medium">{h.action}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{h.user} • {h.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Register Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="glass-card rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-slate-100 font-display">Register New Inventory Asset</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-white/10 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ClayPaky Xtylos Laser Moving Head"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Category</label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-400"
                >
                  <option value="A/V Equipment" className="bg-slate-950 text-slate-100">A/V Equipment</option>
                  <option value="Lighting" className="bg-slate-950 text-slate-100">Lighting</option>
                  <option value="Staging" className="bg-slate-950 text-slate-100">Staging</option>
                  <option value="Furniture" className="bg-slate-950 text-slate-100">Furniture</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Estimated Value (SAR)</label>
                <input
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(Number(e.target.value))}
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
                  Register Hardware
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
