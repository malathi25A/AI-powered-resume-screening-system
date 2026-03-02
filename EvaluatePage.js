import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { T } from '../theme';

export default function EvaluatePage() {
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [selectedResumes, setSelectedResumes] = useState([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState([]);
  const [weights, setWeights] = useState({ skills: 35, experience: 30, education: 15, keywords: 10, ats: 10 });
  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  useEffect(() => {
    api.get('/jobs').then(r => setJobs(r.data.jobs || []));
    api.get('/resumes').then(r => setResumes(r.data.resumes || []));
  }, []);

  const toggleResume = (id) => setSelectedResumes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelectedResumes(selectedResumes.length === resumes.length ? [] : resumes.map(r => r._id));

  const runEval = async () => {
    if (!selectedJob) return toast.error('Please select a job');
    if (!selectedResumes.length) return toast.error('Please select at least one resume');
    if (total !== 100) return toast.error('Scoring weights must add up to 100%');
    setRunning(true); setResults([]);
    setProgress({ current: 0, total: selectedResumes.length, status: 'Preparing...' });
    try {
      setProgress(p => ({ ...p, status: 'Running SmartHire AI Engine...' }));
      const { data } = await api.post('/evaluations/run', { jobId: selectedJob, resumeIds: selectedResumes, weights });
      setResults(data.results || []);
      setProgress({ current: selectedResumes.length, total: selectedResumes.length, status: 'Complete!' });
      toast.success(`${data.results?.length || 0} evaluations completed!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Evaluation failed');
      setProgress(null);
    } finally { setRunning(false); }
  };

  const weightConfig = [
    { key: 'skills', label: 'Skills Match', color: T.primary },
    { key: 'experience', label: 'Experience', color: '#8B5CF6' },
    { key: 'education', label: 'Education', color: T.success },
    { key: 'keywords', label: 'Keywords', color: T.warning },
    { key: 'ats', label: 'ATS Score', color: T.danger },
  ];

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 4, height: 28, borderRadius: 2, background: T.gradPrimary }} />
          <h1 style={{ fontFamily: T.fontHead, fontSize: 26, fontWeight: 800, color: T.text, letterSpacing: '-0.5px' }}>AI Evaluate</h1>
        </div>
        <p style={{ color: T.textMid, fontSize: 14, paddingLeft: 16 }}>Screen candidates with SmartHire AI Engine</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Step 1 - Job */}
          <div style={{ background: 'white', borderRadius: 16, padding: 22, boxShadow: T.shadowMd, border: `1px solid ${T.borderLt}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: T.gradPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', fontFamily: T.fontMono }}>1</div>
              <div style={{ fontFamily: T.fontHead, fontWeight: 700, fontSize: 15, color: T.text }}>Select Job Description</div>
            </div>
            <select value={selectedJob} onChange={e => setSelectedJob(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${selectedJob ? T.primary : T.border}`, fontSize: 13, color: T.text, background: '#FAFCFF', outline: 'none', cursor: 'pointer' }}>
              <option value="">— Choose a job position —</option>
              {jobs.map(j => <option key={j._id} value={j._id}>{j.title} {j.department ? `· ${j.department}` : ''}</option>)}
            </select>
          </div>

          {/* Step 2 - Resumes */}
          <div style={{ background: 'white', borderRadius: 16, padding: 22, boxShadow: T.shadowMd, border: `1px solid ${T.borderLt}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: T.gradPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', fontFamily: T.fontMono }}>2</div>
                <div style={{ fontFamily: T.fontHead, fontWeight: 700, fontSize: 15, color: T.text }}>Select Candidates</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: T.textMid, fontFamily: T.fontMono }}>{selectedResumes.length}/{resumes.length}</span>
                <button onClick={toggleAll} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 7, border: `1px solid ${T.border}`, background: 'white', color: T.textMid, cursor: 'pointer', fontWeight: 600 }}>
                  {selectedResumes.length === resumes.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>
            <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {resumes.length === 0 && <div style={{ color: T.textLight, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No resumes uploaded yet</div>}
              {resumes.map(r => {
                const sel = selectedResumes.includes(r._id);
                return (
                  <div key={r._id} onClick={() => toggleResume(r._id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${sel ? T.primary : T.borderLt}`, background: sel ? `${T.primary}06` : '#FAFCFF', cursor: 'pointer', transition: 'all 0.12s' }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${sel ? T.primary : T.border}`, background: sel ? T.primary : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.12s' }}>
                      {sel && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.candidateName || r.originalFileName}</div>
                      <div style={{ fontSize: 11, color: T.textMid, marginTop: 1 }}>{r.email} · {r.fileType?.toUpperCase()}</div>
                    </div>
                    {r.status === 'evaluated' && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 6, background: '#E0F2FE', color: T.primary, fontWeight: 600, flexShrink: 0 }}>Evaluated</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Run Button */}
          <button onClick={runEval} disabled={running || !selectedJob || !selectedResumes.length || total !== 100} style={{
            padding: '15px', background: (running || !selectedJob || !selectedResumes.length || total !== 100) ? T.border : T.gradPrimary,
            border: 'none', borderRadius: 12, color: (running || !selectedJob || !selectedResumes.length || total !== 100) ? T.textLight : 'white',
            fontWeight: 800, fontSize: 16, cursor: (running || !selectedJob || !selectedResumes.length || total !== 100) ? 'not-allowed' : 'pointer',
            fontFamily: T.fontHead, letterSpacing: '-0.3px',
            boxShadow: (running || !selectedJob || !selectedResumes.length || total !== 100) ? 'none' : '0 6px 20px rgba(14,165,233,0.35)',
            transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 4a6 6 0 1 1-6 6 6 6 0 0 1 6-6zm0 2a4 4 0 1 0 4 4 4 4 0 0 0-4-4z"/>
            </svg>
            {running ? 'Running SmartHire AI Engine...' : `Run AI Evaluation (${selectedResumes.length} candidates)`}
          </button>

          {/* Progress */}
          {progress && (
            <div style={{ background: 'white', borderRadius: 14, padding: 20, boxShadow: T.shadowMd, border: `1px solid ${T.borderLt}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: T.fontHead }}>{progress.status}</span>
                <span style={{ fontSize: 12, fontFamily: T.fontMono, color: T.primary }}>{progress.current}/{progress.total}</span>
              </div>
              <div style={{ height: 8, background: T.borderLt, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(progress.current / progress.total) * 100}%`, background: T.gradPrimary, borderRadius: 4, transition: 'width 0.5s' }} />
              </div>
              {results.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  {results.map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < results.length - 1 ? `1px solid ${T.borderLt}` : 'none', fontSize: 12 }}>
                      <span style={{ color: T.text, fontWeight: 500 }}>{r.candidateName || 'Candidate'}</span>
                      <span style={{ color: r.score >= 75 ? T.success : r.score >= 50 ? T.warning : T.danger, fontWeight: 700, fontFamily: T.fontMono }}>{r.score}/100</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right - Weights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 22, boxShadow: T.shadowMd, border: `1px solid ${T.borderLt}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ fontFamily: T.fontHead, fontWeight: 700, fontSize: 15, color: T.text }}>Scoring Weights</div>
              <button onClick={() => setWeights({ skills: 35, experience: 30, education: 15, keywords: 10, ats: 10 })} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, border: `1px solid ${T.border}`, background: 'white', color: T.textMid, cursor: 'pointer', fontFamily: T.fontMono }}>Reset</button>
            </div>
            {weightConfig.map(w => (
              <div key={w.key} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: T.textMid, fontWeight: 500 }}>{w.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, fontFamily: T.fontMono, color: w.color }}>{weights[w.key]}%</span>
                </div>
                <input type="range" min="5" max="60" value={weights[w.key]} onChange={e => setWeights(p => ({ ...p, [w.key]: parseInt(e.target.value) }))}
                  style={{ width: '100%', accentColor: w.color, cursor: 'pointer', height: 4 }} />
              </div>
            ))}
            <div style={{ padding: '10px 14px', borderRadius: 10, background: total === 100 ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${total === 100 ? T.success + '40' : T.danger + '40'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <span style={{ fontSize: 11, color: T.textMid, fontFamily: T.fontMono }}>TOTAL</span>
              <span style={{ fontSize: 14, fontWeight: 800, fontFamily: T.fontMono, color: total === 100 ? T.success : T.danger }}>
                {total}% {total === 100 ? '✓' : '⚠'}
              </span>
            </div>
          </div>

          {/* Info box */}
          <div style={{ background: `${T.primary}08`, borderRadius: 14, padding: 18, border: `1px solid ${T.primary}20` }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.primary} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
              </svg>
              <span style={{ fontFamily: T.fontHead, fontWeight: 700, fontSize: 13, color: T.primaryDk }}>How it works</span>
            </div>
            {['SmartHire AI Engine reads each resume', 'Compares against job requirements', 'Scores 6 dimensions (0-100)', 'Ranks by weighted overall score'].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, fontSize: 12, color: T.textMid }}>
                <span style={{ color: T.primary, fontWeight: 700, fontFamily: T.fontMono, fontSize: 10 }}>{i + 1}.</span> {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
