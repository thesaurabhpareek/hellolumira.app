// lib/passkey-email.ts
// Email dispatch stubs for passkey lifecycle events.
// Templates are implemented in lib/email-templates.ts by the email agent.

export async function sendPasskeyEnrolledEmail(_params: {
  email: string
  firstName: string
  deviceHint: string
}): Promise<void> {
  // TODO: email agent wires up template
  console.log('[passkey-email] enrollment confirmation', _params.deviceHint)
}

export async function sendPasskeyNewDeviceAlertEmail(_params: {
  email: string
  firstName: string
  deviceHint: string
  ipSubnet: string
  revokeUrl: string
}): Promise<void> {
  console.log('[passkey-email] new device alert', _params.deviceHint)
}

export async function sendPasskeyRemovedAlertEmail(_params: {
  email: string
  firstName: string
  deviceHint: string
}): Promise<void> {
  console.log('[passkey-email] passkey removed', _params.deviceHint)
}

export async function sendPasskeySuspendedAlertEmail(_params: {
  email: string
  firstName: string
  deviceHint: string
}): Promise<void> {
  console.log('[passkey-email] passkey suspended (counter mismatch)', _params.deviceHint)
}
