// app/privacy/page.tsx — Redirect to /legal/privacy
import { redirect } from 'next/navigation'

export default function PrivacyRedirectPage() {
  redirect('/legal/privacy')
}
