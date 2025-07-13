package cache

import (
	"context"
	"time"

	"github.com/app/venside/pkg/logger"
	"github.com/redis/go-redis/v9"
	"github.com/sirupsen/logrus"
)

type RedisClient struct {
	client *redis.Client
	ctx    context.Context
}

func NewRedisClient(redisURL string) *RedisClient {
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		logger.Fatal("Failed to parse Redis URL", logrus.Fields{
			"error":     err.Error(),
			"redis_url": redisURL,
		})
	}

	client := redis.NewClient(opt)

	// Use a timeout context for the ping operation
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		logger.Fatal("Failed to connect to Redis", logrus.Fields{
			"error":     err.Error(),
			"redis_url": redisURL,
		})
	}

	logger.Info("Redis connected successfully", logrus.Fields{
		"redis_url": redisURL,
		"driver":    "go-redis",
	})

	return &RedisClient{
		client: client,
		ctx:    context.Background(),
	}
}
