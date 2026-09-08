const supabaseUrl = 'https://duzreyfiwfqhzzwgivdd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1enJleWZpd2ZxaHp6d2dpdmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3ODAzMTEsImV4cCI6MjEwNDM1NjMxMX0.T1w4AmbXhRh3t24pa6tf9GfNRX8WMlk_5JpUFCzIZ4Y';

export const supabase = window.supabase.createClient(supabaseUrl, supabaseKey );

export async function checkAndRegisterUser(telegramId, referrerId = null) {
  try {
    let { data: user, error } = await supabase.from('users').select('*').eq('telegram_id', telegramId).single();
    
    if (!user) {
      const newUser = { 
        telegram_id: telegramId, 
        balance: 0, 
        cooldowns: {}, 
        referrals_count: 0 
      };
      
      if (referrerId && referrerId != telegramId) {
        newUser.referred_by = referrerId;
      }
      
      await supabase.from('users').insert([newUser]);
      
      // إضافة 0.03$ وزيادة عدد الدعوات للشخص الذي قام بالدعوة
      if (referrerId && referrerId != telegramId) {
        let { data: refUser } = await supabase.from('users').select('referrals_count, balance').eq('telegram_id', referrerId).single();
        if (refUser) {
          await supabase.from('users').update({ 
            referrals_count: refUser.referrals_count + 1,
            balance: refUser.balance + 0.03 // 💰 مكافأة الدعوة
          }).eq('telegram_id', referrerId);
        }
      }
      return newUser;
    }
    return user;
  } catch (err) {
    console.error('Supabase error:', err);
    return null;
  }
}

export async function updateUserData(telegramId, balance, cooldowns) {
  try {
    await supabase.from('users').update({ 
      balance: balance, 
      cooldowns: cooldowns,
      last_active: new Date().toISOString()
    }).eq('telegram_id', telegramId);
  } catch (err) {
    console.error('Supabase error:', err);
  }
}
