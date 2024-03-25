-- Ensure the UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Creating the 'device' table
CREATE TABLE device (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
);

-- Creating the 'business' table
CREATE TABLE business (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    card TEXT NOT NULL,
    refresh_token VARCHAR(255)
);

-- Creating the 'restaurant' table
CREATE TABLE restaurant (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    affordability INTEGER,
    logo_file_path VARCHAR(255) UNIQUE, -- Should be restaurant_id based: /covers/<restaurant_id>.png
    cover_file_path VARCHAR(255) UNIQUE, -- Should be restaurant_id based: /logos/<restaurant_id>.png
    FOREIGN KEY (business_id) REFERENCES business(id)
);

-- Creating the 'restaurant_address' table
CREATE TABLE restaurant_address (
    restaurant_id UUID NOT NULL UNIQUE,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    postal_code VARCHAR(255) NOT NULL,
    country_code VARCHAR(255) NOT NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurant(id)
);

-- Creating the 'menu_category' table
CREATE TABLE menu_category (
    category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL,
    label VARCHAR(255) NOT NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurant(id)
);

-- Creating the 'menu_item' table
CREATE TABLE menu_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL,
    image VARCHAR(255) NOT NULL UNIQUE, -- Should be restaurant_id based: /menu_items/<menu_item_id>.png
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    price_amount NUMERIC(10, 2) NOT NULL,
    price_currency VARCHAR(255) NOT NULL,
    FOREIGN KEY (category_id) REFERENCES menu_category(category_id)
);

-- Creating the 'waiter' table
CREATE TABLE waiter (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(255),
    FOREIGN KEY (restaurant_id) REFERENCES restaurant(id)
);

-- Creating the 'restaurant_table' table
CREATE TABLE restaurant_table (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL,
    label VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurant(id)
);

-- Creating the 'orders' table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paid BOOLEAN DEFAULT FALSE NOT NULL,
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL
);

-- Creating the 'ongoing_table_orders' table
CREATE TABLE ongoing_table_orders (
    table_id UUID NOT NULL,
    order_id UUID NOT NULL UNIQUE,
    FOREIGN KEY (table_id) REFERENCES restaurant_table(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Creating the 'order_items' table
CREATE TABLE order_items (
    order_id UUID NOT NULL,
    item_id UUID NOT NULL,
    amount INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (item_id) REFERENCES menu_item(id)
);
