import { IBaseSingleController } from 'src/presentation/base/interfaces/base-single-controller.interface';
import { ICoreResponse } from 'src/presentation/interfaces/response.interface';

export type IHomeController = IBaseSingleController<ICoreResponse<string>>;
