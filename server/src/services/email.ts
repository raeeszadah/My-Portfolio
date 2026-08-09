import nodemailer from 'nodemailer';

// ─── Transporter (lazy-init so server boots even without email config) ────────
let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (_transporter) return _transporter;

  const user = process.env.EMAIL_FROM;
  const pass = process.env.EMAIL_APP_PASSWORD;

  if (!user || !pass || pass === 'your_16_char_app_password_here') {
    console.warn('[Email] EMAIL_APP_PASSWORD not configured — emails will be skipped.');
    return null;
  }

  _transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  return _transporter;
}

// ─── Admin panel URL helper ───────────────────────────────────────────────────
function adminInboxUrl(): string {
  const base = process.env.FRONTEND_URL || process.env.BACKEND_URL || 'http://localhost:5173';
  return `${base}/admin/messages`;
}

// ─── 1. Notify admin when new contact message arrives ────────────────────────
export async function sendAdminNotification(msg: {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  profession?: string;
  created_at: string;
}): Promise<{ sent: boolean; error?: string }> {
  const transporter = getTransporter();
  if (!transporter) return { sent: false, error: 'Email not configured' };

  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM!;
  const timestamp = new Date(msg.created_at).toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const safeMsgBody = msg.message.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body{font-family:'Segoe UI',Arial,sans-serif;background:#0a0a0a;color:#e5e5e5;margin:0;padding:0}
    .w{max-width:600px;margin:32px auto;background:#111;border:1px solid #222;border-radius:12px;overflow:hidden}
    .h{background:linear-gradient(135deg,#1a0005,#0d0d0d);padding:28px 32px;border-bottom:2px solid #ff001b}
    .h h1{margin:0;font-size:18px;color:#fff;letter-spacing:2px;text-transform:uppercase}
    .h p{margin:6px 0 0;font-size:12px;color:#ff001b;text-transform:uppercase;letter-spacing:1px}
    .b{padding:28px 32px}
    .meta{margin-bottom:20px}
    .row{display:flex;gap:12px;align-items:baseline;margin-bottom:8px}
    .lbl{font-size:10px;color:#777;text-transform:uppercase;letter-spacing:1px;min-width:72px;flex-shrink:0}
    .val{font-size:14px;color:#fff}
    .val a{color:#ff001b;text-decoration:none}
    hr{border:none;border-top:1px solid #222;margin:20px 0}
    .box{background:#0d0d0d;border:1px solid #1e1e1e;border-left:3px solid #ff001b;border-radius:8px;padding:18px 20px}
    .subj{font-size:10px;color:#777;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px}
    .msg{font-size:14px;color:#ccc;line-height:1.7;white-space:pre-wrap}
    .cta{margin-top:28px;text-align:center}
    .btn{display:inline-block;background:#ff001b;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase}
    .hint{margin-top:20px;padding:14px 16px;background:#0d1a0d;border:1px solid #1a3a1a;border-radius:8px;font-size:12px;color:#6aba6a}
    .ft{background:#0a0a0a;border-top:1px solid #1e1e1e;padding:16px 32px;font-size:11px;color:#555;text-align:center}
  </style>
</head>
<body>
  <div class="w">
    <div class="h"><h1>&#x2709; New Portfolio Message</h1><p>TECORITHAM &mdash; Admin Notification</p></div>
    <div class="b">
      <div class="meta">
        <div class="row"><span class="lbl">From</span><span class="val">${msg.name}</span></div>
        <div class="row"><span class="lbl">Email</span><span class="val"><a href="mailto:${msg.email}">${msg.email}</a></span></div>
        ${msg.profession ? `<div class="row"><span class="lbl">Role</span><span class="val">${msg.profession}</span></div>` : ''}
        <div class="row"><span class="lbl">Received</span><span class="val">${timestamp}</span></div>
      </div>
      <hr />
      <div class="box">
        <div class="subj">${msg.subject}</div>
        <div class="msg">${safeMsgBody}</div>
      </div>
      <div class="cta"><a href="${adminInboxUrl()}" class="btn">Open Admin Inbox</a></div>
      <div class="hint">
        &#x1F4A1; <strong>Quick reply:</strong> Hit <strong>Reply</strong> in your email app &mdash; it goes directly to
        <strong>${msg.email}</strong> (not back to yourself). Correct threading is configured.
      </div>
    </div>
    <div class="ft">TECORITHAM Portfolio &middot; Admin notification &middot; Reply-To is set to ${msg.email}</div>
  </div>
</body>
</html>`;

  const text = `New portfolio message from ${msg.name} <${msg.email}>

Subject: ${msg.subject}
${msg.profession ? `Role/Profession: ${msg.profession}\n` : ''}Received: ${timestamp}

---
${msg.message}
---

Hit Reply in your email app to respond directly to ${msg.name}.
Or open Admin Inbox: ${adminInboxUrl()}`;

  try {
    await transporter.sendMail({
      from: `"TECORITHAM Portfolio" <${process.env.EMAIL_FROM}>`,
      to: adminEmail,
      subject: `\u2709 New Message from ${msg.name}: ${msg.subject}`,
      // Reply-To = client email so Gmail "Reply" sends to the visitor, not back to admin
      replyTo: `"${msg.name}" <${msg.email}>`,
      html,
      text,
    });
    console.log(`[Email] Admin notification sent for message ${msg.id}`);
    return { sent: true };
  } catch (err: any) {
    console.error('[Email] sendAdminNotification failed:', err.message);
    return { sent: false, error: err.message };
  }
}

// ─── 2. Send admin reply to the client ───────────────────────────────────────
export async function sendClientReply(
  msg: { id: string; name: string; email: string; subject: string; message: string },
  replyText: string
): Promise<{ sent: boolean; error?: string }> {
  const transporter = getTransporter();
  if (!transporter) return { sent: false, error: 'Email not configured' };

  const adminEmail = process.env.EMAIL_FROM!;
  const adminName = 'Mohammad Raees';

  const safeReply = replyText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeOriginal = msg.message.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body{font-family:'Segoe UI',Arial,sans-serif;background:#0a0a0a;color:#e5e5e5;margin:0;padding:0}
    .w{max-width:600px;margin:32px auto;background:#111;border:1px solid #222;border-radius:12px;overflow:hidden}
    .h{background:linear-gradient(135deg,#1a0005,#0d0d0d);padding:28px 32px;border-bottom:2px solid #ff001b}
    .h h1{margin:0;font-size:18px;color:#fff;letter-spacing:1px}
    .h p{margin:6px 0 0;font-size:12px;color:#888}
    .b{padding:28px 32px}
    .sal{font-size:15px;color:#fff;margin-bottom:16px}
    .box{background:#0d0d0d;border:1px solid #1e1e1e;border-left:3px solid #ff001b;border-radius:8px;padding:18px 20px;font-size:14px;color:#ccc;line-height:1.7;white-space:pre-wrap}
    .sig{margin-top:28px;font-size:13px;color:#aaa;border-top:1px solid #222;padding-top:16px}
    .sig strong{color:#fff}
    .sig a{color:#ff001b;text-decoration:none}
    .orig{margin-top:24px;padding:14px 16px;background:#0a0a0a;border:1px solid #1a1a1a;border-radius:8px}
    .orig-lbl{font-size:10px;color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px}
    .orig-body{font-size:12px;color:#666;line-height:1.6;white-space:pre-wrap}
    .ft{background:#0a0a0a;border-top:1px solid #1e1e1e;padding:16px 32px;font-size:11px;color:#555;text-align:center}
  </style>
</head>
<body>
  <div class="w">
    <div class="h"><h1>Re: ${msg.subject}</h1><p>Reply from ${adminName} &middot; TECORITHAM Portfolio</p></div>
    <div class="b">
      <div class="sal">Hi ${msg.name},</div>
      <div class="box">${safeReply}</div>
      <div class="sig">
        <strong>${adminName}</strong><br/>
        Full-Stack Engineer &amp; Creative Developer<br/>
        <a href="mailto:${adminEmail}">${adminEmail}</a> &middot; <a href="https://tecoritham.com">tecoritham.com</a>
      </div>
      <div class="orig">
        <div class="orig-lbl">Your original message</div>
        <div class="orig-body">${safeOriginal}</div>
      </div>
    </div>
    <div class="ft">You received this because you sent a message via TECORITHAM Portfolio</div>
  </div>
</body>
</html>`;

  const text = `Hi ${msg.name},

${replyText}

\u2014
${adminName}
Full-Stack Engineer & Creative Developer
${adminEmail} \u00b7 tecoritham.com

--- Your original message ---
${msg.message}`;

  try {
    await transporter.sendMail({
      from: `"${adminName}" <${adminEmail}>`,
      to: `"${msg.name}" <${msg.email}>`,
      subject: `Re: ${msg.subject}`,
      replyTo: `"${adminName}" <${adminEmail}>`,
      html,
      text,
    });
    console.log(`[Email] Reply sent to ${msg.email} for message ${msg.id}`);
    return { sent: true };
  } catch (err: any) {
    console.error('[Email] sendClientReply failed:', err.message);
    return { sent: false, error: err.message };
  }
}
