package routes

import (
	"os"
	"strings"
	"time"

	"server/controllers"
	"server/middleware"
	"server/models"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// setuprouter builds and configures the gin engine with cors middleware
// and all application routes.
func SetupRouter() *gin.Engine {
	router := gin.Default()

	// load allowed origins from .env (supports comma-separated urls for local & live)
	allowedOrigins := []string{"http://localhost:5173", "http://localhost:3000"}
	if envOrigins := os.Getenv("FRONTEND_URL"); envOrigins != "" {
		allowedOrigins = strings.Split(envOrigins, ",")
	}

	// configure cors middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// basic health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	api := router.Group("/api")
	{
		// public authentication routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", controllers.Register)
			auth.POST("/login", controllers.Login)
		}

		// protected routes requiring valid jwt token
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/profile", controllers.GetProfile)

			// admin governance routes
			admin := protected.Group("/admin")
			admin.Use(middleware.RequireRole(models.RoleAdmin))
			{
				admin.GET("/overview", controllers.GetAdminOverview)
				admin.PATCH("/users/:id/verify", controllers.ToggleUserVerification)
				admin.PATCH("/rfqs/:id/close", controllers.ForceCloseRFQ)
			}

			// rfq & reverse bidding routes
			rfqs := protected.Group("/rfqs")
			{
				// buyer rfq routes
				rfqs.POST("", middleware.RequireRole(models.RoleBuyer), controllers.CreateRFQ)
				rfqs.GET("/my", middleware.RequireRole(models.RoleBuyer), controllers.GetMyRFQs)
				rfqs.PATCH("/:id/award/:bidId", middleware.RequireRole(models.RoleBuyer), controllers.AwardBid)

				// seller rfq & bidding routes
				rfqs.GET("/open", middleware.RequireRole(models.RoleSeller), controllers.GetOpenRFQs)
				rfqs.POST("/:id/bids", middleware.RequireRole(models.RoleSeller), controllers.PlaceOrUpdateBid)

				// seller bid history route
				protected.GET("/bids/my", middleware.RequireRole(models.RoleSeller), controllers.GetMyBids)
			}
		}

		return router
	}
}
