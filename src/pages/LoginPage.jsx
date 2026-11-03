import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Lock, User, Eye, EyeOff, Wifi, Shield, Radio, Users, FileText } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useStore((s) => s.login);
  const isAuthenticated = useStore((s) => s.isAuthenticated);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/dashboard');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = login(username, password);
    setLoading(false);
    if (result && result.success) {
      navigate('/dashboard');
    } else {
      setError(result?.error || 'Invalid credentials. Access denied.');
    }
  };

  return (
    <div className="min-h-screen bg-army-darkest flex">
      {/* Left side - hero */}
      <div
        className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #061006 0%, #0a2010 50%, #061006 100%)',
        }}
      >
        {/* Top bar */}
        <div className="flex justify-end gap-6 text-gray-400 text-xs font-semibold tracking-widest uppercase">
          <span>Loyalty</span>
          <span className="text-gold">|</span>
          <span>Courage</span>
          <span className="text-gold">|</span>
          <span>Service</span>
          <span className="ml-4 w-12 h-0.5 bg-gold self-center" />
        </div>

        {/* Center content */}
        <div className="flex-1 flex flex-col justify-center max-w-lg">
          {/* Badge */}
          <div className="flex items-center gap-5 mb-8">
            <div className="w-20 h-20 rounded-full bg-red-700 border-4 border-gold flex items-center justify-center">
              <Wifi size={36} className="text-gold" />
            </div>
            <div>
              <h1 className="text-white font-extrabold text-xl tracking-wider">NIGERIAN ARMY</h1>
              <h2 className="text-gray-300 font-semibold text-sm tracking-widest">SIGNALS CORPS</h2>
              <p className="text-gray-500 text-xs tracking-widest mt-1">
                COMMUNICATIONS &nbsp;|&nbsp; INFORMATION &nbsp;|&nbsp; VICTORY
              </p>
            </div>
          </div>

          <div className="mb-2 w-24 h-0.5 bg-gold" />
          <h2 className="text-white font-extrabold text-4xl leading-tight mb-2">
            Radio Asset<br />Management<br />
            <span className="text-army-light">System (RAMS)</span>
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            Track &nbsp;·&nbsp; Issue &nbsp;·&nbsp; Return &nbsp;·&nbsp; Account
          </p>

          {/* Feature icons */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: Radio, label: 'Radio Management' },
              { icon: Users, label: 'Personnel Records' },
              { icon: FileText, label: 'Issue & Return Logs' },
              { icon: Shield, label: 'Secure & Auditable' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-lg border border-green-800 flex items-center justify-center text-army-light">
                  <Icon size={20} />
                </div>
                <p className="text-gray-400 text-[10px] text-center leading-tight">{label}</p>
              </div>
            ))}
          </div>

          <p className="text-gray-500 text-sm italic mt-10">
            Efficient Communications.<br />A Stronger Army.
          </p>
        </div>

        {/* Decorative grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(34,197,94,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Right side - form */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-8 bg-[#0a1a0a]">
        <div className="w-full max-w-sm">
          <div className="bg-[#111c11] border border-green-900/50 rounded-2xl p-8 shadow-2xl">
            {/* Shield icon */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-full border-2 border-gold flex items-center justify-center bg-[#1a2e1a] mb-4">
                <Lock size={28} className="text-gold" />
              </div>
              <h2 className="text-white font-bold text-2xl">Sign In</h2>
              <p className="text-gray-400 text-sm mt-1">Access your RAMS account</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Username (Army Number or Staff ID)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input pl-10"
                />
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 accent-army-medium"
                  />
                  <span className="text-gray-300 text-sm">Remember me</span>
                </label>
                <button type="button" className="text-army-light text-sm hover:underline">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center py-3 text-base"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In →'
                )}
              </button>

              <div className="relative flex items-center">
                <div className="flex-1 border-t border-gray-700" />
                <span className="px-3 text-gray-500 text-xs">OR</span>
                <div className="flex-1 border-t border-gray-700" />
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 border border-gray-600 text-gray-300 py-2.5 rounded-lg hover:bg-[#1a2e1a] transition-colors text-sm"
              >
                <Shield size={16} />
                Login with Smart Card
              </button>
            </form>

            {/* System credentials reference */}
            <div className="mt-6 p-3 bg-[#0a180c] border border-green-900/60 rounded-xl text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-semibold">Default Login:</span>
                <button
                  type="button"
                  onClick={() => { setUsername('admin'); setPassword('password123'); }}
                  className="text-army-light text-[11px] hover:underline"
                >
                  Auto-fill Admin
                </button>
              </div>

              <p className="text-[10px] text-gray-500 pt-0.5">
                Authorized access only. Add more operators in Settings → User Management.
              </p>
            </div>

            {/* Footer branding */}
            <div className="flex items-center justify-center gap-3 mt-6 pt-4 border-t border-green-900/30">
              <div className="w-8 h-8 rounded-full bg-red-700 border border-gold flex items-center justify-center">
                <Wifi size={12} className="text-gold" />
              </div>
              <div>
                <p className="text-gray-300 text-xs font-semibold">Nigerian Army Signals Corps</p>
                <p className="text-gray-500 text-[10px]">RAMS v1.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
