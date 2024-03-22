-- Ensure the UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Creating the 'device' table
CREATE TABLE device (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
);

-- Creating the 'business' table
CREATE TABLE business (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT,
    password TEXT,
    name TEXT,
    card TEXT,
    refresh_token TEXT
);

-- Creating the 'restaurant' table
CREATE TABLE restaurant (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID,
    name TEXT,
    description TEXT,
    affordability INTEGER,
    logo_file_name TEXT,
    cover_file_name TEXT,
    FOREIGN KEY (business_id) REFERENCES business(id)
);

-- Creating the 'restaurant_address' table
CREATE TABLE restaurant_address (
    restaurant_id UUID,
    latitude NUMERIC,
    longitude NUMERIC,
    address_line TEXT,
    locality TEXT,
    postal_code TEXT,
    country_code TEXT,
    FOREIGN KEY (restaurant_id) REFERENCES restaurant(id)
);

-- Creating the 'menu_category' table
CREATE TABLE menu_category (
    category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID,
    label TEXT,
    FOREIGN KEY (restaurant_id) REFERENCES restaurant(id)
);

-- Creating the 'menu_item' table
CREATE TABLE menu_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID,
    name TEXT,
    description TEXT,
    ingredients TEXT,
    price_amount NUMERIC,
    price_currency TEXT,
    FOREIGN KEY (category_id) REFERENCES menu_category(category_id)
);

-- Creating the 'waiter' table
CREATE TABLE waiter (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID,
    username TEXT,
    password TEXT,
    FOREIGN KEY (restaurant_id) REFERENCES restaurant(id)
);

-- Creating the 'restaurant_table' table
CREATE TABLE restaurant_table (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID,
    label TEXT,
    capacity NUMERIC,
    FOREIGN KEY (restaurant_id) REFERENCES restaurant(id)
);

-- Creating the 'orders' table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paid BOOLEAN DEFAULT FALSE,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT now()
);

-- Creating the 'ongoing_table_orders' table
CREATE TABLE ongoing_table_orders (
    table_id UUID,
    order_id UUID,
    FOREIGN KEY (table_id) REFERENCES restaurant_table(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Creating the 'order_items' table
CREATE TABLE order_items (
    order_id UUID,
    item_id UUID,
    amount NUMERIC,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (item_id) REFERENCES menu_item(id)
);
