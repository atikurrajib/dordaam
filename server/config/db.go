package config

import (
	"log"
	"os"

	"server/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// db holds the global gorm database connection instance
var DB *gorm.DB

// connectdatabase initializes the supabase postgresql connection and runs auto-migration
func ConnectDatabase() {
	// read database connection string from environment variables
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL is not set in .env file")
	}

	// open connection to postgresql database
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to Supabase database:", err)
	}

	// create or update tables automatically
	err = db.AutoMigrate(&models.User{}, &models.RFQ{}, &models.Bid{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// assign connected instance to global db variable
	DB = db
	log.Println("Connected to Supabase PostgreSQL & migrated tables successfully!")
}