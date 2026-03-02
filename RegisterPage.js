import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { T } from '../theme';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const fields = [
    { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Alex Morgan', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
    { label: 'Email address', key: 'email', type: 'email', placeholder: 'you@company.com', icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6' },
    { label: 'Password', key: 'password', type: 'password', placeholder: '8+ characters', icon: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4' },
    { label: 'Company (optional)', key: 'company', type: 'text', placeholder: 'Your company name', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10' },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #F0F7FF 0%, #E0F2FE 50%, #F8FAFC 100%)',
      padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -60, right: -60, width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: T.gradPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 8px 24px rgba(14,165,233,0.3)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: T.fontHead, fontSize: 24, fontWeight: 800, color: T.text, letterSpacing: '-0.5px' }}>
            Create Account
          </h1>
          <p style={{ color: T.textMid, fontSize: 13, marginTop: 5 }}>Start screening resumes with AI</p>
        </div>

        <div style={{ background: 'white', borderRadius: 20, padding: '32px 28px', boxShadow: '0 8px 40px rgba(14,165,233,0.12)', border: `1px solid ${T.borderLt}` }}>
          <form onSubmit={handleSubmit}>
            {fields.map(f => (
              <div key={f.key} style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 6, fontFamily: T.fontHead }}>{f.label}</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: T.textLight }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      {f.icon.split(' M').map((p, i) => <path key={i} d={i === 0 ? p : 'M' + p} />)}
                    </svg>
                  </div>
                  <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} required={f.key !== 'company'}
                    style={{ width: '100%', padding: '10px 12px 10px 34px', borderRadius: 9, border: `1.5px solid ${T.border}`, fontSize: 13, color: T.text, background: '#FAFCFF', outline: 'none', transition: 'border 0.15s' }}
                    onFocus={e => e.target.style.borderColor = T.primary}
                    onBlur={e => e.target.style.borderColor = T.border}
                  />
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: loading ? T.primaryLt : T.gradPrimary, border: 'none', borderRadius: 10, color: 'white', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: T.fontHead, boxShadow: loading ? 'none' : '0 4px 14px rgba(14,165,233,0.35)', transition: 'all 0.2s', marginTop: 6 }}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: T.textMid }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: T.primary, fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
