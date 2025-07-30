package main

import (
	"flag"
	"os"

	"github.com/app/venside/cmd/server"
	"github.com/app/venside/config"
	"github.com/app/venside/database"
	"github.com/app/venside/pkg/cache"
	"github.com/app/venside/pkg/logger"
	"github.com/app/venside/pkg/seed"
	"github.com/sirupsen/logrus"
)

func main() {
	// Parse command line flags
	seedFlag := flag.Bool("seed", false, "Run database seeding before starting server")
	flag.Parse()

	cfg := config.LoadEnv()

	// Initialize the global logger
	logger.Initialize(cfg.Environment)

	// Initialize database connection
	db := database.Connect(*cfg)
	defer db.Close()

	// Run seeding if flag is set
	if *seedFlag {
		logger.Info("Running database seeding...", logrus.Fields{})
		if err := seed.SeedProducts(db); err != nil {
			logger.Fatal("Database seeding failed", logrus.Fields{
				"error": err.Error(),
			})
			os.Exit(1)
		}
		logger.Info("Seeding successfully completed", logrus.Fields{})
	}

	// Initialize Redis connection
	redisCache := cache.NewRedisClient(cfg.RedisUrl)
	defer redisCache.Close()

	// Start server
	e := server.NewServer(db, redisCache, cfg)
	logger.Info("Starting server...", logrus.Fields{
		"environment": cfg.Environment,
		"port":        cfg.Port,
	})

	if err := e.Start(":" + cfg.Port); err != nil {
		logger.Fatal("Server failed to start", logrus.Fields{
			"error": err.Error(),
		})
	}
}
