package users

type ICreateUserDTO struct {
	UserEntity
}

type IUpdateUserDTO struct {
	*ICreateUserDTO
}
