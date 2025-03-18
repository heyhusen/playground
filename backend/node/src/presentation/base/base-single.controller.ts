import { IBaseSingleController } from './interfaces/base-single-controller.interface';

export abstract class BaseSingleController<Return>
	implements IBaseSingleController<Return>
{
	abstract execute(): Return;
}
