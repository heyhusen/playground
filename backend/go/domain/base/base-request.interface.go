package base

type IBaseRequest struct {
	Timezoneame    string `json:"timezone_name"`
	TimezoneOffset int    `json:"timezone_offset"`
}
