package controllers

import (
	"errors"
	"net/http"

	"server/config"
	"server/models"
	"server/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// registerrequest is the expected json payload for new account registration
type RegisterRequest struct {
	Name        string      `json:"name" binding:"required,min=2,max=100"`
	Email       string      `json:"email" binding:"required,email"`
	Password    string      `json:"password" binding:"required,min=6"`
	Role        models.Role `json:"role" binding:"required,oneof=buyer seller"`
	CompanyName string      `json:"company_name"`
	Phone       string      `json:"phone"`
}

// loginrequest is the expected json payload for authenticating a user
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// authresponse is the standard shape returned after a successful
// registration or login, containing the issued access token and the
// public-facing user record
type authResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

// register creates a new buyer or seller account. admin accounts can only
// be created via the seeder and are intentionally not allowed here
func Register(c *gin.Context) {
	// bind and validate incoming registration json payload
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// check if an account with the same email already exists
	var existing models.User
	result := config.DB.Where("email = ?", req.Email).First(&existing)
	if result.Error == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "An account with this email already exists"})
		return
	} else if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify account uniqueness"})
		return
	}

	// hash the plain text password before saving
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process password"})
		return
	}

	// create new user record in database
	user := models.User{
		Name:        req.Name,
		Email:       req.Email,
		Password:    string(hashedPassword),
		Role:        req.Role,
		CompanyName: req.CompanyName,
		Phone:       req.Phone,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create account"})
		return
	}

	// generate jwt access token for immediate login
	token, err := utils.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate access token"})
		return
	}

	// return created status with token and user profile
	c.JSON(http.StatusCreated, authResponse{Token: token, User: user})
}

// login authenticates a user by email and password and issues a jwt access
// token on success
func Login(c *gin.Context) {
	// bind and validate incoming login json payload
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// find user by email
	var user models.User
	result := config.DB.Where("email = ?", req.Email).First(&user)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// block unverified buyer/seller accounts until admin approves them
	if user.Role != models.RoleAdmin && !user.IsVerified {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Your business account is pending admin verification. Please wait for approval before logging in.",
		})
		return
	}

	// generate jwt access token
	token, err := utils.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate access token"})
		return
	}

	// return ok status with token and authenticated user profile
	c.JSON(http.StatusOK, authResponse{Token: token, User: user})
}

// getprofile returns the currently authenticated user's profile details
func GetProfile(c *gin.Context) {
	// extract authenticated user id injected by auth middleware
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// fetch user record from database using id from jwt context
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch profile"})
		return
	}

	// return user profile payload
	c.JSON(http.StatusOK, gin.H{"user": user})
}