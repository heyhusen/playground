import { BaseCoreUseCase } from '../../../../base/use-cases/base.use-case';
import { getMessage } from '../../../../helpers/get-message.helper';
import { IUserReadRepository } from '../../queries/interfaces/user-repository-read.interface';
import { IUniqueUserUserUseCase } from '../interfaces/use-cases/unique-user-use-case.interface';

export class UniqueUserEmailUseCase
	extends BaseCoreUseCase<Promise<boolean>>
	implements IUniqueUserUserUseCase
{
	constructor(
		private readonly repository: IUserReadRepository,
		private readonly email: string,
		private readonly userId?: string
	) {
		super();
	}

	async execute() {
		const isExists = await this.repository.findOneByEmail(
			this.email,
			this.userId
		);

		if (isExists) {
			throw new Error(getMessage('email.unique'));
		}

		return true;
	}
}
