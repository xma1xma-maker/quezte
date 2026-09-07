// src/data/questions.js

export const categoriesMetaData = [
  { id: 'flags', icon: '🚩', name: { ar: 'تخمين الأعلام', en: 'Guess the Flag' } },
  { id: 'capitals', icon: '🌍', name: { ar: 'عواصم وجغرافيا', en: 'Capitals & Geography' } },
  { id: 'general', icon: '🧠', name: { ar: 'معلومات عامة', en: 'General Knowledge' } },
  { id: 'math', icon: '🔢', name: { ar: 'رياضيات وسرعة', en: 'Fast Math' } },
  { id: 'science', icon: '🔬', name: { ar: 'علوم وتكنولوجيا', en: 'Science & Tech' } },
  { id: 'history', icon: '📜', name: { ar: 'تاريخ وحضارات', en: 'History & Civilization' } },
  { id: 'islamic', icon: '🕌', name: { ar: 'ثقافة إسلامية', en: 'Islamic Trivia' } },
  { id: 'sports', icon: '⚽', name: { ar: 'رياضة وكرة قدم', en: 'Sports & Football' } }
];

// يمكنك وضع باقي المصفوفات هنا (flagsList, rawCapitals, etc...)
// ...

export const questionPools = {
  flags: { ar: [], en: [] },
  capitals: { ar: [], en: [] },
  general: { ar: [], en: [] },
  math: { ar: [], en: [] },
  science: { ar: [], en: [] },
  history: { ar: [], en: [] },
  islamic: { ar: [], en: [] },
  sports: { ar: [], en: [] }
};

// دوال توليد الأسئلة
export function initializeDatabase() {
  // نفس الكود الخاص بتوليد الأسئلة الذي كتبته مسبقاً
  // generateFlagsPool();
  // generateMathPool();
  // ...
}
