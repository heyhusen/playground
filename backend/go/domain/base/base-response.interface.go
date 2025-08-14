package base

type IBasePaginatedResponse[Entity comparable] struct {
	Data []Entity `json:"data"`

	Meta struct {
		Page  int `json:"page"`
		Limit int `json:"limit"`
		Total int `json:"total"`
	}
}
