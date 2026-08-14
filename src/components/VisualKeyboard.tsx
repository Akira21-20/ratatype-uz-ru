import React from 'react';

interface VisualKeyboardProps {
  activeKey: string;
  language: 'uz' | 'ru';
}

// Finger assignment: 0=left-pinky, 1=left-ring, 2=left-middle, 3=left-index,
//                   4=right-index, 5=right-middle, 6=right-ring, 7=right-pinky
const FINGER_CLASS = [
  'finger-left-pinky',
  'finger-left-ring',
  'finger-left-middle',
  'finger-left-index',
  'finger-right-index',
  'finger-right-middle',
  'finger-right-ring',
  'finger-right-pinky',
];

// Finger assignments per row (by key index in that row)
// Row 0 (top): Q W E R T Y U I O P [ ]
const ROW0_FINGERS = [0, 0, 1, 2, 3, 3, 4, 4, 5, 6, 7, 7];
// Row 1 (home): A S D F G H J K L ; '
const ROW1_FINGERS = [0, 1, 2, 3, 3, 4, 4, 5, 6, 7, 7];
// Row 2 (bottom): Z X C V B N M , . /
const ROW2_FINGERS = [0, 1, 2, 3, 3, 4, 4, 5, 6, 7];

// Home row keys that get a special underline indicator
const HOME_KEYS_LATIN = new Set(['a', 's', 'd', 'f', 'j', 'k', 'l', ';']);
const HOME_KEYS_RU    = new Set(['ф', 'ы', 'в', 'а', 'о', 'л', 'д', 'ж']);

export const VisualKeyboard: React.FC<VisualKeyboardProps> = ({ activeKey, language }) => {
  const normalizeKey = (key: string): string => {
    if (!key) return '';
    if (key === ' ') return 'Space';
    return key.toLowerCase();
  };

  const currentKey = normalizeKey(activeKey);
  const homeKeys = language === 'ru' ? HOME_KEYS_RU : HOME_KEYS_LATIN;

  const getLayout = () => {
    if (language === 'ru') {
      return [
        [
          { label: 'й', code: 'й' }, { label: 'ц', code: 'ц' }, { label: 'у', code: 'у' }, { label: 'к', code: 'к' },
          { label: 'е', code: 'е' }, { label: 'н', code: 'н' }, { label: 'г', code: 'г' }, { label: 'ш', code: 'ш' },
          { label: 'щ', code: 'щ' }, { label: 'з', code: 'з' }, { label: 'х', code: 'х' }, { label: 'ъ', code: 'ъ' },
        ],
        [
          { label: 'ф', code: 'ф' }, { label: 'ы', code: 'ы' }, { label: 'в', code: 'в' }, { label: 'а', code: 'а' },
          { label: 'п', code: 'п' }, { label: 'р', code: 'р' }, { label: 'о', code: 'о' }, { label: 'л', code: 'л' },
          { label: 'д', code: 'д' }, { label: 'ж', code: 'ж' }, { label: 'э', code: 'э' },
        ],
        [
          { label: 'я', code: 'я' }, { label: 'ч', code: 'ч' }, { label: 'с', code: 'с' }, { label: 'м', code: 'м' },
          { label: 'и', code: 'и' }, { label: 'т', code: 'т' }, { label: 'ь', code: 'ь' }, { label: 'б', code: 'б' },
          { label: 'ю', code: 'ю' }, { label: '.', code: '.' },
        ],
      ];
    }
    // Uzbek / Latin layout
    return [
      [
        { label: 'q', code: 'q' }, { label: 'w', code: 'w' }, { label: 'e', code: 'e' }, { label: 'r', code: 'r' },
        { label: 't', code: 't' }, { label: 'y', code: 'y' }, { label: 'u', code: 'u' }, { label: 'i', code: 'i' },
        { label: 'o', code: 'o' }, { label: 'p', code: 'p' }, { label: '[', code: '[' }, { label: ']', code: ']' },
      ],
      [
        { label: 'a', code: 'a' }, { label: 's', code: 's' }, { label: 'd', code: 'd' }, { label: 'f', code: 'f' },
        { label: 'g', code: 'g' }, { label: 'h', code: 'h' }, { label: 'j', code: 'j' }, { label: 'k', code: 'k' },
        { label: 'l', code: 'l' }, { label: ';', code: ';' }, { label: "'", code: "'" },
      ],
      [
        { label: 'z', code: 'z' }, { label: 'x', code: 'x' }, { label: 'c', code: 'c' }, { label: 'v', code: 'v' },
        { label: 'b', code: 'b' }, { label: 'n', code: 'n' }, { label: 'm', code: 'm' }, { label: ',', code: ',' },
        { label: '.', code: '.' }, { label: '/', code: '/' },
      ],
    ];
  };

  const ROW_FINGERS = [ROW0_FINGERS, ROW1_FINGERS, ROW2_FINGERS];
  const rows = getLayout();

  const getFingerClass = (rowIdx: number, keyIdx: number): string => {
    const fingerMap = ROW_FINGERS[rowIdx];
    const fingerIdx = fingerMap[keyIdx] ?? 7;
    return FINGER_CLASS[fingerIdx] ?? '';
  };

  return (
    <div className="keyboard">
      {rows.map((row, rowIdx) => (
        <div className="keyboard-row" key={rowIdx}>
          {row.map((k, idx) => {
            const isActive = currentKey === k.code;
            const isHome = homeKeys.has(k.code);
            return (
              <div
                key={k.code}
                className={`key ${isActive ? 'active' : ''} ${getFingerClass(rowIdx, idx)} ${isHome ? 'key-home' : ''}`}
                title={isHome ? 'Home row' : undefined}
              >
                {k.label.toUpperCase()}
              </div>
            );
          })}
        </div>
      ))}
      {/* Space bar row */}
      <div className="keyboard-row">
        <div className={`key key-space ${currentKey === 'space' ? 'active' : ''}`} />
      </div>
    </div>
  );
};
