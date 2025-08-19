package mapper

import (
	"time"

	"github.com/app/venside/internal/models"
	"github.com/google/uuid"
)

func ToCreatePurchase(req *models.PurchaseRequest, inventoryID uuid.UUID) *models.Purchase {
	purchaseDate := time.Now()
	if req.PurchaseDate != nil {
		purchaseDate = *req.PurchaseDate
	}

	var vendorID *uuid.UUID
	if req.VendorID != nil {
		parsedID, _ := uuid.Parse(*req.VendorID)
		vendorID = &parsedID
	}

	vendorName := ""
	if req.VendorName != nil {
		vendorName = *req.VendorName
	}

	purchase := &models.Purchase{
		ID:              uuid.New(),
		VendorID:        vendorID,
		VendorName:      vendorName,
		PurchaseDate:    purchaseDate,
		Eta:             req.Eta,
		ShippingCost:    req.ShippingCost,
		TotalAmount:     req.TotalAmount,
		PaymentStatus:   req.PaymentStatus,
		PurchaseStatus:  req.PurchaseStatus,
		DiscountAmount:  req.DiscountAmount,
		DiscountPercent: req.DiscountPercent,
		InventoryID:     inventoryID,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	// Create purchase items
	purchase.Items = make([]models.PurchaseItem, len(req.Items))
	for i, itemReq := range req.Items {
		productID, _ := uuid.Parse(itemReq.ProductID)

		purchase.Items[i] = models.PurchaseItem{
			ID:         uuid.New(),
			PurchaseID: purchase.ID,
			ProductID:  productID,
			Quantity:   itemReq.Quantity,
			UnitPrice:  itemReq.UnitPrice,
			Subtotal:   itemReq.Subtotal,
			CreatedAt:  time.Now(),
		}
	}

	return purchase
}

func ToEditPurchase(req *models.PurchaseRequest, existing *models.Purchase) *models.Purchase {
	purchaseDate := existing.PurchaseDate
	if req.PurchaseDate != nil {
		purchaseDate = *req.PurchaseDate
	}

	var vendorID *uuid.UUID
	if req.VendorID != nil {
		parsedID, _ := uuid.Parse(*req.VendorID)
		vendorID = &parsedID
	}

	vendorName := existing.VendorName
	if req.VendorName != nil {
		vendorName = *req.VendorName
	}

	return &models.Purchase{
		ID:              existing.ID,
		PurchaseNumber:  existing.PurchaseNumber,
		VendorID:        vendorID,
		VendorName:      vendorName,
		PurchaseDate:    purchaseDate,
		Eta:             req.Eta,
		DeliveryDate:    existing.DeliveryDate,
		ShippingCost:    req.ShippingCost,
		TotalAmount:     req.TotalAmount,
		PaymentStatus:   req.PaymentStatus,
		PurchaseStatus:  req.PurchaseStatus,
		DiscountAmount:  req.DiscountAmount,
		DiscountPercent: req.DiscountPercent,
		InventoryID:     existing.InventoryID,
		CreatedAt:       existing.CreatedAt,
		UpdatedAt:       time.Now(),
		Items:           existing.Items,
	}
}

func ToPurchaseResponse(purchase *models.Purchase) *models.PurchaseResponse {
	response := &models.PurchaseResponse{
		ID:              purchase.ID,
		PurchaseNumber:  purchase.PurchaseNumber,
		VendorID:        purchase.VendorID,
		VendorName:      purchase.VendorName,
		PurchaseDate:    purchase.PurchaseDate,
		Eta:             purchase.Eta,
		DeliveryDate:    purchase.DeliveryDate,
		ShippingCost:    purchase.ShippingCost,
		TotalAmount:     purchase.TotalAmount,
		PaymentStatus:   purchase.PaymentStatus,
		PurchaseStatus:  purchase.PurchaseStatus,
		DiscountAmount:  purchase.DiscountAmount,
		DiscountPercent: purchase.DiscountPercent,
		CreatedAt:       purchase.CreatedAt,
		UpdatedAt:       purchase.UpdatedAt,
	}

	// Map purchase items
	if len(purchase.Items) > 0 {
		response.Items = make([]models.PurchaseItemResponse, len(purchase.Items))
		for i, item := range purchase.Items {
			response.Items[i] = models.PurchaseItemResponse{
				ID:        item.ID,
				ProductID: item.ProductID,
				Quantity:  item.Quantity,
				UnitPrice: item.UnitPrice,
				Subtotal:  item.Subtotal,
				CreatedAt: item.CreatedAt,
			}

			// Map product if available
			if item.Product != nil {
				response.Items[i].Product = ToProductResponse(item.Product)
			}
		}
	}

	return response
}

func ToPurchaseItemResponse(item *models.PurchaseItem) *models.PurchaseItemResponse {
	return &models.PurchaseItemResponse{
		ID:        item.ID,
		ProductID: item.ProductID,
		Quantity:  item.Quantity,
		UnitPrice: item.UnitPrice,
		Subtotal:  item.Subtotal,
		CreatedAt: item.CreatedAt,
		Product:   ToProductResponse(item.Product),
	}
}
