import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { T } from '../theme';

const scoreColor = (s) => s >= 75 ? T.success : s >= 50 ? T.warning : '#EF4444';
const scoreBg    = (s) => s >= 75 ? '#D1FAE5' : s >= 50 ? '#FEF3C7' : '#FEE2E2';
const recConfig  = (r) => ({
  'Strong Fit':      { bg: '#D1FAE5', color: '#065F46', border: `${T.success}40`, label: '✓ Strong Fit' },
  'Moderate Fit':    { bg: '#FEF3C7', color: '#92400E', border: `${T.warning}40`, label: '~ Moderate Fit' },
  'Not Recommended': { bg: '#FEE2E2', color: '#991B1B', border: `${T.danger}40`,  label: '✗ Not Recommended' },
}[r] || { bg: '#F1F5F9', color: T.textMid, border: T.border, label: r });

const getName  = (ev) => ev?.resume?.candidateName || ev?.candidateName || 'Unknown';
const getEmail = (ev) => ev?.resume?.email || ev?.email || '';
const getJob   = (ev) => ev?.job?.title || 'N/A';

function ScoreRing({ score, size = 60, strokeW = 5 }) {
  const s = Number(score) || 0;
  const r = (size - strokeW * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (s / 100) * circ;
  const col = scoreColor(s);
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${col}25`} strokeWidth={strokeW} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={strokeW} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2} textAnchor="middle" dy="0.4em" fill={col} fontSize={size > 55 ? 13 : 10} fontWeight="800" fontFamily="'JetBrains Mono'">{s}</text>
    </svg>
  );
}

function ScoreBar({ label, value, color }) {
  const v = Number(value) || 0;
  const col = color || scoreColor(v);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: T.textMid }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono'", color: col }}>{v}</span>
      </div>
      <div style={{ height: 6, background: T.borderLt, borderRadius: 3 }}>
        <div style={{ width: `${v}%`, height: '100%', background: col, borderRadius: 3, transition: 'width 0.8s' }} />
      </div>
    </div>
  );
}

const FILTERS = ['', 'Strong Fit', 'Moderate Fit', 'Not Recommended'];

export default function ResultsPage() {
  const [evaluations, setEvaluations] = useState([]);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEvals = () => {
    setLoading(true); setError('');
    const params = filter ? `?recommendation=${encodeURIComponent(filter)}` : '';
    api.get(`/evaluations${params}`)
      .then(r => {
        const raw = r.data;
        const list = raw?.evaluations ?? raw?.results ?? (Array.isArray(raw) ? raw : []);
        setEvaluations(list);
      })
      .catch(err => setError(err.response?.data?.message || 'Could not load results'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchEvals(); }, [filter]); // eslint-disable-line

  const toggleShortlist = async (ev) => {
    try {
      const { data } = await api.patch(`/evaluations/${ev._id}/shortlist`);
      toast.success(data.message);
      setEvaluations(prev => prev.map(e => e._id === ev._id ? { ...e, shortlisted: data.shortlisted } : e));
      if (selected?._id === ev._id) setSelected(p => ({ ...p, shortlisted: data.shortlisted }));
    } catch { toast.error('Failed'); }
  };

  const downloadPDF = (ev) => {
    const html = `<!DOCTYPE html><html><head><title>${getName(ev)} - Report</title><style>body{font-family:Arial;padding:40px;color:#1a1a1a}h1{color:#0284C7}h2{color:#374151;font-size:16px;border-bottom:1px solid #e5e7eb;padding-bottom:8px;margin-top:24px}.score{font-size:36px;font-weight:bold;color:#0284C7}.badge{padding:4px 12px;border-radius:20px;font-size:12px;font-weight:bold;background:#dcfce7;color:#166534}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.metric{background:#f9fafb;padding:12px;border-radius:8px}</style></head><body>
    <h1>SmartHire AI — Evaluation Report</h1>
    <p><strong>Candidate:</strong> ${getName(ev)}</p><p><strong>Email:</strong> ${getEmail(ev)||'N/A'}</p><p><strong>Role:</strong> ${getJob(ev)}</p><p><strong>Date:</strong> ${new Date(ev.createdAt).toLocaleDateString()}</p>
    <div class="score">${ev.scores?.overall}/100</div><span class="badge">${ev.recommendation}</span>
    <h2>AI Summary</h2><p>${ev.summary||''}</p>
    <h2>Scores</h2><div class="grid"><div class="metric"><strong>Skills</strong><br>${ev.scores?.skills}/100</div><div class="metric"><strong>Experience</strong><br>${ev.scores?.experience}/100</div><div class="metric"><strong>Education</strong><br>${ev.scores?.education}/100</div><div class="metric"><strong>ATS</strong><br>${ev.scores?.ats}/100</div></div>
    <h2>Strengths</h2><ul>${(ev.strengths||[]).map(s=>`<li>${s}</li>`).join('')}</ul>
    <h2>Improvements</h2><ul>${(ev.improvements||[]).map(s=>`<li>${s}</li>`).join('')}</ul>
    <p style="margin-top:40px;color:#9ca3af;font-size:12px">Generated by SmartHire AI · Powered by SmartHire AI Engine</p></body></html>`;
    const w = window.open('', '_blank'); w.document.write(html); w.document.close(); w.print();
  };

  const sorted = [...evaluations].sort((a, b) => (b.scores?.overall||0) - (a.scores?.overall||0));

  return (
    <div style={{ padding: '32px 36px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 4, height: 28, borderRadius: 2, background: T.gradPrimary }} />
            <h1 style={{ fontFamily: T.fontHead, fontSize: 26, fontWeight: 800, color: T.text, letterSpacing: '-0.5px' }}>Evaluation Results</h1>
          </div>
          <p style={{ color: T.textMid, fontSize: 14, paddingLeft: 16 }}>{loading ? 'Loading...' : `${sorted.length} candidate${sorted.length !== 1 ? 's' : ''} evaluated · Click to view full report`}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={fetchEvals} style={{ width: 36, height: 36, borderRadius: 9, border: `1px solid ${T.border}`, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textMid, boxShadow: T.shadow }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          </button>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 14px', borderRadius: 8, border: `1.5px solid ${filter === f ? T.primary : T.border}`, background: filter === f ? `${T.primary}10` : 'white', color: filter === f ? T.primary : T.textMid, cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.15s' }}>
              {f || 'All'}
            </button>
          ))}
        </div>
      </div>

      {error && <div style={{ padding: '12px 16px', background: '#FEF2F2', border: `1px solid ${T.danger}30`, borderRadius: 10, color: T.danger, fontSize: 13, marginBottom: 16 }}>⚠ {error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20 }}>
        {/* List */}
        <div>
          {loading && <div style={{ textAlign: 'center', padding: '60px 0', color: T.textMid }}>Loading evaluations...</div>}
          {!loading && sorted.length === 0 && !error && (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 16, boxShadow: T.shadow, border: `1px solid ${T.borderLt}` }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: T.gradLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
              </div>
              <div style={{ fontFamily: T.fontHead, fontSize: 16, fontWeight: 700, color: T.text }}>No evaluations yet</div>
              <div style={{ color: T.textMid, fontSize: 13, marginTop: 6 }}>Go to AI Evaluate → select job + resumes → Run</div>
            </div>
          )}

          <div style={{ background: 'white', borderRadius: 16, boxShadow: T.shadowMd, border: `1px solid ${T.borderLt}`, overflow: 'hidden' }}>
            {sorted.map((ev, i) => {
              const rc = recConfig(ev.recommendation);
              const isSel = selected?._id === ev._id;
              return (
                <div key={ev._id} onClick={() => setSelected(isSel ? null : ev)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < sorted.length - 1 ? `1px solid ${T.borderLt}` : 'none', cursor: 'pointer', transition: 'background 0.1s', background: isSel ? `${T.primary}06` : 'white', borderLeft: isSel ? `3px solid ${T.primary}` : '3px solid transparent' }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = T.bgHover; }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'white'; }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.textLight, fontFamily: T.fontMono, width: 24, flexShrink: 0 }}>#{i + 1}</div>
                  <ScoreRing score={ev.scores?.overall} size={52} strokeW={4} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontFamily: T.fontHead, fontWeight: 700, fontSize: 14, color: T.text }}>{getName(ev)}</span>
                      {ev.shortlisted && <svg width="13" height="13" viewBox="0 0 24 24" fill={T.warning} stroke={T.warning} strokeWidth="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
                    </div>
                    <div style={{ fontSize: 11, color: T.textMid }}>{getJob(ev)}{getEmail(ev) ? ` · ${getEmail(ev)}` : ''}</div>
                  </div>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 700, background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`, flexShrink: 0, whiteSpace: 'nowrap' }}>{rc.label}</span>
                  <div style={{ textAlign: 'right', minWidth: 80 }}>
                    <div style={{ fontSize: 11, color: T.textMid }}>Skills <span style={{ fontWeight: 700, color: scoreColor(ev.scores?.skills), fontFamily: T.fontMono }}>{ev.scores?.skills ?? '-'}%</span></div>
                    <div style={{ fontSize: 11, color: T.textMid, marginTop: 2 }}>Exp <span style={{ fontWeight: 700, color: scoreColor(ev.scores?.experience), fontFamily: T.fontMono }}>{ev.scores?.experience ?? '-'}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (() => {
          const rc = recConfig(selected.recommendation);
          return (
            <div style={{ background: 'white', border: `1px solid ${T.primaryLt}`, borderRadius: 16, padding: 24, position: 'sticky', top: 20, maxHeight: 'calc(100vh - 80px)', overflowY: 'auto', boxShadow: T.shadowLg }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 18 }}>
                <div>
                  <div style={{ fontFamily: T.fontHead, fontSize: 17, fontWeight: 800, color: T.text }}>{getName(selected)}</div>
                  <div style={{ color: T.textMid, fontSize: 12, marginTop: 3 }}>{getEmail(selected)}</div>
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 700, background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>{rc.label}</span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${T.border}`, background: '#F1F5F9', cursor: 'pointer', color: T.textMid, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>

              {/* Score rings */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16, padding: 14, background: T.bgHover, borderRadius: 12 }}>
                {[['Overall', selected.scores?.overall, 72], ['Skills', selected.scores?.skills, 52], ['Exp', selected.scores?.experience, 52]].map(([label, val, size]) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <ScoreRing score={val} size={size} strokeW={4} />
                    <div style={{ fontSize: 10, color: T.textMid, marginTop: 4, fontFamily: T.fontMono, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                  </div>
                ))}
              </div>

              <ScoreBar label="Education Match" value={selected.scores?.education} />
              <ScoreBar label="Keyword Density" value={selected.scores?.keywords} color={T.warning} />
              <ScoreBar label="ATS Score" value={selected.scores?.ats} color='#8B5CF6' />

              {selected.summary && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.borderLt}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.textMid, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontFamily: T.fontMono }}>AI Summary</div>
                  <p style={{ color: T.textMid, fontSize: 12, lineHeight: 1.7 }}>{selected.summary}</p>
                </div>
              )}

              {selected.strengths?.length > 0 && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.borderLt}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.textMid, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontFamily: T.fontMono }}>Strengths</div>
                  {selected.strengths.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'start', marginBottom: 6, fontSize: 12, color: T.text }}>
                      <span style={{ color: T.success, flexShrink: 0, marginTop: 1 }}>✓</span>{s}
                    </div>
                  ))}
                </div>
              )}

              {selected.missingSkills?.length > 0 && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.borderLt}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.textMid, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontFamily: T.fontMono }}>Missing Skills</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {selected.missingSkills.map(s => (
                      <span key={s} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: '#FEF2F2', color: T.danger, border: `1px solid ${T.danger}25`, fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {selected.matchedSkills?.length > 0 && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.borderLt}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.textMid, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontFamily: T.fontMono }}>Matched Skills</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {selected.matchedSkills.map(s => (
                      <span key={s} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: '#F0FDF4', color: T.success, border: `1px solid ${T.success}30`, fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {selected.improvements?.length > 0 && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.borderLt}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.textMid, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontFamily: T.fontMono }}>Suggestions</div>
                  {selected.improvements.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: T.textMid, marginBottom: 6 }}>
                      <span style={{ color: T.primary, fontFamily: T.fontMono, flexShrink: 0 }}>{i + 1}.</span>{s}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 18 }}>
                <button onClick={() => toggleShortlist(selected)} style={{ padding: '9px', borderRadius: 9, cursor: 'pointer', fontWeight: 700, fontSize: 12, fontFamily: T.fontHead, border: selected.shortlisted ? `1px solid ${T.danger}40` : `1px solid ${T.success}40`, background: selected.shortlisted ? '#FEF2F2' : '#F0FDF4', color: selected.shortlisted ? T.danger : T.success }}>
                  {selected.shortlisted ? '✕ Remove' : '★ Shortlist'}
                </button>
                <button onClick={() => downloadPDF(selected)} style={{ padding: '9px', borderRadius: 9, border: `1px solid ${T.border}`, cursor: 'pointer', background: '#F8FAFC', color: T.textMid, fontWeight: 600, fontSize: 12 }}>
                  ↓ PDF Report
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
