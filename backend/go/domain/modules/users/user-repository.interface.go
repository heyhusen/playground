package users

import (
	"github.com/heyhusen/playground/backend/go/domain/base"
)

type IUserReadRepository interface {
	base.IBaseReadRepository[UserEntity]

	FindOneByEmail(email string, id *string) (UserEntity, error)
}

type IUserRepository interface {
	base.IBaseReadRepository[UserEntity]
	base.IBaseRepository[UserEntity]
}
