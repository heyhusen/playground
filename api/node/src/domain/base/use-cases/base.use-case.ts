import { IBaseCoreUseCase } from '../interfaces/base-use-case.interface.js';

export abstract class BaseCoreUseCase<
	Response,
> implements IBaseCoreUseCase<Response> {
	abstract execute(): Response;
}
