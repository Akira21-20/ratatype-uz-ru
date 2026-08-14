import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Award, Globe, Plus, Trash2, Shuffle } from 'lucide-react';
import { lessons, type Lesson } from './LessonsData';
import { VisualKeyboard } from './VisualKeyboard';
import { soundEngine } from './SoundEngine';

interface TypingTutorProps {
  onTestComplete: (wpm: number, accuracy: number, lang: string) => void;
}

export const TypingTutor: React.FC<TypingTutorProps> = ({ onTestComplete }) => {
  const [selectedLang, setSelectedLang] = useState<'uz' | 'ru'>('uz');
  const [customLessons, setCustomLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(lessons.filter(l => l.language === 'uz')[0]);
  const [isRandomMode, setIsRandomMode] = useState(false);
  
  const [isStarted, setIsStarted] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);

  // New Custom Lesson Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

  const containerRef = useRef<HTMLDivElement>(null);

  // Load custom lessons from Backend
  useEffect(() => {
    fetch('/api/lessons')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCustomLessons(data);
        }
      })
      .catch(e => console.error('Error loading custom lessons', e));
  }, []);

  // Combine default lessons and custom lessons
  const allLessons = [...lessons, ...customLessons];
  const filteredLessons = allLessons.filter(l => l.language === selectedLang);

  // Sync selected lesson when language changes
  useEffect(() => {
    const langLessons = allLessons.filter(l => l.language === selectedLang);
    if (langLessons.length > 0) {
      setSelectedLesson(langLessons[0]);
    }
    resetTest();
  }, [selectedLang]);

  // Handle typing input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isStarted || isFinished) return;

      // Prevent scrolling on Space
      if (e.key === ' ') {
        e.preventDefault();
      }

      const targetText = selectedLesson.text;
      const expectedChar = targetText[currentIndex];

      if (e.key === 'Backspace') {
        if (typedText.length > 0) {
          setTypedText(prev => prev.slice(0, -1));
          setCurrentIndex(prev => prev - 1);
        }
        return;
      }

      // Ignore functional keys
      if (e.key.length > 1) return;

      const typedChar = e.key;

      if (!startTime) {
        setStartTime(Date.now());
      }

      if (typedChar === expectedChar) {
        soundEngine.playNote(selectedLesson.id, currentIndex, true);
        setTypedText(prev => prev + typedChar);
        setCurrentIndex(prev => prev + 1);
      } else {
        soundEngine.playNote(selectedLesson.id, currentIndex, false);
        setErrors(prev => prev + 1);
        setTypedText(prev => prev + typedChar);
        setCurrentIndex(prev => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, currentIndex, selectedLesson, typedText, startTime, isFinished]);

  // Calculate live WPM & Accuracy
  useEffect(() => {
    if (!startTime || currentIndex === 0 || isFinished) return;

    const timeElapsed = (Date.now() - startTime) / 60000; // in minutes
    const calculatedWpm = Math.round((currentIndex / 5) / timeElapsed);
    const calculatedAccuracy = Math.round(((currentIndex - errors) / currentIndex) * 100);

    setWpm(calculatedWpm > 0 ? calculatedWpm : 0);
    setAccuracy(calculatedAccuracy >= 0 ? calculatedAccuracy : 100);

    // Check if test completed
    if (currentIndex >= selectedLesson.text.length) {
      setIsFinished(true);
      soundEngine.playFinish(selectedLesson.id);
      onTestComplete(calculatedWpm, calculatedAccuracy, selectedLang);
    }
  }, [currentIndex, errors, startTime, selectedLesson, isFinished]);

  // Helper to pick a random lesson
  const pickRandomLesson = () => {
    const pool = filteredLessons;
    if (pool.length > 1) {
      const otherLessons = pool.filter(l => l.id !== selectedLesson.id);
      const randIdx = Math.floor(Math.random() * otherLessons.length);
      setSelectedLesson(otherLessons[randIdx]);
    } else if (pool.length > 0) {
      setSelectedLesson(pool[0]);
    }
  };

  const startTest = () => {
    if (isRandomMode) {
      pickRandomLesson();
    }
    setIsStarted(true);
    setStartTime(null);
    setCurrentIndex(0);
    setErrors(0);
    setTypedText('');
    setWpm(0);
    setAccuracy(100);
    setIsFinished(false);

    // Focus typing box
    setTimeout(() => {
      containerRef.current?.focus();
    }, 100);
  };

  const resetTest = () => {
    setIsStarted(false);
    setIsFinished(false);
    setCurrentIndex(0);
    setErrors(0);
    setTypedText('');
    setWpm(0);
    setAccuracy(100);
    setStartTime(null);
  };

  // Add custom lesson
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim()) return;

    const newLesson: Lesson = {
      id: `custom-${Date.now()}`,
      title: `[Shaxsiy] ${newTitle.trim()}`,
      text: newText.trim().replace(/\s+/g, ' '), // sanitize extra whitespace
      language: selectedLang,
      difficulty: newDifficulty
    };

    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLesson)
      });
      if (res.ok) {
        const updated = [newLesson, ...customLessons];
        setCustomLessons(updated);
        setSelectedLesson(newLesson);
        setNewTitle('');
        setNewText('');
        setShowAddForm(false);
        resetTest();
      }
    } catch (e) {
      console.error('Failed to add lesson', e);
    }
  };

  // Delete custom lesson
  const handleDeleteLesson = async (id: string) => {
    if (!id.startsWith('custom-')) return;
    
    try {
      const res = await fetch(`/api/lessons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const updated = customLessons.filter(l => l.id !== id);
        setCustomLessons(updated);
        const remaining = [...lessons, ...updated].filter(l => l.language === selectedLang);
        if (remaining.length > 0) {
          setSelectedLesson(remaining[0]);
        }
        resetTest();
      }
    } catch (e) {
      console.error('Failed to delete lesson', e);
    }
  };

  // Build character output
  const renderText = () => {
    const text = selectedLesson.text;
    return text.split('').map((char, index) => {
      let className = '';
      if (index < currentIndex) {
        className = typedText[index] === text[index] ? 'char-correct' : 'char-incorrect';
      } else if (index === currentIndex) {
        className = 'char-current';
      }
      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div className="card glass" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Settings Row */}
        <div className="justify-between" style={{ flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Globe className="text-muted" size={20} />
            <select 
              value={selectedLang} 
              onChange={(e) => setSelectedLang(e.target.value as 'uz' | 'ru')}
              className="select-input"
            >
              <option value="uz">Uzbek (Latin)</option>
              <option value="ru">Русский (ЙЦУКЕН)</option>
            </select>

            <select 
              value={selectedLesson.id} 
              onChange={(e) => {
                const selected = allLessons.find(l => l.id === e.target.value);
                if (selected) {
                  setSelectedLesson(selected);
                  resetTest();
                }
              }}
              className="select-input"
              style={{ maxWidth: '280px' }}
            >
              {filteredLessons.map(l => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>

            {/* Random Mode Toggle Button */}
            <button 
              className={`nav-link ${isRandomMode ? 'active' : ''}`}
              onClick={() => setIsRandomMode(!isRandomMode)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', padding: '0.5rem 0.75rem' }}
              title="Har gal yangi tasodifiy matn tanlash rejimi"
            >
              <Shuffle size={16} />
              <span>Tasodifiy / Случайно</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span className={`badge ${selectedLesson.difficulty === 'Beginner' ? 'badge-success' : selectedLesson.difficulty === 'Intermediate' ? 'badge-warning' : 'badge-accent'}`}>
              {selectedLesson.difficulty}
            </span>

            {/* Delete button if custom lesson */}
            {selectedLesson.id.startsWith('custom-') && (
              <button 
                onClick={() => handleDeleteLesson(selectedLesson.id)}
                className="btn-danger"
                style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: 'none', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                title="Matnni o'chirish"
              >
                <Trash2 size={16} />
              </button>
            )}

            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-add-custom"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              <Plus size={16} />
              <span>Matn Qo'shish</span>
            </button>
          </div>
        </div>

        {/* Stats ribbon */}
        <div className="stats-ribbon">
          <div className="stat-card glass">
            <div className="stat-value">{wpm}</div>
            <div className="stat-label">WPM (Tezlik)</div>
          </div>
          <div className="stat-card glass">
            <div className="stat-value">{accuracy}%</div>
            <div className="stat-label">Accuracy (Aniqlik)</div>
          </div>
          <div className="stat-card glass">
            <div className="stat-value">{errors}</div>
            <div className="stat-label">Xatolar</div>
          </div>
          <div className="stat-card glass">
            <div className="stat-value">{Math.round((currentIndex / selectedLesson.text.length) * 100)}%</div>
            <div className="stat-label">Progress</div>
          </div>
        </div>

        {/* Typing box */}
        <div 
          ref={containerRef}
          tabIndex={0}
          className="typing-box-container glass"
          style={{ outline: 'none' }}
        >
          {!isStarted && (
            <div className="typing-start-overlay">
              <button className="btn-start" onClick={startTest}>
                <Play size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                Testni Boshlash / Начать тест
              </button>
              <p style={{ opacity: 0.8, fontSize: '1rem', marginTop: '0.5rem' }}>
                {isRandomMode ? 'Tasodifiy matn yuklanadi. Boshlash uchun bosing!' : 'Tezlik va aniqlikni sinash uchun start tugmasini bosing'}
              </p>
            </div>
          )}

          {isFinished && (
            <div className="typing-start-overlay" style={{ backgroundColor: 'rgba(16, 185, 129, 0.95)' }}>
              <Award size={48} style={{ marginBottom: '1rem' }} />
              <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>Ajoyib natija! / Отличный результат!</h2>
              <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                Tezlik: {wpm} WPM | Aniqlik: {accuracy}% | Xatolar soni: {errors} ta
              </p>
              <button className="btn-start" style={{ background: '#0f172a' }} onClick={startTest}>
                <RotateCcw size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                Qayta urinish / Повторить
              </button>
            </div>
          )}

          <div style={{ wordBreak: 'break-word', userSelect: 'none' }}>
            {renderText()}
          </div>
        </div>

        {/* Visual Keyboard */}
        <VisualKeyboard 
          activeKey={selectedLesson.text[currentIndex] || ''} 
          language={selectedLang}
        />
      </div>

      {/* Add Custom Lesson Form Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddForm(false)}>
              <RotateCcw size={18} style={{ transform: 'rotate(45deg)' }} />
            </button>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={24} style={{ color: 'var(--accent)' }} />
              Yangi Shaxsiy Matn Qo'shish
            </h3>
            <form onSubmit={handleAddLesson} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Matn Sarlavhasi
                  </label>
                  <input 
                    type="text" 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Masalan: Mening maqolam..." 
                    className="text-input"
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Qiyinchilik darajasi
                  </label>
                  <select 
                    value={newDifficulty} 
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="select-input"
                  >
                    <option value="Beginner">Beginner (Oson)</option>
                    <option value="Intermediate">Intermediate (O'rtacha)</option>
                    <option value="Advanced">Advanced (Qiyin)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Matn Tarkibi
                </label>
                <textarea 
                  value={newText} 
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Bu yerga matnni kiriting..." 
                  className="text-input"
                  rows={5}
                  style={{ resize: 'vertical', fontFamily: 'var(--font-mono)' }}
                  required
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  * Kiritilgan matn tanlangan tildagi darslar ro'yxatiga qo'shiladi.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="btn-cancel"
                  style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  style={{ padding: '0.75rem 2rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                >
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
