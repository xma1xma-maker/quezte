// استبدل هذه الروابط لاحقاً بروابط مشروعك في Supabase
const supabaseUrl = 'https://duzreyfiwfqhzzwgivdd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1enJleWZpd2ZxaHp6d2dpdmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3ODAzMTEsImV4cCI6MjEwNDM1NjMxMX0.T1w4AmbXhRh3t24pa6tf9GfNRX8WMlk_5JpUFCzIZ4Y';

export const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

export async function getUserData(telegramId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();
  return data;
}

export async function updateUserData(telegramId, balance, cooldowns) {
  await supabase
    .from('users')
    .upsert({ telegram_id: telegramId, balance: balance, cooldowns: cooldowns });
}
