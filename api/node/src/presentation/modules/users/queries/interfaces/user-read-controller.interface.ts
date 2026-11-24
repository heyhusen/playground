import { UserReadEntity } from '../../../../../domain/modules/users/queries/entities/user-read.entity.js';
import { IBaseReadController } from '../../../../base/interfaces/base-read-controller.interface.js';

export type IUserReadController = IBaseReadController<UserReadEntity>;
