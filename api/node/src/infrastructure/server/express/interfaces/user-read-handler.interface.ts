import { UserReadEntity } from '../../../../domain/modules/users/queries/entities/user-read.entity.js';
import { IBaseReadHandler } from '../base/interfaces/base-read-handler.interface.js';

export type IUserReadHandler = IBaseReadHandler<UserReadEntity>;
