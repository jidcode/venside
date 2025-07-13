package cloudflare

import (
	"bytes"
	"context"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/google/uuid"
)

type UploadResult struct {
	URL     string
	FileKey string
	Name    string
}

func (r2 *R2Client) UploadFile(file *multipart.FileHeader) (*UploadResult, error) {
	src, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	buf := bytes.NewBuffer(nil)
	if _, err := buf.ReadFrom(src); err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	fileExt := filepath.Ext(file.Filename)
	fileName := strings.TrimSuffix(file.Filename, fileExt)
	fileKey := fmt.Sprintf("uploads/%s_%s%s", uuid.New().String(), fileName, fileExt)

	contentType := file.Header.Get("Content-Type")
	if contentType == "" {
		contentType = getContentType(fileExt)
	}

	_, err = r2.client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(r2.bucketName),
		Key:         aws.String(fileKey),
		Body:        bytes.NewReader(buf.Bytes()),
		ContentType: aws.String(contentType),
		Metadata: map[string]string{
			"uploaded-at": time.Now().Format(time.RFC3339),
		},
	})

	if err != nil {
		return nil, fmt.Errorf("failed to upload file to R2: %w", err)
	}

	publicURL := fmt.Sprintf("%s/%s", strings.TrimSuffix(r2.baseURL, "/"), fileKey)

	return &UploadResult{
		URL:     publicURL,
		FileKey: fileKey,
		Name:    file.Filename,
	}, nil
}

func (r2 *R2Client) DeleteFile(fileKey string) error {
	_, err := r2.client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: aws.String(r2.bucketName),
		Key:    aws.String(fileKey),
	})

	if err != nil {
		return fmt.Errorf("failed to delete file from R2: %w", err)
	}

	return nil
}

func (r2 *R2Client) DeleteFiles(fileKeys []string) error {
	if len(fileKeys) == 0 {
		return nil
	}

	objects := make([]types.ObjectIdentifier, len(fileKeys))
	for i, key := range fileKeys {
		objects[i] = types.ObjectIdentifier{
			Key: aws.String(key),
		}
	}

	_, err := r2.client.DeleteObjects(context.TODO(), &s3.DeleteObjectsInput{
		Bucket: aws.String(r2.bucketName),
		Delete: &types.Delete{
			Objects: objects,
		},
	})

	if err != nil {
		return fmt.Errorf("failed to delete files from R2: %w", err)
	}

	return nil
}

func (r2 *R2Client) FileExists(fileKey string) (bool, error) {
	_, err := r2.client.HeadObject(context.TODO(), &s3.HeadObjectInput{
		Bucket: aws.String(r2.bucketName),
		Key:    aws.String(fileKey),
	})

	if err != nil {
		if strings.Contains(err.Error(), "NotFound") {
			return false, nil
		}
		return false, fmt.Errorf("failed to check file existence: %w", err)
	}

	return true, nil
}

func getContentType(fileExt string) string {
	switch strings.ToLower(fileExt) {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".gif":
		return "image/gif"
	case ".webp":
		return "image/webp"
	case ".svg":
		return "image/svg+xml"
	case ".pdf":
		return "application/pdf"
	case ".txt":
		return "text/plain"
	case ".json":
		return "application/json"
	case ".xml":
		return "application/xml"
	default:
		return "application/octet-stream"
	}
}

// IsValidImageFile checks if the file extension is a valid image type.
func IsValidImageFile(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	validExts := []string{".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}

	for _, validExt := range validExts {
		if ext == validExt {
			return true
		}
	}

	return false
}

// IsValidFileSize checks if the file size is within the allowed max size (in MB).
func IsValidFileSize(fileSize int64, maxSizeMB int64) bool {
	maxSizeBytes := maxSizeMB * 1024 * 1024
	return fileSize <= maxSizeBytes
}
