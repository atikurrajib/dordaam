package main

import (
	"log"
	"os"

	"server/config"
	"server/routes"
	"server/utils"

	"github.com/joho/godotenv"
)

func main() {
	// load environment variables from .env if present. in production the
	// variables may already be injected by the hosting platform, so a
	// missing file is not treated as a fatal error.
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on existing environment variables")
	}

	// connect to supabase database and seed default admin
	config.ConnectDatabase()
	utils.SeedAdmin()

	// initialize router with cors and api routes
	router := routes.SetupRouter()

	// get server port from env or default to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server is running on port %s\n", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
