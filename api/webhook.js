export default async function handler(req, res) {
  // التأكد من أن الطلب قادم من تليجرام (POST)
  if (req.method === 'POST') {
    const update = req.body;

    // التحقق مما إذا كانت هناك رسالة نصية
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;

      // إذا أرسل المستخدم /start
      if (text.startsWith('/start')) {
        
        // ⚠️ ضع توكن البوت الخاص بك هنا (من BotFather)
        const BOT_TOKEN = '8610812523:AAGC946M1yRxNRzWiu8t7exrk7DHxiZOTTM'; 
        
        // ⚠️ ضع الرابط المختصر لتطبيقك هنا
        const WEB_APP_URL = 'https://t.me/Speed_QuizBot/apps'; 

        const replyText = "مرحباً بك في SpeedQuiz ⚡️!\n\nأسرع وأمتع طريقة لربح المال من تليجرام 💸\nاضغط على الزر بالأسفل لبدء اللعب وجمع الأرباح 👇";

        const payload = {
          chat_id: chatId,
          text: replyText,
          reply_markup: {
            inline_keyboard: [
              [{ text: "العب واربح 🎮", url: WEB_APP_URL }]
            ]
          }
        };

        // إرسال الرد إلى تليجرام
        try {
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload )
          });
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }
    }
  }
  
  // يجب دائماً إرجاع 200 OK لتليجرام
  res.status(200).send('OK');
}
