import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { T } from '../theme';

const scoreColor = (s) => s >= 75 ? T.success : s >= 50 ? T.warning : s > 0 ? T.danger : T.textLight;

export default function ResumesPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchResumes = () => {
    api.get('/resumes').then(r => setResumes(r.data.resumes || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(fetchResumes, []);

  const deleteResume = async (id) => {
    if (!window.confirm('Delete this resume?')) return;
    await api.delete(`/resumes/${id}`); toast.success('Deleted'); fetchResumes();
  };

  const filtered = resumes.filter(r =>
    !search || r.candidateName?.toLowerCase().includes(search.toLowerCase()) || r.email?.toLowerCase().includes(search.toLowerCase()) || r.originalFileName?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = { pending: T.warning, evaluated: T.primary, shortlisted: T.success, rejected: T.danger };
  const statusBg = { pending: '#FEF3C7', evaluated: '#E0F2FE', shortlisted: '#D1FAE5', rejected: '#FEE2E2' };

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 4, height: 28, borderRadius: 2, background: T.gradPrimary }} />
            <h1 style={{ fontFamily: T.fontHead, fontSize: 26, fontWeight: 800, color: T.text, letterSpacing: '-0.5px' }}>Resume Library</h1>
          </div>
          <p style={{ color: T.textMid, fontSize: 14, paddingLeft: 16 }}>{resumes.length} resume{resumes.length !== 1 ? 's' : ''} uploaded</p>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textLight }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resumes..." style={{ padding: '9px 14px 9px 36px', borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 13, color: T.text, background: 'white', outline: 'none', width: 240, boxShadow: T.shadow }} onFocus={e => e.target.style.borderColor = T.primary} onBlur={e => e.target.style.borderColor = T.border} />
        </div>
      </div>

      {loading && <div style={{ color: T.textMid, textAlign: 'center', padding: '60px 0' }}>Loading...</div>}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 16, boxShadow: T.shadow, border: `1px solid ${T.borderLt}` }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: T.gradLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div style={{ fontFamily: T.fontHead, fontSize: 16, fontWeight: 700, color: T.text }}>{search ? 'No matching resumes' : 'No resumes yet'}</div>
          <div style={{ color: T.textMid, fontSize: 13, marginTop: 6 }}>{search ? 'Try a different search term' : 'Upload resumes to get started'}</div>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 16, boxShadow: T.shadowMd, border: `1px solid ${T.borderLt}`, overflow: 'hidden' }}>
        {filtered.map((r, i) => (
          <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < filtered.length - 1 ? `1px solid ${T.borderLt}` : 'none', transition: 'background 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.background = T.bgHover}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}>
            {/* File icon */}
            <div style={{ width: 40, height: 40, borderRadius: 11, background: r.fileType === 'pdf' ? '#FEF2F2' : '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={r.fileType === 'pdf' ? T.danger : T.primary} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>
              </svg>
            </div>
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontFamily: T.fontHead, fontWeight: 700, fontSize: 14, color: T.text }}>{r.candidateName || 'Unknown'}</span>
                <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 20, fontWeight: 700, background: statusBg[r.status] || '#F1F5F9', color: statusColor[r.status] || T.textMid, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: T.fontMono }}>
                  {r.status || 'pending'}
                </span>
              </div>
              <div style={{ fontSize: 12, color: T.textMid }}>{r.email} · {r.originalFileName}</div>
            </div>
            {/* Skills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 200 }}>
              {(r.extractedSkills || []).slice(0, 3).map(s => (
                <span key={s} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 6, background: `${T.primary}10`, color: T.primaryDk, fontWeight: 600 }}>{s}</span>
              ))}
              {r.extractedSkills?.length > 3 && <span style={{ fontSize: 10, color: T.textLight }}>+{r.extractedSkills.length - 3}</span>}
            </div>
            {/* Exp */}
            <div style={{ textAlign: 'center', minWidth: 60 }}>
              <div style={{ fontFamily: T.fontMono, fontWeight: 700, fontSize: 15, color: T.text }}>{r.experienceYears || 0}</div>
              <div style={{ fontSize: 10, color: T.textLight }}>yrs exp</div>
            </div>
            {/* Delete */}
            <button onClick={() => deleteResume(r._id)} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.danger}20`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.danger, transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = T.danger; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = `${T.danger}20`; }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
