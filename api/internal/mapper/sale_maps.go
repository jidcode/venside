package mapper

import (
	"time"

	"github.com/app/venside/internal/models"
	"github.com/google/uuid"
)

func ToCreateSale(req *models.SaleRequest, inventoryID uuid.UUID) *models.Sale {
	saleDate := time.Now()
	if req.SaleDate != nil {
		saleDate = *req.SaleDate
	}

	var customerID *uuid.UUID
	if req.CustomerID != nil {
		parsedID, _ := uuid.Parse(*req.CustomerID)
		customerID = &parsedID
	}

	sale := &models.Sale{
		ID:              uuid.New(),
		CustomerID:      customerID,
		CustomerName:    req.CustomerName,
		SaleDate:        saleDate,
		TotalAmount:     req.TotalAmount,
		Balance:         req.Balance,
		PaymentStatus:   req.PaymentStatus,
		DiscountAmount:  req.DiscountAmount,
		DiscountPercent: req.DiscountPercent,
		InventoryID:     inventoryID,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	// Create sale items
	sale.Items = make([]models.SaleItem, len(req.Items))
	for i, itemReq := range req.Items {
		productID, _ := uuid.Parse(itemReq.ProductID)

		sale.Items[i] = models.SaleItem{
			ID:              uuid.New(),
			SaleID:          sale.ID,
			ProductID:       productID,
			Quantity:        itemReq.Quantity,
			UnitPrice:       itemReq.UnitPrice,
			Subtotal:        itemReq.Subtotal,
			DiscountAmount:  itemReq.DiscountAmount,
			DiscountPercent: itemReq.DiscountPercent,
			CreatedAt:       time.Now(),
		}
	}

	return sale
}

func ToEditSale(req *models.SaleRequest, existing *models.Sale) *models.Sale {
	saleDate := existing.SaleDate
	if req.SaleDate != nil {
		saleDate = *req.SaleDate
	}

	var customerID *uuid.UUID
	if req.CustomerID != nil {
		parsedID, _ := uuid.Parse(*req.CustomerID)
		customerID = &parsedID
	}

	return &models.Sale{
		ID:              existing.ID,
		SaleNumber:      existing.SaleNumber,
		CustomerID:      customerID,
		CustomerName:    req.CustomerName,
		SaleDate:        saleDate,
		TotalAmount:     req.TotalAmount,
		Balance:         req.Balance,
		PaymentStatus:   req.PaymentStatus,
		DiscountAmount:  req.DiscountAmount,
		DiscountPercent: req.DiscountPercent,
		InventoryID:     existing.InventoryID,
		CreatedAt:       existing.CreatedAt,
		UpdatedAt:       time.Now(),
		Items:           existing.Items,
	}
}

func ToSaleResponse(sale *models.Sale) *models.SaleResponse {
	response := &models.SaleResponse{
		ID:              sale.ID,
		SaleNumber:      sale.SaleNumber,
		CustomerID:      sale.CustomerID,
		CustomerName:    sale.CustomerName,
		SaleDate:        sale.SaleDate,
		TotalAmount:     sale.TotalAmount,
		Balance:         sale.Balance,
		PaymentStatus:   sale.PaymentStatus,
		DiscountAmount:  sale.DiscountAmount,
		DiscountPercent: sale.DiscountPercent,
		CreatedAt:       sale.CreatedAt,
		UpdatedAt:       sale.UpdatedAt,
	}

	// Map sale items
	if len(sale.Items) > 0 {
		response.Items = make([]models.SaleItemResponse, len(sale.Items))
		for i, item := range sale.Items {
			response.Items[i] = models.SaleItemResponse{
				ID:              item.ID,
				ProductID:       item.ProductID,
				Quantity:        item.Quantity,
				UnitPrice:       item.UnitPrice,
				Subtotal:        item.Subtotal,
				DiscountAmount:  item.DiscountAmount,
				DiscountPercent: item.DiscountPercent,
				CreatedAt:       item.CreatedAt,
			}

			// Map product if available
			if item.Product != nil {
				response.Items[i].Product = ToProductResponse(item.Product)
			}
		}
	}

	return response
}

// func ToCreateSaleItem(req *models.AddItemToSaleRequest, saleID uuid.UUID) *models.SaleItem {
// 	productID, _ := uuid.Parse(req.ProductID)

// 	return &models.SaleItem{
// 		ID:              uuid.New(),
// 		SaleID:          saleID,
// 		ProductID:       productID,
// 		Quantity:        req.Quantity,
// 		UnitPrice:       req.UnitPrice,
// 		Subtotal:        req.Quantity * req.UnitPrice,
// 		DiscountAmount:  req.DiscountAmount,
// 		DiscountPercent: req.DiscountPercent,
// 		CreatedAt:       time.Now(),
// 	}
// }

// func ToSaleItemResponse(item *models.SaleItem) *models.SaleItemResponse {
// 	response := &models.SaleItemResponse{
// 		ID:              item.ID,
// 		ProductID:       item.ProductID,
// 		Quantity:        item.Quantity,
// 		UnitPrice:       item.UnitPrice,
// 		Subtotal:        item.Subtotal,
// 		DiscountAmount:  item.DiscountAmount,
// 		DiscountPercent: item.DiscountPercent,
// 		CreatedAt:       item.CreatedAt,
// 	}

// 	if item.Product != nil {
// 		response.Product = ToProductResponse(item.Product)
// 	}

// 	return response
// }
