import { UserReadEntity } from '../../../../../domain/modules/users/queries/entities/user-read.entity';
import { IBaseReadController } from '../../../../base/interfaces/base-read-controller.interface';

export type IUserReadController = IBaseReadController<UserReadEntity>;
