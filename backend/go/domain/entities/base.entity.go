package entities

import (
	"time"

	"github.com/heyhusen/playground/backend/go/domain/base"
)

type BaseEntity struct {
	Id      string `json:"id"`
	Version int    `json:"version"`
	Cursor  int    `json:"cursor"`

	CreatedAt               int64  `json:"created_at"`
	CreatedAtTimezoneName   string `json:"created_at_timezone_name"`
	CreatedAtTimezoneOffset int    `json:"created_at_timezone_offset"`

	UpdatedAt               int64  `json:"updated_at"`
	UpdatedAtTimezoneName   string `json:"updated_at_timezone_name"`
	UpdatedAtTimezoneOffset int    `json:"updated_at_timezone_offset"`

	DeletedAt               *int64  `json:"deleted_at"`
	DeletedAtTimezoneName   *string `json:"deleted_at_timezone_name"`
	DeletedAtTimezoneOffset *int    `json:"deleted_at_timezone_offset"`
}

func NewBaseEntity(request base.IBaseRequest) *BaseEntity {
	now := time.Now().UnixMilli()

	return &BaseEntity{
		CreatedAt:               now,
		CreatedAtTimezoneName:   request.Timezoneame,
		CreatedAtTimezoneOffset: request.TimezoneOffset,
		UpdatedAt:               now,
		UpdatedAtTimezoneName:   request.Timezoneame,
		UpdatedAtTimezoneOffset: request.TimezoneOffset,
	}
}

func UpdateBaseEntity(request base.IBaseRequest) *BaseEntity {
	now := time.Now().UnixMilli()

	return &BaseEntity{
		UpdatedAt:               now,
		UpdatedAtTimezoneName:   request.Timezoneame,
		UpdatedAtTimezoneOffset: request.TimezoneOffset,
	}
}
