import { SignJWT, jwtVerify, errors as joseErrors } from 'jose'

const secret = new TextEncoder().encode(process.env.TOKEN_SECRET ?? 'missing-secret')

export type TokenPayload = {
  jobId: string
  type: 'quote' | 'delivery'
}

export type TokenVerifyResult =
  | { ok: true; payload: TokenPayload }
  | { ok: false; reason: 'expired' | 'invalid' }

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
    const { payload } = await jwtVerify(token, secret)
    return { ok: true, payload: payload as unknown as TokenPayload }
  } catch (e) {
    if (e instanceof joseErrors.JWTExpired) {
      return { ok: false, reason: 'expired' }
    }
    return { ok: false, reason: 'invalid' }
  }
}
