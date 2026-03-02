import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { T } from '../theme';

const scoreColor = (s) => s >= 75 ? T.success : s >= 50 ? T.warning : T.danger;
const getName = (ev) => ev?.resume?.candidateName || 'Unknown';
const getEmail = (ev) => ev?.resume?.email || '';
const getJob = (ev) => ev?.job?.title || 'N/A';

export default function ShortlistedPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    api.get('/evaluations?shortlisted=true')
      .then(r => { const raw = r.data; setCandidates(raw?.evaluations ?? raw?.results ?? (Array.isArray(raw) ? raw : [])); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(fetch, []);

  const removeShortlist = async (ev) => {
    try {
      await api.patch(`/evaluations/${ev._id}/shortlist`);
      toast.success('Removed from shortlist');
      fetch();
    } catch { toast.error('Failed'); }
  };

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 4, height: 28, borderRadius: 2, background: T.gradPrimary }} />
          <h1 style={{ fontFamily: T.fontHead, fontSize: 26, fontWeight: 800, color: T.text, letterSpacing: '-0.5px' }}>Shortlisted Candidates</h1>
        </div>
        <p style={{ color: T.textMid, fontSize: 14, paddingLeft: 16 }}>{candidates.length} top candidate{candidates.length !== 1 ? 's' : ''} selected for interview</p>
      </div>

      {loading && <div style={{ color: T.textMid, textAlign: 'center', padding: '60px 0' }}>Loading...</div>}

      {!loading && candidates.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 16, boxShadow: T.shadow, border: `1px solid ${T.borderLt}` }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill={T.warning} stroke={T.warning} strokeWidth="1">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div style={{ fontFamily: T.fontHead, fontSize: 16, fontWeight: 700, color: T.text }}>No shortlisted candidates yet</div>
          <div style={{ color: T.textMid, fontSize: 13, marginTop: 6 }}>Star candidates in the Results page to shortlist them</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {candidates.sort((a, b) => (b.scores?.overall||0) - (a.scores?.overall||0)).map((ev, i) => (
          <div key={ev._id} style={{ background: 'white', borderRadius: 16, padding: 22, boxShadow: T.shadowMd, border: `1px solid ${T.borderLt}`, position: 'relative', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = T.shadowLg; e.currentTarget.style.borderColor = T.primaryLt; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = T.shadowMd; e.currentTarget.style.borderColor = T.borderLt; }}>
            {/* Rank badge */}
            <div style={{ position: 'absolute', top: 16, right: 16, width: 28, height: 28, borderRadius: 8, background: i === 0 ? '#FEF3C7' : i === 1 ? '#F1F5F9' : '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: T.gradPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16, fontFamily: T.fontHead, boxShadow: '0 4px 12px rgba(14,165,233,0.25)', flexShrink: 0 }}>
                {getName(ev).charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: T.fontHead, fontWeight: 700, fontSize: 15, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getName(ev)}</div>
                <div style={{ fontSize: 12, color: T.textMid, marginTop: 2 }}>{getEmail(ev)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, padding: '10px 14px', background: T.bgHover, borderRadius: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: T.textLight, fontFamily: T.fontMono, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overall Score</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: scoreColor(ev.scores?.overall), fontFamily: T.fontMono, lineHeight: 1.2 }}>{ev.scores?.overall}<span style={{ fontSize: 12, fontWeight: 400, color: T.textLight }}>/100</span></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: T.textLight, fontFamily: T.fontMono, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Position</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginTop: 2 }}>{getJob(ev)}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
              {[['Skills', ev.scores?.skills], ['Experience', ev.scores?.experience], ['ATS', ev.scores?.ats]].map(([label, val]) => (
                <div key={label} style={{ textAlign: 'center', padding: '8px', background: '#FAFCFF', borderRadius: 8, border: `1px solid ${T.borderLt}` }}>
                  <div style={{ fontFamily: T.fontMono, fontWeight: 700, fontSize: 14, color: scoreColor(val) }}>{val ?? '-'}</div>
                  <div style={{ fontSize: 10, color: T.textLight, marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>

            {ev.summary && <p style={{ fontSize: 12, color: T.textMid, lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ev.summary}</p>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => removeShortlist(ev)} style={{ flex: 1, padding: '8px', borderRadius: 9, border: `1px solid ${T.danger}30`, background: '#FEF2F2', color: T.danger, fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: T.fontHead }}>
                ✕ Remove
              </button>
              <div style={{ flex: 1, padding: '8px', borderRadius: 9, background: '#F0FDF4', border: `1px solid ${T.success}30`, color: T.success, fontWeight: 600, fontSize: 12, textAlign: 'center' }}>
                ✓ Shortlisted
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
