// src/main.js
import './style.css';
import { categoriesMetaData, questionPools, initializeDatabase } from './data/questions.js';
import { supabase, getUserData, updateUserBalance } from './supabase.js';

// إعدادات تليجرام
const tg = window.Telegram?.WebApp;
let telegramUser = null;

if (tg) {
  tg.ready();
  tg.expand();
  telegramUser = tg.initDataUnsafe?.user;
}

// متغيرات الحالة (State)
let currentLang = 'ar';
let soundEnabled = true;
let totalBalance = 0; // سيتم جلبه من Supabase
let categoryCooldowns = {};

// دالة التهيئة عند فتح التطبيق
async function initApp() {
  initializeDatabase(); // تجهيز الأسئلة
  
  if (telegramUser) {
    // جلب بيانات المستخدم من Supabase
    const userData = await getUserData(telegramUser.id);
    if (userData) {
      totalBalance = userData.balance || 0;
      categoryCooldowns = userData.cooldowns || {};
    } else {
      // إذا كان مستخدم جديد، قم بإنشائه في قاعدة البيانات (سنضيف هذه الدالة لاحقاً)
    }
  }
  
  updateBalanceUI();
  renderCategoriesGrid();
}

// ... (باقي دوال اللعبة مثل startCategoryQuiz, loadNextQuestion, finishGame) ...

// تشغيل التطبيق
window.onload = initApp;
