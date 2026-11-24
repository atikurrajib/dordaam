package controllers

import (
	"net/http"
	"strconv"

	"server/config"
	"server/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// createrfqinput defines the expected json payload for publishing a new bulk rfq
type CreateRFQInput struct {
	Title          string  `json:"title" binding:"required"`
	Category       string  `json:"category" binding:"required"`
	Quantity       float64 `json:"quantity" binding:"required,gt=0"`
	Unit           string  `json:"unit" binding:"required"`
	TargetPrice    float64 `json:"target_price" binding:"required,gt=0"`
	Deadline       string  `json:"deadline" binding:"required"`
	Specifications string  `json:"specifications"`
}

// placebidinput defines the expected json payload for submitting or updating a reverse bid
type PlaceBidInput struct {
	UnitPrice    float64 `json:"unit_price" binding:"required,gt=0"`
	DeliveryDays int     `json:"delivery_days" binding:"required,gt=0"`
	Note         string  `json:"note"`
}

// helper to safely extract uint user_id from gin context
func getContextUserID(c *gin.Context) (uint, bool) {
	val, exists := c.Get("user_id")
	if !exists {
		return 0, false
	}
	// handle possible numeric types stored in context
	switch v := val.(type) {
	case uint:
		return v, true
	case float64:
		return uint(v), true
	case int:
		return uint(v), true
	default:
		return 0, false
	}
}

// POST /api/rfqs creates a new bulk rfq listing (verified buyer only)
func CreateRFQ(c *gin.Context) {
	// extract authenticated buyer id from context
	buyerID, ok := getContextUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// fetch buyer record and enforce admin kyb verification
	var buyer models.User
	if err := config.DB.First(&buyer, buyerID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "buyer account not found"})
		return
	}
	if !buyer.IsVerified {
		c.JSON(http.StatusForbidden, gin.H{"error": "admin verification required before posting rfqs"})
		return
	}

	// bind and validate incoming rfq json payload
	var input CreateRFQInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// initialize rfq model with open status
	rfq := models.RFQ{
		BuyerID:        buyerID,
		Title:          input.Title,
		Category:       input.Category,
		Quantity:       input.Quantity,
		Unit:           input.Unit,
		TargetPrice:    input.TargetPrice,
		Deadline:       input.Deadline,
		Specifications: input.Specifications,
		Status:         "open",
	}

	// persist new rfq record to database
	if err := config.DB.Create(&rfq).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create rfq"})
		return
	}

	// initialize empty bids slice for consistent frontend response structure
	rfq.Bids = []models.Bid{}
	c.JSON(http.StatusCreated, gin.H{"rfq": rfq})
}

// GET /api/rfqs/my fetches all rfqs posted by the authenticated buyer with bids sorted lowest price first
func GetMyRFQs(c *gin.Context) {
	// extract authenticated buyer id from context
	buyerID, ok := getContextUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// query buyer's rfqs preloading bids ordered ascending by unit price and seller details
	var rfqs []models.RFQ
	err := config.DB.
		Where("buyer_id = ?", buyerID).
		Preload("Bids", func(db *gorm.DB) *gorm.DB {
			return db.Order("unit_price ASC")
		}).
		Preload("Bids.Seller").
		Order("created_at DESC").
		Find(&rfqs).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch rfqs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"rfqs": rfqs})
}

// GET /api/rfqs/open retrieves all active marketplace rfqs for sellers to browse and bid on
func GetOpenRFQs(c *gin.Context) {
	// query open rfqs with buyer info and sorted bids
	var rfqs []models.RFQ
	err := config.DB.
		Where("status = ?", "open").
		Preload("Buyer").
		Preload("Bids", func(db *gorm.DB) *gorm.DB {
			return db.Order("unit_price ASC")
		}).
		Order("created_at DESC").
		Find(&rfqs).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch open rfqs"})
		return
	}

	// hide buyer phone number while rfq is still open for bidding
	for i := range rfqs {
		rfqs[i].Buyer.Phone = ""
	}

	c.JSON(http.StatusOK, gin.H{"rfqs": rfqs})
}

// POST /api/rfqs/:id/bids submits a new bid or updates an existing bid for a verified seller
func PlaceOrUpdateBid(c *gin.Context) {
	// extract authenticated seller id from context
	sellerID, ok := getContextUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// fetch seller record and enforce admin kyb verification
	var seller models.User
	if err := config.DB.First(&seller, sellerID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "seller account not found"})
		return
	}
	if !seller.IsVerified {
		c.JSON(http.StatusForbidden, gin.H{"error": "admin verification required before placing bids"})
		return
	}

	// parse and validate target rfq id from url parameter
	rfqID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid rfq id"})
		return
	}

	// verify target rfq exists and is still open for bidding
	var rfq models.RFQ
	if err := config.DB.First(&rfq, rfqID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "rfq not found"})
		return
	}

	if rfq.Status != "open" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bidding is closed for this rfq"})
		return
	}

	// bind and validate incoming bid payload
	var input PlaceBidInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// check if seller already bid on this rfq -> update in place (reverse auction)
	var existingBid models.Bid
	err = config.DB.Where("rfq_id = ? AND seller_id = ?", rfq.ID, sellerID).First(&existingBid).Error

	if err == nil {
		existingBid.UnitPrice = input.UnitPrice
		existingBid.DeliveryDays = input.DeliveryDays
		existingBid.Note = input.Note
		if err := config.DB.Save(&existingBid).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update bid"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"bid": existingBid, "updated": true})
		return
	}

	// create new bid record if seller has not bid on this rfq yet
	newBid := models.Bid{
		RFQID:        rfq.ID,
		SellerID:     sellerID,
		UnitPrice:    input.UnitPrice,
		DeliveryDays: input.DeliveryDays,
		Note:         input.Note,
	}

	if err := config.DB.Create(&newBid).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to place bid"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"bid": newBid, "updated": false})
}

// GET /api/bids/my fetches all bids placed by the authenticated seller along with parent rfq details
func GetMyBids(c *gin.Context) {
	// extract authenticated seller id from context
	sellerID, ok := getContextUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// fetch all bids submitted by this seller ordered by most recently updated
	var bids []models.Bid
	if err := config.DB.Where("seller_id = ?", sellerID).Order("updated_at DESC").Find(&bids).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch bids"})
		return
	}

	// collect parent rfq ids corresponding to the seller's bids
	var rfqIDs []uint
	for _, b := range bids {
		rfqIDs = append(rfqIDs, b.RFQID)
	}

	var rfqs []models.RFQ
	if len(rfqIDs) > 0 {
		config.DB.Preload("Buyer").Preload("Bids.Seller").Where("id IN ?", rfqIDs).Find(&rfqs)

		// reveal buyer phone only if this seller won the awarded deal
		for i := range rfqs {
			isWinner := false
			for _, b := range bids {
				if rfqs[i].AwardedBidID != nil && *rfqs[i].AwardedBidID == b.ID {
					isWinner = true
					break
				}
			}
			if !isWinner {
				rfqs[i].Buyer.Phone = ""
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"bids": bids, "rfqs": rfqs})
}

// PATCH /api/rfqs/:id/award/:bidid awards a winning bid and closes the rfq (buyer owner only)
func AwardBid(c *gin.Context) {
	// extract authenticated buyer id from context
	buyerID, ok := getContextUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// parse rfq id and winning bid id from url parameters
	rfqID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid rfq id"})
		return
	}

	bidID, err := strconv.Atoi(c.Param("bidId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid bid id"})
		return
	}

	// locate rfq and verify ownership and open status
	var rfq models.RFQ
	if err := config.DB.First(&rfq, rfqID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "rfq not found"})
		return
	}

	if rfq.BuyerID != buyerID {
		c.JSON(http.StatusForbidden, gin.H{"error": "you can only award your own rfq"})
		return
	}

	if rfq.Status != "open" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "this rfq is already closed or awarded"})
		return
	}

	// ensure the selected bid belongs to this rfq
	var bid models.Bid
	if err := config.DB.Where("id = ? AND rfq_id = ?", bidID, rfq.ID).First(&bid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "bid not found for this rfq"})
		return
	}

	// update rfq status to awarded and record winning bid id
	awardedID := bid.ID
	rfq.Status = "awarded"
	rfq.AwardedBidID = &awardedID

	if err := config.DB.Save(&rfq).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to award bid"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"rfq": rfq})
}