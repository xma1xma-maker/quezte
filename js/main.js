import { categoriesMetaData, questionPools, initializeDatabase } from './data.js';
import { supabase, checkAndRegisterUser, updateUserData } from './supabase.js';

// ⚠️ إعدادات البوت والسحب (قم بتغييرها ببياناتك الحقيقية)
const BOT_USERNAME = 'Speed_QuizBot'; // معرف البوت الخاص بك بدون @
const ADMIN_USERNAME = 'hamsterze'; // معرف حسابك الشخصي على تليجرام بدون @ للتواصل
const MIN_WITHDRAW = 50; // الحد الأدنى للسحب (كوينز)
const MIN_INVITES = 20; // الحد الأدنى للدعوات لطلب السحب
const VIP_INVITES = 50; // الدعوات المطلوبة لظهور حسابك الشخصي

// قاموس الترجمة للواجهة
const i18n = {
  ar: {
    lblBalance: 'الرصيد الكلي',
    catBadge: '⚡ مربح وسريع جداً',
    catTitle: 'اختر القسم وابدأ التحدي',
    catSubtitle: '20 سؤالاً سريعاً. احصل على <span class="text-emerald-400 font-bold">0.001 كوينز</span> عن كل إجابة صحيحة!',
    lblResScore: 'الإجابات الصحيحة',
    lblResEarned: 'أرباح الجولة',
    btnClaim: 'سحب الأرباح لحسابك',
    btnBack: 'العودة للأقسام',
    adTitle: 'إعلان مكافأة تليجرام',
    lblAdWait: 'يرجى الانتظار...',
    btnClaimAdNow: 'إضافة الأرباح الآن 💰',
    lblExit: 'خروج',
    lblCorrect: 'الصحيحة',
    lblChannel: 'قناة إثباتات السحب',
    btnInvite: 'دعوة الأصدقاء 🎁',
    btnWithdraw: 'سحب الأرباح 💳',
    invTitle: 'دعوة الأصدقاء',
    invDesc: 'قم بدعوة أصدقائك لزيادة أرباحك وفتح ميزة السحب المباشر!',
    lblInvCount: 'عدد الدعوات',
    lblInvBal: 'رصيدك الحالي',
    btnShareText: 'مشاركة الرابط 🚀',
    btnInvBack: 'العودة للأقسام',
    wdTitle: 'سحب الأرباح',
    wdDesc: 'تأكد من استيفاء الشروط لسحب أرباحك مباشرة.',
    lblWdBalReq: `الرصيد المطلوب (${MIN_WITHDRAW} كوينز)`,
    lblWdInvReq: `الدعوات المطلوبة (${MIN_INVITES})`,
    btnReqWithdraw: 'طلب السحب الآن',
    btnWdBack: 'العودة للأقسام',
    langName: 'العربية',
    langFlag: '🇸🇦',
    dir: 'rtl',
    cooldownReady: 'جاهز الآن',
    cooldownWait: '⏳ متبقي'
  },
  en: {
    lblBalance: 'Total Balance',
    catBadge: '⚡ Fast & Rewarding',
    catTitle: 'Choose Category & Play',
    catSubtitle: '20 rapid questions. Earn <span class="text-emerald-400 font-bold">0.001 Coins</span> for each correct answer!',
    lblResScore: 'Correct Answers',
    lblResEarned: 'Session Earned',
    btnClaim: 'Claim Earnings',
    btnBack: 'Back to Categories',
    adTitle: 'Telegram Rewarded Ad',
    lblAdWait: 'Please wait...',
    btnClaimAdNow: 'Claim Earnings Now 💰',
    lblExit: 'Exit',
    lblCorrect: 'Correct',
    lblChannel: 'Withdrawal Proofs',
    btnInvite: 'Invite Friends 🎁',
    btnWithdraw: 'Withdraw 💳',
    invTitle: 'Invite Friends',
    invDesc: 'Invite your friends to increase your earnings and unlock direct withdrawal!',
    lblInvCount: 'Invites Count',
    lblInvBal: 'Current Balance',
    btnShareText: 'Share Link 🚀',
    btnInvBack: 'Back to Categories',
    wdTitle: 'Withdraw Earnings',
    wdDesc: 'Ensure you meet the conditions to withdraw directly.',
    lblWdBalReq: `Required Balance (${MIN_WITHDRAW} Coins)`,
    lblWdInvReq: `Required Invites (${MIN_INVITES})`,
    btnReqWithdraw: 'Request Withdrawal Now',
    btnWdBack: 'Back to Categories',
    langName: 'English',
    langFlag: '🇬🇧',
    dir: 'ltr',
    cooldownReady: 'Ready Now',
    cooldownWait: '⏳ Wait'
  }
};

const tg = window.Telegram?.WebApp;
let telegramUser = null;
let startParam = null;

if (tg) {
  tg.ready();
  tg.expand();
  telegramUser = tg.initDataUnsafe?.user;
  startParam = tg.initDataUnsafe?.start_param;
}

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
let referralsCount = 0;
let categoryCooldowns = {};
let selectedCategory = null;
let activeQuizQuestions = [];
let currentQuestionIndex = 0;
let sessionScore = 0;
let timerInterval = null;
let timerSecondsLeft = 5;
const TIME_LIMIT_PER_Q = 5;
const REWARD_PER_CORRECT = 0.001;
const COOLDOWN_MS = 12 * 60 * 60 * 1000;

function triggerHaptic(style) {
  if (tg && tg.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(style);
  }
}

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
  
  if(document.getElementById('lbl-exit')) document.getElementById('lbl-exit').innerText = i18n[currentLang].lblExit;
  if(document.getElementById('lbl-channel')) document.getElementById('lbl-channel').innerText = i18n[currentLang].lblChannel;
  if(document.getElementById('lbl-invite')) document.getElementById('lbl-invite').innerText = i18n[currentLang].btnInvite;
  if(document.getElementById('lbl-withdraw')) document.getElementById('lbl-withdraw').innerText = i18n[currentLang].btnWithdraw;
  
  if(document.getElementById('inv-title')) document.getElementById('inv-title').innerText = i18n[currentLang].invTitle;
  if(document.getElementById('inv-desc')) document.getElementById('inv-desc').innerText = i18n[currentLang].invDesc;
  if(document.getElementById('lbl-inv-count')) document.getElementById('lbl-inv-count').innerText = i18n[currentLang].lblInvCount;
  if(document.getElementById('lbl-inv-bal')) document.getElementById('lbl-inv-bal').innerText = i18n[currentLang].lblInvBal;
  if(document.getElementById('btn-share-text')) document.getElementById('btn-share-text').innerText = i18n[currentLang].btnShareText;
  if(document.getElementById('btn-inv-back')) document.getElementById('btn-inv-back').innerText = i18n[currentLang].btnInvBack;

  if(document.getElementById('wd-title')) document.getElementById('wd-title').innerText = i18n[currentLang].wdTitle;
  if(document.getElementById('wd-desc')) document.getElementById('wd-desc').innerText = i18n[currentLang].wdDesc;
  if(document.getElementById('lbl-wd-bal-req')) document.getElementById('lbl-wd-bal-req').innerText = i18n[currentLang].lblWdBalReq;
  if(document.getElementById('lbl-wd-inv-req')) document.getElementById('lbl-wd-inv-req').innerText = i18n[currentLang].lblWdInvReq;
  if(document.getElementById('btn-req-withdraw')) document.getElementById('btn-req-withdraw').innerText = i18n[currentLang].btnReqWithdraw;
  if(document.getElementById('btn-wd-back')) document.getElementById('btn-wd-back').innerText = i18n[currentLang].btnWdBack;

  renderCategoriesGrid();

  if (!document.getElementById('screen-quiz').classList.contains('hidden')) {
    renderCurrentQuestionUI();
  }
}

async function initApp() {
  initializeDatabase();
  applyLanguage(); 
  
  if (telegramUser) {
    const userData = await checkAndRegisterUser(telegramUser.id, startParam);
    if (userData) {
      totalBalance = userData.balance || 0;
      categoryCooldowns = userData.cooldowns || {};
      referralsCount = userData.referrals_count || 0;
    }
  } else {
    totalBalance = parseFloat(localStorage.getItem('sq_balance') || '0');
    categoryCooldowns = JSON.parse(localStorage.getItem('sq_cooldowns') || '{}');
  }
  updateBalanceUI();

  setInterval(() => {
    if (!document.getElementById('screen-categories').classList.contains('hidden')) {
      renderCategoriesGrid();
    }
  }, 1000);
}

function updateBalanceUI() {
  document.getElementById('user-balance').innerText = `🪙 ${totalBalance.toFixed(3)}`;
  if(document.getElementById('inv-bal-val')) {
    document.getElementById('inv-bal-val').innerText = `🪙 ${totalBalance.toFixed(3)}`;
  }
}

function renderCategoriesGrid() {
  const grid = document.getElementById('categories-grid');
  grid.innerHTML = '';
  categoriesMetaData.forEach(cat => {
    const cooldownEndTime = categoryCooldowns[cat.id] || 0;
    const isCooldown = Date.now() < cooldownEndTime;
    const card = document.createElement('div');
    
    card.className = `glass-card rounded-2xl p-3.5 flex flex-col justify-between border ${isCooldown ? 'border-amber-500/30 opacity-70' : 'border-slate-800 cursor-pointer hover:border-sky-500/50'}`;
    
    let statusText = '';
    if (isCooldown) {
      const diffSec = Math.ceil((cooldownEndTime - Date.now()) / 1000);
      const hours = Math.floor(diffSec / 3600);
      const mins = Math.floor((diffSec % 3600) / 60);
      const secs = diffSec % 60;
      const timeStr = `${hours}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
      statusText = `<span class="text-amber-400">${i18n[currentLang].cooldownWait} ${timeStr}</span>`;
    } else {
      statusText = `<span class="text-emerald-400">${i18n[currentLang].cooldownReady}</span>`;
    }
    
    card.innerHTML = `
      <div>
        <div class="flex justify-between items-start mb-2">
          <span class="text-3xl">${cat.icon}</span>
        </div>
        <h3 class="font-bold text-sm text-white">${cat.name[currentLang]}</h3>
        <span class="text-[11px] mt-2 block font-mono font-bold">${statusText}</span>
      </div>
    `;
    
    card.onclick = () => {
      if (isCooldown) { 
        playSound('wrong'); 
        triggerHaptic('heavy');
        return showToast(currentLang === 'ar' ? 'هذا القسم في فترة الانتظار!' : 'Category is on cooldown!', '⏳'); 
      }
      startCategoryQuiz(cat.id);
    };
    grid.appendChild(card);
  });
}

function startCategoryQuiz(catId) {
  selectedCategory = catId;
  const rawPoolAr = questionPools[catId]['ar'];
  const rawPoolEn = questionPools[catId]['en'];
  
  let indices = Array.from({length: rawPoolAr.length}, (_, i) => i);
  indices = indices.sort(() => 0.5 - Math.random()).slice(0, 20);
  
  activeQuizQuestions = indices.map(idx => {
    const qAr = rawPoolAr[idx];
    const qEn = rawPoolEn[idx];
    const optOrder = [0, 1, 2, 3].sort(() => 0.5 - Math.random());
    
    const optsAr = optOrder.map(i => i === 0 ? qAr.ans : qAr.alt[i - 1]);
    const optsEn = optOrder.map(i => i === 0 ? qEn.ans : qEn.alt[i - 1]);
    
    return {
      ar: { q: qAr.q, options: optsAr },
      en: { q: qEn.q, options: optsEn },
      ansIndex: optOrder.indexOf(0),
      flagCode: qAr.flagCode
    };
  });

  currentQuestionIndex = 0; 
  sessionScore = 0;
  
  const correctCounter = document.getElementById('correct-counter');
  if(correctCounter) correctCounter.innerText = '0';

  document.getElementById('screen-categories').classList.add('hidden');
  document.getElementById('screen-quiz').classList.remove('hidden');
  loadNextQuestion();
}

function loadNextQuestion() {
  if (currentQuestionIndex >= activeQuizQuestions.length) return finishGame();
  renderCurrentQuestionUI();
  resetTimer();
}

function renderCurrentQuestionUI() {
  if (currentQuestionIndex >= activeQuizQuestions.length) return;
  
  const qData = activeQuizQuestions[currentQuestionIndex];
  const qLang = qData[currentLang];
  const catMeta = categoriesMetaData.find(c => c.id === selectedCategory);
  
  document.getElementById('question-cat-tag').innerHTML = `${catMeta.icon} ${catMeta.name[currentLang]}`;
  document.getElementById('q-counter').innerText = `${currentQuestionIndex + 1} / ${activeQuizQuestions.length}`;
  
  document.getElementById('score-counter').innerText = `🪙 ${(sessionScore * REWARD_PER_CORRECT).toFixed(3)}`;
  document.getElementById('question-text').innerText = qLang.q;

  const flagContainer = document.getElementById('flag-container');
  const flagImg = document.getElementById('flag-img');
  if (qData.flagCode) {
    flagContainer.classList.remove('hidden');
    flagImg.src = `https://flagcdn.com/w320/${qData.flagCode.toLowerCase( )}.png`;
  } else {
    flagContainer.classList.add('hidden');
  }

  const optionsContainer = document.getElementById('options-container');
  optionsContainer.innerHTML = '';
  const prefixes = currentLang === 'ar' ? ['أ', 'ب', 'جـ', 'د'] : ['A', 'B', 'C', 'D'];
  
  qLang.options.forEach((optText, idx) => {
    const btn = document.createElement('button');
    const alignClass = currentLang === 'ar' ? 'text-right' : 'text-left flex-row-reverse';
    btn.className = `opt-btn glass-btn w-full p-3.5 rounded-xl font-bold text-sm text-slate-100 flex items-center justify-between border border-slate-700/80 shadow-md active:scale-98 mb-2 ${alignClass}`;
    btn.innerHTML = `<span>${optText}</span><span class="w-6 h-6 rounded-lg bg-slate-800 text-sky-400 text-xs flex items-center justify-center font-black border border-slate-700">${prefixes[idx] || (idx+1)}</span>`;
    btn.onclick = () => selectAnswer(idx, btn);
    optionsContainer.appendChild(btn);
  });
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
      triggerHaptic('heavy');
      currentQuestionIndex++; loadNextQuestion();
    }
  }, 100);
}

function selectAnswer(idx, btn) {
  clearInterval(timerInterval);
  const q = activeQuizQuestions[currentQuestionIndex];
  const buttons = document.querySelectorAll('.opt-btn');
  buttons.forEach(b => b.style.pointerEvents = 'none');

  if (idx === q.ansIndex) {
    btn.classList.add('correct'); 
    playSound('correct'); 
    triggerHaptic('light'); 
    sessionScore++;
    
    const correctCounter = document.getElementById('correct-counter');
    if(correctCounter) correctCounter.innerText = sessionScore;
  } else {
    btn.classList.add('wrong'); 
    buttons[q.ansIndex].classList.add('correct'); 
    playSound('wrong'); 
    triggerHaptic('heavy'); 
  }
  
  setTimeout(() => { currentQuestionIndex++; loadNextQuestion(); }, 700);
}

function finishGame() {
  clearInterval(timerInterval);
  categoryCooldowns[selectedCategory] = Date.now() + COOLDOWN_MS;
  
  document.getElementById('screen-quiz').classList.add('hidden');
  document.getElementById('result-screen').classList.remove('hidden');
  document.getElementById('res-correct-count').innerText = `${sessionScore} / 20`;
  document.getElementById('res-earned-amount').innerText = `🪙 ${(sessionScore * REWARD_PER_CORRECT).toFixed(3)}`;
  
  if (sessionScore >= 15 && window.confetti) {
    window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    triggerHaptic('success');
  }
}

// --- دوال الأزرار والنوافذ ---

window.toggleSound = () => { 
  soundEnabled = !soundEnabled; 
  document.getElementById('sound-icon').innerText = soundEnabled ? '🔊' : '🔇';
  showToast(soundEnabled ? (currentLang === 'ar' ? 'تم تشغيل الصوت' : 'Sound Enabled') : (currentLang === 'ar' ? 'تم إيقاف الصوت' : 'Sound Disabled'), '🔊');
};

window.toggleLanguage = () => { 
  currentLang = currentLang === 'ar' ? 'en' : 'ar'; 
  localStorage.setItem('sq_lang', currentLang);
  applyLanguage(); 
};

window.backToCategories = () => {
  document.getElementById('result-screen').classList.add('hidden');
  document.getElementById('screen-categories').classList.remove('hidden');
  renderCategoriesGrid();
};

window.exitQuiz = () => {
  clearInterval(timerInterval);
  document.getElementById('screen-quiz').classList.add('hidden');
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
      triggerHaptic('success');
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

window.openChannel = () => {
  const channelUrl = 'https://t.me/+0giQaGJfCQ0xMzcy';
  if (tg && tg.openTelegramLink ) {
    tg.openTelegramLink(channelUrl);
  } else {
    window.open(channelUrl, '_blank');
  }
};

// --- دوال صفحة الدعوة ---

window.openInviteScreen = () => {
  if (!telegramUser) return showToast(currentLang === 'ar' ? 'متاح داخل تليجرام فقط' : 'Available in Telegram only', '⚠️');

  const inviteLink = `https://t.me/${BOT_USERNAME}/apps?startapp=${telegramUser.id}`;
  
  document.getElementById('inv-link-input' ).value = inviteLink;
  document.getElementById('inv-count-val').innerText = referralsCount;
  document.getElementById('inv-bal-val').innerText = `🪙 ${totalBalance.toFixed(3)}`;

  document.getElementById('screen-categories').classList.add('hidden');
  document.getElementById('screen-invite').classList.remove('hidden');
};

window.closeInviteScreen = () => {
  document.getElementById('screen-invite').classList.add('hidden');
  document.getElementById('screen-categories').classList.remove('hidden');
};

window.copyInviteLink = () => {
  const copyText = document.getElementById('inv-link-input');
  copyText.select();
  copyText.setSelectionRange(0, 99999); // للهواتف المحمولة
  navigator.clipboard.writeText(copyText.value).then(() => {
    showToast(currentLang === 'ar' ? 'تم نسخ الرابط بنجاح!' : 'Link copied successfully!', '📋');
    triggerHaptic('light');
  });
};

window.shareInviteLink = () => {
  const inviteLink = document.getElementById('inv-link-input').value;
  const text = currentLang === 'ar' 
    ? `العب واربح الكوينز معي في تحدي الأسئلة! 🪙` 
    : `Play and earn coins with me! 🪙`;

  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink )}&text=${encodeURIComponent(text)}`;

  if (tg && tg.openTelegramLink) {
    tg.openTelegramLink(shareUrl);
  } else {
    window.open(shareUrl, '_blank');
  }
};

// --- دوال صفحة السحب (الجديدة) ---

window.openWithdrawScreen = () => {
  const balPercent = Math.min(100, (totalBalance / MIN_WITHDRAW) * 100);
  const invPercent = Math.min(100, (referralsCount / MIN_INVITES) * 100);
  
  document.getElementById('wd-bal-progress').innerText = `${balPercent.toFixed(0)}%`;
  document.getElementById('wd-bal-bar').style.width = `${balPercent}%`;
  
  // إظهار شريط الدعوات فقط إذا اكتمل الرصيد
  if (totalBalance >= MIN_WITHDRAW) {
    document.getElementById('inv-req-section').classList.remove('hidden');
    document.getElementById('wd-inv-progress').innerText = `${invPercent.toFixed(0)}%`;
    document.getElementById('wd-inv-bar').style.width = `${invPercent}%`;
  } else {
    document.getElementById('inv-req-section').classList.add('hidden');
  }

  document.getElementById('screen-categories').classList.add('hidden');
  document.getElementById('screen-withdraw').classList.remove('hidden');
};

window.closeWithdrawScreen = () => {
  document.getElementById('screen-withdraw').classList.add('hidden');
  document.getElementById('screen-categories').classList.remove('hidden');
};

window.processWithdrawal = () => {
  if (totalBalance < MIN_WITHDRAW) {
    triggerHaptic('error');
    return showToast(currentLang === 'ar' ? `تحتاج إلى ${MIN_WITHDRAW} كوينز للسحب.` : `Need ${MIN_WITHDRAW} coins to withdraw.`, '⚠️');
  }

  if (referralsCount < MIN_INVITES) {
    triggerHaptic('warning');
    return showToast(currentLang === 'ar' ? `تحتاج إلى ${MIN_INVITES} دعوة للسحب.` : `Need ${MIN_INVITES} invites.`, '👥');
  }

  if (referralsCount >= VIP_INVITES) {
    triggerHaptic('success');
    showToast(currentLang === 'ar' ? 'تم استيفاء الشروط! تحويل للإدارة...' : 'Conditions met! Redirecting...', '✅');
    
    setTimeout(() => {
      const adminUrl = `https://t.me/${ADMIN_USERNAME}`;
      if (tg && tg.openTelegramLink ) {
        tg.openTelegramLink(adminUrl);
      } else {
        window.open(adminUrl, '_blank');
      }
    }, 2000);
  } else {
    triggerHaptic('warning');
    showToast(currentLang === 'ar' ? `تحتاج ${VIP_INVITES} دعوة للتواصل المباشر.` : `Need ${VIP_INVITES} invites for direct contact.`, '🔒');
  }
};

function showToast(msg, icon) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').innerText = msg;
  document.getElementById('toast-icon').innerText = icon;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

window.onload = initApp;
