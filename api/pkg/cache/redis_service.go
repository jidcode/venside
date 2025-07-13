package cache

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/app/venside/pkg/logger"
	"github.com/redis/go-redis/v9"
	"github.com/sirupsen/logrus"
)

type RedisService interface {
	Get(key string, dest interface{}) error
	Set(key string, value interface{}, expiration time.Duration) error
	Delete(key string) error
	Close() error
}

func (r *RedisClient) Get(key string, dest interface{}) error {
	val, err := r.client.Get(r.ctx, key).Bytes()
	if err == redis.Nil {
		return errors.New("cache miss")
	} else if err != nil {
		logger.Debug("Redis GET operation failed", logrus.Fields{
			"key":   key,
			"error": err.Error(),
		})
		return err
	}

	if err := json.Unmarshal(val, dest); err != nil {
		logger.Warn("Failed to unmarshal cached data", logrus.Fields{
			"key":   key,
			"error": err.Error(),
		})
		return err
	}

	return nil
}

func (r *RedisClient) Set(key string, value interface{}, expiration time.Duration) error {
	jsonData, err := json.Marshal(value)
	if err != nil {
		logger.Warn("Failed to marshal data for caching", logrus.Fields{
			"key":   key,
			"error": err.Error(),
		})
		return err
	}

	if err := r.client.Set(r.ctx, key, jsonData, expiration).Err(); err != nil {
		logger.Debug("Redis SET operation failed", logrus.Fields{
			"key":        key,
			"expiration": expiration.String(),
			"error":      err.Error(),
		})
		return err
	}

	return nil
}

func (r *RedisClient) Delete(key string) error {
	if err := r.client.Del(r.ctx, key).Err(); err != nil {
		logger.Debug("Redis DELETE operation failed", logrus.Fields{
			"key":   key,
			"error": err.Error(),
		})
		return err
	}
	return nil
}

func (r *RedisClient) Close() error {
	logger.Info("Closing Redis connection", logrus.Fields{})
	return r.client.Close()
}
