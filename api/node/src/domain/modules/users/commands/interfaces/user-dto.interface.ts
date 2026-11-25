import { UserEntity } from '../entities/user.entity.js';

export type ICreateUserDTO = UserEntity;

/**
 * Updates must carry the version the client read so stale writes can be
 * rejected with 409 Conflict. The request schema enforces it at runtime.
 */
export type IUpdateUserDTO = Partial<ICreateUserDTO>;
