package database

import (
	"github.com/app/venside/config"
	"github.com/app/venside/pkg/logger"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/sirupsen/logrus"
)

var DB *sqlx.DB

func Connect(config config.Variables) *sqlx.DB {
	connectionString := config.DatabaseUrl

	db, err := sqlx.Connect("postgres", connectionString)
	if err != nil {
		logger.Fatal("Database connection failed", logrus.Fields{
			"error":             err.Error(),
			"connection_string": connectionString,
		})
	}

	// Test the connection
	if err := db.Ping(); err != nil {
		logger.Fatal("Database ping failed", logrus.Fields{
			"error": err.Error(),
		})
	}

	logger.Info("Database connected successfully", logrus.Fields{
		"database_url": connectionString,
		"driver":       "postgres",
	})

	DB = db
	return db
}
