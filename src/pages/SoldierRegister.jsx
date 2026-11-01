import { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Eye, Trash2, Download, Camera,
  Upload, X, Users, Radio, CheckCircle, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

const RANKS = ['Pte', 'LCpl', 'Cpl', 'Sgt', 'SSgt', 'WO2', 'WO1', '2Lt', 'Lt', 'Capt', 'Maj', 'LtCol', 'Col'];
const PAGE_SIZE = 10;

export default function SoldierRegister() {
  const { soldiers, radios, registerAndIssueRadio, addSoldier, deleteSoldier } = useStore();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filterRank, setFilterRank] = useState('All Ranks');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    armyNo: '',
    rank: 'Pte',
    unit: '55 Sig Bde',
    phone: '',
    dob: '',
    photo: null,
  });

  // Immediate radio issue option in registration
  const [issueNow, setIssueNow] = useState(true);
  const [radioSerial, setRadioSerial] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [radioType, setRadioType] = useState('Motorola GP338');

  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);

  const filtered = soldiers.filter((s) => {
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.armyNo.toLowerCase().includes(search.toLowerCase());
    const matchRank = filterRank === 'All Ranks' || s.rank === filterRank;
    return matchSearch && matchRank;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      alert('Camera not available. Please upload a photo.');
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 480;
    canvas.height = videoRef.current.videoHeight || 480;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    setForm({ ...form, photo: canvas.toDataURL('image/jpeg', 0.8) });
    stopCamera();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm({ ...form, photo: ev.target?.result });
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    if (!form.name || !form.armyNo) {
      alert('Please enter soldier name and army number.');
      return;
    }

    if (issueNow && radioSerial.trim()) {
      registerAndIssueRadio({
        name: form.name,
        armyNo: form.armyNo,
        rank: form.rank,
        unit: form.unit,
        phone: form.phone,
        dob: form.dob,
        photo: form.photo,
        radioSerials: radioSerial.trim(),
        quantity,
        radioType,
        condition: 'Serviceable',
      });
    } else {
      addSoldier(form);
    }

    setForm({ name: '', armyNo: '', rank: 'Pte', unit: '55 Sig Bde', phone: '', dob: '', photo: null });
    setRadioSerial('');
    setQuantity(1);
    setShowAdd(false);
    stopCamera();
  };

  const exportCSV = () => {
    const header = 'S/N,Name,Army No,Rank,Unit,Phone,Date Registered,Radios Held\n';
    const rows = filtered.map((s, i) => {
      const held = radios.filter((r) => r.issuedTo === s.id).map((r) => r.serialNo).join('; ');
      return `${i + 1},"${s.name}",${s.armyNo},${s.rank},"${s.unit}",${s.phone},${s.dateRegistered ? format(new Date(s.dateRegistered), 'dd/MM/yyyy') : ''},"${held}"`;
    }).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'soldier-register.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white font-bold text-2xl flex items-center gap-2">
            <Users size={24} className="text-army-light" /> Soldier Register
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {soldiers.length} personnel registered · Single-step registration and immediate radio issue
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary">
            <Download size={16} /> Export CSV
          </button>
          <button
            onClick={() => navigate('/issue-radio')}
            className="btn-primary"
          >
            <Radio size={16} /> Register &amp; Issue Radio
          </button>
        </div>
      </div>

      {/* Quick Registration & Issuance Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="card w-full max-w-xl max-h-[90vh] overflow-y-auto border border-green-700/60 bg-[#0c2210] shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-green-800">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <Users size={18} className="text-army-light" />
                Register Soldier &amp; Issue Radio
              </h2>
              <button onClick={() => { setShowAdd(false); stopCamera(); }}>
                <X size={18} className="text-gray-400 hover:text-white" />
              </button>
            </div>

            {/* Photo capture & Basic Details */}
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                {/* Photo */}
                <div className="flex flex-col items-center gap-2">
                  {form.photo ? (
                    <div className="relative">
                      <img
                        src={form.photo}
                        alt=""
                        className="w-24 h-28 object-cover rounded-xl border-2 border-green-500 shadow"
                      />
                      <button
                        onClick={() => setForm({ ...form, photo: null })}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : showCamera ? (
                    <div className="w-36 space-y-1">
                      <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg border border-green-500" />
                      <div className="flex gap-1">
                        <button type="button" onClick={takePhoto} className="flex-1 btn-primary text-xs py-1 px-1">
                          Snap
                        </button>
                        <button type="button" onClick={stopCamera} className="btn-danger text-xs py-1 px-2">
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-24 h-28 rounded-xl border-2 border-dashed border-green-800 flex flex-col items-center justify-center gap-1 bg-[#09170a]">
                      <Camera size={20} className="text-gray-500" />
                      <p className="text-gray-500 text-[10px] text-center">Capture Photo</p>
                    </div>
                  )}

                  {!showCamera && !form.photo && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="text-army-light text-xs hover:underline flex items-center gap-1"
                      >
                        <Camera size={12} /> Camera
                      </button>
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="text-army-light text-xs hover:underline flex items-center gap-1"
                      >
                        <Upload size={12} /> Upload
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </div>
                  )}
                </div>

                {/* Name & Army No */}
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="form-label">Full Name *</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. PTE Musa Ibrahim"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Army Number *</label>
                    <input
                      value={form.armyNo}
                      onChange={(e) => setForm({ ...form, armyNo: e.target.value })}
                      placeholder="e.g. NA/24/5123"
                      className="form-input font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Rank, Unit, Phone */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="form-label">Rank</label>
                  <select
                    value={form.rank}
                    onChange={(e) => setForm({ ...form, rank: e.target.value })}
                    className="form-select"
                  >
                    {RANKS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Unit</label>
                  <input
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="080..."
                    className="form-input"
                  />
                </div>
              </div>

              {/* IMMEDIATE RADIO ISSUANCE SECTION */}
              <div className="p-3 bg-[#0a1a0d] rounded-xl border border-green-800/80 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={issueNow}
                    onChange={(e) => setIssueNow(e.target.checked)}
                    className="accent-army-medium w-4 h-4"
                  />
                  <span className="text-white text-sm font-semibold">
                    Issue Radio Immediately (Single Step)
                  </span>
                </label>

                {issueNow && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="sm:col-span-2">
                      <label className="form-label">Radio Serial Number *</label>
                      <input
                        type="text"
                        placeholder="e.g. RAD-015"
                        value={radioSerial}
                        onChange={(e) => setRadioSerial(e.target.value)}
                        className="form-input font-mono uppercase text-army-light"
                      />
                    </div>
                    <div>
                      <label className="form-label">Number of Radios</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="form-input font-mono font-bold text-gold text-center"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-green-800/80 mt-4">
              <button
                type="button"
                onClick={() => { setShowAdd(false); stopCamera(); }}
                className="flex-1 btn-secondary justify-center py-2.5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!form.name || !form.armyNo}
                className="flex-1 btn-primary justify-center py-2.5 disabled:opacity-50"
              >
                {issueNow ? 'Register & Issue Radio' : 'Register Soldier'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or army number..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="form-input pl-10 text-xs"
          />
        </div>
        <select
          value={filterRank}
          onChange={(e) => { setFilterRank(e.target.value); setPage(1); }}
          className="form-select w-auto text-xs"
        >
          <option>All Ranks</option>
          {RANKS.map((r) => <option key={r}>{r}</option>)}
        </select>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-secondary text-xs"
        >
          <Plus size={14} /> Quick Add
        </button>
      </div>

      {/* Table with Actual Photos */}
      <div className="card p-0 overflow-hidden shadow-xl border border-green-900/60">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header whitespace-nowrap">S/N</th>
                <th className="table-header whitespace-nowrap">Actual Photo</th>
                <th className="table-header whitespace-nowrap">Full Name</th>
                <th className="table-header whitespace-nowrap">Army No.</th>
                <th className="table-header whitespace-nowrap">Rank</th>
                <th className="table-header whitespace-nowrap">Unit</th>
                <th className="table-header whitespace-nowrap">Phone</th>
                <th className="table-header whitespace-nowrap">Radios Held</th>
                <th className="table-header whitespace-nowrap">Date Registered</th>
                <th className="table-header whitespace-nowrap text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((s, i) => {
                const heldRadios = radios.filter((r) => r.issuedTo === s.id && r.status === 'Issued');
                const photoSrc = s.photo || '/soldiers/soldier1.jpg';

                return (
                  <tr key={s.id} className="table-row hover:bg-[#0f2e13]/60 transition-colors">
                    <td className="table-cell text-gray-500 w-10">
                      {(page - 1) * PAGE_SIZE + i + 1}
                    </td>

                    {/* Actual Soldier Photo */}
                    <td className="table-cell">
                      <div className="w-10 h-12 rounded-lg overflow-hidden border border-green-800 shadow">
                        <img
                          src={photoSrc}
                          alt={s.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    <td className="table-cell">
                      <span className="text-white font-semibold text-sm">{s.name}</span>
                    </td>
                    <td className="table-cell text-gold font-mono text-xs">{s.armyNo}</td>
                    <td className="table-cell text-gray-300 text-xs">{s.rank}</td>
                    <td className="table-cell text-gray-300 text-xs">{s.unit}</td>
                    <td className="table-cell text-gray-300 text-xs font-mono">{s.phone || '—'}</td>

                    {/* Radios Held */}
                    <td className="table-cell">
                      {heldRadios.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {heldRadios.map((r) => (
                            <span
                              key={r.id}
                              className="text-army-light font-mono text-[11px] bg-green-950 px-1.5 py-0.5 rounded border border-green-800"
                            >
                              {r.serialNo}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-600 text-xs">None</span>
                      )}
                    </td>

                    <td className="table-cell text-gray-400 whitespace-nowrap text-xs">
                      {s.dateRegistered ? format(new Date(s.dateRegistered), 'dd MMM yyyy') : '—'}
                    </td>

                    <td className="table-cell text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/soldier/${s.id}`)}
                          className="text-army-light hover:text-white text-xs flex items-center gap-1 px-2 py-1 rounded bg-[#0d2610] hover:bg-[#1a4a1f] border border-green-900"
                        >
                          <Eye size={12} /> View
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete soldier ${s.name}?`)) deleteSoldier(s.id);
                          }}
                          className="text-red-500 hover:text-red-400 p-1"
                          title="Delete Soldier"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={10} className="table-cell text-center text-gray-500 py-12">
                    No soldiers found.
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
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} soldiers
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
                  className={`w-8 h-8 rounded border text-xs flex items-center justify-center ${
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
    </div>
  );
}
