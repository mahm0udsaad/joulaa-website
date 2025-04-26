-- Drop existing tables if they exist
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;

-- Create carts table with proper constraints
CREATE TABLE carts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a unique index for active carts only
CREATE UNIQUE INDEX one_active_cart_per_user 
ON carts(user_id) 
WHERE status = 'active';

-- Create cart_items table
CREATE TABLE cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    discount DECIMAL(5,2) DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_carts_status ON carts(status);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_carts_updated_at
    BEFORE UPDATE ON carts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to ensure one active cart per user
CREATE OR REPLACE FUNCTION ensure_one_active_cart()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' THEN
        -- Set all other active carts for this user to inactive
        UPDATE carts
        SET status = 'inactive'
        WHERE user_id = NEW.user_id
        AND status = 'active'
        AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce one active cart per user
CREATE TRIGGER ensure_one_active_cart_trigger
    BEFORE INSERT OR UPDATE ON carts
    FOR EACH ROW
    EXECUTE FUNCTION ensure_one_active_cart();

-- Add RLS (Row Level Security) policies
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Create policies for carts
CREATE POLICY "Users can view their own carts"
    ON carts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own carts"
    ON carts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own carts"
    ON carts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own carts"
    ON carts FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for cart_items
CREATE POLICY "Users can view their own cart items"
    ON cart_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM carts
        WHERE carts.id = cart_items.cart_id
        AND carts.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own cart items"
    ON cart_items FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM carts
        WHERE carts.id = cart_items.cart_id
        AND carts.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own cart items"
    ON cart_items FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM carts
        WHERE carts.id = cart_items.cart_id
        AND carts.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own cart items"
    ON cart_items FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM carts
        WHERE carts.id = cart_items.cart_id
        AND carts.user_id = auth.uid()
    )); 