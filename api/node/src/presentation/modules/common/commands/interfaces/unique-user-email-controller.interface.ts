import { IBaseSingleController } from '../../../../base/interfaces/base-single-controller.interface.js';

export type IUniqueUserEmailController = IBaseSingleController<
	Promise<boolean>
>;
