import { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Camera, Upload, X, RotateCcw, CheckCircle, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function ReturnRadio() {
  const { radios, soldiers, returnRadio } = useStore();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();

  const [searchMode, setSearchMode] = useState('soldier'); // 'soldier' | 'serial'
  const [query, setQuery] = useState('');
  const [selectedRadio, setSelectedRadio] = useState(null);
  const [signMethod, setSignMethod] = useState('Photo (Radio)');
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastReturned, setLastReturned] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);

  const issuedRadios = radios.filter((r) => r.status === 'Issued');

  const filteredResults = issuedRadios.filter((r) => {
    if (!query || query.length < 1) return false;
    const soldier = soldiers.find((s) => s.id === r.issuedTo);
    if (searchMode === 'serial') {
      return r.serialNo.toLowerCase().includes(query.toLowerCase());
    }
    return (
      soldier?.name.toLowerCase().includes(query.toLowerCase()) ||
      soldier?.armyNo.toLowerCase().includes(query.toLowerCase())
    );
  });

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      alert('Camera not accessible.');
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  };

  const takePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    setCapturedPhoto(canvas.toDataURL('image/jpeg', 0.7));
    stopCamera();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCapturedPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const onSubmit = (data) => {
    if (!selectedRadio) return;
    const ok = returnRadio({
      radioId: selectedRadio.id,
      condition: data.condition,
      signMethod,
      notes: data.notes || '',
      photo: capturedPhoto,
    });
    if (ok) {
      setLastReturned({ radio: selectedRadio, time: new Date() });
      setSuccess(true);
      reset();
      setQuery('');
      setSelectedRadio(null);
      setCapturedPhoto(null);
    }
  };

  if (success && lastReturned) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <div className="card text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-900 flex items-center justify-center mx-auto">
            <CheckCircle size={32} className="text-blue-400" />
          </div>
          <h2 className="text-white font-bold text-xl">Radio Returned Successfully!</h2>
          <div className="bg-[#0d2610] rounded-xl p-4 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Radio Serial:</span>
              <span className="text-white font-mono">{lastReturned.radio.serialNo}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Return Time:</span>
              <span className="text-white">{format(lastReturned.time, 'dd MMM yyyy HH:mm')}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setSuccess(false)} className="flex-1 btn-blue justify-center">
              Return Another
            </button>
            <button onClick={() => navigate('/transactions')} className="flex-1 btn-secondary justify-center">
              View Transactions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-white font-bold text-2xl">Return Radio</h1>
        <p className="text-gray-400 text-sm">Record the return of a radio</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1 - Search */}
        <div className="card">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">1</span>
            Soldier / Radio Search
          </h2>

          {/* Mode toggle */}
          <div className="flex mb-4 border border-gray-700 rounded-lg overflow-hidden w-fit">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium transition-colors ${searchMode === 'soldier' ? 'bg-army-medium text-white' : 'text-gray-400 hover:bg-[#1a2e1a]'}`}
              onClick={() => { setSearchMode('soldier'); setQuery(''); setSelectedRadio(null); }}
            >
              By Soldier
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium transition-colors ${searchMode === 'serial' ? 'bg-army-medium text-white' : 'text-gray-400 hover:bg-[#1a2e1a]'}`}
              onClick={() => { setSearchMode('serial'); setQuery(''); setSelectedRadio(null); }}
            >
              By Radio Serial
            </button>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder={searchMode === 'soldier' ? 'Search by name or army number...' : 'Search by radio serial number...'}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedRadio(null); }}
              className="form-input pl-10"
            />
          </div>

          {/* Results */}
          {filteredResults.length > 0 && !selectedRadio && (
            <div className="mt-2 space-y-2">
              {filteredResults.map((r) => {
                const soldier = soldiers.find((s) => s.id === r.issuedTo);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => { setSelectedRadio(r); setQuery(r.serialNo); }}
                    className="w-full flex items-center gap-4 p-3 bg-[#0d2610] rounded-xl hover:bg-[#14532d] transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-army-medium flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                      {soldier?.photo
                        ? <img src={soldier.photo} alt="" className="w-full h-full object-cover" />
                        : (soldier?.name || '').split(' ').map(n => n[0]).join('').slice(0,2)
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm">{soldier?.name}</p>
                      <p className="text-gray-400 text-xs">{soldier?.armyNo} · {soldier?.rank}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-army-light font-mono text-sm">{r.serialNo}</p>
                      <p className="text-gray-500 text-xs">
                        Issued {r.issuedDate ? format(new Date(r.issuedDate), 'dd MMM HH:mm') : ''}
                      </p>
                    </div>
                    <span className="badge-issued ml-2">Issued</span>
                  </button>
                );
              })}
            </div>
          )}

          {selectedRadio && (() => {
            const soldier = soldiers.find((s) => s.id === selectedRadio.issuedTo);
            return (
              <div className="mt-3 bg-[#0d2610] rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-army-medium flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                  {soldier?.photo
                    ? <img src={soldier.photo} alt="" className="w-full h-full object-cover" />
                    : (soldier?.name || '').split(' ').map(n => n[0]).join('').slice(0,2)
                  }
                </div>
                <div>
                  <p className="text-white font-semibold">{soldier?.name}</p>
                  <p className="text-gray-400 text-sm">{soldier?.armyNo}</p>
                  <p className="text-army-light text-xs font-mono">Radio: {selectedRadio.serialNo}</p>
                  <p className="text-gray-500 text-xs">
                    Signed out: {selectedRadio.issuedDate ? format(new Date(selectedRadio.issuedDate), 'dd MMM yyyy HH:mm') : ''}
                  </p>
                </div>
                <button
                  type="button"
                  className="ml-auto text-gray-500 hover:text-white"
                  onClick={() => { setSelectedRadio(null); setQuery(''); }}
                >
                  <X size={16} />
                </button>
              </div>
            );
          })()}
        </div>

        {/* Section 2 - Return Details */}
        <div className="card">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">2</span>
            Return Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Return Date &amp; Time</label>
              <input type="text" readOnly value={format(new Date(), 'dd/MM/yyyy HH:mm')} className="form-input bg-[#0d2610]" />
            </div>
            <div>
              <label className="form-label">Condition *</label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" {...register('condition')} value="Serviceable" defaultChecked className="accent-army-medium" />
                  <span className="text-gray-300 text-sm">Serviceable</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" {...register('condition')} value="Faulty" className="accent-red-500" />
                  <span className="text-gray-300 text-sm">Faulty</span>
                </label>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Notes</label>
              <input {...register('notes')} placeholder="Optional notes..." className="form-input" />
            </div>
          </div>
        </div>

        {/* Section 3 - Capture Method */}
        <div className="card">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">3</span>
            Verification &amp; Capture
          </h2>
          <div className="flex gap-4 mb-4">
            {['Photo (Radio/Soldier)', 'None'].map((m) => (
              <label key={m} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="signMethod"
                  checked={signMethod === m}
                  onChange={() => setSignMethod(m)}
                  className="accent-blue-500"
                />
                <span className="text-gray-300 text-sm">{m}</span>
              </label>
            ))}
          </div>

          {signMethod === 'Photo (Radio/Soldier)' && (
            <div className="space-y-3">
              {showCamera ? (
                <div>
                  <video ref={videoRef} autoPlay className="w-full max-w-sm rounded-lg border border-gray-700" />
                  <div className="flex gap-2 mt-2">
                    <button type="button" onClick={takePhoto} className="btn-blue">
                      <Camera size={16} /> Take Photo
                    </button>
                    <button type="button" onClick={stopCamera} className="btn-danger">
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </div>
              ) : capturedPhoto ? (
                <div className="relative inline-block">
                  <img src={capturedPhoto} alt="Radio" className="w-32 h-32 object-cover rounded-lg border border-blue-500" />
                  <button type="button" onClick={() => setCapturedPhoto(null)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button type="button" onClick={startCamera} className="btn-secondary">
                    <Camera size={16} /> Take Photo
                  </button>
                  <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary">
                    <Upload size={16} /> Upload
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button
            type="submit"
            disabled={!selectedRadio}
            className="flex-1 btn-blue justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw size={16} /> Record Return
          </button>
        </div>
      </form>
    </div>
  );
}
