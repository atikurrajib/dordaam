package models

import (
	"time"
)

// 'RFQ' represents a bulk request for quotation published by a verified buyer
type RFQ struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	BuyerID        uint      `gorm:"not null;index" json:"buyer_id"`
	Buyer          User      `gorm:"foreignKey:BuyerID" json:"buyer,omitempty"`
	Title          string    `gorm:"type:varchar(255);not null" json:"title"`
	Category       string    `gorm:"type:varchar(100);not null" json:"category"`
	Quantity       float64   `gorm:"not null" json:"quantity"`
	Unit           string    `gorm:"type:varchar(50);not null" json:"unit"`
	TargetPrice    float64   `gorm:"not null" json:"target_price"`
	Deadline       string    `gorm:"type:varchar(50);not null" json:"deadline"`
	Specifications string    `gorm:"type:text" json:"specifications"`
	Status         string    `gorm:"type:varchar(20);default:'open'" json:"status"` // open | awarded | closed
	AwardedBidID   *uint     `json:"awarded_bid_id"`
	Bids           []Bid     `gorm:"foreignKey:RFQID" json:"bids"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// 'Bid' represents a reverse-auction quote submitted by a verified seller for an rfq
type Bid struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	RFQID        uint      `gorm:"not null;index" json:"rfq_id"`
	SellerID     uint      `gorm:"not null;index" json:"seller_id"`
	Seller       User      `gorm:"foreignKey:SellerID" json:"seller,omitempty"`
	UnitPrice    float64   `gorm:"not null" json:"unit_price"`
	DeliveryDays int       `gorm:"not null" json:"delivery_days"`
	Note         string    `gorm:"type:text" json:"note"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}