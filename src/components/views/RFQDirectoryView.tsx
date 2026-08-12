import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  Building2,
  User,
  Calendar,
  X,
  ChevronRight,
  Trash2,
  AlertCircle,
  Wrench,
  ShoppingBag,
  Send,
  HelpCircle,
} from 'lucide-react';
import { ClientDocument, RFQDocument, RFQLineItem, User as SystemUser } from '../../types';

interface RFQDirectoryViewProps {
  rfqs: RFQDocument[];
  clients: ClientDocument[];
  users: SystemUser[];
  onAddRFQ: (newRFQ: Omit<RFQDocument, 'id' | 'rfqNumber' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateRFQ: (updatedRFQ: RFQDocument) => void;
  onAddClientInline: (newClient: Omit<ClientDocument, 'id' | 'createdAt' | 'updatedAt'>) => ClientDocument;
  initialSelectedClientId?: string;
}

export const RFQDirectoryView: React.FC<RFQDirectoryViewProps> = ({
  rfqs,
  clients,
  users,
  onAddRFQ,
  onUpdateRFQ,
  onAddClientInline,
  initialSelectedClientId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'ALL' | 'RECEIVED' | 'PENDING_ITEM_SPLIT' | 'ITEMS_SPLIT' | 'IN_PRICING'
  >('ALL');
  const [selectedRFQ, setSelectedRFQ] = useState<RFQDocument | null>(null);
  const [isLogRFQModalOpen, setIsLogRFQModalOpen] = useState(!!initialSelectedClientId);

  // New RFQ Modal Form State
  const [rfqTitle, setRfqTitle] = useState('');
  const [selectedClientId, setSelectedClientId] = useState(initialSelectedClientId || '');
  const [isInlineClient, setIsInlineClient] = useState(false);
  const [inlineClientName, setInlineClientName] = useState('');
  const [inlineContactPerson, setInlineContactPerson] = useState('');
  const [inlinePhone, setInlinePhone] = useState('');
  const [inlineEmail, setInlineEmail] = useState('');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [receivedByUid, setReceivedByUid] = useState(users[0]?.id || 'usr-ceo');
  const [rawDetails, setRawDetails] = useState('');

  // Line items state in intake form
  const [formItems, setFormItems] = useState<
    Array<{ title: string; description: string; quantity: number; unit: string }>
  >([
    { title: 'Main Stage Backboard & Carpentry', description: 'CNC routed wood paneling with matte paint finish', quantity: 1, unit: 'lump_sum' },
    { title: 'LED Screen Trussing & Mounting', description: 'Outdoor heavy-duty ground support structure', quantity: 1, unit: 'set' },
  ]);

  // Selected RFQ Editing Items state for splitting workbench
  const [editingItems, setEditingItems] = useState<RFQLineItem[]>([]);

  const handleOpenRFQDetail = (rfq: RFQDocument) => {
    setSelectedRFQ(rfq);
    setEditingItems(JSON.parse(JSON.stringify(rfq.items)));
  };

  const handleAddItemRow = () => {
    setFormItems([
      ...formItems,
      { title: '', description: '', quantity: 1, unit: 'pcs' },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  const handleCreateRFQSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetClientId = selectedClientId;
    let targetClientName = clients.find((c) => c.id === selectedClientId)?.name || 'Direct Client';

    if (isInlineClient) {
      if (!inlineClientName.trim() || !inlineContactPerson.trim()) return;
      const createdClient = onAddClientInline({
        name: inlineClientName.trim(),
        clientType: 'NEW',
        contactPerson: inlineContactPerson.trim(),
        phone: inlinePhone.trim(),
        email: inlineEmail.trim(),
        createdById: receivedByUid,
      });
      targetClientId = createdClient.id;
      targetClientName = createdClient.name;
    }

    if (!targetClientId || !rfqTitle.trim()) return;

    const handlerUser = users.find((u) => u.id === receivedByUid);

    const initialLineItems: RFQLineItem[] = formItems
      .filter((fi) => fi.title.trim())
      .map((fi, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        title: fi.title.trim(),
        description: fi.description.trim(),
        quantity: Number(fi.quantity) || 1,
        unit: fi.unit || 'pcs',
        type: 'UNASSIGNED',
      }));

    onAddRFQ({
      clientId: targetClientId,
      clientName: targetClientName,
      title: rfqTitle.trim(),
      receivedDate,
      receivedByUid,
      receivedByName: handlerUser ? handlerUser.name : 'Executive Office',
      rawDetails: rawDetails.trim(),
      status: initialLineItems.length > 0 ? 'PENDING_ITEM_SPLIT' : 'RECEIVED',
      assignedPricerUids: [],
      items: initialLineItems,
      createdById: receivedByUid,
    });

    // Reset Form
    setRfqTitle('');
    setRawDetails('');
    setIsLogRFQModalOpen(false);
  };

  const handleSaveItemSplits = () => {
    if (!selectedRFQ) return;

    // Collect pricers
    const pricerUids = new Set<string>();
    editingItems.forEach((item) => {
      if (item.assignedUserUid) {
        pricerUids.add(item.assignedUserUid);
      }
    });

    const allSplit = editingItems.every((item) => item.type !== 'UNASSIGNED');

    const updatedRFQ: RFQDocument = {
      ...selectedRFQ,
      items: editingItems,
      assignedPricerUids: Array.from(pricerUids),
      status: allSplit ? 'ITEMS_SPLIT' : 'PENDING_ITEM_SPLIT',
      updatedAt: new Date().toISOString(),
    };

    onUpdateRFQ(updatedRFQ);
    setSelectedRFQ(updatedRFQ);
  };

  const filteredRFQs = rfqs.filter((rfq) => {
    const matchesSearch =
      rfq.rfqNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.clientName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'ALL' || rfq.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              RFQ Intake & Item Split
            </span>
            <span className="text-xs text-slate-400">Step 1 RFQ Processing</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-100 font-display mt-1">
            RFQ Directory & Item Allocation
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Log raw client RFQs and split line items into Joudcon Factory in-house vs subcontracted execution.
          </p>
        </div>

        <button
          onClick={() => setIsLogRFQModalOpen(true)}
          className="glass-btn-amber font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Log New Client RFQ
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search RFQ #, title, client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/10 overflow-x-auto w-full sm:w-auto">
          {(['ALL', 'RECEIVED', 'PENDING_ITEM_SPLIT', 'ITEMS_SPLIT'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-amber-500/30 text-amber-200 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {status === 'ALL'
                ? 'All RFQs'
                : status === 'RECEIVED'
                ? 'Received'
                : status === 'PENDING_ITEM_SPLIT'
                ? 'Pending Split'
                : 'Items Split'}
            </button>
          ))}
        </div>
      </div>

      {/* RFQ Cards Grid */}
      {filteredRFQs.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
          <FileSpreadsheet className="w-10 h-10 text-slate-500" />
          <p className="text-base font-bold text-slate-200">No RFQs logged in directory</p>
          <p className="text-xs text-slate-400 max-w-sm">
            {searchQuery
              ? 'No RFQ requests match your active query filters.'
              : 'Log an intake request when a client submits an RFQ or tender.'}
          </p>
          <button
            onClick={() => setIsLogRFQModalOpen(true)}
            className="mt-2 glass-btn-amber font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Log RFQ Request
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRFQs.map((rfq) => {
            const inHouseCount = rfq.items.filter((i) => i.type === 'IN_HOUSE').length;
            const subCount = rfq.items.filter((i) => i.type === 'SUBCONTRACTED').length;
            const unassignedCount = rfq.items.filter((i) => i.type === 'UNASSIGNED').length;

            return (
              <div
                key={rfq.id}
                onClick={() => handleOpenRFQDetail(rfq)}
                className="glass-card rounded-2xl p-5 border border-white/10 hover:border-amber-500/40 cursor-pointer transition-all group hover:scale-[1.005] space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-amber-300">{rfq.rfqNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          rfq.status === 'ITEMS_SPLIT'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : rfq.status === 'PENDING_ITEM_SPLIT'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-white/10 text-slate-300 border border-white/15'
                        }`}
                      >
                        {rfq.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                      {rfq.title}
                    </h3>
                    <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" /> {rfq.clientName}
                    </p>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-amber-300 group-hover:border-amber-500/40 transition-all shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Info metadata bar */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/50 p-2.5 rounded-xl border border-white/5">
                  <div className="text-slate-400">
                    Received: <span className="text-slate-200 font-semibold">{rfq.receivedDate}</span>
                  </div>
                  <div className="text-slate-400">
                    Handler: <span className="text-slate-200 font-semibold">{rfq.receivedByName}</span>
                  </div>
                </div>

                {/* Item Split Summary Pills */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{rfq.items.length} Total Items</span>
                  <div className="flex items-center gap-2">
                    {inHouseCount > 0 && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                        <Wrench className="w-3 h-3" /> {inHouseCount} Workshop
                      </span>
                    )}
                    {subCount > 0 && (
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold text-[10px] flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3" /> {subCount} Subcontracted
                      </span>
                    )}
                    {unassignedCount > 0 && (
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold text-[10px]">
                        {unassignedCount} Unassigned
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RFQ Detail & Item Splitting Workbench Modal */}
      {selectedRFQ && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-amber-300">{selectedRFQ.rfqNumber}</span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {selectedRFQ.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-100 font-display">
                  {selectedRFQ.title}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Client: <span className="font-bold text-indigo-300">{selectedRFQ.clientName}</span> • Received: {selectedRFQ.receivedDate} by {selectedRFQ.receivedByName}
                </p>
              </div>

              <button
                onClick={() => setSelectedRFQ(null)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scope details */}
            {selectedRFQ.rawDetails && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-1 text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Raw Client RFQ Scope & Requirements</span>
                <p className="text-slate-200 whitespace-pre-wrap">{selectedRFQ.rawDetails}</p>
              </div>
            )}

            {/* Finance Item Splitting Workbench */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" /> Finance Item Splitting Workbench
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Split each line item into Joudcon Factory in-house production or subcontracted procurement.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingItems([
                        ...editingItems,
                        {
                          id: `item-${Date.now()}`,
                          title: 'New Item Requirement',
                          description: '',
                          quantity: 1,
                          unit: 'pcs',
                          type: 'UNASSIGNED',
                        },
                      ]);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Line Item
                  </button>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-950/60">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">Line Item Description</th>
                        <th className="p-3 w-28">Qty & Unit</th>
                        <th className="p-3 w-40">Execution Type</th>
                        <th className="p-3 w-36">Category</th>
                        <th className="p-3 w-40">Responsible Lead</th>
                        <th className="p-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-200">
                      {editingItems.map((item, index) => (
                        <tr key={item.id} className="hover:bg-white/[0.02]">
                          <td className="p-3 space-y-1">
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const updated = [...editingItems];
                                updated[index].title = e.target.value;
                                setEditingItems(updated);
                              }}
                              className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
                            />
                            <input
                              type="text"
                              placeholder="Specification notes..."
                              value={item.description}
                              onChange={(e) => {
                                const updated = [...editingItems];
                                updated[index].description = e.target.value;
                                setEditingItems(updated);
                              }}
                              className="w-full bg-slate-900/60 border border-white/5 rounded-lg px-2.5 py-1 text-[11px] text-slate-400 focus:outline-none focus:border-amber-500"
                            />
                          </td>

                          <td className="p-3 align-top">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => {
                                  const updated = [...editingItems];
                                  updated[index].quantity = Number(e.target.value);
                                  setEditingItems(updated);
                                }}
                                className="w-14 bg-slate-900 border border-white/10 rounded-lg p-1 text-center text-xs text-slate-100 focus:outline-none"
                              />
                              <span className="text-[11px] text-slate-400">{item.unit}</span>
                            </div>
                          </td>

                          <td className="p-3 align-top">
                            <select
                              value={item.type}
                              onChange={(e) => {
                                const updated = [...editingItems];
                                updated[index].type = e.target.value as RFQLineItem['type'];
                                if (e.target.value === 'IN_HOUSE') {
                                  updated[index].assignedDept = 'PRODUCTION';
                                  const prodLead = users.find((u) => u.department === 'Production' || u.role === 'Operations Manager');
                                  if (prodLead) {
                                    updated[index].assignedUserUid = prodLead.id;
                                    updated[index].assignedUserName = prodLead.name;
                                  }
                                } else if (e.target.value === 'SUBCONTRACTED') {
                                  updated[index].assignedDept = 'PROCUREMENT';
                                  const procUser = users.find((u) => u.department === 'Procurement');
                                  if (procUser) {
                                    updated[index].assignedUserUid = procUser.id;
                                    updated[index].assignedUserName = procUser.name;
                                  }
                                }
                                setEditingItems(updated);
                              }}
                              className={`w-full border rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none ${
                                item.type === 'IN_HOUSE'
                                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                                  : item.type === 'SUBCONTRACTED'
                                  ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300'
                                  : 'bg-slate-900 border-white/15 text-slate-400'
                              }`}
                            >
                              <option value="UNASSIGNED">Unassigned</option>
                              <option value="IN_HOUSE">In-House (Joudcon Factory)</option>
                              <option value="SUBCONTRACTED">Subcontracted (Outsourced)</option>
                            </select>
                          </td>

                          <td className="p-3 align-top">
                            <select
                              value={item.category || 'FABRICATION'}
                              onChange={(e) => {
                                const updated = [...editingItems];
                                updated[index].category = e.target.value as RFQLineItem['category'];
                                setEditingItems(updated);
                              }}
                              className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                            >
                              <option value="CARPENTRY">Carpentry</option>
                              <option value="PAINTING">Painting</option>
                              <option value="FABRICATION">Fabrication</option>
                              <option value="AV">A/V Equipment</option>
                              <option value="LIGHTING">Lighting</option>
                              <option value="MANPOWER">Manpower</option>
                              <option value="LOGISTICS">Logistics</option>
                              <option value="OTHER">Other</option>
                            </select>
                          </td>

                          <td className="p-3 align-top">
                            <select
                              value={item.assignedUserUid || ''}
                              onChange={(e) => {
                                const updated = [...editingItems];
                                updated[index].assignedUserUid = e.target.value;
                                const matchedUser = users.find((u) => u.id === e.target.value);
                                updated[index].assignedUserName = matchedUser ? matchedUser.name : '';
                                setEditingItems(updated);
                              }}
                              className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                            >
                              <option value="">Select Pricer Lead</option>
                              {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.name} ({u.department})
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="p-3 align-top text-center">
                            <button
                              onClick={() => {
                                setEditingItems(editingItems.filter((_, i) => i !== index));
                              }}
                              className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Phase 3 Notice Note */}
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Phase 2 Scope:</strong> Items are split into in-house vs subcontracted execution. Cost sheets, raw pricing input, and CEO profit margin approval loops will be unlocked in Phase 3.
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {editingItems.filter((i) => i.type !== 'UNASSIGNED').length} / {editingItems.length} items categorized
              </span>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedRFQ(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 hover:bg-white/20 text-xs font-bold transition-all"
                >
                  Close
                </button>
                <button
                  onClick={handleSaveItemSplits}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/25 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save Item Splitting State
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log New RFQ Intake Modal */}
      {isLogRFQModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h2 className="text-lg font-bold text-slate-100 font-display">
                  Log Client RFQ Intake
                </h2>
                <p className="text-xs text-slate-400">Record incoming client RFQ before item splitting</p>
              </div>
              <button
                onClick={() => setIsLogRFQModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRFQSubmit} className="space-y-4 text-xs">
              {/* Event / RFQ Title */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">RFQ Title / Event Scope Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Riyadh Season VIP Pavilion Fabrication & AV"
                  value={rfqTitle}
                  onChange={(e) => setRfqTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Client Selection vs Inline Creation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-medium">Select Corporate Client *</label>
                  <button
                    type="button"
                    onClick={() => setIsInlineClient(!isInlineClient)}
                    className="text-amber-400 font-bold text-[11px] hover:underline"
                  >
                    {isInlineClient ? '← Select Existing Client' : '+ Create New Client Inline'}
                  </button>
                </div>

                {!isInlineClient ? (
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Choose Client --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.contactPerson})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-3">
                    <p className="text-[11px] text-amber-300 font-bold">New Inline Client Account Details</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          required={isInlineClient}
                          placeholder="Company Name *"
                          value={inlineClientName}
                          onChange={(e) => setInlineClientName(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-slate-200 placeholder-slate-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          required={isInlineClient}
                          placeholder="Contact Person *"
                          value={inlineContactPerson}
                          onChange={(e) => setInlineContactPerson(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-slate-200 placeholder-slate-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Phone Number"
                          value={inlinePhone}
                          onChange={(e) => setInlinePhone(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-slate-200 placeholder-slate-500 focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={inlineEmail}
                          onChange={(e) => setInlineEmail(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-slate-200 placeholder-slate-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Handler & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Date Received</label>
                  <input
                    type="date"
                    value={receivedDate}
                    onChange={(e) => setReceivedDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Received By (Intake Handler)</label>
                  <select
                    value={receivedByUid}
                    onChange={(e) => setReceivedByUid(e.target.value)}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Raw Requirements Scope */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Raw Request / Scope Description</label>
                <textarea
                  rows={3}
                  placeholder="Paste raw email details or RFQ breakdown received from client..."
                  value={rawDetails}
                  onChange={(e) => setRawDetails(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Initial Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-medium">Initial Line Items</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-amber-400 font-bold text-[11px] flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3 h-3" /> Add Item Row
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {formItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-white/10">
                      <input
                        type="text"
                        placeholder="Item title (e.g. Wooden Archway)"
                        value={item.title}
                        onChange={(e) => {
                          const updated = [...formItems];
                          updated[idx].title = e.target.value;
                          setFormItems(updated);
                        }}
                        className="flex-1 bg-transparent text-slate-100 font-medium focus:outline-none"
                      />
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...formItems];
                          updated[idx].quantity = Number(e.target.value);
                          setFormItems(updated);
                        }}
                        className="w-14 bg-slate-900 border border-white/10 rounded px-1.5 py-0.5 text-center text-slate-200"
                      />
                      <select
                        value={item.unit}
                        onChange={(e) => {
                          const updated = [...formItems];
                          updated[idx].unit = e.target.value;
                          setFormItems(updated);
                        }}
                        className="bg-slate-900 border border-white/10 rounded px-1.5 py-0.5 text-slate-300 text-[11px]"
                      >
                        <option value="pcs">pcs</option>
                        <option value="m2">m2</option>
                        <option value="set">set</option>
                        <option value="lump_sum">lump_sum</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogRFQModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 hover:bg-white/20 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glass-btn-amber font-bold px-5 py-2 rounded-xl transition-all shadow-lg flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Save & Log RFQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
