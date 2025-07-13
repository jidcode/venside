package mapper

import (
	"time"

	"github.com/app/venside/internal/models"
	"github.com/google/uuid"
)

func ToCreateWarehouse(req *models.WarehouseRequest, inventoryID uuid.UUID) *models.Warehouse {
	return &models.Warehouse{
		ID:          uuid.New(),
		Name:        trim(req.Name),
		Location:    trim(req.Location),
		Capacity:    req.Capacity,
		StorageType: trim(req.StorageType),
		Manager:     trim(req.Manager),
		Contact:     trim(req.Contact),
		InventoryID: inventoryID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
}

func ToUpdateWarehouse(req *models.WarehouseRequest, existing *models.Warehouse) *models.Warehouse {
	return &models.Warehouse{
		ID:          existing.ID,
		Name:        trim(req.Name),
		Location:    trim(req.Location),
		Capacity:    req.Capacity,
		StorageType: trim(req.StorageType),
		Manager:     trim(req.Manager),
		Contact:     trim(req.Contact),
		InventoryID: existing.InventoryID,
		CreatedAt:   existing.CreatedAt,
		UpdatedAt:   time.Now(),
	}
}

func ToWarehouseResponse(warehouse *models.Warehouse) *models.WarehouseResponse {
	response := &models.WarehouseResponse{
		ID:          warehouse.ID,
		Name:        warehouse.Name,
		Location:    warehouse.Location,
		Capacity:    warehouse.Capacity,
		StorageType: warehouse.StorageType,
		Manager:     warehouse.Manager,
		Contact:     warehouse.Contact,
		CreatedAt:   warehouse.CreatedAt,
		UpdatedAt:   warehouse.UpdatedAt,
	}

	// Map stock items
	for _, item := range warehouse.StockItems {
		response.StockItems = append(response.StockItems, models.StockItemResponse{
			Product: models.ProductResponse{
				ID:            item.Product.ID,
				Name:          item.Product.Name,
				Code:          item.Product.Code,
				SKU:           item.Product.SKU,
				Brand:         item.Product.Brand,
				Model:         item.Product.Model,
				Description:   item.Product.Description,
				TotalQuantity: item.Product.TotalQuantity,
				RestockLevel:  item.Product.RestockLevel,
				OptimalLevel:  item.Product.OptimalLevel,
				CostPrice:     item.Product.CostPrice,
				SellingPrice:  item.Product.SellingPrice,
				CreatedAt:     item.Product.CreatedAt,
				UpdatedAt:     item.Product.UpdatedAt,
			},
			StockQuantity: item.StockQuantity,
		})
	}

	return response
}
