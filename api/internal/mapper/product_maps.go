package mapper

import (
	"time"

	"github.com/app/venside/internal/models"
	"github.com/google/uuid"
)

func ToCreateProduct(req *models.ProductRequest, inventoryID uuid.UUID) *models.Product {
	return &models.Product{
		ID:            uuid.New(),
		Name:          trim(req.Name),
		Code:          trim(req.Code),
		SKU:           trim(req.SKU),
		Brand:         trim(req.Brand),
		Model:         trim(req.Model),
		Description:   trim(req.Description),
		TotalQuantity: req.TotalQuantity,
		TotalStock:    req.TotalStock,
		RestockLevel:  req.RestockLevel,
		OptimalLevel:  req.OptimalLevel,
		CostPrice:     req.CostPrice,
		SellingPrice:  req.SellingPrice,
		InventoryID:   inventoryID,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}
}

func ToUpdateProduct(req *models.ProductRequest, existing *models.Product) *models.Product {
	return &models.Product{
		ID:            existing.ID,
		Name:          trim(req.Name),
		Code:          trim(req.Code),
		SKU:           trim(req.SKU),
		Brand:         trim(req.Brand),
		Model:         trim(req.Model),
		Description:   trim(req.Description),
		TotalQuantity: req.TotalQuantity,
		RestockLevel:  req.RestockLevel,
		OptimalLevel:  req.OptimalLevel,
		CostPrice:     req.CostPrice,
		SellingPrice:  req.SellingPrice,
		InventoryID:   existing.InventoryID,
		CreatedAt:     existing.CreatedAt,
		UpdatedAt:     time.Now(),
		Images:        existing.Images,
		Categories:    existing.Categories,
		Storages:      existing.Storages,
	}
}

func ToProductResponse(product *models.Product) *models.ProductResponse {
	response := &models.ProductResponse{
		ID:            product.ID,
		Name:          product.Name,
		Code:          product.Code,
		SKU:           product.SKU,
		Brand:         product.Brand,
		Model:         product.Model,
		Description:   product.Description,
		TotalQuantity: product.TotalQuantity,
		TotalStock:    product.TotalStock,
		RestockLevel:  product.RestockLevel,
		OptimalLevel:  product.OptimalLevel,
		CostPrice:     product.CostPrice,
		SellingPrice:  product.SellingPrice,
		CreatedAt:     product.CreatedAt,
		UpdatedAt:     product.UpdatedAt,
	}

	// Calculate total stock from warehouse quantities if available
	if len(product.Storages) > 0 {
		response.TotalStock = 0
		for _, storage := range product.Storages {
			response.TotalStock += storage.QuantityInStock
		}
	}

	// Map images
	if product.Images != nil {
		for _, img := range product.Images {
			response.Images = append(response.Images, models.ProductImageResponse{
				ID:        img.ID,
				URL:       img.URL,
				Name:      img.Name,
				FileKey:   img.FileKey,
				IsPrimary: img.IsPrimary,
				CreatedAt: img.CreatedAt,
				UpdatedAt: img.UpdatedAt,
			})
		}
	}

	// Map categories
	if product.Categories != nil {
		for _, ctg := range product.Categories {
			response.Categories = append(response.Categories, models.ProductCategoryResponse{
				ID:        ctg.ID,
				Name:      ctg.Name,
				CreatedAt: ctg.CreatedAt,
				UpdatedAt: ctg.UpdatedAt,
			})
		}
	}

	// Map storages
	if product.Storages != nil {
		for _, storage := range product.Storages {
			response.Storages = append(response.Storages, models.StorageResponse{
				Warehouse: models.WarehouseResponse{
					ID:          storage.Warehouse.ID,
					Name:        storage.Warehouse.Name,
					Location:    storage.Warehouse.Location,
					Capacity:    storage.Warehouse.Capacity,
					StorageType: storage.Warehouse.StorageType,
					IsMain:      storage.Warehouse.IsMain,
					Manager:     storage.Warehouse.Manager,
					Phone:       storage.Warehouse.Phone,
					Email:       storage.Warehouse.Email,
					CreatedAt:   storage.Warehouse.CreatedAt,
					UpdatedAt:   storage.Warehouse.UpdatedAt,
				},
				QuantityInStock: storage.QuantityInStock,
			})
		}
	}

	return response
}

func ToProductCategoryResponse(category *models.ProductCategory) *models.ProductCategoryResponse {
	return &models.ProductCategoryResponse{
		ID:        category.ID,
		Name:      category.Name,
		CreatedAt: category.CreatedAt,
		UpdatedAt: category.UpdatedAt,
	}
}

func ToProductStock(productsWithStock []models.ProductWithStock) []models.StockItem {
	var stockItems []models.StockItem
	for _, pws := range productsWithStock {
		stockItems = append(stockItems, models.StockItem{
			Product: models.Product{
				ID:            pws.ID,
				Name:          pws.Name,
				Code:          pws.Code,
				SKU:           pws.SKU,
				Brand:         pws.Brand,
				Model:         pws.Model,
				Description:   pws.Description,
				TotalQuantity: pws.TotalQuantity,
				TotalStock:    pws.TotalStock,
				RestockLevel:  pws.RestockLevel,
				OptimalLevel:  pws.OptimalLevel,
				CostPrice:     pws.CostPrice,
				SellingPrice:  pws.SellingPrice,
				InventoryID:   pws.InventoryID,
				CreatedAt:     pws.CreatedAt,
				UpdatedAt:     pws.UpdatedAt,
			},
			QuantityInStock: pws.QuantityInStock,
		})
	}
	return stockItems
}
