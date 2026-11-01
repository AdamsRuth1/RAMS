import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowLeft, Radio, History, User, Phone, Calendar, Shield } from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import { useState } from 'react';

export default function SoldierProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { soldiers, radios, transactions } = useStore();
  const [tab, setTab] = useState('details');

  const soldier = soldiers.find((s) => s.id === id);
  if (!soldier) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Soldier not found.</p>
        <button onClick={() => navigate('/soldier-register')} className="btn-secondary mt-4">Back to Register</button>
      </div>
    );
  }

  const soldierTransactions = transactions.filter((t) => t.soldierId === id);
  const currentRadio = radios.find((r) => r.status === 'Issued' && r.issuedTo === id);
  const age = soldier.dob ? differenceInYears(new Date(), new Date(soldier.dob)) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <button onClick={() => navigate('/soldier-register')} className="flex items-center gap-1 hover:text-white">
          <ArrowLeft size={14} /> Soldier Register
        </button>
        <span>/</span>
        <span className="text-white">{soldier.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left - Profile card */}
        <div className="space-y-4">
          <div className="card text-center">
            {soldier.photo ? (
              <img src={soldier.photo} alt="" className="w-24 h-28 rounded-xl object-cover mx-auto border-2 border-army-medium" />
            ) : (
              <div className="w-24 h-28 rounded-xl bg-army-medium flex items-center justify-center text-white font-bold text-3xl mx-auto">
                {soldier.name.split(' ').map(n => n[0]).join('').slice(0,2)}
              </div>
            )}
            <h2 className="text-white font-bold text-lg mt-3">{soldier.name}</h2>
            <p className="text-gray-400 text-sm">{soldier.armyNo}</p>
            <p className="text-gray-500 text-xs">{soldier.unit}</p>
            {currentRadio ? (
              <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-blue-900 border border-blue-700 rounded-full text-blue-300 text-xs font-semibold">
                <Radio size={12} /> Radio Issued
              </div>
            ) : (
              <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-gray-400 text-xs">
                No Radio
              </div>
            )}
          </div>

          {/* Current Radio */}
          {currentRadio && (
            <div className="card">
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <Radio size={14} className="text-army-light" /> Current Radio
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Serial:</span>
                  <span className="text-army-light font-mono">{currentRadio.serialNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white">{currentRadio.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Issued:</span>
                  <span className="text-white text-xs">{currentRadio.issuedDate ? format(new Date(currentRadio.issuedDate), 'dd MMM yyyy') : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Condition:</span>
                  <span className="text-white">{currentRadio.condition}</span>
                </div>
                <button
                  onClick={() => navigate('/return-radio')}
                  className="w-full btn-blue justify-center mt-2 text-xs"
                >
                  Return Radio
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right - Tabs */}
        <div className="md:col-span-2">
          {/* Tab header */}
          <div className="flex border-b border-gray-700 mb-4">
            {[
              { id: 'details', label: 'Details', icon: User },
              { id: 'radios', label: 'Radios', icon: Radio },
              { id: 'history', label: 'History', icon: History },
            ].map(({ id: tabId, label, icon: Icon }) => (
              <button
                key={tabId}
                onClick={() => setTab(tabId)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === tabId ? 'border-army-medium text-army-light' : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {tab === 'details' && (
            <div className="card space-y-4">
              <h3 className="text-white font-semibold">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', value: soldier.name, icon: User },
                  { label: 'Army Number', value: soldier.armyNo, icon: Shield },
                  { label: 'Rank', value: soldier.rank, icon: Shield },
                  { label: 'Unit', value: soldier.unit, icon: Shield },
                  { label: 'Phone', value: soldier.phone || '—', icon: Phone },
                  { label: 'Date of Birth', value: soldier.dob ? `${format(new Date(soldier.dob), 'dd MMM yyyy')} (Age ${age})` : '—', icon: Calendar },
                  { label: 'Date Registered', value: soldier.dateRegistered ? format(new Date(soldier.dateRegistered), 'dd MMM yyyy HH:mm') : '—', icon: Calendar },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label}>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-white font-medium text-sm">{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-700">
                <button onClick={() => navigate('/issue-radio')} className="btn-primary text-xs">
                  Issue Radio
                </button>
                <button onClick={() => navigate('/return-radio')} className="btn-blue text-xs">
                  Return Radio
                </button>
              </div>
            </div>
          )}

          {tab === 'radios' && (
            <div className="card">
              <h3 className="text-white font-semibold mb-4">Radio History</h3>
              {soldierTransactions.filter(t => t.type !== 'Register').length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No radio history</p>
              ) : (
                <div className="space-y-2">
                  {soldierTransactions
                    .filter((t) => t.type !== 'Register')
                    .map((t) => (
                      <div key={t.id} className="flex items-center gap-4 p-3 bg-[#0d2610] rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${t.type === 'Issue' ? 'bg-blue-400' : 'bg-green-400'}`} />
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{t.radioSerial}</p>
                          <p className="text-gray-500 text-xs">{format(new Date(t.timestamp), 'dd MMM yyyy HH:mm')}</p>
                        </div>
                        <span className={t.type === 'Issue' ? 'badge-issued' : 'badge-returned'}>{t.type}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {tab === 'history' && (
            <div className="card">
              <h3 className="text-white font-semibold mb-4">Full Activity Log</h3>
              {soldierTransactions.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No activity</p>
              ) : (
                <div className="space-y-2">
                  {soldierTransactions.map((t) => (
                    <div key={t.id} className="flex items-start gap-3 p-3 bg-[#0d2610] rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${
                        t.type === 'Issue' ? 'bg-blue-400' : t.type === 'Return' ? 'bg-green-400' : 'bg-yellow-400'
                      }`} />
                      <div className="flex-1">
                        <p className="text-white text-sm">{t.notes || `${t.type}: ${t.radioSerial || ''}`}</p>
                        <p className="text-gray-500 text-xs">
                          {format(new Date(t.timestamp), 'dd MMM yyyy HH:mm')} · Processed by {t.processedBy}
                        </p>
                      </div>
                      <span className={
                        t.type === 'Issue' ? 'badge-issued' :
                        t.type === 'Return' ? 'badge-returned' : 'badge-available'
                      }>{t.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
