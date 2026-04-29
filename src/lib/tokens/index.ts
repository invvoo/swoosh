import { SignJWT, jwtVerify, decodeJwt, errors as joseErrors } from 'jose'

const secret = new TextEncoder().encode(process.env.TOKEN_SECRET ?? 'missing-secret')

export type TokenPayload = {
  jobId: string
  type: 'quote' | 'delivery'
}

export type TokenVerifyResult =
  | { ok: true; payload: TokenPayload }
  | { ok: false; reason: 'expired'; expiredPayload?: TokenPayload }
  | { ok: false; reason: 'invalid' }

export async function signToken(payload: TokenPayload, expiresIn: string): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret)
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  const result = await verifyTokenWithReason(token)
  return result.ok ? result.payload : null
}

export async function verifyTokenWithReason(token: string): Promise<TokenVerifyResult> {
  try {
    // Allow 60s clock tolerance to handle minor server drift
    const { payload } = await jwtVerify(token, secret, { clockTolerance: 60 })
    return { ok: true, payload: payload as unknown as TokenPayload }
  } catch (e) {
    if (e instanceof joseErrors.JWTExpired) {
      // Signature was valid — decode the payload so callers can identify the job
      let expiredPayload: TokenPayload | undefined
      try { expiredPayload = decodeJwt(token) as unknown as TokenPayload } catch { /* ignore */ }
      return { ok: false, reason: 'expired', expiredPayload }
    }
    return { ok: false, reason: 'invalid' }
  }
}
