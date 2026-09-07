// js/app.js
import { categoriesMetaData, questionPools, initializeDatabase } from './data.js';

// إعداد Supabase (سنضع الروابط الحقيقية لاحقاً)
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// إعداد تليجرام
const tg = window.Telegram?.WebApp;
let telegramUser = null;
if (tg) {
  tg.ready();
  tg.expand();
  telegramUser = tg.initDataUnsafe?.user;
}

let totalBalance = 0;

async function initApp() {
  initializeDatabase();
  
  if (telegramUser) {
    // جلب رصيد المستخدم من Supabase
    const { data, error } = await supabase
      .from('users')
      .select('balance')
      .eq('telegram_id', telegramUser.id)
      .single();
      
    if (data) {
      totalBalance = data.balance;
    }
  }
  
  // تحديث الواجهة
  document.getElementById('user-balance').innerText = `$${totalBalance.toFixed(3)}`;
  // استدعاء دالة عرض الأقسام هنا...
}

window.onload = initApp;
// ... باقي دوال اللعبة (startCategoryQuiz, loadNextQuestion, الخ)
