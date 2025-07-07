package cache

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type IRedisCache interface {
	Get(key string, dest interface{}) error
	Set(key string, value interface{}, expiration time.Duration) error
	Delete(key string) error
}

type RedisClient struct {
	client *redis.Client
	ctx    context.Context
}
