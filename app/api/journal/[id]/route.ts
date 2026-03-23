/**
 * @module JournalEntryAPI
 * @description DELETE /api/journal/[id] — Deletes a journal entry owned by the
 *   authenticated user. Includes IDOR protection: the entry's profile_id is
 *   verified against the session user before deletion.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id || typeof id !== 'string' || id.trim() === '') {
      return NextResponse.json(
        { error: true, message: 'Missing entry id' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    const supabase = await createClient()

    // Authenticate
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: true, message: 'Unauthorized' },
        { status: 401, headers: SECURITY_HEADERS }
      )
    }

    // Fetch entry to verify ownership (IDOR protection)
    const { data: entry, error: fetchError } = await supabase
      .from('journal_entries')
      .select('id, profile_id')
      .eq('id', id)
      .single()

    if (fetchError || !entry) {
      return NextResponse.json(
        { error: true, message: 'Entry not found' },
        { status: 404, headers: SECURITY_HEADERS }
      )
    }

    if (entry.profile_id !== user.id) {
      return NextResponse.json(
        { error: true, message: 'Access denied' },
        { status: 403, headers: SECURITY_HEADERS }
      )
    }

    // Delete the entry
    const { error: deleteError } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)
      .eq('profile_id', user.id) // double-lock: belt-and-suspenders

    if (deleteError) {
      console.error('[journal/delete] Delete failed:', deleteError.message)
      return NextResponse.json(
        { error: true, message: 'Failed to delete entry. Please try again.' },
        { status: 500, headers: SECURITY_HEADERS }
      )
    }

    return NextResponse.json({ success: true }, { status: 200, headers: SECURITY_HEADERS })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[journal/delete] Unexpected error:', msg)
    return NextResponse.json(
      { error: true, message: 'An unexpected error occurred.' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}
