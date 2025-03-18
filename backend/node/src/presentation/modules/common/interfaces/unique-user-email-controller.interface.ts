import { IBaseSingleController } from 'src/presentation/base/interfaces/base-single-controller.interface';

export type IUniqueUserEmailController = IBaseSingleController<
	Promise<boolean>
>;
