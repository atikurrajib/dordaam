package utils

import (
	"errors"
	"os"
	"time"

	"server/models"

	"github.com/golang-jwt/jwt/v5"
)

// errinvalidtoken is returned when a jwt is malformed, expired, or signed
// with an unexpected algorithm or secret.
var ErrInvalidToken = errors.New("invalid or expired token")

// claims is the set of custom jwt claims embedded in every access token
// issued by this application.
type Claims struct {
	UserID uint        `json:"user_id"`
	Email  string      `json:"email"`
	Role   models.Role `json:"role"`
	jwt.RegisteredClaims
}

// tokenttl controls how long an issued access token remains valid.
const tokenTTL = 72 * time.Hour

// jwtsecret reads the signing secret from the environment on every call so
// that it always reflects the currently loaded configuration.
func jwtSecret() ([]byte, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return nil, errors.New("JWT_SECRET is not set in .env file")
	}
	return []byte(secret), nil
}

// generatetoken creates a signed jwt for the given user, embedding their
// id, email, and role as custom claims.
func GenerateToken(userID uint, email string, role models.Role) (string, error) {
	secret, err := jwtSecret()
	if err != nil {
		return "", err
	}

	// set token issue and expiration timestamps
	now := time.Now()
	claims := Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(tokenTTL)),
			Subject:   email,
		},
	}

	// sign token with hs256 algorithm
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secret)
}

// validatetoken parses and validates a jwt string, returning the embedded
// claims when the token is valid, unexpired, and properly signed.
func ValidateToken(tokenString string) (*Claims, error) {
	secret, err := jwtSecret()
	if err != nil {
		return nil, err
	}

	// parse token and verify signing method
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return secret, nil
	})

	if err != nil || !token.Valid {
		return nil, ErrInvalidToken
	}

	return claims, nil
}
