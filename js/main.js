import { categoriesMetaData, questionPools, initializeDatabase } from './data.js';
import { supabase, getUserData, updateUserData } from './supabase.js';

// قاموس الترجمة للواجهة
const i18n = {
  ar: {
    lblBalance: 'الرصيد الكلي',
    catBadge: '⚡ مربح وسريع جداً',
    catTitle: 'اختر القسم وابدأ التحدي',
    catSubtitle: '20 سؤالاً سريعاً. احصل على <span class="text-emerald-400 font-bold">$0.001</span> عن كل إجابة صحيحة!',
    lblResScore: 'الإجابات الصحيحة',
    lblResEarned: 'أرباح الجولة',
    btnClaim: 'سحب الأرباح لحسابك',
    btnBack: 'العودة للأقسام',
    adTitle: 'إعلان مكافأة تليجرام',
    lblAdWait: 'يرجى الانتظار...',
    btnClaimAdNow: 'إضافة الأرباح الآن 💰',
    langName: 'العربية',
    langFlag: '🇸🇦',
    dir: 'rtl',
    cooldownReady: 'جاهز الآن',
    cooldownWait: '⏳ متبقي وقت'
  },
  en: {
    lblBalance: 'Total Balance',
    catBadge: '⚡ Fast & Rewarding',
    catTitle: 'Choose Category & Play',
    catSubtitle: '20 rapid questions. Earn <span class="text-emerald-400 font-bold">$0.001</span> for each correct answer!',
    lblResScore: 'Correct Answers',
    lblResEarned: 'Session Earned',
    btnClaim: 'Claim Earnings',
    btnBack: 'Back to Categories',
    adTitle: 'Telegram Rewarded Ad',
    lblAdWait: 'Please wait...',
    btnClaimAdNow: 'Claim Earnings Now 💰',
    langName: 'English',
    langFlag: '🇬🇧',
    dir: 'ltr',
    cooldownReady: 'Ready Now',
    cooldownWait: '⏳ Locked'
  }
};

const tg = window.Telegram?.WebApp;
let telegramUser = null;
if (tg) {
  tg.ready();
  tg.expand();
  telegramUser = tg.initDataUnsafe?.user;
}

// تحديد اللغة الافتراضية (من التخزين، أو من تليجرام، أو عربي كافتراضي)
let currentLang = localStorage.getItem('sq_lang');
if (!currentLang) {
  if (telegramUser && telegramUser.language_code) {
    currentLang = telegramUser.language_code.startsWith('en') ? 'en' : 'ar';
  } else {
    currentLang = 'ar';
  }
}

let soundEnabled = true;
let totalBalance = 0;
let categoryCooldowns = {};
let selectedCategory = null;
let activeQuizQuestions = [];
let currentQuestionIndex = 0;
let sessionScore = 0;
let streak = 0;
let timerInterval = null;
let timerSecondsLeft = 5;
const TIME_LIMIT_PER_Q = 5;
const REWARD_PER_CORRECT = 0.001;
const COOLDOWN_MS = 2 * 60 * 60 * 1000;

/* نظام الصوت Web Audio API */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
  if (!soundEnabled) return;
  try {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
      osc.start(now); osc.stop(now + 0.25);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.3);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
    }
  } catch (e) { console.error(e); }
}

// تطبيق اللغة على الواجهة
function applyLanguage() {
  document.documentElement.dir = i18n[currentLang].dir;
  document.documentElement.lang = currentLang;
  
  document.getElementById('lang-flag').innerText = i18n[currentLang].langFlag;
  document.getElementById('lang-code').innerText = i18n[currentLang].langName;
  
  document.getElementById('lbl-balance').innerText = i18n[currentLang].lblBalance;
  document.getElementById('cat-badge').innerText = i18n[currentLang].catBadge;
  document.getElementById('cat-title').innerText = i18n[currentLang].catTitle;
  document.getElementById('cat-subtitle').innerHTML = i18n[currentLang].catSubtitle;
  document.getElementById('lbl-res-score').innerText = i18n[currentLang].lblResScore;
  document.getElementById('lbl-res-earned').innerText = i18n[currentLang].lblResEarned;
  document.getElementById('btn-claim-text').innerText = i18n[currentLang].btnClaim;
  document.getElementById('btn-back-text').innerText = i18n[currentLang].btnBack;
  document.getElementById('ad-title').innerText = i18n[currentLang].adTitle;
  
  renderCategoriesGrid();
}

async function initApp() {
  initializeDatabase();
  applyLanguage(); // تطبيق اللغة عند البدء
  
  if (telegramUser) {
    const userData = await getUserData(telegramUser.id);
    if (userData) {
      totalBalance = userData.balance || 0;
      categoryCooldowns = userData.cooldowns || {};
    }
  } else {
    totalBalance = parseFloat(localStorage.getItem('sq_balance') || '0');
    categoryCooldowns = JSON.parse(localStorage.getItem('sq_cooldowns') || '{}');
  }
  updateBalanceUI();
}

function updateBalanceUI() {
  document.getElementById('user-balance').innerText = `$${totalBalance.toFixed(3)}`;
}

function renderCategoriesGrid() {
  const grid = document.getElementById('categories-grid');
  grid.innerHTML = '';
  categoriesMetaData.forEach(cat => {
    const cooldownEndTime = categoryCooldowns[cat.id] || 0;
    const isCooldown = Date.now() < cooldownEndTime;
    const card = document.createElement('div');
    card.className = `glass-card rounded-2xl p-3.5 flex flex-col justify-between border ${isCooldown ? 'border-amber-500/30 opacity-80' : 'border-slate-800 cursor-pointer hover:border-sky-500/50'}`;
    
    let statusText = isCooldown ? i18n[currentLang].cooldownWait : i18n[currentLang].cooldownReady;
    
    card.innerHTML = `
      <div>
        <div class="flex justify-between items-start mb-2">
          <span class="text-3xl">${cat.icon}</span>
        </div>
        <h3 class="font-bold text-sm text-white">${cat.name[currentLang]}</h3>
        <span class="text-[10px] text-emerald-400 mt-2 block">${statusText}</span>
      </div>
    `;
    card.onclick = () => {
      if (isCooldown) { playSound('wrong'); return showToast(currentLang === 'ar' ? 'هذا القسم في فترة الانتظار!' : 'Category is on cooldown!', '⏳'); }
      startCategoryQuiz(cat.id);
    };
    grid.appendChild(card);
  });
}

function startCategoryQuiz(catId) {
  selectedCategory = catId;
  const rawPool = questionPools[catId][currentLang];
  
  activeQuizQuestions = [...rawPool].sort(() => 0.5 - Math.random()).slice(0, 20).map(qObj => {
    const allOpts = [qObj.ans, ...qObj.alt].sort(() => 0.5 - Math.random());
    return { ...qObj, options: allOpts, ansIndex: allOpts.indexOf(qObj.ans) };
  });

  currentQuestionIndex = 0; sessionScore = 0; streak = 0;
  document.getElementById('screen-categories').classList.add('hidden');
  document.getElementById('screen-quiz').classList.remove('hidden');
  loadNextQuestion();
}

function loadNextQuestion() {
  if (currentQuestionIndex >= activeQuizQuestions.length) return finishGame();
  
  const q = activeQuizQuestions[currentQuestionIndex];
  const catMeta = categoriesMetaData.find(c => c.id === selectedCategory);
  
  document.getElementById('question-cat-tag').innerHTML = `${catMeta.icon} ${catMeta.name[currentLang]}`;
  document.getElementById('q-counter').innerText = `${currentQuestionIndex + 1} / ${activeQuizQuestions.length}`;
  document.getElementById('streak-counter').innerText = `Streak: ${streak}`;
  document.getElementById('score-counter').innerText = `$${(sessionScore * REWARD_PER_CORRECT).toFixed(3)}`;
  document.getElementById('question-text').innerText = q.q;

  const flagContainer = document.getElementById('flag-container');
  const flagImg = document.getElementById('flag-img');
  if (q.flagCode) {
    flagContainer.classList.remove('hidden');
    flagImg.src = `https://flagcdn.com/w320/${q.flagCode.toLowerCase( )}.png`;
  } else {
    flagContainer.classList.add('hidden');
  }

  const optionsContainer = document.getElementById('options-container');
  optionsContainer.innerHTML = '';
  const prefixes = currentLang === 'ar' ? ['أ', 'ب', 'جـ', 'د'] : ['A', 'B', 'C', 'D'];
  
  q.options.forEach((optText, idx) => {
    const btn = document.createElement('button');
    const alignClass = currentLang === 'ar' ? 'text-right' : 'text-left flex-row-reverse';
    btn.className = `opt-btn glass-btn w-full p-3.5 rounded-xl font-bold text-sm text-slate-100 flex items-center justify-between border border-slate-700/80 shadow-md active:scale-98 mb-2 ${alignClass}`;
    btn.innerHTML = `<span>${optText}</span><span class="w-6 h-6 rounded-lg bg-slate-800 text-sky-400 text-xs flex items-center justify-center font-black border border-slate-700">${prefixes[idx] || (idx+1)}</span>`;
    btn.onclick = () => selectAnswer(idx, btn);
    optionsContainer.appendChild(btn);
  });
  resetTimer();
}

function resetTimer() {
  clearInterval(timerInterval);
  timerSecondsLeft = TIME_LIMIT_PER_Q;
  const timerBar = document.getElementById('timer-bar');
  timerBar.style.width = '100%';
  
  timerInterval = setInterval(() => {
    timerSecondsLeft -= 0.1;
    timerBar.style.width = `${Math.max(0, (timerSecondsLeft / TIME_LIMIT_PER_Q) * 100)}%`;
    if (timerSecondsLeft <= 0) {
      clearInterval(timerInterval);
      playSound('wrong');
      streak = 0; currentQuestionIndex++; loadNextQuestion();
    }
  }, 100);
}

function selectAnswer(idx, btn) {
  clearInterval(timerInterval);
  const q = activeQuizQuestions[currentQuestionIndex];
  const buttons = document.querySelectorAll('.opt-btn');
  buttons.forEach(b => b.style.pointerEvents = 'none');

  if (idx === q.ansIndex) {
    btn.classList.add('correct'); playSound('correct'); sessionScore++; streak++;
  } else {
    btn.classList.add('wrong'); buttons[q.ansIndex].classList.add('correct'); playSound('wrong'); streak = 0;
  }
  setTimeout(() => { currentQuestionIndex++; loadNextQuestion(); }, 700);
}

function finishGame() {
  clearInterval(timerInterval);
  categoryCooldowns[selectedCategory] = Date.now() + COOLDOWN_MS;
  
  document.getElementById('screen-quiz').classList.add('hidden');
  document.getElementById('result-screen').classList.remove('hidden');
  document.getElementById('res-correct-count').innerText = `${sessionScore} / 20`;
  document.getElementById('res-earned-amount').innerText = `$${(sessionScore * REWARD_PER_CORRECT).toFixed(3)}`;
  
  if (sessionScore >= 15 && window.confetti) {
    window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  }
}

// جعل الدوال متاحة لملف HTML
window.toggleSound = () => { 
  soundEnabled = !soundEnabled; 
  document.getElementById('sound-icon').innerText = soundEnabled ? '🔊' : '🔇';
  showToast(soundEnabled ? (currentLang === 'ar' ? 'تم تشغيل الصوت' : 'Sound Enabled') : (currentLang === 'ar' ? 'تم إيقاف الصوت' : 'Sound Disabled'), '🔊');
};

window.toggleLanguage = () => { 
  currentLang = currentLang === 'ar' ? 'en' : 'ar'; 
  localStorage.setItem('sq_lang', currentLang); // حفظ اللغة في المتصفح
  applyLanguage(); 
};

window.backToCategories = () => {
  document.getElementById('result-screen').classList.add('hidden');
  document.getElementById('screen-categories').classList.remove('hidden');
  renderCategoriesGrid();
};

window.openAdModal = () => {
  document.getElementById('ad-modal').classList.remove('hidden');
  let elapsed = 0;
  const progressBar = document.getElementById('ad-progress-bar');
  const timerText = document.getElementById('ad-timer-text');
  const btnComplete = document.getElementById('btn-complete-ad');
  
  document.getElementById('lbl-ad-wait').innerText = i18n[currentLang].lblAdWait;
  btnComplete.disabled = true;
  btnComplete.className = "w-full py-3 bg-slate-800 text-slate-500 font-bold text-xs rounded-xl border border-slate-700 cursor-not-allowed";

  const adInt = setInterval(() => {
    elapsed += 0.1;
    timerText.innerText = `${Math.max(0, 5 - elapsed).toFixed(0)}s`;
    progressBar.style.width = `${(elapsed / 5) * 100}%`;
    if (elapsed >= 5) {
      clearInterval(adInt);
      btnComplete.disabled = false;
      btnComplete.className = "btn-shimmer w-full py-3 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer";
      document.getElementById('lbl-ad-wait').innerText = i18n[currentLang].btnClaimAdNow;
    }
  }, 100);
};

window.finishRewardClaim = async () => {
  document.getElementById('ad-modal').classList.add('hidden');
  totalBalance += (sessionScore * REWARD_PER_CORRECT);
  
  if (telegramUser) {
    await updateUserData(telegramUser.id, totalBalance, categoryCooldowns);
  } else {
    localStorage.setItem('sq_balance', totalBalance);
    localStorage.setItem('sq_cooldowns', JSON.stringify(categoryCooldowns));
  }
  
  updateBalanceUI();
  showToast(currentLang === 'ar' ? `تمت إضافة الأرباح بنجاح!` : `Earnings claimed successfully!`, '🎉');
  window.backToCategories();
};

function showToast(msg, icon) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').innerText = msg;
  document.getElementById('toast-icon').innerText = icon;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

window.onload = initApp;
