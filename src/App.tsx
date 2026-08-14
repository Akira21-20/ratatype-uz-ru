import { useState, useEffect } from 'react';
import { Sun, Moon, Keyboard, Play, BarChart2, Users } from 'lucide-react';
import { TypingTutor } from './components/TypingTutor';
import { MultiplayerRace } from './components/MultiplayerRace';
import { StatsDashboard } from './components/StatsDashboard';

export interface AppStats {
  wpmHistory: number[];
  accuracyHistory: number[];
  totalTests: number;
  bestWpm: number;
  uzWpmHistory: number[];
  ruWpmHistory: number[];
  uzTests: number;
  ruTests: number;
  uzBestWpm: number;
  ruBestWpm: number;
  // daily challenge: dateKey → number of tests completed
  dailyProgress: Record<string, number>;
}

const emptyStats = (): AppStats => ({
  wpmHistory: [],
  accuracyHistory: [],
  totalTests: 0,
  bestWpm: 0,
  uzWpmHistory: [],
  ruWpmHistory: [],
  uzTests: 0,
  ruTests: 0,
  uzBestWpm: 0,
  ruBestWpm: 0,
  dailyProgress: {},
});

export default function App() {
  const [activeTab, setActiveTab] = useState<'lessons' | 'race' | 'dashboard'>('lessons');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [stats, setStats] = useState<AppStats>(emptyStats());

  // Load theme and stats
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const localTheme = savedTheme || 'dark';
    setTheme(localTheme);
    document.documentElement.setAttribute('data-theme', localTheme);

    const loadStats = async () => {
      try {
        const statsRes = await fetch('/api/stats');
        const dailyRes = await fetch('/api/stats/daily');
        
        if (statsRes.ok && dailyRes.ok) {
          const statsData = await statsRes.json();
          const dailyData = await dailyRes.json();
          
          setStats({
            ...emptyStats(),
            ...statsData,
            dailyProgress: {
              [dailyData.date]: dailyData.count
            }
          });
        }
      } catch (e) {
        console.error('Failed to load stats from backend', e);
      }
    };
    loadStats();
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  const handleTestComplete = (wpm: number, accuracy: number, lang: string) => {
    const todayKey = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

    setStats(prev => {
      const newStats: AppStats = {
        wpmHistory: [...prev.wpmHistory, wpm],
        accuracyHistory: [...prev.accuracyHistory, accuracy],
        totalTests: prev.totalTests + 1,
        bestWpm: Math.max(prev.bestWpm, wpm),
        uzWpmHistory: lang === 'uz' ? [...prev.uzWpmHistory, wpm] : prev.uzWpmHistory,
        ruWpmHistory: lang === 'ru' ? [...prev.ruWpmHistory, wpm] : prev.ruWpmHistory,
        uzTests: lang === 'uz' ? prev.uzTests + 1 : prev.uzTests,
        ruTests: lang === 'ru' ? prev.ruTests + 1 : prev.ruTests,
        uzBestWpm: lang === 'uz' ? Math.max(prev.uzBestWpm, wpm) : prev.uzBestWpm,
        ruBestWpm: lang === 'ru' ? Math.max(prev.ruBestWpm, wpm) : prev.ruBestWpm,
        dailyProgress: {
          ...prev.dailyProgress,
          [todayKey]: (prev.dailyProgress[todayKey] ?? 0) + 1,
        },
      };
      
      // Save to backend
      fetch('/api/stats/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wpm, accuracy, language: lang, lesson_id: 'unknown' })
      }).catch(e => console.error('Failed to save test result', e));
      
      return newStats;
    });
  };

  const resetStats = async () => {
    try {
      await fetch('/api/stats', { method: 'DELETE' });
      setStats(emptyStats());
    } catch (e) {
      console.error('Failed to reset stats', e);
    }
  };

  return (
    <>
      {/* Navbar header */}
      <header className="navbar glass">
        <div className="logo" onClick={() => setActiveTab('lessons')}>
          <Keyboard size={28} />
          <span>RataType Uzbek &amp; Russian</span>
        </div>

        <nav className="nav-links">
          <button 
            className={`nav-link ${activeTab === 'lessons' ? 'active' : ''}`}
            onClick={() => setActiveTab('lessons')}
          >
            <Play size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            Mashqlar / Уроки
          </button>
          <button 
            className={`nav-link ${activeTab === 'race' ? 'active' : ''}`}
            onClick={() => setActiveTab('race')}
          >
            <Users size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            Poyga / Гонка
          </button>
          <button 
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart2 size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            Statistika / Статистика
          </button>
        </nav>

        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Main content container */}
      <main className="container">
        {activeTab === 'lessons' && (
          <TypingTutor onTestComplete={handleTestComplete} />
        )}
        
        {activeTab === 'race' && (
          <MultiplayerRace />
        )}

        {activeTab === 'dashboard' && (
          <StatsDashboard stats={stats} onReset={resetStats} />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center" style={{ padding: '2rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', borderTop: '1px solid var(--border-color)' }}>
        <p>© 2026 RataType Uzbek &amp; Russian Touch Typing Tutor. Barcha huquqlar himoyalangan.</p>
      </footer>
    </>
  );
}
