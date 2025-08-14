package base

type IBaseReadRepository[Entity comparable] interface {
	Read(entityId string) (Entity, error)

	ReadAll(page int, limit int, options any) (IBasePaginatedResponse[Entity], error)
}

type IBaseRepository[Entity comparable] interface {
	IBaseReadRepository[Entity]

	Create(data Entity) (Entity, error)
	Update(entityId string, data Entity) (Entity, error)
	Delete(entityId string) (Entity, error)
}
