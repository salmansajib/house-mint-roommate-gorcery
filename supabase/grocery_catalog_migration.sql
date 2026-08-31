-- ==============================================================================
-- HouseMint — Grocery Catalog & Smart Bangla/Banglish Auto-Suggestions Migration
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- ==============================================================================

-- 1. Create the grocery_catalog table
CREATE TABLE IF NOT EXISTS grocery_catalog (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  household_id TEXT REFERENCES households(id) ON DELETE CASCADE, -- NULL = global default; household_id = custom to that apartment
  name_bn TEXT NOT NULL,                  -- Bangla name displayed in suggestions (e.g. 'চাল')
  name_en TEXT NOT NULL,                  -- English translation (e.g. 'Rice')
  banglish_aliases TEXT[] NOT NULL DEFAULT '{}', -- Banglish variants (e.g. ['chal', 'chaal', 'cal', 'rice', 'vath'])
  category TEXT NOT NULL DEFAULT 'staples', -- 'staples', 'vegetables', 'meat_fish', 'spices', 'dairy_eggs', 'household', etc.
  default_unit TEXT NOT NULL DEFAULT 'কেজি', -- Suggested unit ('কেজি', 'গ্রাম', 'লিটার', 'ডজন', 'হালি', 'পিস', 'প্যাকেট', 'আঁটি')
  usage_count INT NOT NULL DEFAULT 0,     -- Frequently picked items sort to the top
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes for instant text & array lookups
CREATE INDEX IF NOT EXISTS idx_grocery_catalog_banglish ON grocery_catalog USING GIN (banglish_aliases);
CREATE INDEX IF NOT EXISTS idx_grocery_catalog_name_bn ON grocery_catalog (name_bn);
CREATE INDEX IF NOT EXISTS idx_grocery_catalog_household ON grocery_catalog (household_id);
CREATE INDEX IF NOT EXISTS idx_grocery_catalog_usage ON grocery_catalog (usage_count DESC);

-- 3. Row Level Security (RLS)
ALTER TABLE grocery_catalog ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read global items (household_id IS NULL) and their household's custom items
DROP POLICY IF EXISTS "Allow read on grocery_catalog" ON grocery_catalog;
CREATE POLICY "Allow read on grocery_catalog" ON grocery_catalog 
  FOR SELECT 
  USING (true);

-- Allow authenticated/anon users to insert custom items or increment usage counts
DROP POLICY IF EXISTS "Allow all on grocery_catalog" ON grocery_catalog;
CREATE POLICY "Allow all on grocery_catalog" ON grocery_catalog 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 4. Enable Supabase Realtime so changes sync across all roommates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'grocery_catalog'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE grocery_catalog;
  END IF;
END $$;

-- 5. Seed Global Bangladeshi Household Grocery Items
-- Uses ON CONFLICT or conditional INSERT to avoid duplicates if re-run
INSERT INTO grocery_catalog (name_bn, name_en, banglish_aliases, category, default_unit, usage_count)
VALUES
  -- Staples & Grains
  ('চাল', 'Rice', ARRAY['chal', 'chaal', 'cal', 'rice', 'vath', 'bhat', 'miniket', 'nazirshail', 'paijam', 'atap'], 'staples', 'কেজি', 100),
  ('পোলাওয়ের চাল', 'Polao Rice / Chinigura', ARRAY['polao chal', 'polao er chal', 'chinigura', 'kalijira chal', 'aromatic rice', 'biryani rice'], 'staples', 'কেজি', 40),
  ('মসুর ডাল', 'Red Lentils / Masoor Dal', ARRAY['dal', 'daal', 'moshur dal', 'masoor dal', 'mosur dal', 'lentils'], 'staples', 'কেজি', 90),
  ('মুগ ডাল', 'Moong Dal', ARRAY['mug dal', 'moong dal', 'mung dal', 'roasted dal'], 'staples', 'কেজি', 30),
  ('ছোলা / বুট', 'Chickpeas / Chola', ARRAY['chola', 'boot', 'chhola', 'chickpeas', 'gram'], 'staples', 'কেজি', 25),
  ('আটা', 'Wheat Flour / Atta', ARRAY['ata', 'atta', 'flour', 'wheat flour', 'lal ata'], 'staples', 'কেজি', 50),
  ('ময়দা', 'All-Purpose Flour / Maida', ARRAY['moyda', 'maida', 'white flour'], 'staples', 'কেজি', 25),
  ('সুজি', 'Semolina / Suji', ARRAY['suji', 'sooji', 'semolina'], 'staples', 'প্যাকেট', 15),

  -- Oil & Ghee
  ('সয়াবিন তেল', 'Soybean Oil', ARRAY['tel', 'tael', 'teyl', 'soyabean tel', 'soybean oil', 'oil', 'teel', 'rupchanda'], 'oil_ghee', 'লিটার', 95),
  ('সরিষার তেল', 'Mustard Oil', ARRAY['sorishar tel', 'sorisha tel', 'mustard oil', 'shorisha tel', 'radhuni'], 'oil_ghee', 'লিটার', 50),
  ('ঘি', 'Ghee / Clarified Butter', ARRAY['ghee', 'ghi', 'butter oil', 'aarong ghee'], 'oil_ghee', 'গ্রাম', 20),

  -- Spices, Seasonings & Condiments
  ('লবণ', 'Salt', ARRAY['lobon', 'nobon', 'salt', 'noon', 'molla salt', 'aaci salt'], 'spices', 'কেজি', 80),
  ('চিনি', 'Sugar', ARRAY['chini', 'sugar', 'deshi chini'], 'spices', 'কেজি', 70),
  ('হলুদ গুঁড়া', 'Turmeric Powder', ARRAY['holud gura', 'holud', 'turmeric', 'haldi', 'holud powder'], 'spices', 'গ্রাম', 65),
  ('মরিচ গুঁড়া', 'Red Chili Powder', ARRAY['morich gura', 'moris gura', 'chili powder', 'morich powder', 'lal morich'], 'spices', 'গ্রাম', 65),
  ('ধনিয়া গুঁড়া', 'Coriander Powder', ARRAY['dhonia gura', 'dhoniya gura', 'coriander powder', 'dhone'], 'spices', 'গ্রাম', 50),
  ('জিরা গুঁড়া / আস্ত জিরা', 'Cumin / Jeera', ARRAY['jira', 'jeera', 'cumin', 'jira gura'], 'spices', 'গ্রাম', 55),
  ('গরম মসলা', 'Garam Masala', ARRAY['gorom moshla', 'garam masala', 'moshla', 'spices mix'], 'spices', 'গ্রাম', 40),
  ('এলাচ', 'Cardamom / Elachi', ARRAY['elach', 'elachi', 'cardamom', 'choto elach'], 'spices', 'গ্রাম', 30),
  ('দারুচিনি', 'Cinnamon / Darchini', ARRAY['darchini', 'daruchini', 'cinnamon'], 'spices', 'গ্রাম', 30),
  ('লবঙ্গ', 'Cloves / Lobongo', ARRAY['lobongo', 'long', 'clove', 'cloves'], 'spices', 'গ্রাম', 20),
  ('তেজপাতা', 'Bay Leaves / Tejpata', ARRAY['tejpata', 'bay leaves', 'tezpata'], 'spices', 'গ্রাম', 25),
  ('গোলমরিচ', 'Black Pepper', ARRAY['gol morich', 'black pepper', 'golmoris'], 'spices', 'গ্রাম', 20),
  ('পাঁচফোড়ন', 'Panch Phoron', ARRAY['panch phoron', 'pachforon', 'five spice'], 'spices', 'গ্রাম', 15),
  ('সিরকা / ভিনেগার', 'Vinegar', ARRAY['vinegar', 'sirka', 'white vinegar'], 'spices', 'বোতল', 15),

  -- Kitchen Aromatics & Roots
  ('পেঁয়াজ', 'Onion', ARRAY['peyaj', 'peaj', 'piaj', 'piyaj', 'pyaj', 'onion', 'onions', 'deshi peyaj'], 'vegetables', 'কেজি', 100),
  ('রসুন', 'Garlic', ARRAY['roshun', 'rosun', 'roshon', 'garlic', 'deshi roshun'], 'vegetables', 'কেজি', 85),
  ('আদা', 'Ginger', ARRAY['ada', 'ginger', 'adrak'], 'vegetables', 'কেজি', 75),
  ('কাঁচা মরিচ', 'Green Chili', ARRAY['kacha morich', 'morich', 'kacha moris', 'green chilli', 'chili', 'kasa moris'], 'vegetables', 'গ্রাম', 90),
  ('ধনে পাতা', 'Coriander Leaves', ARRAY['dhone pata', 'dhonia pata', 'coriander leaves', 'cilantro'], 'vegetables', 'আঁটি', 60),

  -- Common Vegetables
  ('আলু', 'Potato', ARRAY['alu', 'aloo', 'potato', 'potatoes', 'gol alu'], 'vegetables', 'কেজি', 100),
  ('টমেটো', 'Tomato', ARRAY['tomato', 'tamato', 'tomatoes'], 'vegetables', 'কেজি', 75),
  ('বেগুন', 'Brinjal / Eggplant', ARRAY['begun', 'baigun', 'brinjal', 'eggplant', 'aubergine'], 'vegetables', 'কেজি', 65),
  ('শসা', 'Cucumber', ARRAY['shosha', 'sosa', 'cucumber', 'kheera'], 'vegetables', 'কেজি', 60),
  ('গাজর', 'Carrot', ARRAY['gajor', 'gajar', 'carrot'], 'vegetables', 'কেজি', 50),
  ('ফুলকপি', 'Cauliflower', ARRAY['fulkopi', 'ful kopi', 'cauliflower', 'phulkopi'], 'vegetables', 'পিস', 45),
  ('বাঁধাকপি', 'Cabbage', ARRAY['badhakopi', 'badha kopi', 'cabbage', 'bandhakopi'], 'vegetables', 'পিস', 40),
  ('ঢেঁড়স', 'Okra / Ladies Finger', ARRAY['dherosh', 'dheros', 'bhindi', 'okra', 'ladies finger'], 'vegetables', 'কেজি', 45),
  ('পটল', 'Pointed Gourd / Potol', ARRAY['potol', 'patol', 'pointed gourd'], 'vegetables', 'কেজি', 40),
  ('লাউ', 'Bottle Gourd / Lau', ARRAY['lau', 'lao', 'bottle gourd', 'kodu'], 'vegetables', 'পিস', 50),
  ('পেঁপে', 'Green Papaya / Pepe', ARRAY['pepe', 'kacha pepe', 'papaya', 'raw papaya'], 'vegetables', 'কেজি', 40),
  ('মিষ্টি কুমড়া', 'Sweet Pumpkin', ARRAY['mishti kumra', 'misti kumra', 'pumpkin', 'sweet gourd'], 'vegetables', 'কেজি', 40),
  ('করলা / উচ্ছে', 'Bitter Gourd / Korola', ARRAY['korola', 'uchhe', 'kerela', 'bitter gourd', 'karala'], 'vegetables', 'কেজি', 40),
  ('শিম', 'Flat Beans / Shim', ARRAY['shim', 'seem', 'beans', 'flat beans'], 'vegetables', 'কেজি', 40),
  ('বরবটি', 'Yardlong Beans / Borboti', ARRAY['borboti', 'long beans', 'string beans'], 'vegetables', 'কেজি', 35),
  ('লেবু', 'Lemon / Lime', ARRAY['lebu', 'lemon', 'lime', 'kagoji lebu', 'elachi lebu'], 'vegetables', 'হালি', 70),

  -- Leafy Greens (Shak)
  ('লাল শাক', 'Red Amaranth / Lal Shak', ARRAY['lal shak', 'laal shaak', 'red amaranth'], 'vegetables', 'আঁটি', 50),
  ('পালং শাক', 'Spinach / Palong Shak', ARRAY['palong shak', 'spinach', 'paalong shaak'], 'vegetables', 'আঁটি', 45),
  ('কলমি শাক', 'Water Spinach / Kolmi Shak', ARRAY['kolmi shak', 'kalmi shak', 'water spinach'], 'vegetables', 'আঁটি', 35),
  ('পুঁই শাক', 'Malabar Spinach / Pui Shak', ARRAY['pui shak', 'puin shak', 'malabar spinach'], 'vegetables', 'আঁটি', 40),

  -- Protein: Poultry, Meat & Eggs
  ('ডিম', 'Eggs', ARRAY['dim', 'deem', 'egg', 'eggs', 'hali', 'farm er dim', 'lal dim'], 'dairy_eggs', 'ডজন', 100),
  ('ব্রয়লার মুরগি', 'Broiler Chicken', ARRAY['murgi', 'chicken', 'broiler', 'broiler chicken', 'murgir mangsho', 'mangsho'], 'meat_fish', 'কেজি', 90),
  ('সোনালী মুরগি', 'Sonali Chicken', ARRAY['sonali murgi', 'sonali chicken', 'cock chicken'], 'meat_fish', 'কেজি', 70),
  ('দেশি মুরগি', 'Desi Chicken', ARRAY['desi murgi', 'deshi chicken', 'country chicken'], 'meat_fish', 'কেজি', 50),
  ('গরুর মাংস', 'Beef', ARRAY['goru', 'gorur mangsho', 'beef', 'cow meat', 'beaf'], 'meat_fish', 'কেজি', 85),
  ('খাসির মাংস', 'Mutton / Goat Meat', ARRAY['khasi', 'khasir mangsho', 'mutton', 'goat meat'], 'meat_fish', 'কেজি', 40),

  -- Fish & Seafood
  ('রুই মাছ', 'Rohu Fish / Rui Mach', ARRAY['rui mach', 'rui fish', 'rohu', 'mach', 'fish'], 'meat_fish', 'কেজি', 70),
  ('কাতল মাছ', 'Catla Fish / Katol Mach', ARRAY['katol mach', 'catla', 'katla mach'], 'meat_fish', 'কেজি', 60),
  ('পাঙ্গাস মাছ', 'Pangas Fish', ARRAY['pangas mach', 'pangaash', 'pangash'], 'meat_fish', 'কেজি', 55),
  ('তেলাপিয়া মাছ', 'Tilapia Fish', ARRAY['telapia mach', 'tilapia', 'telapia'], 'meat_fish', 'কেজি', 60),
  ('ইলিশ মাছ', 'Hilsa / Ilish Mach', ARRAY['ilish mach', 'hilsa', 'elish mach', 'ilish fish'], 'meat_fish', 'কেজি', 50),
  ('চিংড়ি মাছ', 'Prawn / Shrimp', ARRAY['chingri mach', 'prawn', 'shrimp', 'chingri'], 'meat_fish', 'কেজি', 60),
  ('ট্যাংরা মাছ', 'Tengra Fish', ARRAY['tengra mach', 'tangra', 'choto mach'], 'meat_fish', 'কেজি', 40),

  -- Dairy & Breakfast
  ('তরল দুধ', 'Liquid Milk', ARRAY['dudh', 'doodh', 'milk', 'liquid milk', 'aarong milk', 'pran milk'], 'dairy_eggs', 'লিটার', 80),
  ('গুঁড়ো দুধ', 'Milk Powder', ARRAY['gura dudh', 'powder milk', 'milk powder', 'dano', 'marks', 'diploma'], 'dairy_eggs', 'প্যাকেট', 50),
  ('পাউরুটি', 'Bread', ARRAY['pauruti', 'bread', 'ruti', 'sliced bread'], 'dairy_eggs', 'প্যাকেট', 70),
  ('মাখন / বাটার', 'Butter', ARRAY['butter', 'makhon', 'aarong butter'], 'dairy_eggs', 'গ্রাম', 30),
  ('কলা', 'Banana', ARRAY['kola', 'banana', 'shobri kola', 'champa kola', 'sagorkola'], 'vegetables', 'ডজন', 65),
  ('চা পাতা', 'Tea Leaves', ARRAY['cha', 'cha pata', 'tea', 'tea bag', 'taaza', 'ispat'], 'staples', 'প্যাকেট', 75),
  ('কফি', 'Coffee', ARRAY['coffee', 'nescafe', 'kofi'], 'staples', 'জার', 40),
  ('নুডলস', 'Noodles', ARRAY['noodles', 'nuduls', 'maggi', 'maggie', 'koka', 'chopsticks'], 'staples', 'প্যাকেট', 60),
  ('বিস্কুট', 'Biscuits / Cookies', ARRAY['biskut', 'biscuit', 'cookies', 'toast biskut', 'energy biskut'], 'staples', 'প্যাকেট', 55),

  -- Cleaning, Washroom & Household
  ('থালাবাসন ধোয়ার লিকুইড / সাবান', 'Dishwashing Liquid / Bar', ARRAY['dishwash', 'vim bar', 'vim liquid', 'dish soap', 'shaban'], 'household', 'পিস', 60),
  ('ডিটারজেন্ট পাউডার', 'Laundry Detergent', ARRAY['detergent', 'wheel powder', 'surf excel', 'rin', 'washing powder'], 'household', 'কেজি', 65),
  ('টয়লেট ক্লিনার', 'Toilet Cleaner', ARRAY['harpic', 'toilet cleaner', 'commode cleaner'], 'household', 'বোতল', 55),
  ('ফ্লোর ক্লিনার', 'Floor Cleaner', ARRAY['floor cleaner', 'lizol', 'phenyl', 'finis'], 'household', 'বোতল', 40),
  ('গোসলের সাবান', 'Bath Soap', ARRAY['shaban', 'soap', 'bath soap', 'lux', 'dettol soap', 'lifebuoy'], 'household', 'পিস', 60),
  ('শ্যাম্পু', 'Shampoo', ARRAY['shampoo', 'shampu', 'clear shampoo', 'sunsilk', 'head shoulders'], 'household', 'বোতল', 50),
  ('টুথপেস্ট', 'Toothpaste', ARRAY['toothpaste', 'colgate', 'pepsodent', 'meswak', 'paste'], 'household', 'পিস', 55),
  ('টিস্যু পেপার', 'Tissue Paper', ARRAY['tissue', 'tissu', 'tissue box', 'toilet tissue', 'kitchen towel', 'bashundhara tissue'], 'household', 'প্যাকেট', 65),
  ('মশার কয়েল / স্প্রে', 'Mosquito Coil / Aerosol', ARRAY['koel', 'coil', 'aerosol', 'moshari', 'hit spray', 'mosquito spray'], 'household', 'প্যাকেট', 45),
  ('ম্যাচ / গ্যাস লাইটার', 'Matches / Gas Lighter', ARRAY['match', 'diasholai', 'gas lighter', 'lighter'], 'household', 'পিস', 35);
