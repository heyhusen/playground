package users

import base "github.com/heyhusen/playground/backend/go/domain/entities"

type BaseUserEntity struct {
	FirstName string  `json:"first_name"`
	LastName  *string `json:"last_name"`
	Nickname  *string `json:"nickname"`
	Email     string  `json:"email"`
}

type UserEntity struct {
	*base.BaseEntity
	*BaseUserEntity
}
