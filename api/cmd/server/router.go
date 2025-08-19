package server

import (
	"log"

	"github.com/app/venside/config"
	"github.com/app/venside/internal/features/account/auth"
	"github.com/app/venside/internal/features/account/inventories"
	"github.com/app/venside/internal/features/application/customers"
	"github.com/app/venside/internal/features/application/products"
	"github.com/app/venside/internal/features/application/purchases"
	"github.com/app/venside/internal/features/application/sales"
	"github.com/app/venside/internal/features/application/vendors"
	"github.com/app/venside/internal/features/application/warehouses"
	"github.com/app/venside/internal/routes"
	"github.com/app/venside/pkg/cache"
	"github.com/app/venside/pkg/cloudflare"

	"github.com/jmoiron/sqlx"
	"github.com/labstack/echo/v4"
)

func ConfigureRoutes(e *echo.Echo, db *sqlx.DB, cache cache.RedisService, config *config.Variables) {
	// Health check endpoint
	e.GET("/health", func(ctx echo.Context) error {
		return ctx.JSON(200, map[string]string{"status": "A-OK✅"})
	})

	// Initialize R2 client
	r2Config := cloudflare.R2Config{
		AccountID:       config.R2AccountID,
		AccessKeyID:     config.R2AccessKeyID,
		SecretAccessKey: config.R2SecretAccessKey,
		BucketName:      config.R2BucketName,
		PublicURL:       config.R2PublicURL,
	}

	r2Client, err := cloudflare.NewR2Client(r2Config)
	if err != nil {
		log.Fatalf("Failed to initialize R2 client: %v", err)
	}

	// Initialize auth routing components
	authRepo := auth.NewRepository(db)
	authValidator := auth.NewValidator(db)
	authService := auth.NewService(authRepo, config.JWTSecret)
	authController := auth.NewController(authService, authValidator)
	routes.AuthRoutes(e, authController, authService)

	// Inventory routes
	inventoryRepo := inventories.NewRepository(db)
	inventoryValidator := inventories.NewValidator(db)
	inventoryController := inventories.NewController(inventoryRepo, inventoryValidator)
	routes.InventoryRoutes(e, inventoryController, authService)

	// Warehouse routes
	warehouseRepo := warehouses.NewRepository(db, cache)
	warehouseValidator := warehouses.NewValidator(db)
	warehouseController := warehouses.NewController(warehouseRepo, warehouseValidator)
	routes.WarehouseRoutes(e, warehouseController, authService)

	// Product routes
	productRepo := products.NewRepository(db, cache)
	productValidator := products.NewValidator(db)
	productController := products.NewController(productRepo, productValidator, r2Client)
	routes.ProductRoutes(e, productController, authService)

	// Customer routes
	customerRepo := customers.NewRepository(db, cache)
	customerValidator := customers.NewValidator(db)
	customerController := customers.NewController(customerRepo, customerValidator)
	routes.CustomerRoutes(e, customerController, authService)

	// Sale routes
	saleRepo := sales.NewRepository(db, cache)
	saleController := sales.NewController(saleRepo)
	routes.SaleRoutes(e, saleController, authService)

	// Vendor routes
	vendorRepo := vendors.NewRepository(db, cache)
	vendorValidator := vendors.NewValidator(db)
	vendorController := vendors.NewController(vendorRepo, vendorValidator)
	routes.VendorRoutes(e, vendorController, authService)

	// Purchase routes
	purchaseRepo := purchases.NewRepository(db, cache)
	purchaseController := purchases.NewController(purchaseRepo)
	routes.PurchaseRoutes(e, purchaseController, authService)
}
