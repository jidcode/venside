package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Variables struct {
	DatabaseUrl       string
	RedisUrl          string
	JWTSecret         string
	Environment       string
	Domain            string
	Port              string
	R2AccountID       string
	R2AccessKeyID     string
	R2SecretAccessKey string
	R2BucketName      string
	R2PublicURL       string
}

func LoadEnv() *Variables {
	if err := godotenv.Load(); err != nil {
		log.Fatalf("Failed to load environmental variables: %s", err)
	}

	env := os.Getenv("APP_ENV")
	if env == "" {
		env = "development"
	}

	config := &Variables{
		DatabaseUrl: os.Getenv("DATABASE_URL"),
		RedisUrl:    os.Getenv("REDIS_URL"),
		JWTSecret:   os.Getenv("JWT_SECRET"),

		R2AccountID:       os.Getenv("R2_ACCOUNT_ID"),
		R2AccessKeyID:     os.Getenv("R2_ACCESS_KEY_ID"),
		R2SecretAccessKey: os.Getenv("R2_SECRET_ACCESS_KEY"),
		R2BucketName:      os.Getenv("R2_BUCKET_NAME"),
		R2PublicURL:       os.Getenv("R2_PUBLIC_URL"),

		Domain:      os.Getenv("DOMAIN"),
		Port:        os.Getenv("PORT"),
		Environment: env,
	}

	return config
}
