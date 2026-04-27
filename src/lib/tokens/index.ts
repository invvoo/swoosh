import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.TOKEN_SECRET!)

export type TokenPayload = {
  jobId: string
  type: 'quote' | 'delivery'
}

export async function signToken(payload: TokenPayload, expiresIn: string): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret)
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as TokenPayload
  } catch {
    return null
  }
}
