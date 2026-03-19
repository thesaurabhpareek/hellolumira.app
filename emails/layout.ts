/**
 * @module EmailLayout
 * @description Shared inline-CSS email layout wrapper used by all Lumira email
 *   templates. Provides brand-consistent styling with mobile-responsive design,
 *   preheader text, and an unsubscribe footer.
 * @version 1.0.0
 * @since March 2026
 */

const SAGE_500 = '#3D8178'
const TERRA_400 = '#C4844E'
const SAND_0 = '#FAFAF8'

export { SAGE_500, TERRA_400, SAND_0 }

/**
 * Escapes HTML special characters to prevent injection in email templates.
 */
export const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/**
 * Wraps email body content in the standard Lumira email layout.
 *
 * @param preheader    - Hidden preheader text shown in inbox previews.
 * @param body         - Inner HTML content for the email.
 * @param unsubscribeUrl - URL for the unsubscribe link.
 */
export function emailLayout(preheader: string, body: string, unsubscribeUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Lumira</title>
</head>
<body style="margin:0;padding:0;background-color:${SAND_0};font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<!-- Preheader -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}</div>
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${SAND_0};">
  <tr>
    <td align="center" style="padding:24px 16px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width:480px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">
        <!-- Logo header -->
        <tr>
          <td style="padding:28px 28px 0 28px;">
            <p style="margin:0;font-size:20px;font-weight:700;color:${SAGE_500};letter-spacing:-0.3px;">Lumira</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:20px 28px 28px 28px;">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 28px;border-top:1px solid #e8e8e5;">
            <p style="margin:0 0 8px 0;font-size:12px;color:#8a8a86;text-align:center;line-height:1.5;">
              You received this email because you use Lumira.
            </p>
            <p style="margin:0;font-size:12px;color:#8a8a86;text-align:center;line-height:1.5;">
              <a href="${unsubscribeUrl}" style="color:#8a8a86;text-decoration:underline;">Unsubscribe or manage preferences</a>
            </p>
            <p style="margin:12px 0 0 0;font-size:11px;color:#b0b0ac;text-align:center;">
              hellolumira.app
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

/**
 * Generates a CTA button with brand styling.
 *
 * @param text - Button label.
 * @param href - Link URL.
 * @param color - Background color (defaults to Sage 500).
 */
export function ctaButton(text: string, href: string, color: string = SAGE_500): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
  <tr>
    <td style="background-color:${color};border-radius:8px;">
      <a href="${href}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.2px;">${escapeHtml(text)}</a>
    </td>
  </tr>
</table>`
}

/**
 * Generates a row of quick-tap buttons for email (e.g., Rough / Okay / Good).
 *
 * @param buttons - Array of { label, href, color? } objects.
 */
export function quickTapButtons(buttons: { label: string; href: string; color?: string }[]): string {
  const cells = buttons
    .map(
      (b) =>
        `<td style="padding:0 4px;">
      <a href="${b.href}" style="display:inline-block;padding:12px 20px;background-color:${b.color || SAGE_500};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;text-align:center;min-width:70px;">${escapeHtml(b.label)}</a>
    </td>`
    )
    .join('')

  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
  <tr>${cells}</tr>
</table>`
}
