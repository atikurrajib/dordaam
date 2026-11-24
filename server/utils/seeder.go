package utils

import (
	"log"
	"os"

	"server/config"
	"server/models"

	"golang.org/x/crypto/bcrypt"
)

func SeedAdmin() {
	// read admin credentials from environment variables
	adminEmail := os.Getenv("ADMIN_EMAIL")
	adminPassword := os.Getenv("ADMIN_PASSWORD")
	adminName := os.Getenv("ADMIN_NAME")

	// skip seeding if email or password is missing
	if adminEmail == "" || adminPassword == "" {
		log.Println("Admin credentials not found in .env, skipping admin seed")
		return
	}

	// check if an admin account already exists in the database
	var existingAdmin models.User
	result := config.DB.Where("role = ?", models.RoleAdmin).First(&existingAdmin)
	if result.RowsAffected > 0 {
		log.Println("Admin account already exists:", existingAdmin.Email)
		return
	}

	// hash the plain text admin password using bcrypt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal("Failed to hash admin password:", err)
	}

	// construct the default admin user record
	admin := models.User{
		Name:        adminName,
		Email:       adminEmail,
		Password:    string(hashedPassword),
		Role:        models.RoleAdmin,
		CompanyName: "DORDAAM",
		IsVerified:  true,
	}

	// insert admin user into database
	if err := config.DB.Create(&admin).Error; err != nil {
		log.Fatal("Failed to create admin user:", err)
	}

	log.Println("Default Admin created successfully:", adminEmail)
}
