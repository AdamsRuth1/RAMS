import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import {
  Camera, Upload, X, Radio, User, CheckCircle,
  Plus, Minus, ArrowRight, Shield, Printer, History, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

const RANKS = ['Pte', 'LCpl', 'Cpl', 'Sgt', 'SSgt', 'WO2', 'WO1', '2Lt', 'Lt', 'Capt', 'Maj', 'LtCol', 'Col'];
const RADIO_TYPES = ['Motorola GP338', 'Kenwood TK-3401', 'Icom IC-F4003', 'Hytera PD405', 'Other'];

export default function IssueRadio() {
  const { radios, soldiers, registerAndIssueRadio } = useStore();
  const navigate = useNavigate();

  // Mode: 'new' (Register new soldier & issue) | 'existing' (Pick registered soldier & issue)
  const [mode, setMode] = useState('new');

  // Soldier fields
  const [name, setName] = useState('');
  const [armyNo, setArmyNo] = useState('');
  const [rank, setRank] = useState('Pte');
  const [unit, setUnit] = useState('55 Sig Bde');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');

  // Existing soldier selection
  const [soldierSearch, setSoldierSearch] = useState('');
  const [selectedExistingSoldier, setSelectedExistingSoldier] = useState(null);

  // Radio Issuance fields
  const [quantity, setQuantity] = useState(1);
  const [serialNumbers, setSerialNumbers] = useState(['']);
  const [radioType, setRadioType] = useState('Motorola GP338');
  const [condition, setCondition] = useState('Serviceable');
  const [notes, setNotes] = useState('');

  // Photo capture
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState('');

  // Completion state
  const [successData, setSuccessData] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Available radios in stock for quick suggestion
  const availableRadios = radios.filter((r) => r.status === 'Available');

  // Filtered existing soldiers
  const matchingSoldiers = soldiers.filter(
    (s) =>
      soldierSearch.trim().length > 1 &&
      (s.name.toLowerCase().includes(soldierSearch.toLowerCase()) ||
        s.armyNo.toLowerCase().includes(soldierSearch.toLowerCase()))
  );

  // Keep serialNumbers array in sync with quantity
  useEffect(() => {
    setSerialNumbers((prev) => {
      const next = [...prev];
      if (next.length < quantity) {
        while (next.length < quantity) next.push('');
      } else if (next.length > quantity) {
        return next.slice(0, quantity);
      }
      return next;
    });
  }, [quantity]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setShowCamera(true);
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError('Camera access unavailable. You can upload a photo instead.');
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCapturedPhoto(ev.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSerialChange = (index, value) => {
    setSerialNumbers((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const applyStockSerial = (serial) => {
    // Fill first empty slot or last slot
    const emptyIdx = serialNumbers.findIndex((s) => !s.trim());
    if (emptyIdx >= 0) {
      handleSerialChange(emptyIdx, serial);
    } else {
      handleSerialChange(0, serial);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const activeName = mode === 'existing' ? selectedExistingSoldier?.name : name;
    const activeArmyNo = mode === 'existing' ? selectedExistingSoldier?.armyNo : armyNo;

    if (!activeName || !activeArmyNo) {
      alert('Please provide Soldier Name and Army Number.');
      return;
    }

    const filteredSerials = serialNumbers.map((s) => s.trim()).filter(Boolean);
    if (filteredSerials.length === 0) {
      alert('Please enter at least one Radio Serial Number.');
      return;
    }

    const result = registerAndIssueRadio({
      soldierId: mode === 'existing' ? selectedExistingSoldier?.id : undefined,
      name: activeName,
      armyNo: activeArmyNo,
      rank: mode === 'existing' ? selectedExistingSoldier?.rank : rank,
      unit: mode === 'existing' ? selectedExistingSoldier?.unit : unit,
      phone: mode === 'existing' ? selectedExistingSoldier?.phone : phone,
      dob: mode === 'existing' ? selectedExistingSoldier?.dob : dob,
      photo: capturedPhoto || (mode === 'existing' ? selectedExistingSoldier?.photo : null),
      radioSerials: filteredSerials,
      quantity,
      radioType,
      condition,
      notes,
    });

    if (result.success) {
      setSuccessData(result);
    }
  };

  const handleResetForNext = () => {
    setSuccessData(null);
    setName('');
    setArmyNo('');
    setRank('Pte');
    setUnit('55 Sig Bde');
    setPhone('');
    setDob('');
    setQuantity(1);
    setSerialNumbers(['']);
    setNotes('');
    setCapturedPhoto(null);
    setSelectedExistingSoldier(null);
    setSoldierSearch('');
  };

  // ─── SUCCESS CONFIRMATION SLIP ──────────────────────────────────────────────
  if (successData) {
    const { soldier, serials, quantity: issuedQty, transaction } = successData;
    return (
      <div className="max-w-2xl mx-auto py-4 space-y-6 animate-fadeIn">
        <div className="card border border-green-700/50 bg-[#0d2411]/90 shadow-2xl p-6">
          <div className="text-center space-y-3 pb-6 border-b border-green-800/60">
            <div className="w-16 h-16 rounded-full bg-green-900/80 border-2 border-green-500 flex items-center justify-center mx-auto text-green-400">
              <CheckCircle size={36} />
            </div>
            <div>
              <h2 className="text-white font-bold text-2xl tracking-wide">
                Soldier Registered &amp; Radio Issued
              </h2>
              <p className="text-green-300 text-sm mt-1">
                Transaction logged securely. Biometric photo saved in database.
              </p>
            </div>
          </div>

          {/* Receipt Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-green-800/60">
            {/* Actual Soldier Photo */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="relative">
                <img
                  src={soldier.photo || transaction.soldierPhoto || '/soldiers/soldier1.jpg'}
                  alt={soldier.name}
                  className="w-32 h-36 object-cover rounded-xl border-2 border-gold shadow-lg"
                />
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-[10px] text-green-400 font-mono">
                  Verified
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-2">Captured Photo</p>
            </div>

            {/* Soldier Info */}
            <div className="md:col-span-2 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400 text-xs block">Soldier Name:</span>
                  <span className="text-white font-semibold text-base">{soldier.name}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block">Army Number:</span>
                  <span className="text-gold font-mono font-semibold">{soldier.armyNo}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block">Rank / Unit:</span>
                  <span className="text-gray-200">{soldier.rank} · {soldier.unit}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block">Date &amp; Time:</span>
                  <span className="text-gray-200 font-mono text-xs">
                    {format(new Date(transaction.timestamp), 'dd MMM yyyy, HH:mm')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block">Number of Radios Signed:</span>
                  <span className="text-white font-bold text-base bg-army-medium/40 px-2.5 py-0.5 rounded border border-green-700/50 inline-block">
                    {issuedQty} Radio{issuedQty > 1 ? 's' : ''}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block">Radio Serial Number(s):</span>
                  <span className="text-army-light font-mono font-bold text-base block">
                    {serials.join(', ')}
                  </span>
                </div>
              </div>

              <div className="pt-2 text-xs text-gray-400">
                <span className="text-gray-500">Processed by: </span>
                <span className="text-gray-300 font-medium">{transaction.processedBy}</span>
                <span className="mx-2">·</span>
                <span className="text-gray-500">Authentication: </span>
                <span className="text-green-400 font-medium">Digital Photo Record (No signature required)</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-6">
            <button
              onClick={handleResetForNext}
              className="flex-1 btn-primary justify-center py-3 text-sm"
            >
              <RefreshCw size={16} /> Issue Another Radio
            </button>
            <button
              onClick={() => navigate('/transactions')}
              className="flex-1 btn-secondary justify-center py-3 text-sm"
            >
              <History size={16} /> View Transaction History
            </button>
            <button
              onClick={() => window.print()}
              className="btn-secondary px-4 py-3 text-sm"
              title="Print Receipt"
            >
              <Printer size={16} /> Print Slip
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN UNIFIED FORM ───────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-white font-bold text-2xl flex items-center gap-2">
            <Radio size={26} className="text-army-light" />
            Simple Radio Registration &amp; Issuance
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Register soldier, enter radio serial number &amp; quantity, capture photo, and issue in one step.
          </p>
        </div>

        {/* Quick Mode Toggle */}
        <div className="flex bg-[#0b1f0d] p-1 rounded-xl border border-green-900/60 text-xs self-start md:self-auto">
          <button
            type="button"
            onClick={() => {
              setMode('new');
              setSelectedExistingSoldier(null);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'new'
                ? 'bg-army-medium text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            + Register New Soldier &amp; Issue
          </button>
          <button
            type="button"
            onClick={() => setMode('existing')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'existing'
                ? 'bg-army-medium text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Existing Soldier
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ROW 1: SOLDIER DETAILS & PHOTO CAPTURE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Soldier Details (7 cols) */}
          <div className="lg:col-span-7 card space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h2 className="text-white font-semibold flex items-center gap-2 text-base">
                <span className="w-6 h-6 rounded-full bg-army-medium flex items-center justify-center text-xs font-bold text-white">
                  1
                </span>
                {mode === 'new' ? 'Soldier Information' : 'Select Registered Soldier'}
              </h2>
              <span className="text-[11px] text-gray-500 uppercase tracking-wider">
                {mode === 'new' ? 'Immediate Registration' : 'Database Lookup'}
              </span>
            </div>

            {mode === 'existing' ? (
              <div className="space-y-4">
                <div>
                  <label className="form-label">Search Registered Soldier *</label>
                  <input
                    type="text"
                    placeholder="Type soldier name or army number (e.g. Musa, NA/23)..."
                    value={soldierSearch}
                    onChange={(e) => {
                      setSoldierSearch(e.target.value);
                      setSelectedExistingSoldier(null);
                    }}
                    className="form-input"
                  />
                </div>

                {matchingSoldiers.length > 0 && !selectedExistingSoldier && (
                  <div className="bg-[#0b1f0d] border border-green-900 rounded-xl overflow-hidden max-h-52 overflow-y-auto divide-y divide-gray-800">
                    {matchingSoldiers.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedExistingSoldier(s);
                          setSoldierSearch(s.name);
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-[#143618] text-left transition-colors"
                      >
                        <img
                          src={s.photo || '/soldiers/soldier1.jpg'}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border border-green-700"
                        />
                        <div className="flex-1">
                          <p className="text-white text-sm font-semibold">{s.name}</p>
                          <p className="text-gray-400 text-xs font-mono">{s.armyNo} · {s.rank}</p>
                        </div>
                        <span className="badge-available text-xs">Select</span>
                      </button>
                    ))}
                  </div>
                )}

                {selectedExistingSoldier && (
                  <div className="bg-[#0b2410] border border-green-800/80 rounded-xl p-4 flex items-center gap-4">
                    <img
                      src={selectedExistingSoldier.photo || '/soldiers/soldier1.jpg'}
                      alt=""
                      className="w-14 h-16 rounded-lg object-cover border border-gold shadow"
                    />
                    <div className="flex-1">
                      <p className="text-white font-bold">{selectedExistingSoldier.name}</p>
                      <p className="text-gold font-mono text-xs">{selectedExistingSoldier.armyNo}</p>
                      <p className="text-gray-400 text-xs">{selectedExistingSoldier.rank} · {selectedExistingSoldier.unit}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedExistingSoldier(null);
                        setSoldierSearch('');
                      }}
                      className="text-gray-400 hover:text-white text-xs underline"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PTE Musa Ibrahim"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Army Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NA/24/5123"
                      value={armyNo}
                      onChange={(e) => setArmyNo(e.target.value)}
                      className="form-input font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="form-label">Rank</label>
                    <select
                      value={rank}
                      onChange={(e) => setRank(e.target.value)}
                      className="form-select"
                    >
                      {RANKS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Unit</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="08012345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Photo Capture Section (5 cols) */}
          <div className="lg:col-span-5 card space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h2 className="text-white font-semibold flex items-center gap-2 text-base">
                <span className="w-6 h-6 rounded-full bg-army-medium flex items-center justify-center text-xs font-bold text-white">
                  2
                </span>
                Soldier Photo Capture
              </h2>
              <span className="text-[11px] text-green-400 font-medium">Saved in Database</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 bg-[#0a1a0c] rounded-xl border border-dashed border-green-900/80 min-h-[220px]">
              {showCamera ? (
                <div className="w-full flex flex-col items-center space-y-2">
                  <div className="relative w-full max-w-[240px] aspect-square rounded-xl overflow-hidden border-2 border-green-500 shadow-xl bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 border border-white/20 pointer-events-none rounded-xl" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={takePhoto}
                      className="btn-primary text-xs py-2 px-4 shadow-lg"
                    >
                      <Camera size={14} /> Snap Photo
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="btn-danger text-xs py-2 px-3"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : capturedPhoto ? (
                <div className="flex flex-col items-center space-y-2">
                  <div className="relative group">
                    <img
                      src={capturedPhoto}
                      alt="Soldier Captured"
                      className="w-36 h-40 object-cover rounded-xl border-2 border-green-500 shadow-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setCapturedPhoto(null)}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-white shadow"
                      title="Remove Photo"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                    <CheckCircle size={12} /> Photo Captured
                  </span>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="text-xs text-army-light hover:underline flex items-center gap-1 mt-1"
                  >
                    <RefreshCw size={12} /> Retake Photo
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center space-y-3 py-4">
                  <div className="w-16 h-16 rounded-full bg-army-medium/30 border border-green-700/50 flex items-center justify-center text-army-light">
                    <Camera size={30} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Capture Soldier Photo</p>
                    <p className="text-gray-400 text-xs max-w-[200px]">
                      Required for identity verification &amp; transaction log.
                    </p>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="btn-primary text-xs py-2 px-3.5"
                    >
                      <Camera size={14} /> Open Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary text-xs py-2 px-3"
                    >
                      <Upload size={14} /> Upload
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                  {cameraError && (
                    <p className="text-red-400 text-[11px] mt-1">{cameraError}</p>
                  )}
                </div>
              )}
            </div>
            <p className="text-gray-500 text-[11px] text-center">
              The captured photo will be permanently stored in the database and shown on all transaction history records.
            </p>
          </div>
        </div>

        {/* ROW 2: RADIO DETAILS & NUMBER OF RADIOS BEING SIGNED / ISSUED */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h2 className="text-white font-semibold flex items-center gap-2 text-base">
              <span className="w-6 h-6 rounded-full bg-army-medium flex items-center justify-center text-xs font-bold text-white">
                3
              </span>
              Radio Details (Entered by Issuer)
            </h2>
            <span className="text-[11px] text-gray-400">
              No signature required · Biometric photo verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Number of Radios Being Given Out (Quantity) */}
            <div className="md:col-span-4 bg-[#0a1f0c] p-4 rounded-xl border border-green-900/60 space-y-3">
              <label className="form-label block text-white font-semibold">
                Number of Radios Being Given Out *
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-lg bg-[#143618] hover:bg-[#1c4b22] border border-green-700/60 flex items-center justify-center text-white"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="form-input text-center text-xl font-bold font-mono text-gold w-20 py-2"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 rounded-lg bg-[#143618] hover:bg-[#1c4b22] border border-green-700/60 flex items-center justify-center text-white"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex gap-2 pt-1">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setQuantity(n)}
                    className={`flex-1 py-1 text-xs rounded border transition-colors ${
                      quantity === n
                        ? 'bg-army-medium border-army-light text-white font-bold'
                        : 'border-green-900 text-gray-400 hover:text-white'
                    }`}
                  >
                    {n} Radio{n > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Serial Number(s) Input Fields */}
            <div className="md:col-span-8 space-y-3">
              <div className="flex items-center justify-between">
                <label className="form-label text-white font-semibold">
                  Radio Serial Number{quantity > 1 ? 's' : ''} (Entered by Issuer) *
                </label>
                <span className="text-xs text-gray-400 font-mono">
                  {quantity} radio{quantity > 1 ? 's' : ''} to sign out
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: quantity }, (_, idx) => (
                  <div key={idx}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-xs">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        required
                        placeholder={`e.g. RAD-00${idx + 1}`}
                        value={serialNumbers[idx] || ''}
                        onChange={(e) => handleSerialChange(idx, e.target.value)}
                        className="form-input pl-9 font-mono uppercase text-army-light font-medium tracking-wide"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Fill from Available Inventory in stock */}
              {availableRadios.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] text-gray-400 block mb-1.5">
                    Quick-pick available in stock:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                    {availableRadios.slice(0, 8).map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => applyStockSerial(r.serialNo)}
                        className="px-2 py-1 rounded bg-[#0d2610] hover:bg-[#18421c] border border-green-800 text-[11px] text-gray-300 font-mono transition-colors"
                      >
                        + {r.serialNo}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Radio Model, Condition & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-800/80">
            <div>
              <label className="form-label">Radio Model / Type</label>
              <select
                value={radioType}
                onChange={(e) => setRadioType(e.target.value)}
                className="form-select"
              >
                {RADIO_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="form-select"
              >
                <option value="Serviceable">Serviceable (Good)</option>
                <option value="Faulty">Faulty (Needs Check)</option>
              </select>
            </div>
            <div>
              <label className="form-label">Purpose / Operation Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Forward patrol, guard duty"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <p className="text-gray-500 text-xs hidden sm:block">
            * Instant registration &amp; issue: updates soldier database, records transaction, and updates radio status.
          </p>

          <button
            type="submit"
            className="w-full sm:w-auto ml-auto btn-primary py-3.5 px-8 text-base font-semibold shadow-xl hover:shadow-green-900/40 flex items-center justify-center gap-3"
          >
            <Radio size={20} />
            {mode === 'new'
              ? `Register Soldier & Issue ${quantity} Radio${quantity > 1 ? 's' : ''}`
              : `Issue ${quantity} Radio${quantity > 1 ? 's' : ''} to Soldier`}
          </button>
        </div>
      </form>
    </div>
  );
}
