const OPENAI_API_KEY = PropertiesService.getScriptProperties().getProperty("OPENAI_API_KEY");

function processUnreadEmails() {
  const threads = GmailApp.search('category:primary is:unread to:me newer_than:2d');
  const label = GmailApp.getUserLabelByName("Meeting Review") || GmailApp.createLabel("Meeting Review");

  threads.forEach(thread => {
    const messages = thread.getMessages();
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage.isUnread()) return;

    const sender = lastMessage.getFrom();
    const subject = lastMessage.getSubject();
    const body = lastMessage.getPlainBody().substring(0, 3000);

    const emailMatch = sender.match(/<(.+?)>/);
    const senderEmail = emailMatch ? emailMatch[1] : sender;

    if (senderEmail.toLowerCase().endsWith("@cavendishmusic.com")) {
      Logger.log("Skipping internal email from: " + senderEmail);
      return;
    }

    const prompt = `
You are replying to a professional email on behalf of someone who works in the music industry. Keep the tone clear, polite, and helpful, without being overly formal or corporate.

- Do not use greetings like "Dear [Name]".
- Keep the message concise but try to answer all their questions (6 sentences max).
- Be professional and respectful, but not stiff.
- Sign off with just the person's name (e.g., "Taz").
- Use British English spelling and proper grammar.

If the email involves scheduling or suggesting a meeting, add a line at the end that begins with [[MEETING]] followed by a brief description of the request.
If the email is about submitting demos or music, reply like this:
"Thanks for getting in touch. You can send your demos to our dedicated inbox: demos@cavendishmusic.com. Please include a short bio and links to your work."

Here is the email:

From: ${sender}
Subject: ${subject}
Message:
${body}
`;

    const reply = callOpenAI(prompt);
    if (!reply) return;

    const meetingLine = reply.split('\n').find(line => line.startsWith('[[MEETING]]'));
    if (meetingLine) {
      thread.addLabel(label);
    }

    const cleanedReply = reply.replace(/\[\[MEETING\]\].*/g, '').trim();

    GmailApp.createDraft(sender, "Re: " + subject, cleanedReply, {
      inReplyTo: lastMessage.getId()
    });

    lastMessage.markRead();
  });
}

function callOpenAI(prompt) {
  try {
    const response = UrlFetchApp.fetch("https://api.openai.com/v1/chat/completions", {
      method: "post",
      contentType: "application/json",
      headers: {
        Authorization: "Bearer " + OPENAI_API_KEY
      },
      payload: JSON.stringify({
        model: "gpt-4",
        messages: [{role: "user", content: prompt}],
        temperature: 0.7
      }),
      muteHttpExceptions: true
    });

    const json = JSON.parse(response.getContentText());
    return json.choices[0].message.content;
  } catch (error) {
    Logger.log("Error calling OpenAI: " + error);
    return null;
  }
}
