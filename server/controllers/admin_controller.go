package controllers

import (
	"net/http"

	"server/config"
	"server/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GET /api/admin/overview retrieves all users, rfqs, bids, and platform summary metrics
func GetAdminOverview(c *gin.Context) {
	// fetch all registered users ordered by newest first
	var users []models.User
	config.DB.Order("created_at DESC").Find(&users)

	// fetch all rfqs with buyer details and bids sorted from lowest to highest price
	var rfqs []models.RFQ
	config.DB.
		Preload("Buyer").
		Preload("Bids", func(db *gorm.DB) *gorm.DB {
			return db.Order("unit_price ASC")
		}).
		Preload("Bids.Seller").
		Order("created_at DESC").
		Find(&rfqs)

	// count total number of submitted bids across the platform
	var totalBids int64
	config.DB.Model(&models.Bid{}).Count(&totalBids)

	// count non-admin accounts awaiting kyb verification
	var pendingCount int
	for _, u := range users {
		if !u.IsVerified && u.Role != models.RoleAdmin {
			pendingCount++
		}
	}

	// return aggregated overview payload and dashboard statistics
	c.JSON(http.StatusOK, gin.H{
		"users": users,
		"rfqs":  rfqs,
		"stats": gin.H{
			"total_users":           len(users),
			"pending_verifications": pendingCount,
			"total_rfqs":            len(rfqs),
			"total_bids":            totalBids,
		},
	})
}

// PATCH /api/admin/users/:id/verify toggles a user's kyb verification status
func ToggleUserVerification(c *gin.Context) {
	id := c.Param("id")

	// locate target user record by id
	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	// flip verification boolean and persist changes
	user.IsVerified = !user.IsVerified
	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update verification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

// PATCH /api/admin/rfqs/:id/close forcefully closes an active rfq listing
func ForceCloseRFQ(c *gin.Context) {
	id := c.Param("id")

	// locate target rfq record by id
	var rfq models.RFQ
	if err := config.DB.First(&rfq, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "rfq not found"})
		return
	}

	// update rfq status to closed and save to database
	rfq.Status = "closed"
	if err := config.DB.Save(&rfq).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to close rfq"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"rfq": rfq})
}