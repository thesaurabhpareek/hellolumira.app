// app/terms/page.tsx — Redirect to /legal/terms
import { redirect } from 'next/navigation'

export default function TermsRedirectPage() {
  redirect('/legal/terms')
}
