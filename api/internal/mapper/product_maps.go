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
		RestockLevel:  product.RestockLevel,
		OptimalLevel:  product.OptimalLevel,
		CostPrice:     product.CostPrice,
		SellingPrice:  product.SellingPrice,
		CreatedAt:     product.CreatedAt,
		UpdatedAt:     product.UpdatedAt,
	}

	// Map images
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

	// Map categories
	for _, ctg := range product.Categories {
		response.Categories = append(response.Categories, models.ProductCategoryResponse{
			ID:        ctg.ID,
			Name:      ctg.Name,
			CreatedAt: ctg.CreatedAt,
			UpdatedAt: ctg.UpdatedAt,
		})
	}

	// Map storages
	for _, storage := range product.Storages {
		response.Storages = append(response.Storages, models.StorageResponse{
			Warehouse: models.WarehouseResponse{
				ID:          storage.Warehouse.ID,
				Name:        storage.Warehouse.Name,
				Location:    storage.Warehouse.Location,
				Capacity:    storage.Warehouse.Capacity,
				StorageType: storage.Warehouse.StorageType,
				Manager:     storage.Warehouse.Manager,
				Contact:     storage.Warehouse.Contact,
				CreatedAt:   storage.Warehouse.CreatedAt,
				UpdatedAt:   storage.Warehouse.UpdatedAt,
			},
			StockQuantity: storage.StockQuantity,
		})
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
