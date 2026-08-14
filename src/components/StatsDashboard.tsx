import React, { useMemo } from 'react';
import { Trash2, Calendar, Trophy, Star, Zap, Target, Flag, TrendingUp } from 'lucide-react';
import type { AppStats } from '../App';

interface StatsDashboardProps {
  stats: AppStats;
  onReset: () => void;
}

// ── Achievements definition ───────────────────────────────────────────────────
interface Achievement {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  unlocked: (s: AppStats) => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_test',
    icon: <Flag size={16} />,
    title: 'Birinchi qadam',
    desc: '1 ta test yakunlash',
    unlocked: s => s.totalTests >= 1,
  },
  {
    id: 'five_tests',
    icon: <Target size={16} />,
    title: '5 ta test',
    desc: '5 ta test yakunlash',
    unlocked: s => s.totalTests >= 5,
  },
  {
    id: 'speed_50',
    icon: <Zap size={16} />,
    title: 'Chaqqon yozuvchi',
    desc: '50+ WPM tezlikka erishish',
    unlocked: s => s.bestWpm >= 50,
  },
  {
    id: 'speed_80',
    icon: <Trophy size={16} />,
    title: 'Speed Demon 🚀',
    desc: '80+ WPM tezlikka erishish',
    unlocked: s => s.bestWpm >= 80,
  },
  {
    id: 'perfect',
    icon: <Star size={16} />,
    title: '100% Aniqlik',
    desc: 'Bir testda 100% aniqlik',
    unlocked: s => s.accuracyHistory.some(a => a === 100),
  },
  {
    id: 'bilingual',
    icon: <TrendingUp size={16} />,
    title: 'Ikki tilli',
    desc: 'Har ikki tilda 1+ test',
    unlocked: s => s.uzTests >= 1 && s.ruTests >= 1,
  },
];

// ── WPM SVG Line Chart ────────────────────────────────────────────────────────
// Sanitize label to a valid SVG id (no spaces, emoji, special chars)
function toSvgId(label: string): string {
  return 'grad-' + label.replace(/[^a-zA-Z0-9]/g, '_');
}

const WpmChart: React.FC<{ data: number[]; label: string; color: string }> = ({ data, label, color }) => {
  const W = 100;
  const H = 60;
  const PAD = 4;

  const { points, min: dMin, max: dMax } = useMemo(() => {
    if (data.length < 2) return { points: null, min: 0, max: 0 };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => {
      const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
      const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
      return `${x},${y}`;
    }).join(' ');
    return { points: pts, min, max };
  }, [data]);

  if (data.length === 0) {
    return (
      <div style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '80px', color: 'var(--text-muted)', fontSize: '0.82rem', gap: '4px'
      }}>
        <TrendingUp size={20} style={{ opacity: 0.4 }} />
        <span>{label} uchun ma'lumot yo'q</span>
      </div>
    );
  }

  const lastWpm = data[data.length - 1];
  const maxWpm = Math.max(...data);
  const gradId = toSvgId(label);
  const range = dMax - dMin || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <span>{label}</span>
        <span style={{ color, fontWeight: 700 }}>So'nggi: {lastWpm} | Max: {maxWpm} WPM</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '70px', overflow: 'visible' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {points && (
          <>
            {/* Area fill */}
            <polygon
              points={`${PAD},${H - PAD} ${points} ${W - PAD},${H - PAD}`}
              fill={`url(#${gradId})`}
            />
            {/* Line */}
            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Dots — use pre-computed min/max from useMemo */}
            {data.map((v, i) => {
              const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
              const y = H - PAD - ((v - dMin) / range) * (H - PAD * 2);
              return (
                <circle key={i} cx={x} cy={y} r="2.2" fill={color} stroke="var(--bg-secondary)" strokeWidth="1.2" />
              );
            })}
          </>
        )}
        {data.length === 1 && (
          <text x="50" y="30" textAnchor="middle" fill={color} fontSize="8" fontWeight="700">
            {data[0]} WPM
          </text>
        )}
      </svg>
    </div>
  );
};

// ── Daily Challenge ───────────────────────────────────────────────────────────
const DAILY_GOAL = 3; // complete 3 tests today

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats, onReset }) => {
  const averageWpm = stats.wpmHistory.length > 0
    ? Math.round(stats.wpmHistory.reduce((a, b) => a + b, 0) / stats.wpmHistory.length)
    : 0;

  const averageAccuracy = stats.accuracyHistory.length > 0
    ? Math.round(stats.accuracyHistory.reduce((a, b) => a + b, 0) / stats.accuracyHistory.length)
    : 0;

  const uzAvgWpm = stats.uzWpmHistory.length > 0
    ? Math.round(stats.uzWpmHistory.reduce((a, b) => a + b, 0) / stats.uzWpmHistory.length)
    : 0;

  const ruAvgWpm = stats.ruWpmHistory.length > 0
    ? Math.round(stats.ruWpmHistory.reduce((a, b) => a + b, 0) / stats.ruWpmHistory.length)
    : 0;

  // Daily challenge
  const todayKey = getTodayKey();
  const todayTests = stats.dailyProgress?.[todayKey] ?? 0;
  const dailyProgress = Math.min((todayTests / DAILY_GOAL) * 100, 100);
  const dailyDone = todayTests >= DAILY_GOAL;

  // Achievements
  const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked(stats)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── Overview row ─────────────────────────────────────────────────── */}
      <div className="grid-cols-2">

        {/* Summary card */}
        <div className="card glass">
          <h2 style={{ marginBottom: '1.5rem' }}>Tarixiy ko'rsatkichlar / Статистика</h2>
          <div className="stats-ribbon" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="stat-card glass">
              <div className="stat-value">{stats.bestWpm}</div>
              <div className="stat-label">Eng yaxshi WPM</div>
            </div>
            <div className="stat-card glass">
              <div className="stat-value">{stats.totalTests}</div>
              <div className="stat-label">Jami testlar</div>
            </div>
            <div className="stat-card glass">
              <div className="stat-value">{averageWpm}</div>
              <div className="stat-label">O'rtacha WPM</div>
            </div>
            <div className="stat-card glass">
              <div className="stat-value">{averageAccuracy}%</div>
              <div className="stat-label">O'rtacha aniqlik</div>
            </div>
          </div>
        </div>

        {/* Daily Challenge card */}
        <div className="card glass" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Kunlik topshiriq / Ежедневный Челлендж</h2>
              <Calendar className="text-accent" size={24} style={{ color: 'var(--accent)' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span className="badge badge-warning">Qiyinligi: O'rta</span>
              <span className={`badge ${dailyDone ? 'badge-success' : 'badge-accent'}`}>
                {dailyDone ? '✅ Bajarildi!' : `+${DAILY_GOAL * 50} ball`}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              {dailyDone
                ? '🎉 Ajoyib! Bugungi topshiriqni bajardingiz!'
                : `Bugun ${DAILY_GOAL} ta test yakunlang va kunlik mukofotni qo'lga kiriting!`}
            </p>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <span>Bajarilish darajasi</span>
              <span style={{ fontWeight: 700, color: dailyDone ? 'var(--success)' : 'var(--accent)' }}>
                {Math.round(dailyProgress)}% ({todayTests} / {DAILY_GOAL})
              </span>
            </div>
            <div style={{ height: '10px', background: 'var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${dailyProgress}%`,
                  height: '100%',
                  background: dailyDone
                    ? 'linear-gradient(90deg, var(--success), #34d399)'
                    : 'linear-gradient(90deg, var(--accent), #8b5cf6)',
                  borderRadius: '6px',
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── WPM Progress Chart ───────────────────────────────────────────── */}
      <div className="card glass">
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} style={{ color: 'var(--accent)' }} />
          WPM Taraqqiyoti / Прогресс WPM
        </h2>

        {stats.wpmHistory.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem'
          }}>
            <TrendingUp size={40} style={{ opacity: 0.3 }} />
            <p>Hali test yakunlanmagan. Mashqlar bo'limiga o'ting va yozishni boshlang!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Overall */}
            <div className="chart-panel glass">
              <WpmChart data={stats.wpmHistory} label="Jami (Barcha testlar)" color="var(--accent)" />
            </div>
            {/* Per-language */}
            <div className="grid-cols-2" style={{ gap: '1rem' }}>
              <div className="chart-panel glass">
                <WpmChart data={stats.uzWpmHistory} label="🇺🇿 Uzbekcha testlar" color="var(--success)" />
              </div>
              <div className="chart-panel glass">
                <WpmChart data={stats.ruWpmHistory} label="🇷🇺 Ruscha testlar" color="var(--warning)" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Per-Language Breakdown ───────────────────────────────────────── */}
      <div className="grid-cols-2">
        {/* Uzbek */}
        <div className="card glass">
          <h2 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🇺🇿 Uzbekcha Natijalar
          </h2>
          <div className="stats-ribbon" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="stat-card glass">
              <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.uzBestWpm}</div>
              <div className="stat-label">Eng yaxshi WPM</div>
            </div>
            <div className="stat-card glass">
              <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.uzTests}</div>
              <div className="stat-label">Testlar soni</div>
            </div>
            <div className="stat-card glass" style={{ gridColumn: 'span 2' }}>
              <div className="stat-value" style={{ color: 'var(--success)' }}>{uzAvgWpm}</div>
              <div className="stat-label">O'rtacha WPM</div>
            </div>
          </div>
        </div>

        {/* Russian */}
        <div className="card glass">
          <h2 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🇷🇺 Ruscha Natijalar
          </h2>
          <div className="stats-ribbon" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="stat-card glass">
              <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats.ruBestWpm}</div>
              <div className="stat-label">Eng yaxshi WPM</div>
            </div>
            <div className="stat-card glass">
              <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats.ruTests}</div>
              <div className="stat-label">Testlar soni</div>
            </div>
            <div className="stat-card glass" style={{ gridColumn: 'span 2' }}>
              <div className="stat-value" style={{ color: 'var(--warning)' }}>{ruAvgWpm}</div>
              <div className="stat-label">O'rtacha WPM</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Achievements ─────────────────────────────────────────────────── */}
      <div className="card glass">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={20} style={{ color: 'var(--accent)' }} />
            Yutuqlar / Достижения
          </h2>
          <span className="badge badge-accent" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
            {unlockedCount} / {ACHIEVEMENTS.length} ochildi
          </span>
        </div>

        <div className="achievements-grid">
          {ACHIEVEMENTS.map(ach => {
            const isUnlocked = ach.unlocked(stats);
            return (
              <div
                key={ach.id}
                className={`achievement-card glass ${isUnlocked ? 'achievement-unlocked' : 'achievement-locked'}`}
              >
                <div className="achievement-icon">{ach.icon}</div>
                <div className="achievement-title">{ach.title}</div>
                <div className="achievement-desc">{ach.desc}</div>
                {isUnlocked && <div className="achievement-check">✓</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Reset ────────────────────────────────────────────────────────── */}
      <div className="card glass" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onReset}
          className="btn-start"
          style={{
            background: 'transparent',
            color: 'var(--error)',
            border: '1px solid var(--error)',
            boxShadow: 'none',
            padding: '0.6rem 1.5rem',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Trash2 size={16} />
          Tarixni tozalash / Сбросить историю
        </button>
      </div>
    </div>
  );
};
