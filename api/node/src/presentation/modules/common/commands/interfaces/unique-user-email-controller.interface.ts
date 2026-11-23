import { IBaseSingleController } from '../../../../base/interfaces/base-single-controller.interface';

export type IUniqueUserEmailController = IBaseSingleController<
	Promise<boolean>
>;
