package config

import (
	"os"
	"strings"

	"github.com/spf13/viper"
)

const (
	defaultAppPort   = 3000
	defaultDBPort    = 5432
	defaultRedisPort = 6379
	defaultS3Port    = 9000
)

// Config holds every runtime setting, loaded from the environment (and an
// optional .env file) through viper.
type Config struct {
	AppName string
	AppPort int
	AppURL  string

	DBHost     string
	DBPort     int
	DBUsername string
	DBPassword string
	DBDatabase string

	RedisHost string
	RedisPort int

	S3Endpoint  string
	S3Port      int
	S3Region    string
	S3AccessKey string
	S3SecretKey string
	S3Bucket    string

	OpenAPIPath string
}

// Load reads configuration with defaults matching api/node/.env.example.
func Load() Config {
	v := viper.New()

	v.SetDefault("APP_NAME", "playground")
	v.SetDefault("APP_PORT", defaultAppPort)
	v.SetDefault("APP_URL", "http://localhost:3000")
	v.SetDefault("DB_HOST", "postgres")
	v.SetDefault("DB_PORT", defaultDBPort)
	v.SetDefault("DB_USERNAME", "postgres")
	v.SetDefault("DB_PASSWORD", "postgres")
	v.SetDefault("DB_DATABASE", "postgres")
	v.SetDefault("REDIS_HOST", "redis")
	v.SetDefault("REDIS_PORT", defaultRedisPort)
	v.SetDefault("S3_ENDPOINT", "minio")
	v.SetDefault("S3_PORT", defaultS3Port)
	v.SetDefault("S3_DEFAULT_REGION", "ap-southeast-1")
	v.SetDefault("S3_ACCESS_KEY_ID", "miniosudo")
	v.SetDefault("S3_SECRET_ACCESS_KEY", "miniosudo")
	v.SetDefault("S3_BUCKET", "local")
	v.SetDefault("OPENAPI_PATH", "../../openapi.yaml")

	v.SetConfigFile(".env")
	v.SetConfigType("env")
	if err := v.ReadInConfig(); err != nil && !os.IsNotExist(err) {
		// A missing .env is fine; environment variables still apply.
		_ = err
	}

	v.AutomaticEnv()
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	return Config{
		AppName:     v.GetString("APP_NAME"),
		AppPort:     v.GetInt("APP_PORT"),
		AppURL:      v.GetString("APP_URL"),
		DBHost:      v.GetString("DB_HOST"),
		DBPort:      v.GetInt("DB_PORT"),
		DBUsername:  v.GetString("DB_USERNAME"),
		DBPassword:  v.GetString("DB_PASSWORD"),
		DBDatabase:  v.GetString("DB_DATABASE"),
		RedisHost:   v.GetString("REDIS_HOST"),
		RedisPort:   v.GetInt("REDIS_PORT"),
		S3Endpoint:  v.GetString("S3_ENDPOINT"),
		S3Port:      v.GetInt("S3_PORT"),
		S3Region:    v.GetString("S3_DEFAULT_REGION"),
		S3AccessKey: v.GetString("S3_ACCESS_KEY_ID"),
		S3SecretKey: v.GetString("S3_SECRET_ACCESS_KEY"),
		S3Bucket:    v.GetString("S3_BUCKET"),
		OpenAPIPath: v.GetString("OPENAPI_PATH"),
	}
}
