import { GroceryCatalogItem } from "@/types";

/**
 * Built-in default grocery catalog for Bangladeshi households.
 * Used as local fallback and instant client-side cache.
 */
export const DEFAULT_GROCERY_CATALOG: GroceryCatalogItem[] = [
  // Staples & Grains
  {
    id: "staple-rice",
    name_bn: "চাল",
    name_en: "Rice",
    banglish_aliases: ["chal", "chaal", "cal", "rice", "vath", "bhat", "miniket", "nazirshail", "paijam", "atap"],
    category: "staples",
    default_unit: "কেজি",
    usage_count: 100,
  },
  {
    id: "staple-polao-rice",
    name_bn: "পোলাওয়ের চাল",
    name_en: "Polao Rice / Chinigura",
    banglish_aliases: ["polao chal", "polao er chal", "chinigura", "kalijira chal", "aromatic rice", "biryani rice"],
    category: "staples",
    default_unit: "কেজি",
    usage_count: 40,
  },
  {
    id: "staple-masoor-dal",
    name_bn: "মসুর ডাল",
    name_en: "Red Lentils / Masoor Dal",
    banglish_aliases: ["dal", "daal", "moshur dal", "masoor dal", "mosur dal", "lentils"],
    category: "staples",
    default_unit: "কেজি",
    usage_count: 90,
  },
  {
    id: "staple-moong-dal",
    name_bn: "মুগ ডাল",
    name_en: "Moong Dal",
    banglish_aliases: ["mug dal", "moong dal", "mung dal", "roasted dal"],
    category: "staples",
    default_unit: "কেজি",
    usage_count: 30,
  },
  {
    id: "staple-chola",
    name_bn: "ছোলা / বুট",
    name_en: "Chickpeas / Chola",
    banglish_aliases: ["chola", "boot", "chhola", "chickpeas", "gram"],
    category: "staples",
    default_unit: "কেজি",
    usage_count: 25,
  },
  {
    id: "staple-atta",
    name_bn: "আটা",
    name_en: "Wheat Flour / Atta",
    banglish_aliases: ["ata", "atta", "flour", "wheat flour", "lal ata"],
    category: "staples",
    default_unit: "কেজি",
    usage_count: 50,
  },
  {
    id: "staple-maida",
    name_bn: "ময়দা",
    name_en: "All-Purpose Flour / Maida",
    banglish_aliases: ["moyda", "maida", "white flour"],
    category: "staples",
    default_unit: "কেজি",
    usage_count: 25,
  },
  {
    id: "staple-suji",
    name_bn: "সুজি",
    name_en: "Semolina / Suji",
    banglish_aliases: ["suji", "sooji", "semolina"],
    category: "staples",
    default_unit: "প্যাকেট",
    usage_count: 15,
  },

  // Oil & Ghee
  {
    id: "oil-soybean",
    name_bn: "সয়াবিন তেল",
    name_en: "Soybean Oil",
    banglish_aliases: ["tel", "tael", "teyl", "soyabean tel", "soybean oil", "oil", "teel", "rupchanda"],
    category: "oil_ghee",
    default_unit: "লিটার",
    usage_count: 95,
  },
  {
    id: "oil-mustard",
    name_bn: "সরিষার তেল",
    name_en: "Mustard Oil",
    banglish_aliases: ["sorishar tel", "sorisha tel", "mustard oil", "shorisha tel", "radhuni"],
    category: "oil_ghee",
    default_unit: "লিটার",
    usage_count: 50,
  },
  {
    id: "oil-ghee",
    name_bn: "ঘি",
    name_en: "Ghee / Clarified Butter",
    banglish_aliases: ["ghee", "ghi", "butter oil", "aarong ghee"],
    category: "oil_ghee",
    default_unit: "গ্রাম",
    usage_count: 20,
  },

  // Spices, Seasonings & Condiments
  {
    id: "spice-salt",
    name_bn: "লবণ",
    name_en: "Salt",
    banglish_aliases: ["lobon", "nobon", "salt", "noon", "molla salt", "aaci salt"],
    category: "spices",
    default_unit: "কেজি",
    usage_count: 80,
  },
  {
    id: "spice-sugar",
    name_bn: "চিনি",
    name_en: "Sugar",
    banglish_aliases: ["chini", "sugar", "deshi chini"],
    category: "spices",
    default_unit: "কেজি",
    usage_count: 70,
  },
  {
    id: "spice-turmeric",
    name_bn: "হলুদ গুঁড়া",
    name_en: "Turmeric Powder",
    banglish_aliases: ["holud gura", "holud", "turmeric", "haldi", "holud powder"],
    category: "spices",
    default_unit: "গ্রাম",
    usage_count: 65,
  },
  {
    id: "spice-chili-powder",
    name_bn: "মরিচ গুঁড়া",
    name_en: "Red Chili Powder",
    banglish_aliases: ["morich gura", "moris gura", "chili powder", "morich powder", "lal morich"],
    category: "spices",
    default_unit: "গ্রাম",
    usage_count: 65,
  },
  {
    id: "spice-coriander-powder",
    name_bn: "ধনিয়া গুঁড়া",
    name_en: "Coriander Powder",
    banglish_aliases: ["dhonia gura", "dhoniya gura", "coriander powder", "dhone"],
    category: "spices",
    default_unit: "গ্রাম",
    usage_count: 50,
  },
  {
    id: "spice-cumin",
    name_bn: "জিরা গুঁড়া / আস্ত জিরা",
    name_en: "Cumin / Jeera",
    banglish_aliases: ["jira", "jeera", "cumin", "jira gura"],
    category: "spices",
    default_unit: "গ্রাম",
    usage_count: 55,
  },
  {
    id: "spice-garam-masala",
    name_bn: "গরম মসলা",
    name_en: "Garam Masala",
    banglish_aliases: ["gorom moshla", "garam masala", "moshla", "spices mix"],
    category: "spices",
    default_unit: "গ্রাম",
    usage_count: 40,
  },
  {
    id: "spice-cardamom",
    name_bn: "এলাচ",
    name_en: "Cardamom / Elachi",
    banglish_aliases: ["elach", "elachi", "cardamom", "choto elach"],
    category: "spices",
    default_unit: "গ্রাম",
    usage_count: 30,
  },
  {
    id: "spice-cinnamon",
    name_bn: "দারুচিনি",
    name_en: "Cinnamon / Darchini",
    banglish_aliases: ["darchini", "daruchini", "cinnamon"],
    category: "spices",
    default_unit: "গ্রাম",
    usage_count: 30,
  },
  {
    id: "spice-cloves",
    name_bn: "লবঙ্গ",
    name_en: "Cloves / Lobongo",
    banglish_aliases: ["lobongo", "long", "clove", "cloves"],
    category: "spices",
    default_unit: "গ্রাম",
    usage_count: 20,
  },
  {
    id: "spice-bay-leaves",
    name_bn: "তেজপাতা",
    name_en: "Bay Leaves / Tejpata",
    banglish_aliases: ["tejpata", "bay leaves", "tezpata"],
    category: "spices",
    default_unit: "গ্রাম",
    usage_count: 25,
  },
  {
    id: "spice-black-pepper",
    name_bn: "গোলমরিচ",
    name_en: "Black Pepper",
    banglish_aliases: ["gol morich", "black pepper", "golmoris"],
    category: "spices",
    default_unit: "গ্রাম",
    usage_count: 20,
  },
  {
    id: "spice-panch-phoron",
    name_bn: "পাঁচফোড়ন",
    name_en: "Panch Phoron",
    banglish_aliases: ["panch phoron", "pachforon", "five spice"],
    category: "spices",
    default_unit: "গ্রাম",
    usage_count: 15,
  },

  // Kitchen Aromatics & Roots
  {
    id: "veg-onion",
    name_bn: "পেঁয়াজ",
    name_en: "Onion",
    banglish_aliases: ["peyaj", "peaj", "piaj", "piyaj", "pyaj", "onion", "onions", "deshi peyaj"],
    category: "vegetables",
    default_unit: "কেজি",
    usage_count: 100,
  },
  {
    id: "veg-garlic",
    name_bn: "রসুন",
    name_en: "Garlic",
    banglish_aliases: ["roshun", "rosun", "roshon", "garlic", "deshi roshun"],
    category: "vegetables",
    default_unit: "কেজি",
    usage_count: 85,
  },
  {
    id: "veg-ginger",
    name_bn: "আদা",
    name_en: "Ginger",
    banglish_aliases: ["ada", "ginger", "adrak"],
    category: "vegetables",
    default_unit: "কেজি",
    usage_count: 75,
  },
  {
    id: "veg-green-chili",
    name_bn: "কাঁচা মরিচ",
    name_en: "Green Chili",
    banglish_aliases: ["kacha morich", "morich", "kacha moris", "green chilli", "chili", "kasa moris"],
    category: "vegetables",
    default_unit: "গ্রাম",
    usage_count: 90,
  },
  {
    id: "veg-coriander-leaves",
    name_bn: "ধনে পাতা",
    name_en: "Coriander Leaves",
    banglish_aliases: ["dhone pata", "dhonia pata", "coriander leaves", "cilantro"],
    category: "vegetables",
    default_unit: "আঁটি",
    usage_count: 60,
  },

  // Common Vegetables
  {
    id: "veg-potato",
    name_bn: "আলু",
    name_en: "Potato",
    banglish_aliases: ["alu", "aloo", "potato", "potatoes", "gol alu"],
    category: "vegetables",
    default_unit: "কেজি",
    usage_count: 100,
  },
  {
    id: "veg-tomato",
    name_bn: "টমেটো",
    name_en: "Tomato",
    banglish_aliases: ["tomato", "tamato", "tomatoes"],
    category: "vegetables",
    default_unit: "কেজি",
    usage_count: 75,
  },
  {
    id: "veg-brinjal",
    name_bn: "বেগুন",
    name_en: "Brinjal / Eggplant",
    banglish_aliases: ["begun", "baigun", "brinjal", "eggplant", "aubergine"],
    category: "vegetables",
    default_unit: "কেজি",
    usage_count: 65,
  },
  {
    id: "veg-cucumber",
    name_bn: "শসা",
    name_en: "Cucumber",
    banglish_aliases: ["shosha", "sosa", "cucumber", "kheera"],
    category: "vegetables",
    default_unit: "কেজি",
    usage_count: 60,
  },
  {
    id: "veg-carrot",
    name_bn: "গাজর",
    name_en: "Carrot",
    banglish_aliases: ["gajor", "gajar", "carrot"],
    category: "vegetables",
    default_unit: "কেজি",
    usage_count: 50,
  },
  {
    id: "veg-cauliflower",
    name_bn: "ফুলকপি",
    name_en: "Cauliflower",
    banglish_aliases: ["fulkopi", "ful kopi", "cauliflower", "phulkopi"],
    category: "vegetables",
    default_unit: "পিস",
    usage_count: 45,
  },
  {
    id: "veg-cabbage",
    name_bn: "বাঁধাকপি",
    name_en: "Cabbage",
    banglish_aliases: ["badhakopi", "badha kopi", "cabbage", "bandhakopi"],
    category: "vegetables",
    default_unit: "পিস",
    usage_count: 40,
  },
  {
    id: "veg-okra",
    name_bn: "ঢেঁড়স",
    name_en: "Okra / Ladies Finger",
    banglish_aliases: ["dherosh", "dheros", "bhindi", "okra", "ladies finger"],
    category: "vegetables",
    default_unit: "কেজি",
    usage_count: 45,
  },
  {
    id: "veg-pointed-gourd",
    name_bn: "পটল",
    name_en: "Pointed Gourd / Potol",
    banglish_aliases: ["potol", "patol", "pointed gourd"],
    category: "vegetables",
    default_unit: "কেজি",
    usage_count: 40,
  },
  {
    id: "veg-bottle-gourd",
    name_bn: "লাউ",
    name_en: "Bottle Gourd / Lau",
    banglish_aliases: ["lau", "lao", "bottle gourd", "kodu"],
    category: "vegetables",
    default_unit: "পিস",
    usage_count: 50,
  },
  {
    id: "veg-papaya",
    name_bn: "পেঁপে",
    name_en: "Green Papaya / Pepe",
    banglish_aliases: ["pepe", "kacha pepe", "papaya", "raw papaya"],
    category: "vegetables",
    default_unit: "কেজি",
    usage_count: 40,
  },
  {
    id: "veg-pumpkin",
    name_bn: "মিষ্টি কুমড়া",
    name_en: "Sweet Pumpkin",
    banglish_aliases: ["mishti kumra", "misti kumra", "pumpkin", "sweet gourd"],
    category: "vegetables",
    default_unit: "কেজি",
    usage_count: 40,
  },
  {
    id: "veg-bitter-gourd",
    name_bn: "করলা / উচ্ছে",
    name_en: "Bitter Gourd / Korola",
    banglish_aliases: ["korola", "uchhe", "kerela", "bitter gourd", "karala"],
    category: "vegetables",
    default_unit: "কেজি",
    usage_count: 40,
  },
  {
    id: "veg-beans",
    name_bn: "শিম",
    name_en: "Flat Beans / Shim",
    banglish_aliases: ["shim", "seem", "beans", "flat beans"],
    category: "vegetables",
    default_unit: "কেজি",
    usage_count: 40,
  },
  {
    id: "veg-long-beans",
    name_bn: "বরবটি",
    name_en: "Yardlong Beans / Borboti",
    banglish_aliases: ["borboti", "long beans", "string beans"],
    category: "vegetables",
    default_unit: "কেজি",
    usage_count: 35,
  },
  {
    id: "veg-lemon",
    name_bn: "লেবু",
    name_en: "Lemon / Lime",
    banglish_aliases: ["lebu", "lemon", "lime", "kagoji lebu", "elachi lebu"],
    category: "vegetables",
    default_unit: "হালি",
    usage_count: 70,
  },

  // Leafy Greens (Shak)
  {
    id: "veg-lal-shak",
    name_bn: "লাল শাক",
    name_en: "Red Amaranth / Lal Shak",
    banglish_aliases: ["lal shak", "laal shaak", "red amaranth"],
    category: "vegetables",
    default_unit: "আঁটি",
    usage_count: 50,
  },
  {
    id: "veg-palong-shak",
    name_bn: "পালং শাক",
    name_en: "Spinach / Palong Shak",
    banglish_aliases: ["palong shak", "spinach", "paalong shaak"],
    category: "vegetables",
    default_unit: "আঁটি",
    usage_count: 45,
  },
  {
    id: "veg-kolmi-shak",
    name_bn: "কলমি শাক",
    name_en: "Water Spinach / Kolmi Shak",
    banglish_aliases: ["kolmi shak", "kalmi shak", "water spinach"],
    category: "vegetables",
    default_unit: "আঁটি",
    usage_count: 35,
  },
  {
    id: "veg-pui-shak",
    name_bn: "পুঁই শাক",
    name_en: "Malabar Spinach / Pui Shak",
    banglish_aliases: ["pui shak", "puin shak", "malabar spinach"],
    category: "vegetables",
    default_unit: "আঁটি",
    usage_count: 40,
  },

  // Protein: Eggs, Poultry, Meat & Fish
  {
    id: "dairy-eggs",
    name_bn: "ডিম",
    name_en: "Eggs",
    banglish_aliases: ["dim", "deem", "egg", "eggs", "hali", "farm er dim", "lal dim"],
    category: "dairy_eggs",
    default_unit: "ডজন",
    usage_count: 100,
  },
  {
    id: "meat-broiler-chicken",
    name_bn: "ব্রয়লার মুরগি",
    name_en: "Broiler Chicken",
    banglish_aliases: ["murgi", "chicken", "broiler", "broiler chicken", "murgir mangsho", "mangsho"],
    category: "meat_fish",
    default_unit: "কেজি",
    usage_count: 90,
  },
  {
    id: "meat-sonali-chicken",
    name_bn: "সোনালী মুরগি",
    name_en: "Sonali Chicken",
    banglish_aliases: ["sonali murgi", "sonali chicken", "cock chicken"],
    category: "meat_fish",
    default_unit: "কেজি",
    usage_count: 70,
  },
  {
    id: "meat-desi-chicken",
    name_bn: "দেশি মুরগি",
    name_en: "Desi Chicken",
    banglish_aliases: ["desi murgi", "deshi chicken", "country chicken"],
    category: "meat_fish",
    default_unit: "কেজি",
    usage_count: 50,
  },
  {
    id: "meat-beef",
    name_bn: "গরুর মাংস",
    name_en: "Beef",
    banglish_aliases: ["goru", "gorur mangsho", "beef", "cow meat", "beaf"],
    category: "meat_fish",
    default_unit: "কেজি",
    usage_count: 85,
  },
  {
    id: "meat-mutton",
    name_bn: "খাসির মাংস",
    name_en: "Mutton / Goat Meat",
    banglish_aliases: ["khasi", "khasir mangsho", "mutton", "goat meat"],
    category: "meat_fish",
    default_unit: "কেজি",
    usage_count: 40,
  },
  {
    id: "fish-rui",
    name_bn: "রুই মাছ",
    name_en: "Rohu Fish / Rui Mach",
    banglish_aliases: ["rui mach", "rui fish", "rohu", "mach", "fish"],
    category: "meat_fish",
    default_unit: "কেজি",
    usage_count: 70,
  },
  {
    id: "fish-katla",
    name_bn: "কাতল মাছ",
    name_en: "Catla Fish / Katol Mach",
    banglish_aliases: ["katol mach", "catla", "katla mach"],
    category: "meat_fish",
    default_unit: "কেজি",
    usage_count: 60,
  },
  {
    id: "fish-pangas",
    name_bn: "পাঙ্গাস মাছ",
    name_en: "Pangas Fish",
    banglish_aliases: ["pangas mach", "pangaash", "pangash"],
    category: "meat_fish",
    default_unit: "কেজি",
    usage_count: 55,
  },
  {
    id: "fish-tilapia",
    name_bn: "তেলাপিয়া মাছ",
    name_en: "Tilapia Fish",
    banglish_aliases: ["telapia mach", "tilapia", "telapia"],
    category: "meat_fish",
    default_unit: "কেজি",
    usage_count: 60,
  },
  {
    id: "fish-ilish",
    name_bn: "ইলিশ মাছ",
    name_en: "Hilsa / Ilish Mach",
    banglish_aliases: ["ilish mach", "hilsa", "elish mach", "ilish fish"],
    category: "meat_fish",
    default_unit: "কেজি",
    usage_count: 50,
  },
  {
    id: "fish-chingri",
    name_bn: "চিংড়ি মাছ",
    name_en: "Prawn / Shrimp",
    banglish_aliases: ["chingri mach", "prawn", "shrimp", "chingri"],
    category: "meat_fish",
    default_unit: "কেজি",
    usage_count: 60,
  },
  {
    id: "fish-tengra",
    name_bn: "ট্যাংরা মাছ",
    name_en: "Tengra Fish",
    banglish_aliases: ["tengra mach", "tangra", "choto mach"],
    category: "meat_fish",
    default_unit: "কেজি",
    usage_count: 40,
  },

  // Dairy & Breakfast
  {
    id: "dairy-liquid-milk",
    name_bn: "তরল দুধ",
    name_en: "Liquid Milk",
    banglish_aliases: ["dudh", "doodh", "milk", "liquid milk", "aarong milk", "pran milk"],
    category: "dairy_eggs",
    default_unit: "লিটার",
    usage_count: 80,
  },
  {
    id: "dairy-milk-powder",
    name_bn: "গুঁড়ো দুধ",
    name_en: "Milk Powder",
    banglish_aliases: ["gura dudh", "powder milk", "milk powder", "dano", "marks", "diploma"],
    category: "dairy_eggs",
    default_unit: "প্যাকেট",
    usage_count: 50,
  },
  {
    id: "breakfast-bread",
    name_bn: "পাউরুটি",
    name_en: "Bread",
    banglish_aliases: ["pauruti", "bread", "ruti", "sliced bread"],
    category: "dairy_eggs",
    default_unit: "প্যাকেট",
    usage_count: 70,
  },
  {
    id: "dairy-butter",
    name_bn: "মাখন / বাটার",
    name_en: "Butter",
    banglish_aliases: ["butter", "makhon", "aarong butter"],
    category: "dairy_eggs",
    default_unit: "গ্রাম",
    usage_count: 30,
  },
  {
    id: "fruit-banana",
    name_bn: "কলা",
    name_en: "Banana",
    banglish_aliases: ["kola", "banana", "shobri kola", "champa kola", "sagorkola"],
    category: "vegetables",
    default_unit: "ডজন",
    usage_count: 65,
  },
  {
    id: "staple-tea",
    name_bn: "চা পাতা",
    name_en: "Tea Leaves",
    banglish_aliases: ["cha", "cha pata", "tea", "tea bag", "taaza", "ispat"],
    category: "staples",
    default_unit: "প্যাকেট",
    usage_count: 75,
  },
  {
    id: "staple-coffee",
    name_bn: "কফি",
    name_en: "Coffee",
    banglish_aliases: ["coffee", "nescafe", "kofi"],
    category: "staples",
    default_unit: "জার",
    usage_count: 40,
  },
  {
    id: "staple-noodles",
    name_bn: "নুডলস",
    name_en: "Noodles",
    banglish_aliases: ["noodles", "nuduls", "maggi", "maggie", "koka", "chopsticks"],
    category: "staples",
    default_unit: "প্যাকেট",
    usage_count: 60,
  },
  {
    id: "staple-biscuits",
    name_bn: "বিস্কুট",
    name_en: "Biscuits / Cookies",
    banglish_aliases: ["biskut", "biscuit", "cookies", "toast biskut", "energy biskut"],
    category: "staples",
    default_unit: "প্যাকেট",
    usage_count: 55,
  },

  // Cleaning, Washroom & Household
  {
    id: "clean-dishwash",
    name_bn: "থালাবাসন ধোয়ার লিকুইড / সাবান",
    name_en: "Dishwashing Liquid / Bar",
    banglish_aliases: ["dishwash", "vim bar", "vim liquid", "dish soap", "shaban"],
    category: "household",
    default_unit: "পিস",
    usage_count: 60,
  },
  {
    id: "clean-detergent",
    name_bn: "ডিটারজেন্ট পাউডার",
    name_en: "Laundry Detergent",
    banglish_aliases: ["detergent", "wheel powder", "surf excel", "rin", "washing powder"],
    category: "household",
    default_unit: "কেজি",
    usage_count: 65,
  },
  {
    id: "clean-toilet",
    name_bn: "টয়লেট ক্লিনার",
    name_en: "Toilet Cleaner",
    banglish_aliases: ["harpic", "toilet cleaner", "commode cleaner"],
    category: "household",
    default_unit: "বোতল",
    usage_count: 55,
  },
  {
    id: "clean-floor",
    name_bn: "ফ্লোর ক্লিনার",
    name_en: "Floor Cleaner",
    banglish_aliases: ["floor cleaner", "lizol", "phenyl", "finis"],
    category: "household",
    default_unit: "বোতল",
    usage_count: 40,
  },
  {
    id: "clean-bath-soap",
    name_bn: "গোসলের সাবান",
    name_en: "Bath Soap",
    banglish_aliases: ["shaban", "soap", "bath soap", "lux", "dettol soap", "lifebuoy"],
    category: "household",
    default_unit: "পিস",
    usage_count: 60,
  },
  {
    id: "clean-shampoo",
    name_bn: "শ্যাম্পু",
    name_en: "Shampoo",
    banglish_aliases: ["shampoo", "shampu", "clear shampoo", "sunsilk", "head shoulders"],
    category: "household",
    default_unit: "বোতল",
    usage_count: 50,
  },
  {
    id: "clean-toothpaste",
    name_bn: "টুথপেস্ট",
    name_en: "Toothpaste",
    banglish_aliases: ["toothpaste", "colgate", "pepsodent", "meswak", "paste"],
    category: "household",
    default_unit: "পিস",
    usage_count: 55,
  },
  {
    id: "clean-tissue",
    name_bn: "টিস্যু পেপার",
    name_en: "Tissue Paper",
    banglish_aliases: ["tissue", "tissu", "tissue box", "toilet tissue", "kitchen towel", "bashundhara tissue"],
    category: "household",
    default_unit: "প্যাকেট",
    usage_count: 65,
  },
  {
    id: "clean-mosquito-coil",
    name_bn: "মশার কয়েল / স্প্রে",
    name_en: "Mosquito Coil / Aerosol",
    banglish_aliases: ["koel", "coil", "aerosol", "moshari", "hit spray", "mosquito spray"],
    category: "household",
    default_unit: "প্যাকেট",
    usage_count: 45,
  },
  {
    id: "clean-matches",
    name_bn: "ম্যাচ / গ্যাস লাইটার",
    name_en: "Matches / Gas Lighter",
    banglish_aliases: ["match", "diasholai", "gas lighter", "lighter"],
    category: "household",
    default_unit: "পিস",
    usage_count: 35,
  },
];

/**
 * Intelligent multi-tier search matching against Bangla name, English name, and Banglish aliases.
 * Prioritizes prefix matches and higher usage frequency.
 */
export function searchGrocerySuggestions(
  items: GroceryCatalogItem[],
  rawQuery: string,
  limit = 7
): GroceryCatalogItem[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  // Scored matches:
  // 100+: Exact or prefix match on Bangla name
  // 80+: Exact or prefix match on Banglish aliases
  // 70+: Exact or prefix match on English name
  // 50+: Substring match on Bangla
  // 40+: Substring match on Banglish aliases
  // 30+: Substring match on English name
  const scoredItems: { item: GroceryCatalogItem; score: number }[] = [];

  for (const item of items) {
    let score = 0;
    const nameBn = item.name_bn.toLowerCase();
    const nameEn = item.name_en.toLowerCase();
    const aliases = (item.banglish_aliases || []).map((a) => a.toLowerCase());

    // 1. Direct Bangla match
    if (nameBn === query) {
      score += 150;
    } else if (nameBn.startsWith(query)) {
      score += 120;
    } else if (nameBn.includes(query)) {
      score += 60;
    }

    // 2. Banglish alias match
    const exactAlias = aliases.find((a) => a === query);
    const prefixAlias = aliases.find((a) => a.startsWith(query));
    const subAlias = aliases.find((a) => a.includes(query));

    if (exactAlias) {
      score += 110;
    } else if (prefixAlias) {
      score += 85;
    } else if (subAlias) {
      score += 45;
    }

    // 3. English name match
    if (nameEn === query) {
      score += 90;
    } else if (nameEn.startsWith(query)) {
      score += 70;
    } else if (nameEn.includes(query)) {
      score += 35;
    }

    if (score > 0) {
      // Add a slight boost from usage_count to rank frequently purchased items higher
      const usageBonus = Math.min((item.usage_count || 0) * 0.1, 20);
      scoredItems.push({ item, score: score + usageBonus });
    }
  }

  scoredItems.sort((a, b) => b.score - a.score);
  return scoredItems.slice(0, limit).map((s) => s.item);
}

/**
 * Maps Bangla unit labels from grocery catalog to standard system unit identifiers
 */
export function mapBanglaUnitToStandard(bnUnit?: string): string {
  if (!bnUnit) return "kg";

  const map: Record<string, string> = {
    "কেজি": "kg",
    "গ্রাম": "gm",
    "পিস": "pcs",
    "লিটার": "litre",
    "মিলি": "ml",
    "প্যাকেট": "pack",
    "ডজন": "dozen",
    "হালি": "hali",
    "আঁটি": "bunch",
    "বোতল": "bottle",
    "জার": "box",
    "বক্স": "box",
  };

  return map[bnUnit.trim()] || bnUnit.toLowerCase();
}

