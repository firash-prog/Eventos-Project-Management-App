import React, { useState } from 'react';
import {
  Receipt,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Plus,
  Download,
  Sparkles,
  ShieldCheck,
  X,
} from 'lucide-react';
import { BudgetItem } from '../../types';

interface BudgetViewProps {
  budgets: BudgetItem[];
  onAddBudget: (newItem: BudgetItem) => void;
  onUpdateBudget: (updatedItem: BudgetItem) => void;
  onOpenCopilot: (prompt?: string) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budgets,
  onAddBudget,
  onUpdateBudget,
  onOpenCopilot,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form
  const [newCat, setNewCat] = useState('');
  const [newEventName, setNewEventName] = useState('Riyadh Season Royal Gala 2026');
  const [newEst, setNewEst] = useState(100000);

  const totalEst = budgets.reduce((sum, b) => sum + b.estimatedAmount, 0);
  const totalAct = budgets.reduce((sum, b) => sum + b.actualAmount, 0);
  const totalRemaining = totalEst - totalAct;

  const handleApprove = (item: BudgetItem) => {
    onUpdateBudget({ ...item, status: 'Approved' });
  };

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat) return;
    const created: BudgetItem = {
      id: `bdg-${Date.now()}`,
      category: newCat,
      description: 'Line item allocated from Command Center',
      eventName: newEventName,
      estimatedAmount: Number(newEst),
      actualAmount: Number(newEst),
      status: 'Pending',
      invoiceNumber: `INV-ZATCA-${Math.floor(1000 + Math.random() * 9000)}`,
      zatcaStatus: 'Compliant',
    };
    onAddBudget(created);
    setShowAddModal(false);
    setNewCat('');
  };

  const handleDownloadZatcaPdf = (item: BudgetItem) => {
    // Generate a simple simulated PDF / text download for ZATCA E-Invoice
    const content = `=====================================================
ZATCA E-INVOICE COMPLIANT RECEIPT
Invoice Number: ${item.invoiceNumber || 'INV-ZATCA-0001'}
Event: ${item.eventName}
Line Item: ${item.category}
Amount: SAR ${item.actualAmount.toLocaleString()}
ZATCA QR Code Status: ${item.zatcaStatus || 'Compliant'}
Issued By: Eventos Elite Operations KSA
=====================================================`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.invoiceNumber || 'ZATCA_Invoice'}.txt`;
    a.click();
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-100 font-display">
            Budget & ZATCA E-Invoicing
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Financial ledger, line item allocations, ZATCA tax invoice verification, and spend authorizations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              onOpenCopilot('Perform an AI financial audit on current actual spend vs estimated budget.')
            }
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/10"
          >
            <Sparkles className="w-4 h-4 fill-slate-950 stroke-none" />
            AI Financial Audit
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/10"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Add Expense Line
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-slate-400 font-medium">Total Budget Allocated</p>
          <p className="text-2xl font-black text-slate-100 mt-1 font-display">SAR {totalEst.toLocaleString()}</p>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-slate-400 font-medium">Actual Spent to Date</p>
          <p className="text-2xl font-black text-amber-300 mt-1 font-display">SAR {totalAct.toLocaleString()}</p>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-slate-400 font-medium">Remaining Liquidity</p>
          <p className="text-2xl font-black text-emerald-400 mt-1 font-display">SAR {totalRemaining.toLocaleString()}</p>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-slate-400 font-medium">ZATCA Compliant Invoices</p>
          <p className="text-2xl font-black text-slate-100 mt-1 flex items-center gap-1.5 font-display">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> 100%
          </p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-display">
            Line Item Expense Ledger
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-white/[0.04] backdrop-blur-md border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="p-4">Line Item & Event</th>
                <th className="p-4">Estimated</th>
                <th className="p-4">Actual Spend</th>
                <th className="p-4">Variance</th>
                <th className="p-4">Status</th>
                <th className="p-4">ZATCA Status</th>
                <th className="p-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {budgets.map((bdg) => {
                const variance = bdg.actualAmount - bdg.estimatedAmount;
                return (
                  <tr key={bdg.id} className="hover:bg-white/[0.05] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-100">{bdg.category}</div>
                      <div className="text-[10px] text-amber-300 font-medium">{bdg.eventName}</div>
                    </td>
                    <td className="p-4 text-slate-300">SAR {bdg.estimatedAmount.toLocaleString()}</td>
                    <td className="p-4 font-bold text-slate-100">SAR {bdg.actualAmount.toLocaleString()}</td>
                    <td className="p-4">
                      <span
                        className={`font-bold ${
                          variance > 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {variance > 0 ? `+SAR ${variance.toLocaleString()}` : 'On Target'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          bdg.status === 'Approved' || bdg.status === 'Paid'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {bdg.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded backdrop-blur-md">
                        <ShieldCheck className="w-3 h-3" /> {bdg.zatcaStatus || 'Compliant'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDownloadZatcaPdf(bdg)}
                        className="glass-btn text-amber-300 hover:text-amber-200 font-semibold px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1 ml-auto"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF Invoice
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Line Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="glass-card rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-slate-100 font-display">Add Line Item Allocation</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-white/10 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Category Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Holographic Projection Rigging"
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Associated Event</label>
                <select
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-400"
                >
                  <option value="Riyadh Season Royal Gala 2026" className="bg-slate-950 text-slate-100">Riyadh Season Royal Gala 2026</option>
                  <option value="Global AI & Tech Summit MENA" className="bg-slate-950 text-slate-100">Global AI & Tech Summit MENA</option>
                  <option value="Luxury Auto Expo & Launch" className="bg-slate-950 text-slate-100">Luxury Auto Expo & Launch</option>
                  <option value="Aramco Annual Energy & Future Forum" className="bg-slate-950 text-slate-100">Aramco Annual Energy & Future Forum</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Estimated Amount (SAR)</label>
                <input
                  type="number"
                  value={newEst}
                  onChange={(e) => setNewEst(Number(e.target.value))}
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
                  Add Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
