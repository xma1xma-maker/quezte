// js/supabase.js

// روابط مشروعك في Supabase
const supabaseUrl = 'https://duzreyfiwfqhzzwgivdd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1enJleWZpd2ZxaHp6d2dpdmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3ODAzMTEsImV4cCI6MjEwNDM1NjMxMX0.T1w4AmbXhRh3t24pa6tf9GfNRX8WMlk_5JpUFCzIZ4Y';

// تهيئة الاتصال بقاعدة البيانات
export const supabase = window.supabase.createClient(supabaseUrl, supabaseKey );

// دالة لجلب بيانات المستخدم (الرصيد ووقت الانتظار)
export async function getUserData(telegramId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();
    
    // تجاهل خطأ "المستخدم غير موجود" لأنه طبيعي للمستخدمين الجدد
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user:', error);
    }
    return data;
  } catch (err) {
    console.error('Supabase error:', err);
    return null;
  }
}

// دالة لتحديث أو إنشاء بيانات المستخدم
export async function updateUserData(telegramId, balance, cooldowns) {
  try {
    const { error } = await supabase
      .from('users')
      .upsert({ 
        telegram_id: telegramId, 
        balance: balance, 
        cooldowns: cooldowns,
        last_active: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error updating user:', error);
    }
  } catch (err) {
    console.error('Supabase error:', err);
  }
}
