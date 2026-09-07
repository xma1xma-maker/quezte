// استبدل هذه الروابط لاحقاً بروابط مشروعك في Supabase
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

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
