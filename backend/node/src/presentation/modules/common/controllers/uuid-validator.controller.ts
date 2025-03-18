import { getMessage } from '../../../../domain/helpers/get-message.helper';
import { validateUuid } from '../../../../domain/modules/common/use-cases/validate-uuid.use-case';
import { BaseSingleController } from '../../../base/base-single.controller';
import { BadRequestException } from '../../../exceptions/bad-request.exception';
import type { IHttpRequestParams } from '../../../interfaces/http.interface';
import type { IRequestIdParams } from '../../../interfaces/request.interface';
import { IUuidValidatorController } from '../interfaces/uuid-validator-controller.interface';

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
