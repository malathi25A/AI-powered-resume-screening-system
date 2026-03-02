import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { T } from '../theme';

const empty = { title:'', department:'', location:'', jobType:'Full-time', requiredExperience:'1-3 years', requiredEducation:"Bachelor's Degree", description:'', requiredSkills:[], niceToHaveSkills:[], additionalKeywords:[] };

const TagInput = ({ value, onChange, placeholder, color = T.primary }) => {
  const [inp, setInp] = useState('');
  const add = () => { const v = inp.trim(); if (v && !value.includes(v)) { onChange([...value, v]); setInp(''); } };
  return (
    <div style={{ border: `1.5px solid ${T.border}`, borderRadius: 10, padding: '8px 10px', background: '#FAFCFF', minHeight: 44, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {value.map(t => (
        <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: `${color}12`, color, border: `1px solid ${color}25` }}>
          {t}
          <button onClick={() => onChange(value.filter(x => x !== t))} style={{ background: 'none', border: 'none', cursor: 'pointer', color, fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
        </span>
      ))}
      <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }} placeholder={placeholder} style={{ border: 'none', outline: 'none', fontSize: 13, color: T.text, background: 'transparent', minWidth: 120 }} />
    </div>
  );
};

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchJobs = () => {
    api.get('/jobs').then(r => setJobs(r.data.jobs || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(fetchJobs, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await api.put(`/jobs/${editId}`, form); toast.success('Job updated!'); }
      else { await api.post('/jobs', form); toast.success('Job created!'); }
      setShowForm(false); setForm(empty); setEditId(null); fetchJobs();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const deleteJob = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    await api.delete(`/jobs/${id}`); toast.success('Deleted'); fetchJobs();
  };

  const inp = (key, label, type = 'text', opts) => (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 5, fontFamily: T.fontHead }}>{label}</label>
      {opts ? (
        <select value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: `1.5px solid ${T.border}`, fontSize: 13, color: T.text, background: '#FAFCFF', outline: 'none' }}>
          {opts.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} rows={3} style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: `1.5px solid ${T.border}`, fontSize: 13, color: T.text, background: '#FAFCFF', outline: 'none', resize: 'vertical' }} />
      ) : (
        <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: `1.5px solid ${T.border}`, fontSize: 13, color: T.text, background: '#FAFCFF', outline: 'none' }} />
      )}
    </div>
  );

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 4, height: 28, borderRadius: 2, background: T.gradPrimary }} />
            <h1 style={{ fontFamily: T.fontHead, fontSize: 26, fontWeight: 800, color: T.text, letterSpacing: '-0.5px' }}>Job Descriptions</h1>
          </div>
          <p style={{ color: T.textMid, fontSize: 14, paddingLeft: 16 }}>{jobs.length} active position{jobs.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setShowForm(true); setForm(empty); setEditId(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: T.gradPrimary, border: 'none', borderRadius: 10, color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: T.fontHead, boxShadow: '0 4px 14px rgba(14,165,233,0.3)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          New Job
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', boxShadow: T.shadowLg }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontFamily: T.fontHead, fontSize: 20, fontWeight: 800, color: T.text }}>{editId ? 'Edit Job' : 'New Job Description'}</div>
              <button onClick={() => setShowForm(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 18, color: T.textMid }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                {inp('title', 'Job Title *')}
                {inp('department', 'Department')}
                {inp('location', 'Location')}
                {inp('jobType', 'Job Type', 'text', ['Full-time','Part-time','Contract','Remote','Hybrid'])}
                {inp('requiredExperience', 'Required Experience', 'text', ['0-1 years','1-3 years','3-5 years','5-8 years','8+ years'])}
                {inp('requiredEducation', 'Required Education', 'text', ["Bachelor's Degree","Master's Degree","PhD","Diploma","Any Degree"])}
              </div>
              <div style={{ display: 'grid', gap: 14, marginBottom: 14 }}>
                {inp('description', 'Job Description', 'textarea')}
              </div>
              <div style={{ display: 'grid', gap: 14, marginBottom: 24 }}>
                {[['requiredSkills','Required Skills *', T.primary],['niceToHaveSkills','Nice-to-Have Skills','#8B5CF6'],['additionalKeywords','Keywords',T.success]].map(([key,label,color]) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 5, fontFamily: T.fontHead }}>{label} <span style={{ color: T.textLight, fontWeight: 400 }}>(press Enter to add)</span></label>
                    <TagInput value={form[key]} onChange={v => setForm(p => ({ ...p, [key]: v }))} placeholder="Type and press Enter..." color={color} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', borderRadius: 9, border: `1.5px solid ${T.border}`, background: 'white', color: T.textMid, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', borderRadius: 9, background: T.gradPrimary, border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: T.fontHead, boxShadow: '0 4px 14px rgba(14,165,233,0.3)' }}>
                  {editId ? 'Save Changes' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Jobs Grid */}
      {loading && <div style={{ color: T.textMid, textAlign: 'center', padding: '60px 0' }}>Loading...</div>}
      {!loading && jobs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 16, boxShadow: T.shadow, border: `1px solid ${T.borderLt}` }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: T.gradLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <div style={{ fontFamily: T.fontHead, fontSize: 16, fontWeight: 700, color: T.text }}>No job descriptions yet</div>
          <div style={{ color: T.textMid, fontSize: 13, marginTop: 6 }}>Create your first job to start screening candidates</div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {jobs.map(job => (
          <div key={job._id} style={{ background: 'white', borderRadius: 16, padding: 22, boxShadow: T.shadowMd, border: `1px solid ${T.borderLt}`, transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = T.shadowLg; e.currentTarget.style.borderColor = T.primaryLt; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = T.shadowMd; e.currentTarget.style.borderColor = T.borderLt; }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T.fontHead, fontWeight: 700, fontSize: 16, color: T.text, marginBottom: 4 }}>{job.title}</div>
                <div style={{ fontSize: 12, color: T.textMid }}>{job.department}{job.location ? ` · ${job.location}` : ''}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginLeft: 10 }}>
                <button onClick={() => { setForm({ ...empty, ...job, requiredSkills: job.requiredSkills || [], niceToHaveSkills: job.niceToHaveSkills || [], additionalKeywords: job.additionalKeywords || [] }); setEditId(job._id); setShowForm(true); }} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${T.border}`, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textMid }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button onClick={() => deleteJob(job._id)} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${T.danger}25`, background: '#FEF2F2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.danger }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              {[job.jobType, job.requiredExperience].filter(Boolean).map(t => (
                <span key={t} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: `${T.primary}10`, color: T.primaryDk, fontWeight: 600, fontFamily: T.fontMono }}>{t}</span>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {(job.requiredSkills || []).slice(0, 5).map(s => (
                <span key={s} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: '#F0FDF4', color: T.success, border: `1px solid ${T.success}25`, fontWeight: 600 }}>{s}</span>
              ))}
              {job.requiredSkills?.length > 5 && <span style={{ fontSize: 11, color: T.textLight, padding: '2px 6px' }}>+{job.requiredSkills.length - 5} more</span>}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.borderLt}` }}>
              <div style={{ fontSize: 11, color: T.textMid }}><span style={{ fontWeight: 700, color: T.text, fontFamily: T.fontMono }}>{job.applicationsCount || 0}</span> applications</div>
              <div style={{ fontSize: 11, color: T.textMid }}><span style={{ fontWeight: 700, color: T.success, fontFamily: T.fontMono }}>{job.shortlistedCount || 0}</span> shortlisted</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
