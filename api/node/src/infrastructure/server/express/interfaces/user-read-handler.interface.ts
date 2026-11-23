import { UserReadEntity } from '../../../../domain/modules/users/queries/entities/user-read.entity';
import { IBaseReadHandler } from '../base/interfaces/base-read-handler.interface';

export type IUserReadHandler = IBaseReadHandler<UserReadEntity>;
