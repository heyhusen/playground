import { getMessage } from '../../../../../domain/helpers/get-message.helper.js';
import { validateUuid } from '../../../../../domain/modules/common/commands/use-cases/validate-uuid.use-case.js';
import { BaseSingleController } from '../../../../base/base-single.controller.js';
import { BadRequestException } from '../../../../exceptions/bad-request.exception.js';
import type { IHttpRequestParams } from '../../../../interfaces/http.interface.js';
import type { IRequestIdParams } from '../../../../interfaces/request.interface.js';
import { IUuidValidatorController } from '../interfaces/uuid-validator-controller.interface.js';

export class UuidValidatorController
	extends BaseSingleController<boolean>
	implements IUuidValidatorController
{
	constructor(private readonly request: IHttpRequestParams<IRequestIdParams>) {
		super();
	}

	override execute(): boolean {
		try {
			if (!this.request.params) {
				throw new BadRequestException(getMessage('params.id.required'));
			}

			const { id } = this.request.params;

			return validateUuid(id);
		} catch (error) {
			if (error instanceof Error && error.message === getMessage('id.format')) {
				throw new BadRequestException(error.message);
			}

			throw error;
		}
	}
}
