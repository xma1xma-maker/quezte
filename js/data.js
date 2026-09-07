export const categoriesMetaData = [
  { id: 'flags', icon: '🚩', name: { ar: 'تخمين الأعلام', en: 'Guess the Flag' } },
  { id: 'capitals', icon: '🌍', name: { ar: 'عواصم وجغرافيا', en: 'Capitals & Geography' } },
  { id: 'general', icon: '🧠', name: { ar: 'معلومات عامة', en: 'General Knowledge' } },
  { id: 'math', icon: '🔢', name: { ar: 'رياضيات وسرعة', en: 'Fast Math' } }
];

export const questionPools = {
  flags: { ar: [], en: [] },
  capitals: { ar: [], en: [] },
  general: { ar: [], en: [] },
  math: { ar: [], en: [] }
};

export function initializeDatabase() {
  // توليد أسئلة الرياضيات كمثال (يمكنك إضافة باقي الأقسام التي كانت في كودك هنا)
  for (let i = 1; i <= 100; i++) {
    const a = (i * 7 + 3) % 40 + 5;
    const b = (i * 3 + 2) % 25 + 2;
    const correct = a + b;
    const altArr = [`${correct + 2}`, `${correct - 3}`, `${correct + 5}`];
    
    questionPools.math.ar.push({ q: `كم الناتج: ${a} + ${b} = ؟`, ans: `${correct}`, alt: altArr });
    questionPools.math.en.push({ q: `What is: ${a} + ${b} = ?`, ans: `${correct}`, alt: altArr });
  }
  // أضف باقي دوال توليد الأسئلة هنا (generateFlagsPool, rawCapitals, etc...)
}
