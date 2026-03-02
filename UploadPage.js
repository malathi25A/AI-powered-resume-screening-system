import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { T } from '../theme';

export default function UploadPage() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);

  const onDrop = useCallback(accepted => {
    const valid = accepted.filter(f => ['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(f.type));
    if (valid.length < accepted.length) toast.error('Only PDF and DOCX files are accepted');
    setFiles(prev => [...prev, ...valid.slice(0, 20 - prev.length)]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }, multiple: true, maxFiles: 20 });

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const handleUpload = async () => {
    if (!files.length) return toast.error('Please select files first');
    setUploading(true);
    const fd = new FormData();
    files.forEach(f => fd.append('resumes', f));
    try {
      const { data } = await api.post('/resumes/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResults(data.uploaded || []);
      setFiles([]);
      toast.success(`${data.uploaded?.length || 0} resume(s) uploaded successfully!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const fmtSize = (b) => b > 1048576 ? `${(b/1048576).toFixed(1)}MB` : `${(b/1024).toFixed(0)}KB`;

  return (
    <div style={{ padding: '32px 36px', maxWidth: 800 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 4, height: 28, borderRadius: 2, background: T.gradPrimary }} />
          <h1 style={{ fontFamily: T.fontHead, fontSize: 26, fontWeight: 800, color: T.text, letterSpacing: '-0.5px' }}>Upload Resumes</h1>
        </div>
        <p style={{ color: T.textMid, fontSize: 14, paddingLeft: 16 }}>Upload PDF or DOCX files — up to 20 at once</p>
      </div>

      {/* Drop zone */}
      <div {...getRootProps()} style={{
        border: `2px dashed ${isDragActive ? T.primary : T.border}`,
        borderRadius: 16, padding: '48px 32px', textAlign: 'center', cursor: 'pointer',
        background: isDragActive ? `${T.primary}08` : 'white',
        transition: 'all 0.2s', marginBottom: 20,
        boxShadow: isDragActive ? `0 0 0 4px ${T.primary}18` : T.shadow,
      }}>
        <input {...getInputProps()} />
        <div style={{ width: 56, height: 56, borderRadius: 16, background: isDragActive ? `${T.primary}18` : T.gradLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={T.primary} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/>
          </svg>
        </div>
        <div style={{ fontFamily: T.fontHead, fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 8 }}>
          {isDragActive ? 'Drop files here' : 'Drag & drop resumes here'}
        </div>
        <div style={{ color: T.textMid, fontSize: 13, marginBottom: 16 }}>or click to browse your files</div>
        <div style={{ display: 'inline-flex', gap: 8 }}>
          {['PDF', 'DOCX'].map(t => (
            <span key={t} style={{ padding: '3px 10px', borderRadius: 6, background: `${T.primary}12`, color: T.primary, fontSize: 11, fontWeight: 700, fontFamily: T.fontMono, border: `1px solid ${T.primary}25` }}>{t}</span>
          ))}
          <span style={{ padding: '3px 10px', borderRadius: 6, background: '#F0FDF4', color: T.success, fontSize: 11, fontWeight: 700, fontFamily: T.fontMono, border: `1px solid ${T.success}30` }}>Max 20 files</span>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: T.shadowMd, border: `1px solid ${T.borderLt}`, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontFamily: T.fontHead, fontWeight: 700, fontSize: 15, color: T.text }}>
              {files.length} file{files.length > 1 ? 's' : ''} selected
            </div>
            <button onClick={() => setFiles([])} style={{ fontSize: 12, color: T.danger, background: '#FEF2F2', border: `1px solid ${T.danger}30`, borderRadius: 7, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>Clear all</button>
          </div>
          {files.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < files.length - 1 ? `1px solid ${T.borderLt}` : 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: f.type.includes('pdf') ? '#FEF2F2' : '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={f.type.includes('pdf') ? T.danger : T.primary} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                <div style={{ fontSize: 11, color: T.textLight, marginTop: 1, fontFamily: T.fontMono }}>{fmtSize(f.size)} · {f.type.includes('pdf') ? 'PDF' : 'DOCX'}</div>
              </div>
              <button onClick={() => removeFile(i)} style={{ color: T.textLight, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '2px 6px', borderRadius: 5 }}>×</button>
            </div>
          ))}
        </div>
      )}

      <button onClick={handleUpload} disabled={uploading || !files.length} style={{
        padding: '13px 28px', background: (!files.length || uploading) ? T.border : T.gradPrimary,
        border: 'none', borderRadius: 11, color: (!files.length || uploading) ? T.textLight : 'white',
        fontWeight: 700, fontSize: 15, cursor: (!files.length || uploading) ? 'not-allowed' : 'pointer',
        fontFamily: T.fontHead, boxShadow: (!files.length || uploading) ? 'none' : '0 4px 14px rgba(14,165,233,0.3)',
        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/>
        </svg>
        {uploading ? 'Uploading...' : `Upload ${files.length || ''} Resume${files.length !== 1 ? 's' : ''}`}
      </button>

      {/* Success results */}
      {results.length > 0 && (
        <div style={{ marginTop: 24, background: '#F0FDF4', border: `1px solid ${T.success}30`, borderRadius: 14, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>
            </svg>
            <span style={{ fontFamily: T.fontHead, fontWeight: 700, fontSize: 14, color: '#065F46' }}>{results.length} resumes uploaded successfully!</span>
          </div>
          {results.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#047857', padding: '4px 0' }}>
              <span style={{ color: T.success }}>✓</span> {r.originalFileName || r.candidateName || `Resume ${i + 1}`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
