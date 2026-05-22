import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../context/ApiContext';
import logo from '../assets/logo.svg';

interface AdminLoginProps {
  onClose: () => void;
}

export default function AdminLogin({ onClose }: AdminLoginProps) {
  const { login } = useApi();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(username, password);

    if (success) {
      onClose();
    } else {
      setError('Invalid username or password');
    }
    setLoading(false);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="pixel-panel pixel-border w-full max-w-sm"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <img src={logo} alt="Midos" className="w-12 h-12 mx-auto mb-3" />
            <h2 className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-sm text-glow">
              ADMIN LOGIN
            </h2>
          </div>

          {error && (
            <div className="bg-pixel-red/10 border border-pixel-red text-pixel-red p-3 mb-4 font-[family-name:var(--font-family-vt)] text-base text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-[family-name:var(--font-family-pixel)] text-[7px] text-pixel-white/50 mb-2">
                USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="admin-input"
                placeholder="admin"
                required
              />
            </div>

            <div>
              <label className="block font-[family-name:var(--font-family-pixel)] text-[7px] text-pixel-white/50 mb-2">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="admin-input"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full admin-btn admin-btn-primary disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <button
            onClick={onClose}
            className="w-full mt-3 admin-btn bg-pixel-gray text-pixel-white/60"
          >
            Cancel
          </button>

          <p className="text-center font-[family-name:var(--font-family-vt)] text-pixel-white/20 text-sm mt-4">
            Default: admin / admin123
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
