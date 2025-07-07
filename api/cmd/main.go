package main

import (
	"github.com/app/venside/cmd/server"
	"github.com/app/venside/config"
	"github.com/app/venside/database"
	"github.com/app/venside/pkg/cache"
	"github.com/app/venside/pkg/logger"

	"github.com/sirupsen/logrus"
)

func main() {
	cfg := config.LoadEnv()

	// Initialize the global logger
	logger.Initialize(cfg.Environment)

	logger.Info("Starting application...", logrus.Fields{
		"environment": cfg.Environment,
	})

	// Initialize database connection
	db := database.Connect(*cfg)
	defer db.Close()

	// Initialize Redis connection
	redisCache := cache.NewRedisClient(cfg.RedisUrl)
	defer redisCache.Close()

	// Start server
	e := server.NewServer(db, redisCache, cfg)
	logger.Info("Server starting on...", logrus.Fields{
		"port": cfg.Port,
	})

	if err := e.Start(":" + cfg.Port); err != nil {
		logger.Fatal("Server failed to start", logrus.Fields{
			"error": err.Error(),
		})
	}
}
