package middleware

import (
	"net/http"
	"strings"

	"server/models"
	"server/utils"

	"github.com/gin-gonic/gin"
)

// contextuseridkey, contextemailkey, and contextrolekey are the gin.context
// keys populated by authmiddleware after successful token validation.
const (
	ContextUserIDKey = "user_id"
	ContextEmailKey  = "email"
	ContextRoleKey   = "role"
)

// authmiddleware verifies the bearer jwt supplied in the authorization
// header and, on success, stores the authenticated user's id, email, and
// role in the request context for downstream handlers to use.
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			return
		}

		// extract bearer token from header
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") || strings.TrimSpace(parts[1]) == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header must be in the format 'Bearer <token>'"})
			return
		}

		// validate jwt signature and expiration
		claims, err := utils.ValidateToken(parts[1])
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		// attach user claims to gin context
		c.Set(ContextUserIDKey, claims.UserID)
		c.Set(ContextEmailKey, claims.Email)
		c.Set(ContextRoleKey, claims.Role)

		c.Next()
	}
}

// requirerole returns a middleware that only allows requests to proceed if
// the authenticated user's role (set by authmiddleware) is one of the
// provided allowed roles. it must be chained after authmiddleware.
func RequireRole(allowedRoles ...models.Role) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleValue, exists := c.Get(ContextRoleKey)
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			return
		}

		// assert role type from context
		role, ok := roleValue.(models.Role)
		if !ok {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Unable to determine user role"})
			return
		}

		// check if user role matches any allowed role
		for _, allowed := range allowedRoles {
			if role == allowed {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "You do not have permission to access this resource"})
	}
}