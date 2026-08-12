import React, { useState } from 'react';
import {
  Building2,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  FileText,
  X,
  UserCheck,
  Calendar,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { ClientDocument, RFQDocument } from '../../types';

interface ClientCRMViewProps {
  clients: ClientDocument[];
  rfqs: RFQDocument[];
  onAddClient: (newClient: Omit<ClientDocument, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onOpenNewRFQWithClient?: (clientId: string) => void;
  currentUserRole?: string;
  userDepartment?: string;
}

export const ClientCRMView: React.FC<ClientCRMViewProps> = ({
  clients,
  rfqs,
  onAddClient,
  onOpenNewRFQWithClient,
  currentUserRole,
  userDepartment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'NEW' | 'EXISTING'>('ALL');
  const [selectedClient, setSelectedClient] = useState<ClientDocument | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    clientType: 'NEW' as 'NEW' | 'EXISTING',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    commercialRegister: '',
    notes: '',
  });

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterType === 'ALL' || client.clientType === filterType;

    return matchesSearch && matchesFilter;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.contactPerson.trim()) return;

    onAddClient({
      name: formData.name.trim(),
      clientType: formData.clientType,
      contactPerson: formData.contactPerson.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      commercialRegister: formData.commercialRegister.trim(),
      notes: formData.notes.trim(),
      createdById: 'usr-current',
    });

    setFormData({
      name: '',
      clientType: 'NEW',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      commercialRegister: '',
      notes: '',
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              Phase 2 CRM
            </span>
            <span className="text-xs text-slate-400">Joudcon Client Directory</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-100 font-display mt-1">
            Client Accounts & History
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Manage corporate clients, CR registration data, and view RFQ history.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Register New Client
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search company, contact, phone, CR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/10 w-full sm:w-auto">
          {(['ALL', 'NEW', 'EXISTING'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === type
                  ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {type === 'ALL' ? 'All Clients' : type === 'NEW' ? 'New Clients' : 'Existing Clients'}
            </button>
          ))}
        </div>
      </div>

      {/* Client List Grid */}
      {filteredClients.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
          <Building2 className="w-10 h-10 text-slate-500" />
          <p className="text-base font-bold text-slate-200">No client records found</p>
          <p className="text-xs text-slate-400 max-w-sm">
            {searchQuery
              ? 'No client accounts match your search criteria.'
              : 'Register your first corporate client to link RFQ intake requests.'}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const clientRfqs = rfqs.filter((r) => r.clientId === client.id);

            return (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className="glass-card rounded-2xl p-5 border border-white/10 hover:border-indigo-500/40 cursor-pointer transition-all group hover:scale-[1.01] flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                          client.clientType === 'NEW'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {client.clientType} CLIENT
                      </span>
                      <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                        {client.name}
                      </h3>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-indigo-300 group-hover:border-indigo-500/40 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-200">{client.contactPerson}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    {client.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.commercialRegister && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                        <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>CR: {client.commercialRegister}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Linked RFQs</span>
                  <span className="font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                    {clientRfqs.length} Requests
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Client Detail Drawer / Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2 ${
                    selectedClient.clientType === 'NEW'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  {selectedClient.clientType} CLIENT
                </span>
                <h2 className="text-xl font-black text-slate-100 font-display">
                  {selectedClient.name}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Corporate Client Profile</p>
              </div>

              <button
                onClick={() => setSelectedClient(null)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Client Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3.5 space-y-1">
                <span className="text-slate-400 font-medium">Primary Contact</span>
                <p className="text-slate-100 font-bold">{selectedClient.contactPerson}</p>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3.5 space-y-1">
                <span className="text-slate-400 font-medium">Phone Number</span>
                <p className="text-slate-100 font-bold font-mono">{selectedClient.phone || 'N/A'}</p>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3.5 space-y-1">
                <span className="text-slate-400 font-medium">Email Address</span>
                <p className="text-slate-100 font-bold truncate">{selectedClient.email || 'N/A'}</p>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3.5 space-y-1">
                <span className="text-slate-400 font-medium">Commercial Register (CR/VAT)</span>
                <p className="text-amber-300 font-bold font-mono">
                  {selectedClient.commercialRegister || 'Not Registered'}
                </p>
              </div>

              {selectedClient.address && (
                <div className="sm:col-span-2 bg-white/[0.03] border border-white/10 rounded-xl p-3.5 space-y-1">
                  <span className="text-slate-400 font-medium">Office / Site Address</span>
                  <p className="text-slate-200">{selectedClient.address}</p>
                </div>
              )}

              {selectedClient.notes && (
                <div className="sm:col-span-2 bg-white/[0.03] border border-white/10 rounded-xl p-3.5 space-y-1">
                  <span className="text-slate-400 font-medium">Internal Relationship Notes</span>
                  <p className="text-slate-300 italic">{selectedClient.notes}</p>
                </div>
              )}
            </div>

            {/* Linked RFQs Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" /> Linked RFQ Requests
                </h3>
                {onOpenNewRFQWithClient && (
                  <button
                    onClick={() => {
                      const cid = selectedClient.id;
                      setSelectedClient(null);
                      onOpenNewRFQWithClient(cid);
                    }}
                    className="text-xs font-bold text-indigo-300 hover:text-indigo-200 flex items-center gap-1 bg-indigo-500/20 px-3 py-1 rounded-lg border border-indigo-500/30"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log New RFQ
                  </button>
                )}
              </div>

              {rfqs.filter((r) => r.clientId === selectedClient.id).length === 0 ? (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-center text-xs text-slate-400">
                  No RFQs logged for this client yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {rfqs
                    .filter((r) => r.clientId === selectedClient.id)
                    .map((rfq) => (
                      <div
                        key={rfq.id}
                        className="p-3 rounded-xl bg-slate-950/60 border border-white/10 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-300">{rfq.rfqNumber}</span>
                            <span className="text-slate-200 font-semibold">{rfq.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Received: {rfq.receivedDate} • {rfq.items.length} line items
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            rfq.status === 'ITEMS_SPLIT'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {rfq.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 hover:bg-white/20 text-xs font-bold transition-all"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl max-w-lg w-full shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h2 className="text-lg font-bold text-slate-100 font-display">
                  Register New Client
                </h2>
                <p className="text-xs text-slate-400">Add corporate client account to CRM database</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Company / Organization Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ministry of Culture / Aramco / Royal Protocol"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Client Type</label>
                  <select
                    value={formData.clientType}
                    onChange={(e) =>
                      setFormData({ ...formData, clientType: e.target.value as 'NEW' | 'EXISTING' })
                    }
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="NEW">New Client</option>
                    <option value="EXISTING">Existing Client</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Key contact representative"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+966 5X XXX XXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="contact@company.sa"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Commercial Register (CR/VAT Number)</label>
                <input
                  type="text"
                  placeholder="e.g. 2050XXXXXX"
                  value={formData.commercialRegister}
                  onChange={(e) => setFormData({ ...formData, commercialRegister: e.target.value })}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Address / Location</label>
                <input
                  type="text"
                  placeholder="City, District, KSA"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  placeholder="Special client payment terms or preference notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 hover:bg-white/20 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-600/25"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
