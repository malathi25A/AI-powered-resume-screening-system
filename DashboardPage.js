import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { T } from '../theme';

const StatCard = ({ icon, label, value, sub, color = T.primary, iconBg }) => (
  <div style={{ background: 'white', borderRadius: 16, padding: '22px 24px', boxShadow: T.shadowMd, border: `1px solid ${T.borderLt}`, display: 'flex', alignItems: 'center', gap: 16, transition: 'transform 0.15s, box-shadow 0.15s' }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = T.shadowLg; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = T.shadowMd; }}>
    <div style={{ width: 52, height: 52, borderRadius: 14, background: iconBg || `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        {Array.isArray(icon) ? icon.map((p, i) => <path key={i} d={p} />) : <path d={icon} />}
      </svg>
    </div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 800, color: T.text, fontFamily: T.fontHead, letterSpacing: '-0.5px' }}>{value ?? '–'}</div>
      <div style={{ fontSize: 13, color: T.textMid, marginTop: 1 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: color, marginTop: 3, fontFamily: T.fontMono }}>{sub}</div>}
    </div>
  </div>
);

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { icon: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4','M17 8l-5-5-5 5','M12 3v12'], label: 'Total Resumes', value: stats?.totalResumes ?? 0, sub: 'Uploaded', color: T.primary },
    { icon: ['M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z','M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16'], label: 'Active Jobs', value: stats?.activeJobs ?? 0, sub: 'Open positions', color: '#8B5CF6' },
    { icon: ['M22 11.08V12a10 10 0 1 1-5.93-9.14','M22 4L12 14.01l-3-3'], label: 'Evaluations Done', value: stats?.totalEvaluations ?? 0, sub: 'AI screened', color: T.success },
    { icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', label: 'Shortlisted', value: stats?.shortlistedCount ?? 0, sub: 'Top candidates', color: '#F59E0B' },
  ];

  const recentEvals = stats?.recentEvaluations || [];
  const scoreColor = (s) => s >= 75 ? T.success : s >= 50 ? T.warning : T.danger;

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 4, height: 28, borderRadius: 2, background: T.gradPrimary }} />
          <h1 style={{ fontFamily: T.fontHead, fontSize: 26, fontWeight: 800, color: T.text, letterSpacing: '-0.5px' }}>
            Dashboard
          </h1>
        </div>
        <p style={{ color: T.textMid, fontSize: 14, paddingLeft: 16 }}>Welcome back — here's your hiring overview</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {cards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Bottom grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Recent Evaluations */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: T.shadowMd, border: `1px solid ${T.borderLt}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `${T.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.primary} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>
              </svg>
            </div>
            <div style={{ fontFamily: T.fontHead, fontWeight: 700, fontSize: 15, color: T.text }}>Recent Evaluations</div>
          </div>
          {loading && <div style={{ color: T.textLight, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Loading...</div>}
          {!loading && recentEvals.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 0', color: T.textLight }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={T.borderLt} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 10px', display: 'block' }}>
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              <div style={{ fontSize: 13 }}>No evaluations yet</div>
            </div>
          )}
          {recentEvals.slice(0, 5).map((ev, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < recentEvals.length - 1 ? `1px solid ${T.borderLt}` : 'none' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{ev.resume?.candidateName || 'Candidate'}</div>
                <div style={{ fontSize: 11, color: T.textLight, marginTop: 2 }}>{ev.job?.title || 'Job'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: scoreColor(ev.scores?.overall), fontFamily: T.fontMono }}>{ev.scores?.overall}</div>
                <div style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: ev.recommendation === 'Strong Fit' ? '#D1FAE5' : ev.recommendation === 'Moderate Fit' ? '#FEF3C7' : '#FEE2E2', color: ev.recommendation === 'Strong Fit' ? '#065F46' : ev.recommendation === 'Moderate Fit' ? '#92400E' : '#991B1B', fontWeight: 600 }}>
                  {ev.recommendation === 'Strong Fit' ? '✓ Strong' : ev.recommendation === 'Moderate Fit' ? '~ Moderate' : '✗ No Fit'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: T.shadowMd, border: `1px solid ${T.borderLt}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `${T.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.primary} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
              </svg>
            </div>
            <div style={{ fontFamily: T.fontHead, fontWeight: 700, fontSize: 15, color: T.text }}>Quick Actions</div>
          </div>
          {[
            { label: 'Upload Resumes', desc: 'Add new candidate files', to: '/upload', icon: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4','M17 8l-5-5-5 5','M12 3v12'], color: T.primary },
            { label: 'Create Job Description', desc: 'Define role requirements', to: '/jobs', icon: ['M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z','M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16'], color: '#8B5CF6' },
            { label: 'Run AI Evaluation', desc: 'Screen candidates with AI Engine', to: '/evaluate', icon: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 4a6 6 0 1 1-6 6 6 6 0 0 1 6-6zm0 2a4 4 0 1 0 4 4 4 4 0 0 0-4-4z', color: T.success },
            { label: 'View Results', desc: 'See ranked candidates', to: '/results', icon: ['M18 20V10','M12 20V4','M6 20v-6'], color: T.warning },
          ].map(a => (
            <a key={a.label} href={a.to} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 10, border: `1px solid ${T.borderLt}`, marginBottom: 10, textDecoration: 'none', transition: 'all 0.15s', background: '#FAFCFF' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = `${a.color}08`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.borderLt; e.currentTarget.style.background = '#FAFCFF'; }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${a.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={a.color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  {Array.isArray(a.icon) ? a.icon.map((p, i) => <path key={i} d={p} />) : <path d={a.icon} />}
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: T.fontHead }}>{a.label}</div>
                <div style={{ fontSize: 11, color: T.textMid, marginTop: 1 }}>{a.desc}</div>
              </div>
              <div style={{ marginLeft: 'auto', color: T.textLight }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
