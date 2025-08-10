-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    address TEXT,
    customer_type VARCHAR(20) NOT NULL DEFAULT 'individual',
    inventory_id UUID NOT NULL,    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY,
    sale_number VARCHAR(50) NOT NULL,
    customer_id UUID,
    customer_name VARCHAR(100) NOT NULL,
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_amount INTEGER NOT NULL DEFAULT 0,
    balance INTEGER NOT NULL DEFAULT 0,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    discount_amount INTEGER NOT NULL DEFAULT 0,
    discount_percent INTEGER NOT NULL DEFAULT 0,
    inventory_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sales_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY,
    sale_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit_price INTEGER NOT NULL,
    subtotal INTEGER NOT NULL,
    discount_amount INTEGER NOT NULL DEFAULT 0,
    discount_percent INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sale_items_sale FOREIGN KEY (sale_id) REFERENCES sales (id) ON DELETE CASCADE,
    CONSTRAINT fk_sale_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_customers_inventory_id ON customers (inventory_id);
CREATE INDEX IF NOT EXISTS idx_sales_inventory_id ON sales (inventory_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_customers_inventory_id;
DROP INDEX IF EXISTS idx_sales_inventory_id;

DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
-- +goose StatementEnd
