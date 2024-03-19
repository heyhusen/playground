import { parse } from '@lukeed/ms';
import type { SignerOptions } from 'fast-jwt';

type JwtConfig = Pick<
	SignerOptions,
	'algorithm' | 'expiresIn' | 'iss' | 'aud' | 'mutatePayload'
> & { key: string };

interface AuthConfig {
	access: JwtConfig;
	refresh: JwtConfig;
}

export const authConfig: AuthConfig = {
	access: {
		key: process.env.JWT_ACCESS_SECRET || 'jwtaccesssecret',
		algorithm: 'HS512',
		expiresIn: parse('15m') as number,
		iss: process.env.JWT_ISSUER || 'jwtaccessissuer',
		aud: process.env.JWT_ISSUER || 'jwtaccessissuer',
		mutatePayload: true,
	},
	refresh: {
		key: process.env.JWT_REFRESH_SECRET || 'jwtrefreshsecret',
		algorithm: 'HS512',
		expiresIn: parse('30d') as number,
		iss: process.env.JWT_ISSUER || 'jwtaccessissuer',
		aud: process.env.JWT_ISSUER || 'jwtaccessissuer',
		mutatePayload: true,
	},
};
