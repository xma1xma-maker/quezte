// js/data.js
export const categoriesMetaData = [
  { id: 'flags', icon: '🚩', name: { ar: 'تخمين الأعلام', en: 'Guess the Flag' } },
  // ... باقي الأقسام
];

export const questionPools = {
  flags: { ar: [], en: [] },
  // ... باقي الأقسام
};

export function initializeDatabase() {
  // كود توليد الأسئلة الذي كتبته مسبقاً يوضع هنا
}
