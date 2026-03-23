-- Passkeys (WebAuthn credentials)
CREATE TABLE IF NOT EXISTS public.passkeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id text NOT NULL UNIQUE,
  public_key text NOT NULL,
  counter bigint NOT NULL DEFAULT 0,
  aaguid text,
  device_type text NOT NULL DEFAULT 'singleDevice',
  backed_up boolean NOT NULL DEFAULT false,
  transport jsonb,
  device_hint text NOT NULL DEFAULT 'Unknown device',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz
);
CREATE INDEX IF NOT EXISTS passkeys_user_id_idx ON public.passkeys(user_id);
CREATE INDEX IF NOT EXISTS passkeys_credential_id_idx ON public.passkeys(credential_id);
ALTER TABLE public.passkeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users view own passkeys" ON public.passkeys
  FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.webauthn_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('registration', 'authentication')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '5 minutes'),
  used boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS webauthn_challenges_expires_idx ON public.webauthn_challenges(expires_at);
ALTER TABLE public.webauthn_challenges ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.passkey_revocations_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_hint text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.passkey_revocations_log ENABLE ROW LEVEL SECURITY;
