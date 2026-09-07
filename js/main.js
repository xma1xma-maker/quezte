import { categoriesMetaData, questionPools, initializeDatabase } from './data.js';
import { supabase, getUserData, updateUserData } from './supabase.js';

let currentLang = 'ar';
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

const tg = window.Telegram?.WebApp;
let telegramUser = null;
if (tg) {
  tg.ready();
  tg.expand();
  telegramUser = tg.initDataUnsafe?.user;
}

async function initApp() {
  initializeDatabase();
  
  if (telegramUser) {
    const userData = await getUserData(telegramUser.id);
    if (userData) {
      totalBalance = userData.balance || 0;
      categoryCooldowns = userData.cooldowns || {};
    }
  } else {
    // Fallback for testing outside Telegram
    totalBalance = parseFloat(localStorage.getItem('sq_balance') || '0');
    categoryCooldowns = JSON.parse(localStorage.getItem('sq_cooldowns') || '{}');
  }
  
  updateBalanceUI();
  renderCategoriesGrid();
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
    card.className = `glass-card rounded-2xl p-3.5 flex flex-col justify-between border ${isCooldown ? 'border-amber-500/30 opacity-80' : 'border-slate-800 cursor-pointer'}`;
    
    card.innerHTML = `
      <div>
        <div class="flex justify-between items-start mb-2">
          <span class="text-3xl">${cat.icon}</span>
        </div>
        <h3 class="font-bold text-sm text-white">${cat.name[currentLang]}</h3>
      </div>
    `;

    card.onclick = () => {
      if (isCooldown) return showToast('هذا القسم في فترة الانتظار!', '⏳');
      startCategoryQuiz(cat.id);
    };
    grid.appendChild(card);
  });
}

function startCategoryQuiz(catId) {
  selectedCategory = catId;
  const rawPool = questionPools[catId][currentLang];
  if(!rawPool || rawPool.length === 0) return showToast('لا توجد أسئلة هنا بعد', '⚠️');
  
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
  document.getElementById('q-counter').innerText = `${currentQuestionIndex + 1} / ${activeQuizQuestions.length}`;
  document.getElementById('score-counter').innerText = `$${(sessionScore * REWARD_PER_CORRECT).toFixed(3)}`;
  document.getElementById('question-text').innerText = q.q;

  const optionsContainer = document.getElementById('options-container');
  optionsContainer.innerHTML = '';
  q.options.forEach((optText, idx) => {
    const btn = document.createElement('button');
    btn.className = 'opt-btn glass-btn w-full p-3.5 rounded-xl font-bold text-sm text-slate-100 text-right mb-2';
    btn.innerText = optText;
    btn.onclick = () => selectAnswer(idx, btn);
    optionsContainer.appendChild(btn);
  });
  resetTimer();
}

function resetTimer() {
  clearInterval(timerInterval);
  timerSecondsLeft = TIME_LIMIT_PER_Q;
  timerInterval = setInterval(() => {
    timerSecondsLeft -= 0.1;
    document.getElementById('timer-bar').style.width = `${(timerSecondsLeft / TIME_LIMIT_PER_Q) * 100}%`;
    if (timerSecondsLeft <= 0) {
      clearInterval(timerInterval);
      streak = 0; currentQuestionIndex++; loadNextQuestion();
    }
  }, 100);
}

function selectAnswer(idx, btn) {
  clearInterval(timerInterval);
  const q = activeQuizQuestions[currentQuestionIndex];
  if (idx === q.ansIndex) {
    btn.classList.add('correct'); sessionScore++; streak++;
  } else {
    btn.classList.add('wrong'); streak = 0;
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
}

// جعل الدوال متاحة لملف HTML
window.toggleSound = () => { soundEnabled = !soundEnabled; };
window.toggleLanguage = () => { currentLang = currentLang === 'ar' ? 'en' : 'ar'; renderCategoriesGrid(); };
window.backToCategories = () => {
  document.getElementById('result-screen').classList.add('hidden');
  document.getElementById('screen-categories').classList.remove('hidden');
  renderCategoriesGrid();
};
window.openAdModal = () => {
  document.getElementById('ad-modal').classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('btn-complete-ad').disabled = false;
    document.getElementById('lbl-ad-wait').innerText = "إضافة الأرباح الآن 💰";
  }, 5000);
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
  window.backToCategories();
};

function showToast(msg, icon) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').innerText = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

window.onload = initApp;
