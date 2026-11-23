package storage

import (
	"context"
	"fmt"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"

	"github.com/heyhusen/playground/api/go/internal/config"
)

// S3 wraps the minio-go client used for object storage.
type S3 struct {
	client *minio.Client
	bucket string
}

// New creates a MinIO client.
func New(cfg config.Config) (*S3, error) {
	endpoint := fmt.Sprintf("%s:%d", cfg.S3Endpoint, cfg.S3Port)

	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.S3AccessKey, cfg.S3SecretKey, ""),
		Secure: false,
		Region: cfg.S3Region,
	})
	if err != nil {
		return nil, err
	}

	return &S3{client: client, bucket: cfg.S3Bucket}, nil
}

// EnsureBucket creates the configured bucket when it does not exist yet.
func (s *S3) EnsureBucket(ctx context.Context) error {
	exists, err := s.client.BucketExists(ctx, s.bucket)
	if err != nil {
		return err
	}

	if exists {
		return nil
	}

	return s.client.MakeBucket(ctx, s.bucket, minio.MakeBucketOptions{Region: ""})
}

// Bucket returns the configured bucket name.
func (s *S3) Bucket() string {
	return s.bucket
}
