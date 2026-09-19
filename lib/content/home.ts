// Home page creatives: hero slides and category cards. Every image URL is Amazon's own
// creative asset, captured from the live signed-out home page on 2026-09-19 (CLAUDE.md:
// "Amazon's brand assets ... load from Amazon's CDN, with every URL kept in ..." this module
// for home-page content, per docs/design.md 6.2). Every href is internal (`/s?...`), rebuilt
// against our own 12 departments so the tile always returns real catalogue products
// (verified by scripts/check-home-links.ts).

export type HeroSlide = {
  image: string;
  alt: string;
  href: string;
};

export type HomeCardTile = {
  label: string;
  image: string;
  href: string;
};

export type HomeCard = {
  title: string;
  href: string;
  footerLabel: string;
  tiles?: HomeCardTile[];
  image?: string;
};

function search(k: string, i: string): string {
  return `/s?k=${encodeURIComponent(k)}&i=${i}`;
}

function searchDept(i: string): string {
  return `/s?i=${i}`;
}

export const heroSlides: HeroSlide[] = [
  {
    image: "https://m.media-amazon.com/images/I/619geyiQI5L._SX3000_.jpg",
    alt: "Kitchen essentials under $50",
    href: search("kitchen", "home-kitchen"),
  },
  {
    image: "https://m.media-amazon.com/images/I/61Yx5-N155L._SX3000_.jpg",
    alt: "Toys for little ones",
    href: searchDept("toys"),
  },
  {
    image: "https://m.media-amazon.com/images/I/71qcoYgEhzL._SX3000_.jpg",
    alt: "Get your game on",
    href: searchDept("video-games"),
  },
];

export const homeCards: HomeCard[] = [
  {
    title: "Get your game on",
    href: searchDept("video-games"),
    footerLabel: "Shop gaming",
    image:
      "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2026/Gaming_26/Fuji_Gaming_SingleImageCard_C-1._SY304_CB762596570_.jpg",
  },
  {
    title: "Shop Fashion for less",
    href: searchDept("fashion"),
    footerLabel: "See all deals",
    tiles: [
      {
        label: "Jeans under $50",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AMAZON_FASHION/2022/SITE_FLIPS/SPR_22/GW/DQC/DQC_APR_TBYB_W_BOTTOMS_1x._SY116_CB624172947_.jpg",
        href: search("jeans", "fashion"),
      },
      {
        label: "Tops under $25",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AMAZON_FASHION/2022/SITE_FLIPS/SPR_22/GW/DQC/DQC_APR_TBYB_W_TOPS_1x._SY116_CB623353881_.jpg",
        href: search("tops", "fashion"),
      },
      {
        label: "Dresses under $30",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AMAZON_FASHION/2022/SITE_FLIPS/SPR_22/GW/DQC/DQC_APR_TBYB_W_DRESSES_1x._SY116_CB623353881_.jpg",
        href: search("dresses", "fashion"),
      },
      {
        label: "Shoes under $50",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AMAZON_FASHION/2022/SITE_FLIPS/SPR_22/GW/DQC/DQC_APR_TBYB_W_SHOES_1x._SY116_CB624172947_.jpg",
        href: search("shoes", "fashion"),
      },
    ],
  },
  {
    title: "New home arrivals under $50",
    href: searchDept("home-kitchen"),
    footerLabel: "Shop the latest from Home",
    tiles: [
      {
        label: "Kitchen & Dining",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/DiscoTec/2024/HomeLifestyle/HomeSummerFlip/Homepage/QuadCards/Home_Flip_Summer_2024_315_HP_NewArrivals_QuadCard_D_01_1x._SY116_CB555960040_.jpg",
        href: search("kitchen dining", "home-kitchen"),
      },
      {
        label: "Home Improvement",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/DiscoTec/2024/HomeLifestyle/HomeSummerFlip/Homepage/QuadCards/Home_Flip_Summer_2024_316_HP_NewArrivals_QuadCard_D_02_1x._SY116_CB555960040_.jpg",
        href: search("home improvement", "tools"),
      },
      {
        label: "Decor",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/DiscoTec/2024/HomeLifestyle/HomeSummerFlip/Homepage/QuadCards/Home_Flip_Summer_2024_317_HP_NewArrivals_QuadCard_D_03_1x._SY116_CB555960040_.jpg",
        href: search("decor", "home-kitchen"),
      },
      {
        label: "Bedding & Bath",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/DiscoTec/2024/HomeLifestyle/HomeSummerFlip/Homepage/QuadCards/Home_Flip_Summer_2024_318_HP_NewArrivals_QuadCard_D_04_1x._SY116_CB555960040_.jpg",
        href: search("bedding", "home-kitchen"),
      },
    ],
  },
  {
    title: "Top categories in Kitchen appliances",
    href: searchDept("home-kitchen"),
    footerLabel: "Explore all products in Kitchen",
    tiles: [
      {
        label: "Cooker",
        image: "https://m.media-amazon.com/images/I/313wAT6Iy2L._SY160_.jpg",
        href: search("cooker", "home-kitchen"),
      },
      {
        label: "Coffee",
        image: "https://m.media-amazon.com/images/I/21W7-lndINL._SY75_.jpg",
        href: search("coffee maker", "home-kitchen"),
      },
      {
        label: "Pots and Pans",
        image: "https://m.media-amazon.com/images/I/21B-NkA9p-L._SY75_.jpg",
        href: search("skillet", "home-kitchen"),
      },
      {
        label: "Kettles",
        image: "https://m.media-amazon.com/images/I/217GQ1a2QzL._SY75_.jpg",
        href: search("electric", "home-kitchen"),
      },
    ],
  },
  {
    title: "Wireless Tech",
    href: searchDept("electronics"),
    footerLabel: "Discover more",
    tiles: [
      {
        label: "Smartphones",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Aug/Smartphone_1x._SY116_CB566164844_.jpg",
        href: search("smartphone", "electronics"),
      },
      {
        label: "Watches",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Aug/Watches_1x._SY116_CB566164844_.jpg",
        href: search("smart watch", "electronics"),
      },
      {
        label: "Headphones",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Aug/Headphone_1x._SY116_CB566164844_.jpg",
        href: search("headphones", "electronics"),
      },
      {
        label: "Tablets",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Aug/Tablet_1x._SY116_CB566164844_.jpg",
        href: search("tablet", "electronics"),
      },
    ],
  },
  {
    title: "Most-loved travel essentials",
    href: searchDept("fashion"),
    footerLabel: "Discover more",
    tiles: [
      {
        label: "Backpacks",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Aug/Backpack_1x._SY116_CB566100767_.jpg",
        href: search("bag", "fashion"),
      },
      {
        label: "Suitcases",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Aug/TravelBag_1x._SY116_CB566100767_.jpg",
        href: search("bag", "fashion"),
      },
      {
        label: "Accessories",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Aug/Accessories_1x._SY116_CB566100767_.jpg",
        href: search("wallet", "fashion"),
      },
      {
        label: "Handbags",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Aug/Handbags_1x._SY116_CB566100767_.jpg",
        href: search("bag", "fashion"),
      },
    ],
  },
  {
    title: "Gear up to get fit",
    href: searchDept("sports"),
    footerLabel: "Discover more",
    tiles: [
      {
        label: "Clothing",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2025/Q1DefectReduction/Fuji_Defect_Reduction_1x_Clothing._SY116_CB549022351_.jpg",
        href: search("shirt", "sports"),
      },
      {
        label: "Trackers",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2025/Q1DefectReduction/Fuji_Defect_Reduction_1x_Trackers._SY116_CB549022351_.jpg",
        href: search("fitness tracker", "electronics"),
      },
      {
        label: "Equipment",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2025/Q1DefectReduction/Fuji_Defect_Reduction_1x_Equipment._SY116_CB549022351_.jpg",
        href: search("fitness equipment", "sports"),
      },
      {
        label: "Deals",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2025/Q1DefectReduction/Fuji_Defect_Reduction_1x_Deals_Fitness._SY116_CB549022351_.jpg",
        href: search("fitness", "sports"),
      },
    ],
  },
  {
    title: "Level up your PC here",
    href: searchDept("computers"),
    footerLabel: "Discover more",
    tiles: [
      {
        label: "Laptops",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2025/Q1DefectReduction/Fuji_Defect_Reduction_1x_Laptop._SY116_CB549022351_.jpg",
        href: search("laptop", "computers"),
      },
      {
        label: "PCs",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2025/Q1DefectReduction/Fuji_Defect_Reduction_1x_PC._SY116_CB549022351_.jpg",
        href: search("desktop computer", "computers"),
      },
      {
        label: "Hard Drives",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2025/Q1DefectReduction/Fuji_Defect_Reduction_1x_Hard_Drives._SY116_CB549022351_.jpg",
        href: search("hard drive", "computers"),
      },
      {
        label: "Monitors",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2025/Q1DefectReduction/Fuji_Defect_Reduction_1x_Monitors._SY116_CB549022351_.jpg",
        href: search("monitor", "computers"),
      },
    ],
  },
  {
    title: "Level up your beauty routine",
    href: searchDept("beauty"),
    footerLabel: "See more",
    tiles: [
      {
        label: "Makeup",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/DskBTFQuadCards/Fuji_BTF_Quad_Cards_1x_Make-up._SY116_CB558654384_.jpg",
        href: search("makeup", "beauty"),
      },
      {
        label: "Brushes",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/DskBTFQuadCards/Fuji_BTF_Quad_Cards_1x_Brushes._SY116_CB558654384_.jpg",
        href: search("makeup brushes", "beauty"),
      },
      {
        label: "Sponges",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/DskBTFQuadCards/Fuji_BTF_Quad_Cards_1x_Sponges._SY116_CB558654384_.jpg",
        href: searchDept("beauty"),
      },
      {
        label: "Mirrors",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/DskBTFQuadCards/Fuji_BTF_Quad_Cards_1x_Mirrors._SY116_CB558654384_.jpg",
        href: searchDept("beauty"),
      },
    ],
  },
  {
    title: "Gaming merchandise",
    href: searchDept("toys"),
    footerLabel: "See more",
    tiles: [
      {
        label: "Apparel",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Fuji/2021/June/Fuji_Quad_Apparel_1x._SY116_CB667159060_.jpg",
        href: searchDept("fashion"),
      },
      {
        label: "Hats",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Fuji/2021/June/Fuji_Quad_Hat_1x._SY116_CB667159060_.jpg",
        href: searchDept("fashion"),
      },
      {
        label: "Action figures",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Fuji/2021/June/Fuji_Quad_Figure_1x._SY116_CB667159060_.jpg",
        href: search("action figure", "toys"),
      },
      {
        label: "Mugs",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Fuji/2021/June/Fuji_Quad_Mug_1x._SY116_CB667159063_.jpg",
        href: searchDept("home-kitchen"),
      },
    ],
  },
  {
    title: "Deals on top categories",
    href: searchDept("books"),
    footerLabel: "Discover more",
    tiles: [
      {
        label: "Books",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2025/Q1DefectReduction/Fuji_Defect_Reduction_1x_Books._SY116_CB549022351_.jpg",
        href: searchDept("books"),
      },
      {
        label: "Fashion",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2025/Q1DefectReduction/Fuji_Defect_Reduction_1x_Fashion._SY116_CB549022351_.jpg",
        href: searchDept("fashion"),
      },
      {
        label: "PC",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2025/Q1DefectReduction/Fuji_Defect_Reduction_1x_Desktops._SY116_CB549022351_.jpg",
        href: searchDept("computers"),
      },
      {
        label: "Beauty",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2025/Q1DefectReduction/Fuji_Defect_Reduction_1x_Beauty._SY116_CB549022351_.jpg",
        href: searchDept("beauty"),
      },
    ],
  },
  {
    title: "Most-loved watches",
    href: searchDept("fashion"),
    footerLabel: "Discover more",
    tiles: [
      {
        label: "Women",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Aug/WomenWatches_1x._SY116_CB564394432_.jpg",
        href: searchDept("fashion"),
      },
      {
        label: "Men",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Aug/MenWatches_1x._SY116_CB564394432_.jpg",
        href: search("men's watch", "fashion"),
      },
      {
        label: "Girls",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Aug/GirlWatches_1x._SY116_CB564394432_.jpg",
        href: searchDept("fashion"),
      },
      {
        label: "Boys",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Aug/BoyWatches_1x._SY116_CB564394432_.jpg",
        href: searchDept("fashion"),
      },
    ],
  },
  {
    title: "Score the top PCs & Accessories",
    href: searchDept("computers"),
    footerLabel: "See more",
    tiles: [
      {
        label: "Desktops",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/DskBTFQuadCards/Fuji_BTF_Quad_Cards_1x_Desktops._SY116_CB558654384_.jpg",
        href: search("desktop computer", "computers"),
      },
      {
        label: "Laptops",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/DskBTFQuadCards/Fuji_BTF_Quad_Cards_1x_laptop._SY116_CB558654384_.jpg",
        href: search("laptop", "computers"),
      },
      {
        label: "Hard Drives",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/DskBTFQuadCards/Fuji_BTF_Quad_Cards_1x_Hard_Drives._SY116_CB558654384_.jpg",
        href: search("hard drive", "computers"),
      },
      {
        label: "PC Accessories",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/DskBTFQuadCards/Fuji_BTF_Quad_Cards_1x_Accessories._SY116_CB558654384_.jpg",
        href: search("computer accessories", "computers"),
      },
    ],
  },
  {
    title: "Discover these beauty products for you",
    href: searchDept("beauty"),
    footerLabel: "Explore all in Beauty",
    tiles: [
      {
        label: "Skincare",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Sept/Skincare_1x._SY116_CB563150139_.jpg",
        href: search("skincare", "beauty"),
      },
      {
        label: "Makeup",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Sept/Makeup_1x._SY116_CB563150139_.jpg",
        href: search("makeup", "beauty"),
      },
      {
        label: "Nails",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Sept/Nail_1x._SY116_CB563150139_.jpg",
        href: search("nail polish", "beauty"),
      },
      {
        label: "Fragrances",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Sept/Fragrance_1x._SY116_CB563150139_.jpg",
        href: search("fragrance", "beauty"),
      },
    ],
  },
  {
    title: "Finds for Home",
    href: searchDept("home-kitchen"),
    footerLabel: "See more",
    tiles: [
      {
        label: "Kitchen",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/DskBTFQuadCards/Fuji_BTF_Quad_Cards_1x_Kitchen._SY116_CB558654384_.jpg",
        href: search("kitchen", "home-kitchen"),
      },
      {
        label: "Home Decor",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/DskBTFQuadCards/Fuji_BTF_Quad_Cards_1x_Home_decor._SY116_CB558654384_.jpg",
        href: search("home decor", "home-kitchen"),
      },
      {
        label: "Dining",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/DskBTFQuadCards/Fuji_BTF_Quad_Cards_1x_Dining._SY116_CB558654384_.jpg",
        href: search("dining", "home-kitchen"),
      },
      {
        label: "Smart Home",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/DskBTFQuadCards/Fuji_BTF_Quad_Cards_1x_Smart_home._SY116_CB558654384_.jpg",
        href: search("smart home", "electronics"),
      },
    ],
  },
  {
    title: "Shop for your home essentials",
    href: searchDept("home-kitchen"),
    footerLabel: "Discover more in Home",
    tiles: [
      {
        label: "Cleaning Tools",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Sept/CleaningTool_1x._SY116_CB563137408_.jpg",
        href: search("cleaning tools", "tools"),
      },
      {
        label: "Home Storage",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Sept/HomeStorage_1x._SY116_CB563137408_.jpg",
        href: search("home storage", "home-kitchen"),
      },
      {
        label: "Home Decor",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Sept/HomeDecor_1x._SY116_CB563137408_.jpg",
        href: search("home decor", "home-kitchen"),
      },
      {
        label: "Bedding",
        image:
          "https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Sept/Bedding_1x._SY116_CB563137408_.jpg",
        href: search("bedding", "home-kitchen"),
      },
    ],
  },
];
