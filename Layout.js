// src/components/Layout/Layout.js
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { T } from '../../theme';

// SVG Icon components — clean professional icons
const Icon = ({ d, size = 18, stroke = T.textMid, fill = 'none', strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const Icons = {
  dashboard:  ['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'],
  upload:     ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'],
  library:    ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'],
  jobs:       ['M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z', 'M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16'],
  ai:         'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 4a6 6 0 1 1-6 6 6 6 0 0 1 6-6zm0 2a4 4 0 1 0 4 4 4 4 0 0 0-4-4z',
  results:    ['M18 20V10', 'M12 20V4', 'M6 20v-6'],
  star:       'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  analytics:  ['M21 21H3', 'M21 3v18', 'M7 16l4-8 4 6 3-4'],
  logout:     ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
  menu:       ['M3 12h18', 'M3 6h18', 'M3 18h18'],
  sparkle:    ['M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z', 'M5 18l1 3 1-3', 'M19 3l1 3 1-3'],
};

const navItems = [
  { to: '/',           iconKey: 'dashboard', label: 'Dashboard',       end: true },
  { to: '/upload',     iconKey: 'upload',    label: 'Upload Resume'              },
  { to: '/resumes',    iconKey: 'library',   label: 'Resume Library'             },
  { to: '/jobs',       iconKey: 'jobs',      label: 'Job Descriptions'           },
  { to: '/evaluate',   iconKey: 'ai',        label: 'AI Evaluate'                },
  { to: '/results',    iconKey: 'results',   label: 'Eval Results'               },
  { to: '/shortlisted',iconKey: 'star',      label: 'Shortlisted'                },
  { to: '/analytics',  iconKey: 'analytics', label: 'Analytics'                  },
];

const sections = [
  { label: 'Overview',  items: navItems.slice(0, 1) },
  { label: 'Resumes',   items: navItems.slice(1, 3) },
  { label: 'Hiring',    items: navItems.slice(3, 5) },
  { label: 'Results',   items: navItems.slice(5) },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'HR';

  return (
    <div style={{ display: 'flex', height: '100vh', background: T.gradBg, overflow: 'hidden' }}>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside style={{
        width: collapsed ? 64 : 230, minWidth: collapsed ? 64 : 230,
        background: T.bgSidebar,
        display: 'flex', flexDirection: 'column', height: '100vh',
        overflow: 'hidden', transition: 'width 0.25s ease',
        boxShadow: '4px 0 24px rgba(14,165,233,0.08)',
        position: 'relative', zIndex: 10,
      }}>

        {/* Logo */}
        <div style={{
          padding: collapsed ? '20px 14px' : '20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: T.gradPrimary,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 16px rgba(14,165,233,0.4)', flexShrink: 0,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>
                  <path d="M5 18l1 3 1-3"/><path d="M19 3l1 3 1-3"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: T.fontHead, fontWeight: 800, fontSize: 15, color: 'white', letterSpacing: '-0.3px' }}>
                  SmartHire <span style={{ color: T.primary }}>AI</span>
                </div>
                <div style={{ fontSize: 9, color: T.primary, fontFamily: T.fontMono, letterSpacing: '1.5px', opacity: 0.8 }}>
                  SmartHire AI Engine
                </div>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{ width: 36, height: 36, borderRadius: 10, background: T.gradPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(14,165,233,0.4)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>
              </svg>
            </div>
          )}
          <button onClick={() => setCollapsed(c => !c)} style={{
            background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 7,
            color: '#94A3B8', cursor: 'pointer', padding: '5px 6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: collapsed ? '12px 8px' : '12px 10px', overflowY: 'auto' }}>
          {sections.map(sec => (
            <div key={sec.label} style={{ marginBottom: 4 }}>
              {!collapsed && (
                <div style={{
                  fontSize: 9, color: 'rgba(148,163,184,0.5)', fontWeight: 700,
                  letterSpacing: '1.5px', textTransform: 'uppercase',
                  padding: '10px 10px 5px', fontFamily: T.fontMono,
                }}>{sec.label}</div>
              )}
              {sec.items.map(item => {
                const iconPaths = Icons[item.iconKey];
                return (
                  <NavLink key={item.to} to={item.to} end={item.end}
                    title={collapsed ? item.label : undefined}
                    style={({ isActive }) => ({
                      display: 'flex', alignItems: 'center',
                      gap: collapsed ? 0 : 10,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      padding: collapsed ? '10px' : '9px 12px',
                      borderRadius: 9, cursor: 'pointer',
                      fontSize: 13, fontWeight: isActive ? 600 : 400,
                      marginBottom: 2, textDecoration: 'none',
                      transition: 'all 0.15s',
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(14,165,233,0.18), rgba(14,165,233,0.08))'
                        : 'transparent',
                      border: `1px solid ${isActive ? 'rgba(14,165,233,0.25)' : 'transparent'}`,
                      color: isActive ? T.primary : '#94A3B8',
                      backdropFilter: isActive ? 'blur(4px)' : 'none',
                    })}>
                    <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                      <Icon
                        d={iconPaths}
                        size={16}
                        stroke="currentColor"
                        strokeWidth={1.75}
                      />
                    </span>
                    {!collapsed && <span style={{ fontFamily: T.fontBody }}>{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div style={{
          padding: collapsed ? '12px 8px' : '12px 14px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '8px' : '10px 10px',
            borderRadius: 9,
            background: 'rgba(14,165,233,0.06)',
            border: '1px solid rgba(14,165,233,0.1)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: T.gradPrimary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 12, color: 'white',
              flexShrink: 0, boxShadow: '0 2px 8px rgba(14,165,233,0.3)',
            }}>{initials}</div>
            {!collapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name || 'User'}
                  </div>
                  <div style={{ fontSize: 10, color: T.primary, fontFamily: T.fontMono, letterSpacing: '0.5px' }}>
                    {user?.role?.toUpperCase() || 'HR'}
                  </div>
                </div>
                <button onClick={handleLogout} title="Logout" style={{
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                  borderRadius: 7, color: '#EF4444', cursor: 'pointer',
                  padding: '5px 6px', display: 'flex', alignItems: 'center', transition: 'all 0.15s',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto', height: '100vh', background: 'transparent' }}>
        <Outlet />
      </main>
    </div>
  );
}
