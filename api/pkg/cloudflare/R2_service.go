package cloudflare

import (
	"bytes"
	"context"
	"fmt"
	"image"
	"image/jpeg"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/disintegration/imaging"
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

	// Read file into memory
	buf := bytes.NewBuffer(nil)
	if _, err := buf.ReadFrom(src); err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	// Optimize image and convert to webp
	optimizedBuf, err := optimizeImage(buf.Bytes())
	if err != nil {
		return nil, fmt.Errorf("failed to optimize image: %w", err)
	}

	// Generate short unique file key
	newID := uuid.New().String()
	shortHex := newID[:8]
	fileName := strings.TrimSuffix(file.Filename, filepath.Ext(file.Filename))
	fileKey := fmt.Sprintf("uploads/%s_%s.webp", shortHex, fileName)

	_, err = r2.client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(r2.bucketName),
		Key:         aws.String(fileKey),
		Body:        bytes.NewReader(optimizedBuf),
		ContentType: aws.String("image/webp"),
		Metadata: map[string]string{
			"uploaded-at": time.Now().Format(time.RFC3339),
		},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to upload to R2: %w", err)
	}

	url := fmt.Sprintf("%s/%s", strings.TrimSuffix(r2.baseURL, "/"), fileKey)

	return &UploadResult{
		URL:     url,
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

// Helpers
func optimizeImage(buf []byte) ([]byte, error) {
	img, format, err := image.Decode(bytes.NewReader(buf))
	if err != nil {
		return nil, fmt.Errorf("failed to decode image: %w", err)
	}

	if !isSupportedFormat(format) {
		return nil, fmt.Errorf("unsupported image format: %s", format)
	}

	img = imaging.Fit(img, 1000, 1000, imaging.Lanczos)

	outputBuf := new(bytes.Buffer)
	if err := jpeg.Encode(outputBuf, img, &jpeg.Options{Quality: 80}); err != nil {
		return nil, fmt.Errorf("failed to encode optimized image: %w", err)
	}

	return outputBuf.Bytes(), nil
}

func isSupportedFormat(format string) bool {
	supported := []string{"jpeg", "png", "gif"}
	for _, f := range supported {
		if format == f {
			return true
		}
	}
	return false
}

func IsValidImageFile(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	validExts := []string{".jpg", ".jpeg", ".png", ".gif", ".webp"}

	for _, validExt := range validExts {
		if ext == validExt {
			return true
		}
	}
	return false
}

func IsValidFileSize(fileSize int64, maxSizeMB int64) bool {
	maxSizeBytes := maxSizeMB * 1024 * 1024
	return fileSize <= maxSizeBytes
}
