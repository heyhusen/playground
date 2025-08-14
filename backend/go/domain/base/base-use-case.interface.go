package base

type BaseUseCase[Repository comparable, ReadRepository comparable] struct {
	Repository     Repository
	ReadRepository ReadRepository
}

func NewBaseUseCase[Repository comparable, ReadRepository comparable](repository Repository, readRepository ReadRepository) *BaseUseCase[Repository, ReadRepository] {
	return &BaseUseCase[Repository, ReadRepository]{
		Repository:     repository,
		ReadRepository: readRepository,
	}
}

type IBaseUseCase[Entity comparable, Request comparable] interface {
	Create(request Request, entity Entity) (*Entity, error)
	ReadAll(page int, limit int, options any) (IBasePaginatedResponse[Entity], error)
	Read(entityId string) (*Entity, error)
	Update(request Request, entityId string, entity Entity) (*Entity, error)
	Delete(entityId string) (*Entity, error)
}
