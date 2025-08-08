-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    capacity INTEGER NOT NULL DEFAULT 0,
    storage_type VARCHAR(100) NOT NULL,
    is_main BOOLEAN DEFAULT false,
    manager VARCHAR(255),
    phone TEXT,       
    email TEXT,       
    inventory_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (name, inventory_id),
    CONSTRAINT fk_warehouses_inventory FOREIGN KEY (inventory_id) REFERENCES inventories (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS warehouse_product_link (
    product_id UUID NOT NULL,
    warehouse_id UUID NOT NULL,
    quantity_in_stock INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (product_id, warehouse_id),
    CONSTRAINT fk_warehouse_product_link_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT fk_warehouse_product_link_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_warehouses_inventory ON warehouses (inventory_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_product_link_warehouse ON warehouse_product_link (warehouse_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_product_link_product ON warehouse_product_link (product_id);
-- +goose StatementEnd


-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS warehouse_product_link CASCADE; 
DROP TABLE IF EXISTS warehouses CASCADE;

DROP INDEX IF EXISTS idx_warehouse_product_link_product;
DROP INDEX IF EXISTS idx_warehouse_product_link_warehouse;
DROP INDEX IF EXISTS idx_warehouses_inventory;
-- +goose StatementEnd