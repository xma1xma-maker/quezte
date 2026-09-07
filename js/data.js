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

const flagsList = [
  { code: "sa", emoji: "🇸🇦", ar: "السعودية", en: "Saudi Arabia", altAr: ["الإمارات", "قطر", "الكويت"], altEn: ["UAE", "Qatar", "Kuwait"] },
  { code: "eg", emoji: "🇪🇬", ar: "مصر", en: "Egypt", altAr: ["السودان", "الجزائر", "العراق"], altEn: ["Sudan", "Algeria", "Iraq"] },
  { code: "iq", emoji: "🇮🇶", ar: "العراق", en: "Iraq", altAr: ["سوريا", "الأردن", "اليمن"], altEn: ["Syria", "Jordan", "Yemen"] },
  { code: "ps", emoji: "🇵🇸", ar: "فلسطين", en: "Palestine", altAr: ["الأردن", "الإمارات", "السودان"], altEn: ["Jordan", "UAE", "Sudan"] },
  { code: "ma", emoji: "🇲🇦", ar: "المغرب", en: "Morocco", altAr: ["تونس", "الجزائر", "موريتانيا"], altEn: ["Tunisia", "Algeria", "Mauritania"] },
  { code: "dz", emoji: "🇩🇿", ar: "الجزائر", en: "Algeria", altAr: ["تونس", "المغرب", "ليبيا"], altEn: ["Tunisia", "Morocco", "Libya"] },
  { code: "sy", emoji: "🇸🇾", ar: "سوريا", en: "Syria", altAr: ["مصر", "العراق", "لبنان"], altEn: ["Egypt", "Iraq", "Lebanon"] },
  { code: "ae", emoji: "🇦🇪", ar: "الإمارات", en: "UAE", altAr: ["الكويت", "قطر", "البحرين"], altEn: ["Kuwait", "Qatar", "Bahrain"] },
  { code: "qa", emoji: "🇶🇦", ar: "قطر", en: "Qatar", altAr: ["البحرين", "عُمان", "الكويت"], altEn: ["Bahrain", "Oman", "Kuwait"] },
  { code: "kw", emoji: "🇰🇼", ar: "الكويت", en: "Kuwait", altAr: ["الإمارات", "قطر", "السعودية"], altEn: ["UAE", "Qatar", "Saudi Arabia"] },
  { code: "jo", emoji: "🇯🇴", ar: "الأردن", en: "Jordan", altAr: ["فلسطين", "السودان", "الكويت"], altEn: ["Palestine", "Sudan", "Kuwait"] },
  { code: "tn", emoji: "🇹🇳", ar: "تونس", en: "Tunisia", altAr: ["تركيا", "الجزائر", "المغرب"], altEn: ["Turkey", "Algeria", "Morocco"] },
  { code: "lb", emoji: "🇱🇧", ar: "لبنان", en: "Lebanon", altAr: ["تونس", "قبرص", "الأردن"], altEn: ["Tunisia", "Cyprus", "Jordan"] },
  { code: "om", emoji: "🇴🇲", ar: "عُمان", en: "Oman", altAr: ["اليمن", "الإمارات", "قطر"], altEn: ["Yemen", "UAE", "Qatar"] },
  { code: "sd", emoji: "🇸🇩", ar: "السودان", en: "Sudan", altAr: ["مصر", "تشاد", "إثيوبيا"], altEn: ["Egypt", "Chad", "Ethiopia"] },
  { code: "jp", emoji: "🇯🇵", ar: "اليابان", en: "Japan", altAr: ["الصين", "كوريا الجنوبية", "فيتنام"], altEn: ["China", "South Korea", "Vietnam"] },
  { code: "fr", emoji: "🇫🇷", ar: "فرنسا", en: "France", altAr: ["إيطاليا", "ألمانيا", "إسبانيا"], altEn: ["Italy", "Germany", "Spain"] },
  { code: "de", emoji: "🇩🇪", ar: "ألمانيا", en: "Germany", altAr: ["النمسا", "بلجيكا", "هولندا"], altEn: ["Austria", "Belgium", "Netherlands"] },
  { code: "it", emoji: "🇮🇹", ar: "إيطاليا", en: "Italy", altAr: ["فرنسا", "المكسيك", "إيرلندا"], altEn: ["France", "Mexico", "Ireland"] },
  { code: "es", emoji: "🇪🇸", ar: "إسبانيا", en: "Spain", altAr: ["البرتغال", "إيطاليا", "اليونان"], altEn: ["Portugal", "Italy", "Greece"] },
  { code: "br", emoji: "🇧🇷", ar: "البرازيل", en: "Brazil", altAr: ["الأرجنتين", "كولومبيا", "تشيلي"], altEn: ["Argentina", "Colombia", "Chile"] },
  { code: "ar", emoji: "🇦🇷", ar: "الأرجنتين", en: "Argentina", altAr: ["البرازيل", "الأوروغواي", "بيرو"], altEn: ["Brazil", "Uruguay", "Peru"] },
  { code: "us", emoji: "🇺🇸", ar: "أمريكا", en: "USA", altAr: ["كندا", "أستراليا", "بريطانيا"], altEn: ["Canada", "Australia", "UK"] },
  { code: "gb", emoji: "🇬🇧", ar: "بريطانيا", en: "UK", altAr: ["أستراليا", "كندا", "إيرلندا"], altEn: ["Australia", "Canada", "Ireland"] },
  { code: "ca", emoji: "🇨🇦", ar: "كندا", en: "Canada", altAr: ["أمريكا", "أستراليا", "الدنمارك"], altEn: ["USA", "Australia", "Denmark"] },
  { code: "tr", emoji: "🇹🇷", ar: "تركيا", en: "Turkey", altAr: ["أذربيجان", "تونس", "باكستان"], altEn: ["Azerbaijan", "Tunisia", "Pakistan"] }
];

const rawCapitals = [
  { qAr: "ما هي عاصمة السعودية؟", qEn: "What is the capital of Saudi Arabia?", ansAr: "الرياض", ansEn: "Riyadh", altAr: ["جدة", "مكة", "الدمام"], altEn: ["Jeddah", "Makkah", "Dammam"] },
  { qAr: "ما هي عاصمة مصر؟", qEn: "What is the capital of Egypt?", ansAr: "القاهرة", ansEn: "Cairo", altAr: ["الإسكندرية", "الجيزة", "أسوان"], altEn: ["Alexandria", "Giza", "Aswan"] },
  { qAr: "ما هي عاصمة العراق؟", qEn: "What is the capital of Iraq?", ansAr: "بغداد", ansEn: "Baghdad", altAr: ["البصرة", "أربيل", "الموصل"], altEn: ["Basra", "Erbil", "Mosul"] },
  { qAr: "ما هي عاصمة فرنسا؟", qEn: "What is the capital of France?", ansAr: "باريس", ansEn: "Paris", altAr: ["مارسيليا", "ليون", "نيس"], altEn: ["Marseille", "Lyon", "Nice"] },
  { qAr: "ما هي عاصمة اليابان؟", qEn: "What is the capital of Japan?", ansAr: "طوكيو", ansEn: "Tokyo", altAr: ["أوساكا", "كيوتو", "هيروشيما"], altEn: ["Osaka", "Kyoto", "Hiroshima"] }
];

const rawGeneral = [
  { qAr: "ما هو أطول نهر في العالم؟", qEn: "What is the longest river in the world?", ansAr: "نهر النيل", ansEn: "Nile River", altAr: ["الأمازون", "المسيسيبي", "الراين"], altEn: ["Amazon", "Mississippi", "Rhine"] },
  { qAr: "كم عدد ألوان القوس قزح؟", qEn: "How many colors are in a rainbow?", ansAr: "7 ألوان", ansEn: "7 colors", altAr: ["5 ألوان", "6 ألوان", "8 ألوان"], altEn: ["5 colors", "6 colors", "8 colors"] },
  { qAr: "ما هو أضخم كوكب في المجموعة الشمسية؟", qEn: "What is the largest planet in our solar system?", ansAr: "المشتري", ansEn: "Jupiter", altAr: ["زحل", "الأرض", "المريخ"], altEn: ["Saturn", "Earth", "Mars"] }
];

const rawScience = [
  { qAr: "ما هو أسرع شيء في الكون؟", qEn: "What is the fastest thing in the universe?", ansAr: "الضوء", ansEn: "Light", altAr: ["الصوت", "الرياح", "الكهرباء"], altEn: ["Sound", "Wind", "Electricity"] },
  { qAr: "كم عدد عظام جسم الإنسان البالغ؟", qEn: "How many bones are in the adult human body?", ansAr: "206 عظمة", ansEn: "206 bones", altAr: ["180 عظمة", "250 عظمة", "300 عظمة"], altEn: ["180 bones", "250 bones", "300 bones"] }
];

const rawHistory = [
  { qAr: "في أي عام انتهت الحرب العالمية الثانية؟", qEn: "In which year did World War II end?", ansAr: "1945", ansEn: "1945", altAr: ["1939", "1918", "1950"], altEn: ["1939", "1918", "1950"] },
  { qAr: "من هو مخترع المصباح الكهربائي؟", qEn: "Who invented the electric light bulb?", ansAr: "توماس إديسون", ansEn: "Thomas Edison", altAr: ["تسلا", "نيوتن", "أينشتاين"], altEn: ["Tesla", "Newton", "Einstein"] }
];

const rawIslamic = [
  { qAr: "ما هي أطول سورة في القرآن الكريم؟", qEn: "What is the longest Surah in the Holy Quran?", ansAr: "سورة البقرة", ansEn: "Surah Al-Baqarah", altAr: ["آل عمران", "النساء", "الأنعام"], altEn: ["Aal-Imran", "An-Nisa", "Al-An'am"] },
  { qAr: "كم عدد أركان الإسلام؟", qEn: "How many pillars of Islam are there?", ansAr: "5 أركان", ansEn: "5 Pillars", altAr: ["4 أركان", "6 أركان", "7 أركان"], altEn: ["4 Pillars", "6 Pillars", "7 Pillars"] }
];

const rawSports = [
  { qAr: "كم عدد لاعبي فريق كرة القدم داخل الملعب؟", qEn: "How many players per football team are on the pitch?", ansAr: "11 لاعب", ansEn: "11 Players", altAr: ["9 ألعاب", "10 ألعاب", "12 لاعب"], altEn: ["9 Players", "10 Players", "12 Players"] },
  { qAr: "من هو الدولة الفائزة بكأس العالم 2022؟", qEn: "Which country won the 2022 World Cup?", ansAr: "الأرجنتين", ansEn: "Argentina", altAr: ["فرنسا", "البرازيل", "ألمانيا"], altEn: ["France", "Brazil", "Germany"] }
];

function populateStandardCategory(catId, rawArray) {
  for (let i = 0; i < 100; i++) {
    const item = rawArray[i % rawArray.length];
    questionPools[catId].ar.push({ q: item.qAr, ans: item.ansAr, alt: item.altAr });
    questionPools[catId].en.push({ q: item.qEn, ans: item.ansEn, alt: item.altEn });
  }
}

export function initializeDatabase() {
  // Flags
  for (let i = 0; i < 100; i++) {
    const item = flagsList[i % flagsList.length];
    questionPools.flags.ar.push({ q: `إلى أي دولة ينتمي هذا العلم؟`, ans: item.ar, alt: item.altAr, flagCode: item.code, flagEmoji: item.emoji });
    questionPools.flags.en.push({ q: `Which country does this flag belong to?`, ans: item.en, alt: item.altEn, flagCode: item.code, flagEmoji: item.emoji });
  }
  
  // Math
  for (let i = 1; i <= 100; i++) {
    const a = (i * 7 + 3) % 40 + 5;
    const b = (i * 3 + 2) % 25 + 2;
    const opType = i % 4;
    let qAr = "", qEn = "", correct = 0;
    if (opType === 0) { correct = a + b; qAr = `كم الناتج: ${a} + ${b} = ؟`; qEn = `What is: ${a} + ${b} = ?`; }
    else if (opType === 1) { correct = (a + b) - b; qAr = `كم الناتج: ${a + b} - ${b} = ؟`; qEn = `What is: ${a + b} - ${b} = ?`; }
    else if (opType === 2) { correct = a * b; qAr = `كم الناتج: ${a} × ${b} = ؟`; qEn = `What is: ${a} × ${b} = ?`; }
    else { correct = a; qAr = `كم الناتج: ${a * b} ÷ ${b} = ؟`; qEn = `What is: ${a * b} ÷ ${b} = ?`; }
    const altArr = [`${correct + 2}`, `${correct - 3}`, `${correct + 5}`];
    questionPools.math.ar.push({ q: qAr, ans: `${correct}`, alt: altArr });
    questionPools.math.en.push({ q: qEn, ans: `${correct}`, alt: altArr });
  }

  populateStandardCategory('capitals', rawCapitals);
  populateStandardCategory('general', rawGeneral);
  populateStandardCategory('science', rawScience);
  populateStandardCategory('history', rawHistory);
  populateStandardCategory('islamic', rawIslamic);
  populateStandardCategory('sports', rawSports);
}
