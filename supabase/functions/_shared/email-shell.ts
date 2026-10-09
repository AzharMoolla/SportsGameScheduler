/** Shared, image-independent CRT programme layout for auth and event emails. */
export function escapeEmailHtml(value: unknown) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

export function safeEmailUrl(value: string | null | undefined, fallback = 'https://silbosports.com') {
  try {
    const url = new URL(value || '')
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : fallback
  } catch { return fallback }
}

export function emailButton(label: string, url: string, secondary = false) {
  return `<a class="${secondary ? 'secondary-button' : 'primary-button'}" href="${escapeEmailHtml(url)}" style="display:block;text-align:center;background:${secondary ? '#fffaf0' : '#0b6f44'};color:${secondary ? '#0b6f44' : '#ffffff'};border:2px solid #0b6f44;border-radius:8px;text-decoration:none;padding:16px 18px;font:700 16px/1.25 Arial,sans-serif;">${escapeEmailHtml(label)}</a>`
}

/** body/footer are trusted renderer HTML, never raw event or user content. */
export function renderEmailShell(options: { title: string; preheader: string; eyebrow: string; body: string; footer: string; appUrl?: string }) {
  const appUrl = safeEmailUrl(options.appUrl).replace(/\/$/, '')
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>${escapeEmailHtml(options.title)}</title>
<style>
body{margin:0;padding:0;-webkit-font-smoothing:antialiased}table{border-collapse:separate}a{color:#0b6f44}p{overflow-wrap:break-word}.email-bg{background-color:#f3eddd}.broadcast-header{background-color:#171b18}.section-pad{padding:28px}.panel{width:100%;max-width:600px}
@media only screen and (max-width:480px){.email-bg{padding:12px 6px!important}.section-pad,.footer{padding:22px 18px!important}.title{font-size:29px!important}.primary-button,.secondary-button{box-sizing:border-box!important;width:100%!important}.time-cell,.details-cell{display:block!important;width:auto!important}.details-cell{padding-top:16px!important}.brand-lockup{width:220px!important;height:auto!important}}
@media(prefers-color-scheme:dark){.email-bg{background-color:#0d1411!important}.panel,.section-pad{background-color:#171f1b!important}.email-copy,.title{color:#fff6e5!important}.email-muted{color:#c3cfc7!important}.footer,.event-ticket{background-color:#202e26!important;color:#c3cfc7!important}.secondary-button{background-color:#202e26!important;color:#77ffad!important;border-color:#77ffad!important}.email-link{color:#77ffad!important}}
</style></head><body style="margin:0;background:#f3eddd;font-family:Arial,'Segoe UI',sans-serif;color:#17352d">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;opacity:0;color:transparent">${escapeEmailHtml(options.preheader)}</div>
<table class="email-bg" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3eddd;padding:32px 12px"><tr><td align="center">
<!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
<table class="panel" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fffaf0;border:1px solid #b9cdbd;border-radius:12px;overflow:hidden">
<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="table-layout:fixed"><tr>${['#54ff9f','#45c7d4','#f0b93f','#ef6baf'].map(color => `<td height="5" style="background:${color};font-size:1px;line-height:5px">&nbsp;</td>`).join('')}</tr></table></td></tr>
<tr><td class="broadcast-header" style="padding:24px 28px;background-color:#171b18;border-bottom:2px solid #54ff9f"><a href="${escapeEmailHtml(appUrl)}" style="text-decoration:none"><img class="brand-lockup" src="${escapeEmailHtml(appUrl)}/assets/brand/silbo-email-lockup.png" width="240" height="54" alt="Silbo Sports" style="display:block;width:240px;max-width:100%;height:auto;border:0"></a><p style="margin:18px 0 0;color:#b9c7bd;font:700 10px/1.6 'Courier New',monospace;letter-spacing:2px;text-transform:uppercase">${escapeEmailHtml(options.eyebrow)}</p></td></tr>
<tr><td class="section-pad" style="padding:28px;background:#fffaf0">${options.body}</td></tr>
<tr><td class="footer email-muted" style="padding:22px 28px;background:#edf1e6;border-top:1px solid #c6d7c9;color:#53675f;font:400 12px/1.7 Arial,sans-serif">${options.footer}<p style="margin:16px 0 0"><a class="email-link" href="${escapeEmailHtml(appUrl)}/my-schedule" style="color:#0b6f44;font-weight:700">My schedule</a> &nbsp;·&nbsp; <a class="email-link" href="${escapeEmailHtml(appUrl)}/privacy" style="color:#0b6f44">Privacy</a> &nbsp;·&nbsp; Silbo Sports</p></td></tr>
</table><!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`
}
