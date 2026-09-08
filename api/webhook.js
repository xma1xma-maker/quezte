export default async function handler(req, res) {
  if (req.method === 'POST') {
    const update = req.body;

    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;

      if (text.startsWith('/start')) {
        
        // التوكن الخاص بك
        const BOT_TOKEN = '8610812523:AAGC946M1yRxNRzWiu8t7exrk7DHxiZOTTM'; 
        
        // رابط التطبيق المصغر (تأكد أن Speed_QuizBot هو يوزر البوت الخاص بك، وإلا قم بتغييره)
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
  
  res.status(200).send('OK');
}
