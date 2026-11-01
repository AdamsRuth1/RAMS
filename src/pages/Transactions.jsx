import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Search, Download, X, History, Eye, Printer } from 'lucide-react';
import { format } from 'date-fns';

const PAGE_SIZE = 10;

function TypeBadge({ type }) {
  if (type === 'Issue') return <span className="badge-issued">Issued</span>;
  if (type === 'Return') return <span className="badge-returned">Returned</span>;
  if (type === 'Register') return <span className="badge-available">Registered</span>;
  return <span className="badge-maintenance">{type}</span>;
}

export default function Transactions() {
  const { transactions, soldiers } = useStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterRank, setFilterRank] = useState('All Ranks');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  // Modal to preview actual photo and full transaction slip
  const [previewTx, setPreviewTx] = useState(null);

  const filtered = transactions.filter((t) => {
    const soldier = soldiers.find((s) => s.id === t.soldierId);
    const matchSearch =
      !search ||
      t.soldierName?.toLowerCase().includes(search.toLowerCase()) ||
      t.soldierArmyNo?.toLowerCase().includes(search.toLowerCase()) ||
      (t.radioSerial || '').toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'All' || t.type === filterType;
    const rank = t.soldierRank || soldier?.rank;
    const matchRank = filterRank === 'All Ranks' || rank === filterRank;
    const matchDate =
      (!startDate || new Date(t.timestamp) >= new Date(startDate)) &&
      (!endDate || new Date(t.timestamp) <= new Date(endDate + 'T23:59:59'));
    return matchSearch && matchType && matchRank && matchDate;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getPhotoForTx = (tx) => {
    if (tx.soldierPhoto) return tx.soldierPhoto;
    if (tx.photo) return tx.photo;
    const s = soldiers.find((sol) => sol.id === tx.soldierId);
    if (s?.photo) return s.photo;
    return '/soldiers/soldier1.jpg';
  };

  const exportCSV = () => {
    const header = 'Date & Time,Soldier Name,Army No,Radio Serial No,Qty Radios Signed,Action,Condition,Processed By\n';
    const rows = filtered.map((t) => {
      const dateStr = format(new Date(t.timestamp), 'dd/MM/yyyy HH:mm');
      const qty = t.quantity !== undefined ? t.quantity : 1;
      return `"${dateStr}","${t.soldierName}","${t.soldierArmyNo}","${t.radioSerial || '—'}",${qty},"${t.type}","${t.condition || 'Serviceable'}","${t.processedBy}"`;
    }).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white font-bold text-2xl flex items-center gap-2">
            <History size={24} className="text-army-light" /> Transaction History
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Complete record with actual soldier biometric photos, radio serial numbers, and signed quantities.
          </p>
        </div>
        <button onClick={exportCSV} className="btn-primary">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="form-input w-auto text-xs"
            title="Filter Start Date"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="form-input w-auto text-xs"
            title="Filter End Date"
          />
        </div>
        <select
          value={filterRank}
          onChange={(e) => { setFilterRank(e.target.value); setPage(1); }}
          className="form-select w-auto text-xs"
        >
          <option>All Ranks</option>
          <option>Pte</option>
          <option>Cpl</option>
          <option>Sgt</option>
          <option>SSgt</option>
          <option>Lt</option>
          <option>Capt</option>
          <option>Maj</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          className="form-select w-auto text-xs"
        >
          <option value="All">All Actions</option>
          <option value="Issue">Issue</option>
          <option value="Return">Return</option>
          <option value="Register">Register</option>
        </select>

        {(search || filterType !== 'All' || filterRank !== 'All Ranks' || startDate || endDate) && (
          <button
            onClick={() => {
              setSearch('');
              setFilterType('All');
              setFilterRank('All Ranks');
              setStartDate('');
              setEndDate('');
              setPage(1);
            }}
            className="btn-secondary text-xs"
          >
            <X size={12} /> Clear Filters
          </button>
        )}

        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by soldier name, army no, or radio serial..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="form-input pl-10 text-xs"
          />
        </div>
      </div>

      {/* Main Table with Prominent Actual Soldier Photos */}
      <div className="card p-0 overflow-hidden shadow-xl border border-green-900/60">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header whitespace-nowrap">Date &amp; Time</th>
                <th className="table-header whitespace-nowrap">Actual Photo</th>
                <th className="table-header whitespace-nowrap">Soldier Details</th>
                <th className="table-header whitespace-nowrap">Radio Serial No.</th>
                <th className="table-header whitespace-nowrap text-center">Qty Signed</th>
                <th className="table-header whitespace-nowrap">Action</th>
                <th className="table-header whitespace-nowrap">Condition</th>
                <th className="table-header whitespace-nowrap">Processed By</th>
                <th className="table-header whitespace-nowrap text-center">Details</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((t) => {
                const photoSrc = getPhotoForTx(t);
                const soldier = soldiers.find((s) => s.id === t.soldierId);
                const displayRank = t.soldierRank || soldier?.rank || 'Pte';
                const displayQty = t.quantity !== undefined ? t.quantity : (t.type === 'Register' ? 0 : 1);

                return (
                  <tr key={t.id} className="table-row hover:bg-[#0f2e13]/60 transition-colors">
                    {/* Date & Time */}
                    <td className="table-cell whitespace-nowrap text-gray-300">
                      <span className="font-medium text-white block">
                        {format(new Date(t.timestamp), 'dd MMM yyyy')}
                      </span>
                      <span className="text-gray-500 text-xs font-mono">
                        {format(new Date(t.timestamp), 'HH:mm:ss')}
                      </span>
                    </td>

                    {/* Prominent Actual Soldier Photo */}
                    <td className="table-cell">
                      <div
                        className="relative group cursor-pointer w-12 h-14 rounded-lg overflow-hidden border-2 border-green-800/80 hover:border-gold transition-all shadow"
                        onClick={() => setPreviewTx(t)}
                        title="Click to view full photo"
                      >
                        <img
                          src={photoSrc}
                          alt={t.soldierName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye size={14} className="text-white" />
                        </div>
                      </div>
                    </td>

                    {/* Soldier Details */}
                    <td className="table-cell">
                      <div>
                        <p className="text-white font-semibold text-sm">{t.soldierName}</p>
                        <p className="text-gold font-mono text-xs">{t.soldierArmyNo}</p>
                        <p className="text-gray-400 text-[11px]">{displayRank} {soldier?.unit ? `· ${soldier.unit}` : ''}</p>
                      </div>
                    </td>

                    {/* Radio Serial No. */}
                    <td className="table-cell">
                      {t.radioSerial ? (
                        <span className="text-army-light font-mono font-bold text-sm bg-army-darkest/60 px-2 py-1 rounded border border-green-900/60 inline-block">
                          {t.radioSerial}
                        </span>
                      ) : (
                        <span className="text-gray-600 font-mono text-xs">—</span>
                      )}
                    </td>

                    {/* Quantity Signed */}
                    <td className="table-cell text-center">
                      {t.type === 'Register' ? (
                        <span className="text-gray-600 text-xs">—</span>
                      ) : (
                        <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-bold bg-[#143618] text-white border border-green-700/60 font-mono">
                          {displayQty}
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="table-cell">
                      <TypeBadge type={t.type} />
                    </td>

                    {/* Condition */}
                    <td className="table-cell">
                      {t.condition ? (
                        <span className={`text-xs ${t.condition === 'Faulty' ? 'text-red-400' : 'text-gray-300'}`}>
                          {t.condition}
                        </span>
                      ) : (
                        <span className="text-gray-600 text-xs">—</span>
                      )}
                    </td>

                    {/* Processed By */}
                    <td className="table-cell text-gray-300 text-xs font-medium">
                      {t.processedBy}
                    </td>

                    {/* Details Button */}
                    <td className="table-cell text-center">
                      <button
                        onClick={() => setPreviewTx(t)}
                        className="text-army-light hover:text-white text-xs inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0d2610] hover:bg-[#1a4a1f] border border-green-900 transition-colors"
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={9} className="table-cell text-center text-gray-500 py-16">
                    No transactions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800 bg-[#0a1b0c]">
          <p className="text-gray-400 text-xs">
            Showing {filtered.length === 0 ? 0 : Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} transactions
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="w-8 h-8 rounded border border-gray-700 text-gray-400 hover:bg-[#1a2e1a] disabled:opacity-30 text-xs flex items-center justify-center"
            >
              «
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded border text-xs flex items-center justify-center transition-colors ${
                    p === page
                      ? 'bg-army-medium border-army-medium text-white font-bold'
                      : 'border-gray-700 text-gray-400 hover:bg-[#1a2e1a]'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages || totalPages === 0}
              className="w-8 h-8 rounded border border-gray-700 text-gray-400 hover:bg-[#1a2e1a] disabled:opacity-30 text-xs flex items-center justify-center"
            >
              »
            </button>
          </div>
        </div>
      </div>

      {/* POPUP MODAL: FULL TRANSACTION & SOLDIER PHOTO PREVIEW */}
      {previewTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="card w-full max-w-lg border border-green-700/60 bg-[#0c2210] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-green-800/80 pb-3">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <History size={18} className="text-army-light" />
                Transaction Voucher &amp; Photo Record
              </h3>
              <button
                onClick={() => setPreviewTx(null)}
                className="w-7 h-7 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Actual Soldier Photo */}
              <div className="sm:col-span-5 flex flex-col items-center">
                <div className="relative">
                  <img
                    src={getPhotoForTx(previewTx)}
                    alt={previewTx.soldierName}
                    className="w-36 h-44 object-cover rounded-xl border-2 border-gold shadow-xl"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-[10px] text-green-400 font-mono">
                    Stored in DB
                  </span>
                </div>
                <p className="text-gray-400 text-xs mt-2 text-center">Actual Captured Photo</p>
              </div>

              {/* Transaction details */}
              <div className="sm:col-span-7 space-y-2.5 text-sm">
                <div>
                  <span className="text-gray-400 text-xs block">Soldier Name:</span>
                  <span className="text-white font-bold text-base">{previewTx.soldierName}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block">Army Number:</span>
                  <span className="text-gold font-mono font-semibold">{previewTx.soldierArmyNo}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-400 text-xs block">Action:</span>
                    <TypeBadge type={previewTx.type} />
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">Radios Signed:</span>
                    <span className="text-white font-mono font-bold">
                      {previewTx.quantity !== undefined ? previewTx.quantity : 1}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block">Radio Serial Number(s):</span>
                  <span className="text-army-light font-mono font-bold block">
                    {previewTx.radioSerial || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block">Timestamp:</span>
                  <span className="text-gray-200 text-xs font-mono">
                    {format(new Date(previewTx.timestamp), 'dd MMMM yyyy, HH:mm:ss')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block">Processed by:</span>
                  <span className="text-gray-300 font-medium">{previewTx.processedBy}</span>
                </div>
                {previewTx.notes && (
                  <div>
                    <span className="text-gray-400 text-xs block">Notes:</span>
                    <span className="text-gray-300 text-xs italic">{previewTx.notes}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-green-800/80">
              <button
                onClick={() => setPreviewTx(null)}
                className="flex-1 btn-secondary justify-center py-2 text-xs"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="btn-primary px-4 py-2 text-xs"
              >
                <Printer size={14} /> Print Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
