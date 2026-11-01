import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Plus, Eye, Trash2, Radio, Filter, X } from 'lucide-react';
import { format } from 'date-fns';

const RADIO_TYPES = ['Motorola GP338', 'Kenwood TK-3401', 'Icom IC-F4003', 'Hytera PD405', 'Other'];
const PAGE_SIZE = 10;

function StatusBadge({ status }) {
  if (status === 'Available') return <span className="badge-available">Available</span>;
  if (status === 'Issued') return <span className="badge-issued">Issued</span>;
  return <span className="badge-maintenance">Maintenance</span>;
}

export default function RadioRegister() {
  const { radios, soldiers, addRadio, deleteRadio } = useStore();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filterRank, setFilterRank] = useState('All Status');
  const [filterType, setFilterType] = useState('All Radios');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [newRadio, setNewRadio] = useState({ serialNo: '', type: 'Motorola GP338', frequency: 'VHF', condition: 'Serviceable' });

  const filtered = radios.filter((r) => {
    const matchSearch =
      !search ||
      r.serialNo.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterRank === 'All Status' || r.status === filterRank;
    const matchType = filterType === 'All Radios' || r.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAddRadio = () => {
    if (!newRadio.serialNo) return;
    addRadio(newRadio);
    setNewRadio({ serialNo: '', type: 'Motorola GP338', frequency: 'VHF', condition: 'Serviceable' });
    setShowAdd(false);
  };

  const exportCSV = () => {
    const header = 'S/N,Serial No,Type,Frequency,Condition,Status,Issued To,Date Signed Out\n';
    const rows = filtered.map((r, i) => {
      const s = r.issuedTo ? soldiers.find((sol) => sol.id === r.issuedTo) : null;
      return `${i + 1},${r.serialNo},${r.type},${r.frequency},${r.condition},${r.status},${s?.name || ''},${r.issuedDate ? format(new Date(r.issuedDate), 'dd/MM/yyyy HH:mm') : ''}`;
    }).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'radio-register.csv'; a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-white font-bold text-2xl flex items-center gap-2">
            <Radio size={24} className="text-army-light" /> Radio Issue Register
          </h1>
          <p className="text-gray-400 text-sm">View all radios, current holders and status</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-primary">
            <Download size={16} /> Export
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-secondary">
            <Plus size={16} /> Add Radio
          </button>
        </div>
      </div>

      {/* Add Radio Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="card w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Add New Radio</h2>
              <button onClick={() => setShowAdd(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="form-label">Serial Number *</label>
                <input value={newRadio.serialNo} onChange={(e) => setNewRadio({ ...newRadio, serialNo: e.target.value })} placeholder="e.g. RAD-120" className="form-input" />
              </div>
              <div>
                <label className="form-label">Radio Type</label>
                <select value={newRadio.type} onChange={(e) => setNewRadio({ ...newRadio, type: e.target.value })} className="form-select">
                  {RADIO_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Frequency</label>
                <select value={newRadio.frequency} onChange={(e) => setNewRadio({ ...newRadio, frequency: e.target.value })} className="form-select">
                  <option>VHF</option><option>UHF</option><option>HF</option>
                </select>
              </div>
              <div>
                <label className="form-label">Condition</label>
                <select value={newRadio.condition} onChange={(e) => setNewRadio({ ...newRadio, condition: e.target.value })} className="form-select">
                  <option>Serviceable</option><option>Faulty</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowAdd(false)} className="flex-1 btn-secondary justify-center">Cancel</button>
              <button onClick={handleAddRadio} className="flex-1 btn-primary justify-center">Add Radio</button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, army number or serial number..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="form-input pl-10"
          />
        </div>
        <select value={filterRank} onChange={(e) => { setFilterRank(e.target.value); setPage(1); }} className="form-select w-auto">
          <option>All Status</option>
          <option>Available</option>
          <option>Issued</option>
          <option>Under Maintenance</option>
        </select>
        <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }} className="form-select w-auto">
          <option>All Radios</option>
          {RADIO_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        {(search || filterRank !== 'All Status' || filterType !== 'All Radios') && (
          <button
            onClick={() => { setSearch(''); setFilterRank('All Status'); setFilterType('All Radios'); setPage(1); }}
            className="btn-secondary"
          >
            <X size={14} /> Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['S/N', 'Photo', 'Name / Army No.', 'Rank', 'Radio Serial No.', 'Sign Out', 'Date Signed Out', 'Date Returned', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="table-header whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((radio, i) => {
                const soldier = radio.issuedTo ? soldiers.find((s) => s.id === radio.issuedTo) : null;
                const rowNum = (page - 1) * PAGE_SIZE + i + 1;
                return (
                  <tr key={radio.id} className="table-row">
                    <td className="table-cell text-gray-500 w-10">{rowNum}</td>
                    <td className="table-cell">
                      {soldier?.photo ? (
                        <img src={soldier.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : soldier ? (
                        <div className="w-8 h-8 rounded-full bg-army-medium flex items-center justify-center text-white text-xs font-bold">
                          {soldier.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                          <Radio size={14} className="text-gray-500" />
                        </div>
                      )}
                    </td>
                    <td className="table-cell">
                      {soldier ? (
                        <div>
                          <p className="text-white font-medium text-sm">{soldier.name}</p>
                          <p className="text-gray-500 text-xs">{soldier.armyNo}</p>
                        </div>
                      ) : <span className="text-gray-600">—</span>}
                    </td>
                    <td className="table-cell text-gray-300">{soldier?.rank || '—'}</td>
                    <td className="table-cell">
                      <span className="text-army-light font-mono text-sm">{radio.serialNo}</span>
                    </td>
                    <td className="table-cell">
                      {radio.status === 'Issued' ? (
                        <span className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white text-xs">✓</span>
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-red-900 flex items-center justify-center text-red-400 text-xs">✕</span>
                      )}
                    </td>
                    <td className="table-cell text-gray-300 whitespace-nowrap">
                      {radio.issuedDate ? format(new Date(radio.issuedDate), 'dd MMM yyyy HH:mm') : '—'}
                    </td>
                    <td className="table-cell text-gray-300 whitespace-nowrap">
                      {radio.returnDate ? format(new Date(radio.returnDate), 'dd MMM yyyy HH:mm') : '—'}
                    </td>
                    <td className="table-cell"><StatusBadge status={radio.status} /></td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button
                          onClick={() => soldier && navigate(`/soldier/${soldier.id}`)}
                          disabled={!soldier}
                          className="text-army-light hover:text-white text-xs flex items-center gap-1 disabled:opacity-30"
                        >
                          <Eye size={14} /> View
                        </button>
                        <button
                          onClick={() => { if (window.confirm('Delete this radio?')) deleteRadio(radio.id); }}
                          className="text-red-500 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={10} className="table-cell text-center text-gray-500 py-12">
                    No radios found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
          <p className="text-gray-500 text-xs">
            Showing {Math.min((page-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length} records
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="w-8 h-8 rounded border border-gray-700 text-gray-400 hover:bg-[#1a2e1a] disabled:opacity-30 text-xs"
            >«</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded border text-xs ${p === page ? 'bg-army-medium border-army-medium text-white' : 'border-gray-700 text-gray-400 hover:bg-[#1a2e1a]'}`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages || totalPages === 0}
              className="w-8 h-8 rounded border border-gray-700 text-gray-400 hover:bg-[#1a2e1a] disabled:opacity-30 text-xs"
            >»</button>
          </div>
        </div>
      </div>
    </div>
  );
}
