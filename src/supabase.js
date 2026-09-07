
// src/supabase.js
import { createClient } from '@supabase/supabase-js';

// سنضع هذه القيم لاحقاً في ملف .env لحمايتها
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);

// دالة لجلب بيانات المستخدم من قاعدة البيانات
export async function getUserData(telegramId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();
    
  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  return data;
}

// دالة لتحديث رصيد المستخدم
export async function updateUserBalance(telegramId, newBalance) {
  const { error } = await supabase
    .from('users')
    .update({ balance: newBalance })
    .eq('telegram_id', telegramId);
    
  if (error) console.error('Error updating balance:', error);
}
