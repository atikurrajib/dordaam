package models

import (
	"time"

	"gorm.io/gorm"
)

// 'Role' represents the access level of a user in the system.
type Role string

const (
	RoleAdmin  Role = "admin"
	RoleBuyer  Role = "buyer"
	RoleSeller Role = "seller"
)

// 'User' defines the database schema and json structure for platform accounts.
type User struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `gorm:"not null" json:"name"`
	Email       string         `gorm:"uniqueIndex;not null" json:"email"`
	Password    string         `gorm:"not null" json:"-"` // password hidden in json response
	Role        Role           `gorm:"type:varchar(20);not null" json:"role"`
	CompanyName string         `json:"company_name"`
	Phone       string         `json:"phone"`
	IsVerified  bool           `gorm:"default:false" json:"is_verified"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

