package users

import (
	"github.com/heyhusen/playground/backend/go/domain/base"
	"github.com/heyhusen/playground/backend/go/domain/entities"
)

type UserUseCase struct {
	*base.BaseUseCase[IUserRepository, IUserReadRepository]
}

func NewUserUseCase(repository IUserRepository, readRepository IUserReadRepository) *UserUseCase {
	baseUseCase := base.NewBaseUseCase(repository, readRepository)

	return &UserUseCase{
		BaseUseCase: baseUseCase,
	}
}

type IUserUseCase interface {
	base.IBaseUseCase[UserEntity, base.IBaseRequest]
}

// Create is a method of UserUseCase that handles the creation of a new user entity.
// It takes a request of type IBaseRequest and a UserEntity as input parameters.
// The method initializes a new UserEntity with the provided data and passes it to the repository for persistence.
// If the creation is successful, it returns a pointer to the created UserEntity.
// In case of an error during the creation process, it returns nil and the corresponding error.
//
// Parameters:
//   - request: An instance of IBaseRequest containing the base request information.
//   - entity: A UserEntity containing the user details to be created.
//
// Returns:
//   - *UserEntity: A pointer to the created UserEntity.
//   - error: An error if the creation process fails, otherwise nil.
func (u *UserUseCase) Create(request base.IBaseRequest, entity UserEntity) (*UserEntity, error) {
	baseEntity := entities.NewBaseEntity(request)
	data := UserEntity{
		BaseEntity: baseEntity,
		BaseUserEntity: &BaseUserEntity{
			FirstName: entity.FirstName,
			LastName:  entity.LastName,
			Nickname:  entity.Nickname,
			Email:     entity.Email,
		},
	}

	user, err := u.Repository.Create(data)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

// Delete removes a user entity from the repository based on the provided entity ID.
// It returns the deleted UserEntity and an error, if any occurred during the operation.
//
// Parameters:
//   - entityId: A string representing the unique identifier of the user entity to be deleted.
//
// Returns:
//   - *UserEntity: A pointer to the deleted user entity.
//   - error: An error object if the deletion fails, otherwise nil.
func (u *UserUseCase) Delete(entityId string) (*UserEntity, error) {
	user, err := u.Repository.Delete(entityId)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

// ReadAll retrieves a paginated list of UserEntity objects from the repository.
// It accepts pagination parameters `page` and `limit`, as well as an `options` parameter
// for additional query customization.
//
// Parameters:
//   - page: The page number to retrieve.
//   - limit: The number of items per page.
//   - options: Additional options for filtering or querying the data.
//
// Returns:
//   - IBasePaginatedResponse[UserEntity]: A paginated response containing UserEntity objects.
//   - error: An error if the operation fails.
func (u *UserUseCase) ReadAll(page int, limit int, options any) (base.IBasePaginatedResponse[UserEntity], error) {
	users, err := u.ReadRepository.ReadAll(page, limit, options)
	if err != nil {
		return users, err
	}

	return users, nil
}

// Read retrieves a UserEntity by its unique identifier.
// It interacts with the ReadRepository to fetch the user data.
//
// Parameters:
//   - entityId: A string representing the unique identifier of the user.
//
// Returns:
//   - *UserEntity: A pointer to the UserEntity object if found.
//   - error: An error if the user cannot be retrieved or another issue occurs.
func (u *UserUseCase) Read(entityId string) (*UserEntity, error) {
	user, err := u.ReadRepository.Read(entityId)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

// Update updates an existing user entity in the repository.
// It takes a request of type IBaseRequest, the ID of the entity to be updated (entityId),
// and the updated user entity data (entity) as parameters.
// The function returns a pointer to the updated UserEntity and an error, if any occurred during the update process.
//
// Parameters:
//   - request: IBaseRequest containing the request context or metadata.
//   - entityId: A string representing the unique identifier of the user entity to be updated.
//   - entity: UserEntity containing the updated user data.
//
// Returns:
//   - *UserEntity: A pointer to the updated user entity.
//   - error: An error if the update operation fails, otherwise nil.
func (u *UserUseCase) Update(request base.IBaseRequest, entityId string, entity UserEntity) (*UserEntity, error) {
	baseEntity := entities.UpdateBaseEntity(request)
	data := UserEntity{
		BaseEntity: baseEntity,
		BaseUserEntity: &BaseUserEntity{
			FirstName: entity.FirstName,
			LastName:  entity.LastName,
			Nickname:  entity.Nickname,
			Email:     entity.Email,
		},
	}

	user, err := u.Repository.Update(entityId, data)
	if err != nil {
		return nil, err
	}

	return &user, nil
}
