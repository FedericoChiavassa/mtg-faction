ALTER TABLE  cards
ADD COLUMN normal_img_url TEXT NOT NULL,
ADD COLUMN normal_img_url_2 TEXT;

COMMENT ON COLUMN cards.normal_img_url_2 IS 'Back face image url';
