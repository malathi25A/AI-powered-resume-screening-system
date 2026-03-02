import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { T } from '../theme';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #F0F7FF 0%, #E0F2FE 50%, #F8FAFC 100%)',
      padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -100, left: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(3,105,161,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: T.gradPrimary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(14,165,233,0.3)',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>
              <path d="M5 18l1 3 1-3"/><path d="M19 3l1 3 1-3"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: T.fontHead, fontSize: 26, fontWeight: 800, color: T.text, letterSpacing: '-0.5px' }}>
            SmartHire <span style={{ color: T.primary }}>AI</span>
          </h1>
          <p style={{ color: T.textMid, fontSize: 14, marginTop: 6 }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white', borderRadius: 20, padding: '36px 32px',
          boxShadow: '0 8px 40px rgba(14,165,233,0.12), 0 2px 8px rgba(0,0,0,0.04)',
          border: `1px solid ${T.borderLt}`,
        }}>
          <form onSubmit={handleSubmit}>
            {[
              { label: 'Email address', key: 'email', type: 'email', placeholder: 'you@company.com', icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6' },
              { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••', icon: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 7, fontFamily: T.fontHead }}>
                  {f.label}
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textLight }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      {f.icon.split(' M').map((p, i) => <path key={i} d={i === 0 ? p : 'M' + p} />)}
                    </svg>
                  </div>
                  <input
                    type={f.type} value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} required
                    style={{
                      width: '100%', padding: '11px 12px 11px 38px',
                      borderRadius: 10, border: `1.5px solid ${T.border}`,
                      fontSize: 14, color: T.text, background: '#FAFCFF',
                      outline: 'none', transition: 'border 0.15s',
                    }}
                    onFocus={e => e.target.style.borderColor = T.primary}
                    onBlur={e => e.target.style.borderColor = T.border}
                  />
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: loading ? T.primaryLt : T.gradPrimary,
              border: 'none', borderRadius: 10, color: 'white',
              fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: T.fontHead, letterSpacing: '-0.2px',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(14,165,233,0.35)',
              transition: 'all 0.2s', marginTop: 8,
            }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: T.textMid }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: T.primary, fontWeight: 600 }}>Create account</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: T.textLight, fontFamily: T.fontMono }}>
          POWERED BY SMARTHIRE AI ENGINE
        </p>
      </div>
    </div>
  );
}
