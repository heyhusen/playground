import type { Request, Response } from 'express';
import { logInUserController } from '../../../adapters/controllers/log-in-user.controller';
import { logOutUserController } from '../../../adapters/controllers/log-out-user.controller';
import { updateTokenController } from '../../../adapters/controllers/update-token.controller';
import { userProfileController } from '../../../adapters/controllers/user-profile.controller';
import type {
	LogInDto,
	UserRefreshRequest,
	UserRequest,
} from '../../../core/interfaces/auth.interface';
import { authConfig } from '../../config/auth';
import { userRepository } from '../../repositories/user.repository';
import { fileService } from '../../services/file.service';
import { hashService } from '../../services/hash.service';
import { redisService } from '../../services/redis.service';
import { tokenService } from '../../services/token.service';

const { expiresIn } = authConfig.access;

export async function logIn(
	req: Request<unknown, unknown, LogInDto>,
	res: Response
) {
	const controller = logInUserController(
		userRepository,
		hashService,
		tokenService,
		redisService,
		expiresIn
	);

	const { status, cookie, data } = await controller({ body: req.body });

	if (cookie) {
		const { name, value, maxAge } = cookie;

		res.cookie(name, value, {
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production',
			httpOnly: true,
			path: '/',
			maxAge,
		});
	}

	res.status(status).json(data);
}

export async function profile(req: Request, res: Response) {
	const controller = userProfileController(userRepository, fileService);

	const { status, data } = await controller({ user: req.user as UserRequest });

	res.status(status).json(data);
}

export async function updateToken(req: Request, res: Response) {
	const controller = updateTokenController(
		tokenService,
		redisService,
		expiresIn
	);

	const { status, cookie, data } = await controller({
		user: req.user as UserRefreshRequest,
	});

	if (cookie) {
		const { name, value, maxAge } = cookie;

		res.cookie(name, value, {
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production',
			httpOnly: true,
			path: '/',
			maxAge,
		});
	}

	res.status(status).json(data);
}

export async function logout(req: Request, res: Response) {
	const controller = logOutUserController(redisService);

	const { status } = await controller({
		user: req.user as UserRefreshRequest,
	});

	res.status(status).end();
}
