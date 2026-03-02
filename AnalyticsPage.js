import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import api from '../utils/api';
import { T } from '../theme';

export default function AnalyticsPage() {
  const [dash, setDash]     = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/analytics/dashboard'),
      api.get('/analytics/skills'),
    ])
      .then(([d, s]) => {
        setDash(d.data);
        setSkills(s.data?.skills || []);
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  const recData = dash ? [
    { name: 'Strong Fit',       value: dash.strongFitCount      || 0, color: T.success },
    { name: 'Moderate Fit',     value: dash.moderateFitCount    || 0, color: T.warning },
    { name: 'Not Recommended',  value: dash.notRecommendedCount || 0, color: T.danger  },
  ].filter(d => d.value > 0) : [];

  const statCards = [
    { label: 'Total Resumes',   value: dash?.totalResumes     ?? 0, icon: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4','M17 8l-5-5-5 5','M12 3v12'], color: T.primary },
    { label: 'Evaluations',     value: dash?.totalEvaluations ?? 0, icon: ['M22 11.08V12a10 10 0 1 1-5.93-9.14','M22 4L12 14.01l-3-3'], color: '#8B5CF6' },
    { label: 'Avg Score',       value: dash?.avgScore         ?? 0, icon: ['M18 20V10','M12 20V4','M6 20v-6'], color: T.primary },
    { label: 'Shortlisted',     value: dash?.shortlistedCount ?? 0, icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', color: T.warning },
  ];

  const SvgIcon = ({ paths, color, size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {Array.isArray(paths) ? paths.map((p, i) => <path key={i} d={p} />) : <path d={paths} />}
    </svg>
  );

  return (
    <div style={{ padding: '32px 36px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 4, height: 28, borderRadius: 2, background: T.gradPrimary }} />
          <h1 style={{ fontFamily: T.fontHead, fontSize: 26, fontWeight: 800, color: T.text, letterSpacing: '-0.5px' }}>Analytics</h1>
        </div>
        <p style={{ color: T.textMid, fontSize: 14, paddingLeft: 16 }}>Hiring insights and performance metrics</p>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#FEF2F2', border: `1px solid ${T.danger}30`, borderRadius: 10, color: T.danger, fontSize: 13, marginBottom: 20 }}>
          ⚠ {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: T.textMid }}>Loading analytics...</div>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
            {statCards.map(c => (
              <div key={c.label} style={{ background: 'white', borderRadius: 14, padding: '18px 20px', boxShadow: T.shadowMd, border: `1px solid ${T.borderLt}`, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <SvgIcon paths={c.icon} color={c.color} />
                </div>
                <div>
                  <div style={{ fontFamily: T.fontMono, fontWeight: 800, fontSize: 26, color: T.text, lineHeight: 1 }}>{c.value}</div>
                  <div style={{ fontSize: 12, color: T.textMid, marginTop: 4 }}>{c.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

            {/* Recommendation Pie */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: T.shadowMd, border: `1px solid ${T.borderLt}` }}>
              <div style={{ fontFamily: T.fontHead, fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 20 }}>Recommendation Breakdown</div>
              {recData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 0', color: T.textLight }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>📊</div>
                  <div style={{ fontSize: 13 }}>Run evaluations to see breakdown</div>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={recData} cx="50%" cy="50%" innerRadius={55} outerRadius={88} paddingAngle={3} dataKey="value">
                        {recData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(val) => [val, 'Candidates']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                    {recData.map(d => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.textMid }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
                        <span>{d.name}</span>
                        <span style={{ fontWeight: 800, color: T.text, fontFamily: T.fontMono }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Top Skills Bar */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: T.shadowMd, border: `1px solid ${T.borderLt}` }}>
              <div style={{ fontFamily: T.fontHead, fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 20 }}>Top Matched Skills</div>
              {skills.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 0', color: T.textLight }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🔧</div>
                  <div style={{ fontSize: 13 }}>Evaluate candidates to see skill data</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={skills.slice(0, 7)} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" tick={{ fontSize: 11, fill: T.textLight }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="skill" tick={{ fontSize: 11, fill: T.textMid }} width={75} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(val) => [val, 'Matches']} contentStyle={{ borderRadius: 8, border: `1px solid ${T.borderLt}`, fontSize: 12 }} />
                    <Bar dataKey="count" fill={T.primary} radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Score Distribution */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: T.shadowMd, border: `1px solid ${T.borderLt}` }}>
            <div style={{ fontFamily: T.fontHead, fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 20 }}>Score Distribution</div>
            {(!dash?.scoreDistribution || dash.scoreDistribution.every(d => d.count === 0)) ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: T.textLight }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📈</div>
                <div style={{ fontSize: 13 }}>Run evaluations to see score distribution</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dash.scoreDistribution} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.borderLt} vertical={false} />
                  <XAxis dataKey="range" tick={{ fontSize: 12, fill: T.textMid }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: T.textLight }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(val) => [val, 'Candidates']} contentStyle={{ borderRadius: 8, border: `1px solid ${T.borderLt}`, fontSize: 12 }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {(dash.scoreDistribution || []).map((entry, i) => (
                      <Cell key={i} fill={
                        entry.range === '76–100' ? T.success :
                        entry.range === '51–75'  ? T.primary :
                        entry.range === '26–50'  ? T.warning : T.danger
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            {/* Legend */}
            <div style={{ display: 'flex', gap: 20, marginTop: 12, justifyContent: 'center' }}>
              {[['0–25', T.danger, 'Poor'], ['26–50', T.warning, 'Below Avg'], ['51–75', T.primary, 'Good'], ['76–100', T.success, 'Excellent']].map(([range, color, label]) => (
                <div key={range} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: T.textMid }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                  <span>{range} — {label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Evaluations Table */}
          {dash?.recentEvaluations?.length > 0 && (
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: T.shadowMd, border: `1px solid ${T.borderLt}`, marginTop: 20 }}>
              <div style={{ fontFamily: T.fontHead, fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 16 }}>Recent Evaluations</div>
              {dash.recentEvaluations.map((ev, i) => {
                const score = ev.scores?.overall || 0;
                const scoreCol = score >= 75 ? T.success : score >= 50 ? T.warning : T.danger;
                const recBg = ev.recommendation === 'Strong Fit' ? '#D1FAE5' : ev.recommendation === 'Moderate Fit' ? '#FEF3C7' : '#FEE2E2';
                const recCol = ev.recommendation === 'Strong Fit' ? '#065F46' : ev.recommendation === 'Moderate Fit' ? '#92400E' : '#991B1B';
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < dash.recentEvaluations.length - 1 ? `1px solid ${T.borderLt}` : 'none' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{ev.resume?.candidateName || 'Unknown'}</div>
                      <div style={{ fontSize: 11, color: T.textMid, marginTop: 2 }}>{ev.job?.title || 'N/A'}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ fontFamily: T.fontMono, fontWeight: 800, fontSize: 18, color: scoreCol }}>{score}</div>
                      <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 20, background: recBg, color: recCol, fontWeight: 600 }}>{ev.recommendation}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
