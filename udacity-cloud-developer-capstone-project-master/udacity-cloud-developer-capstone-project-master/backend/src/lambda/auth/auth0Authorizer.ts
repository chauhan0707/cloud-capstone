import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { getToken } from '../../auth/utils'

const logger = createLogger('auth')

const jwksUrl = process.env.JWKS_URL

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)

  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    let sub = 'User'

    if (!process.env.IS_OFFLINE) {
      sub = jwtToken.sub
    }

    logger.info('User was authorized', jwtToken)

    return {
      principalId: sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

const verifyToken = async (authHeader: string): Promise<JwtPayload> => {
  const token = getToken(authHeader)
  if (process.env.IS_OFFLINE) {
    logger.info('Running offline mode.')
  } else {
    const jwt: Jwt = decode(token, { complete: true }) as Jwt

    const response = await Axios.get(jwksUrl)
    const cert_key_id = response.data.keys[0].x5c[0]

    const cert =
      '-----BEGIN CERTIFICATE-----\n' +
      cert_key_id +
      '\n-----END CERTIFICATE-----'

    return verify(token, cert, { algorithms: [jwt.header.alg] }) as JwtPayload
  }
}
