// CareConnect – sends the sign-in codes from this Gmail account, for free.
//
// Paste this whole file into a Google Apps Script project (script.google.com,
// signed in with the Gmail account that should send the codes) and deploy it
// as a web app. Steps: backend/USERS_SETUP.md → "Email codes from Gmail".
//
// It can only send CareConnect's code email (the backend gives just the address
// and the 6-digit code), and only when the secret matches GMAIL_SCRIPT_SECRET on
// the server – so the link can't be used to send anything else.
// Gmail allows about 100 emails a day this way.

const SECRET = "PASTE-THE-SAME-SECRET-AS-GMAIL_SCRIPT_SECRET";

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply({ ok: false, error: "bad request" });
  }
  if (!data || data.secret !== SECRET) return reply({ ok: false, error: "wrong secret" });
  const to = String(data.to || "");
  const code = String(data.code || "");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to) || !/^\d{6}$/.test(code)) {
    return reply({ ok: false, error: "bad request" });
  }
  try {
    MailApp.sendEmail({
      to: to,
      name: "CareConnect",
      subject: "CareConnect code: " + code,
      body:
        "Your CareConnect sign-in code is " + code + "\n\n" +
        "It is valid for 10 minutes. If you didn't ask for it, ignore this email.",
    });
    return reply({ ok: true, left: MailApp.getRemainingDailyQuota() });
  } catch (err) {
    return reply({ ok: false, error: String(err) });   // e.g. the daily limit was reached
  }
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Run once from the editor (choose testSend, then ▶ Run): Google asks for permission to
// send email as you, and you get a test email – that shows it works.
function testSend() {
  MailApp.sendEmail(Session.getActiveUser().getEmail(), "CareConnect test", "It works! Emails left today: " + MailApp.getRemainingDailyQuota());
}
