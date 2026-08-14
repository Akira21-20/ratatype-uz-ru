import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Globe, Sparkles, Zap } from 'lucide-react';
import { soundEngine } from './SoundEngine';

// ── Race-only text pools ─────────────────────────────────────────────────────
// 3 ta bosqich: oson, ortacha, qiyin. Har bosqich o'z matnlariga ega.
// Barcha matnlarda apostrof yoki maxsus belgilar yo'q.

type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultyConfig {
  label: string;
  labelRu: string;
  emoji: string;
  color: string;
  botSpeeds: [number, number, number]; // [bot1, bot2, bot3] WPM
  botNames: [string, string, string];
}

const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: 'Oson',
    labelRu: 'Лёгкий',
    emoji: '🟢',
    color: 'var(--success)',
    botSpeeds: [18, 24, 14],
    botNames: ['TortBot 🐢', 'SlowBot 🐌', 'EasyBot 🌱'],
  },
  medium: {
    label: "O'rtacha",
    labelRu: 'Средний',
    emoji: '🟡',
    color: 'var(--warning)',
    botSpeeds: [42, 55, 35],
    botNames: ['SwiftBot ⚡', 'NimblyBot 🦅', 'MidBot 🎯'],
  },
  hard: {
    label: 'Qiyin',
    labelRu: 'Сложный',
    emoji: '🔴',
    color: 'var(--error)',
    botSpeeds: [78, 96, 68],
    botNames: ['NinjaBot 🥷', 'CyberBot 🤖', 'UltraBot 💀'],
  },
};

// Uzbek race texts — oson (40–70 belgi)
const UZ_EASY = [
  'Bugun havo juda yaxshi. Biz bogda sayr qildik.',
  'Tez yozish foydali malaka. Har kuni mashq qil.',
  'Kitob oqish aqli ostiradi. Kopr oqi va biling.',
  'Men dasturlashni yaxshi koraman. Bu juda qiziq.',
  'Ozbekiston chiroyli yurt. Uning tabiati ajoyib.',
  'Salomatlik eng katta boylik. Har kuni sport qil.',
  'Musiqa ruhni tetiklaydi. Kuy tingla va xursand bol.',
  'Mehnat qilgan muvaffaq boladi. Dangasa qolmaydi.',
];

// Uzbek race texts — ortacha (100–140 belgi)
const UZ_MEDIUM = [
  'Bugungi zamonaviy dunyo tez rivojlanib bormoqda. Yangi texnologiyalar hayotimizni osonlashtiradi va bizga ko\'proq imkoniyatlar yaratadi.',
  'Kitob insonning eng yaxshi dosti. U bizga yangi bilim va tajriba ulashadi. Har kuni biroz oqish hayotni boyitadi.',
  'Talim olish inson uchun eng katta sarmoya hisoblanadi. Bilimli odam hamma joyda qo\'l keladi va muvaffaqiyatga erishadi.',
  'Sport bilan shugullanish tanamizni sog\'lom saqlaydi. Har kuni qisqa yugurish yoki yurish kayfiyatni yaxshilaydi.',
  'Ozbekiston tarixi juda boy va qiziqarli. Samarqand, Buxoro kabi shaharlar dunyo madaniyatiga katta hissa qoshgan.',
  'Dasturlash ko\'nikmasi zamonaviy dunyo kasblaridan biri. Kod yozish ijodiy va mantiqiy fikrlashni rivojlantiradi.',
  'Ota onaga hurmat korsatish va ularga yordam berish bizning burchimizdir. Oila birdamligi baxt manbaidir.',
  'Tabiatni asrash har birimizning vazifasi. Daraxt ekish va chiqindilarni saralash kelajakni himoya qiladi.',
];

// Uzbek race texts — qiyin (180–240 belgi)
const UZ_HARD = [
  'Bugungi kunda axborot texnologiyalari sohasida jadal rivojlanish kuzatilmoqda. Sun\'iy intellekt, bulut hisoblash va katta ma\'lumotlar tahlili tizimlar inson hayotini tubdan o\'zgartirib, yangi imkoniyatlar eshiklarini ochmoqda. Bu sohada bilim va ko\'nikma egallash har qachongidan muhimroqdir.',
  'Ozbekiston o\'zining boy tarixi, noyob arxitekturasi va mehribon xalqi bilan dunyo miqyosida tan olinmoqda. Ipak yo\'li bo\'ylab joylashgan qadimiy shaharlar, muhtasham madrasalar va minoralar bu yerga tashrif buyuruvchi turistlarni hayratda qoldiradi. Mamlakatimiz iqtisodiy rivojlanish sur\'atlari ham tobora ortib bormoqda.',
  'Insoniyat tarixida eng katta yutuqlardan biri bu tibbiyot sohasidagi kashfiyotlardir. Vaksina ixtirosi, antibiotiklar va zamonaviy jarrohlik usullari millionlab odamlarning hayotini saqlab qolishga imkon berdi. Bugungi tibbiyot genetika va nanomateriallar bilan birga yangi davrga qadam qo\'ymoqda.',
  'Matematika barcha fanlarning asosi hisoblanadi. Fizika, kimyo, biologiya, iqtisodiyot va hatto musiqa ham matematik qonuniyatlarga tayangan. Yoshligidan matematikani chuqur ozlashtirgan inson istalgan sohada o\'z o\'rnini topishi ancha osonlashadi. Mantiqiy fikrlash ham, ijodiy yondashuv ham matematika orqali rivojlanadi.',
];

// Russian race texts — oson
const RU_EASY = [
  'Segodnya khoroshaya pogoda. My gulyali v parke.',
  'Bystryy nabor teksta ochen polezen. Treniruysya.',
  'Chteniye knig razvivayut um. Chitay bolshe seychas.',
  'Ya lyublyu programirovaniye. Eto ochen interesno.',
  'Moskva krasivyy gorod. Tam mnogo dostoprimechatelnostey.',
  'Zdorovye samoe bolshoye bogatstvo. Zanimaysya sportom.',
  'Muzyka poднимает nastroenie. Slushay i raduysya.',
  'Trud privodit k uspekhu. Lenivyy ne dostignyet tseli.',
];

// Russian race texts — ortacha
const RU_MEDIUM = [
  'Sovremennyy mir razvivaetsya ochen bystro. Novyye tekhnologii uproschayut nashu zhizn i sozdayut novyye vozmozhnosti dlya kazhdogo cheloveka.',
  'Kniga yavlyayetsya luchshim drugom cheloveka. Ona delit s nami novyye znaniya i opyt. Chteniye kazhdyy den obogashchayet zhizn.',
  'Polucheniye obrazovaniya yavlyayetsya samoy bolshoy investitsiyey v budushcheye. Obrazovannyy chelovek vsegda naydot svoy put k uspekhu.',
  'Zanyatiya sportom podderzhivayut zdorovye tela. Yezhednevnaya probezh­ka ili progulka uluchshayut nastroyeniye i samochu­vstviye.',
  'Rossiya imeet bogatuyu i interesnuyu istoriyu. Moskva, Sankt­Peterburg i drugiye goroda slav­yatsya svoey arkhitekturoy i kulturoy.',
  'Programmirovaniye yavlyayetsya odnim iz naibolee vostrebovannykh navykov v sovremennom mire. Napisaniye koda razviva­yet logicheskoye myshlenie.',
  'Uvazheniye k roditelyam i pomoshch im yavlyayutsya nashim dolgom. Semeynoye edinstvo yavlyayetsya istochnikom schastya i sily.',
  'Zashchita prirody yavlyayetsya zadachey kazhdogo iz nas. Posadka derevev i sortirovka musora zashchishchayut budushcheye planety.',
];

// Russian race texts — qiyin
const RU_HARD = [
  'V nastoyashcheye vremya v sfere informatsionnykh tekhnologiy nablyudaetsya bystroye razvitiye. Iskusstvennyy intellekt oblachnyye vychisleniya i analiz bolshikh dannykh korennuyu obraz izmenyayut chelovecheskuyu zhizn otkryvaya novyye vozmozhnosti. Polucheniye znany i navykov v etoy oblasti segodnya vazhnee chem kogda­libo.',
  'Rossiya slavitsya svoey bogatoy istoriyey unikalnoy arkhitekturoy i dobrodushnym narodom. Goroda raspolozhennye na Velikom Shelkovom puti drevniye khtramy i dvorets­pervogo urovnya porazhayut turistov kotoryye priyezzhayut syuda. Tempy ekonomicheskogo razvitiya strany takzhe postoyanno vozrastayut.',
  'Odnim iz velichayshikh dostizheniy chelovechestva v istorii yavlyayutsya otkrytiya v oblasti meditsiny. Izobreteniye vaktsin antibiotikov i sovremennyye metody khirurgii pozvolili spasti zhizni millionov lyudey. Sovremennaya meditsina s genetikoy i nanomaterialami vstupa­yet v novuyu epokhu.',
  'Matematika yavlyayetsya osnovoy vsekh nauk. Fizika khimiya biologiya ekonomika i dazhe muzyka osnivayutsya na matematicheskikh zakonomernostyakh. Chelovek kotoryy s detstva gluboko osvoyil matematiku nakhod­it svoyo mesto v lyuboy sfere gorazdo legche. Logicheskoye i tvorcheskoye myshleniye razvivayutsya cherez matematiku.',
];

const RACE_TEXTS: Record<'uz' | 'ru', Record<Difficulty, string[]>> = {
  uz: { easy: UZ_EASY, medium: UZ_MEDIUM, hard: UZ_HARD },
  ru: { easy: RU_EASY, medium: RU_MEDIUM, hard: RU_HARD },
};

// Pick a random text different from the last one
function pickRandom(pool: string[], lastText: string): string {
  const others = pool.filter(t => t !== lastText);
  const src = others.length > 0 ? others : pool;
  return src[Math.floor(Math.random() * src.length)];
}

// ── Component ────────────────────────────────────────────────────────────────
export const MultiplayerRace: React.FC = () => {
  const [gameState, setGameState] = useState<'lobby' | 'countdown' | 'racing' | 'finished'>('lobby');
  const [countdown, setCountdown] = useState(3);
  const [wpm, setWpm] = useState(0);
  const [typedCount, setTypedCount] = useState(0);
  const [botProgress, setBotProgress] = useState([0, 0, 0]);
  const [userProgress, setUserProgress] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);

  const [selectedLang, setSelectedLang] = useState<'uz' | 'ru'>('uz');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [targetText, setTargetText] = useState('');
  const [lastText, setLastText] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  // useRef to avoid stale closure inside bot interval
  const winnerRef = useRef<string | null>(null);
  const cfg = DIFFICULTY_CONFIG[difficulty];

  // Keep ref in sync with state
  useEffect(() => { winnerRef.current = winner; }, [winner]);

  // Countdown → start racing
  useEffect(() => {
    if (gameState !== 'countdown') return;
    if (countdown === 0) {
      setGameState('racing');
      setUserProgress(0);
      setBotProgress([0, 0, 0]);
      setTypedCount(0);
      setWpm(0);
      setStartTime(Date.now());
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, gameState]);

  // Bot movement — speed based on difficulty
  useEffect(() => {
    if (gameState !== 'racing' || !targetText) return;
    const textLen = targetText.length;

    const interval = setInterval(() => {
      setBotProgress(prev => {
        const next = [...prev];
        for (let i = 0; i < 3; i++) {
          // chars per 150ms tick: WPM → chars/min → chars/150ms
          const charsPerTick = (cfg.botSpeeds[i] * 5 / 60) * 0.15 * (Math.random() * 0.4 + 0.8);
          const delta = (charsPerTick / textLen) * 100;
          next[i] = Math.min(next[i] + delta, 100);

          // Use ref (not state) to avoid stale closure
          if (next[i] >= 100 && winnerRef.current === null) {
            winnerRef.current = cfg.botNames[i]; // set immediately to block others
            setWinner(cfg.botNames[i]);
            setGameState('finished');
          }
        }
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [gameState, targetText, difficulty]);

  // Input handler with real WPM calculation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== 'racing') return;
    const value = e.target.value;

    if (targetText.startsWith(value)) {
      const newIdx = value.length;
      if (newIdx > 0) soundEngine.playNote('race-' + difficulty, newIdx - 1, true);
      setTypedCount(newIdx);
      const progress = (newIdx / targetText.length) * 100;
      setUserProgress(progress);

      // Real WPM
      if (startTime && newIdx > 0) {
        const elapsed = (Date.now() - startTime) / 60000;
        setWpm(Math.max(0, Math.round((newIdx / 5) / elapsed)));
      }

      if (progress >= 100) {
        soundEngine.playFinish('uz-1');
        setWinner('Siz yutdingiz!');
        setGameState('finished');
      }
    } else {
      // Wrong key
      soundEngine.playNote('race-' + difficulty, value.length - 1, false);
    }
  };

  const startRace = () => {
    const pool = RACE_TEXTS[selectedLang][difficulty];
    const text = pickRandom(pool, lastText);
    setLastText(text);
    setTargetText(text);
    setCountdown(3);
    setGameState('countdown');
    setWinner(null);
    winnerRef.current = null; // reset ref too
    setUserProgress(0);
    setBotProgress([0, 0, 0]);
    setTypedCount(0);
    setWpm(0);
    setStartTime(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const diffColor = cfg.color;

  return (
    <div className="card glass">
      {/* Header */}
      <div className="justify-between" style={{ marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', fontWeight: 800 }}>
            <Sparkles size={24} style={{ color: 'var(--accent)' }} />
            Ratarace — Tezkor Poyga
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
            Botlarni yengib marraga birinchi yetib boring!
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} style={{ color: diffColor }} />
          <span style={{ fontWeight: 700, color: diffColor, fontSize: '0.95rem' }}>
            {cfg.emoji} {cfg.label} / {cfg.labelRu}
          </span>
        </div>
      </div>

      {/* Lobby — difficulty + lang selector */}
      {gameState === 'lobby' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2rem' }}>
          {/* Language */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Globe size={18} style={{ color: 'var(--text-muted)' }} />
            <select value={selectedLang} onChange={e => setSelectedLang(e.target.value as 'uz' | 'ru')} className="select-input">
              <option value="uz">Uzbek (Latin)</option>
              <option value="ru">Ruscha (Transliterated)</option>
            </select>
          </div>

          {/* Difficulty cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => {
              const c = DIFFICULTY_CONFIG[d];
              const isSelected = difficulty === d;
              return (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  style={{
                    padding: '1.25rem 1rem',
                    borderRadius: 'var(--radius-lg)',
                    border: `2px solid ${isSelected ? c.color : 'var(--border-color)'}`,
                    background: isSelected ? `color-mix(in srgb, ${c.color} 10%, var(--bg-secondary))` : 'var(--bg-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    transform: isSelected ? 'translateY(-3px)' : 'none',
                    boxShadow: isSelected ? `0 8px 24px color-mix(in srgb, ${c.color} 25%, transparent)` : 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{c.emoji}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: isSelected ? c.color : 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {c.label}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{c.labelRu}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      Bot tezligi: ~{Math.round((c.botSpeeds[0] + c.botSpeeds[1] + c.botSpeeds[2]) / 3)} WPM
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Matn: {d === 'easy' ? '40–70' : d === 'medium' ? '100–140' : '180–240'} belgi
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Race Track */}
      <div className="race-container">
        <div className="finish-line" />
        <div className="race-track">
          {/* User lane */}
          <div className="race-lane" style={{ background: 'rgba(99,102,241,0.04)' }}>
            <div className="car-container" style={{ left: `${userProgress * 0.85}%` }}>
              <span className="car-sprite">🏎️</span>
              <span className="car-label" style={{ borderColor: 'var(--accent)', color: 'var(--accent)', fontWeight: 800 }}>
                Siz {wpm > 0 ? `· ${wpm}` : ''}
              </span>
            </div>
          </div>
          {/* Bot lanes */}
          {cfg.botNames.map((name, idx) => (
            <div className="race-lane" key={idx}>
              <div className="car-container" style={{ left: `${botProgress[idx] * 0.85}%` }}>
                <span className="car-sprite">🚗</span>
                <span className="car-label">{name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls area */}
      <div style={{ minHeight: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '1.5rem' }}>

        {/* Lobby start button */}
        {gameState === 'lobby' && (
          <div style={{ textAlign: 'center' }}>
            <button className="btn-start" onClick={startRace}>
              Poygaga Qo'shilish 🏁
            </button>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Har safar tasodifiy yangi matn tanlanadi
            </p>
          </div>
        )}

        {/* Countdown */}
        {gameState === 'countdown' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--accent)', lineHeight: 1, animation: 'cursor-pulse 0.9s ease-in-out infinite' }}>
              {countdown}
            </div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Tayyor turing...</p>
          </div>
        )}

        {/* Racing */}
        {gameState === 'racing' && (
          <div style={{ width: '100%', maxWidth: '820px' }}>
            {/* Text display */}
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.3rem',
              padding: '1.5rem 2rem',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              lineHeight: '2',
              wordBreak: 'break-word',
              userSelect: 'none',
              marginBottom: '1.25rem',
              letterSpacing: '0.04em',
            }}>
              <span style={{ color: 'var(--success)', background: 'var(--success-glow)', borderRadius: '3px', padding: '0 1px' }}>
                {targetText.slice(0, typedCount)}
              </span>
              {typedCount < targetText.length && (
                <span style={{
                  background: 'var(--accent)',
                  color: 'white',
                  borderRadius: '3px',
                  padding: '0 1px',
                  animation: 'cursor-pulse 0.9s ease-in-out infinite',
                }}>
                  {targetText[typedCount]}
                </span>
              )}
              <span style={{ color: 'var(--text-secondary)' }}>{targetText.slice(typedCount + 1)}</span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Bu yerga yozing..."
                className="text-input"
                style={{ width: '100%', maxWidth: '540px', fontSize: '1.15rem', padding: '0.85rem 1.25rem', textAlign: 'center' }}
                onChange={handleInputChange}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <div style={{ textAlign: 'center', minWidth: '70px' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{wpm}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>WPM</div>
              </div>
            </div>
          </div>
        )}

        {/* Finished */}
        {gameState === 'finished' && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
            padding: '2rem 3rem',
            borderRadius: 'var(--radius-xl)',
            border: `2px solid ${winner?.includes('Siz') ? 'var(--success)' : diffColor}`,
            background: winner?.includes('Siz') ? 'var(--success-glow)' : 'var(--error-glow)',
            animation: 'fadeIn 0.3s ease',
          }}>
            <div style={{ fontSize: '3.5rem' }}>{winner?.includes('Siz') ? '🏆' : '😅'}</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {winner?.includes('Siz') ? 'Ajoyib! Siz yutdingiz!' : `G'olib: ${winner}`}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              Sizning natijangiz: <strong style={{ color: 'var(--accent)' }}>{wpm} WPM</strong>
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button className="btn-start" onClick={startRace} style={{ marginBottom: 0 }}>
                <RotateCcw size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                Yangi Poyga
              </button>
              <button
                onClick={() => { setGameState('lobby'); setWinner(null); setUserProgress(0); setBotProgress([0,0,0]); }}
                className="btn-cancel"
                style={{ padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700 }}
              >
                Lobby
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
