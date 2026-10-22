// src/scripts/seed.ts
// Database seeder script for Box and Packaging products with MOQ = 1

import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}
import mongoose from 'mongoose';
import {
  BoxProductModel,
  BoxType,
  MaterialType,
  FluteType,
  FinishType,
  BoxColor,
  UseCaseCategory,
} from '../models/BoxProduct.model';
import { SettingsModel } from '../models/Settings.model';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blossom_box';

async function seed() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  // Initialize Settings
  await SettingsModel.deleteMany({});
  await SettingsModel.create({
    baseDeliveryRate: 35.0,
  });
  console.log('✅ Settings initialized with baseDeliveryRate: GH₵35.00');

  // Clear existing products
  await BoxProductModel.deleteMany({});

  const sampleProducts = [
    {
      title: 'E-Commerce Fast-Seal Corrugated Mailer Box',
      slug: 'ecommerce-fast-seal-mailer-box',
      description:
        'Sturdy, colorful, easy-to-assemble corrugated mailer with peel-and-seal strip and tear-tape opening. Perfect for apparel, beauty kits, gifts, and direct delivery. Order as few as 1 box!',
      boxType: BoxType.MAILER_BOX,
      useCaseCategories: [
        UseCaseCategory.ECOMMERCE_SHIPPING,
        UseCaseCategory.APPAREL_CLOTHING,
        UseCaseCategory.COSMETICS_BEAUTY,
      ],
      availableColors: [BoxColor.PINK, BoxColor.WHITE, BoxColor.KRAFT_NATURAL],
      materialType: MaterialType.SINGLE_WALL,
      brand: 'Blossom&Box',
      ecoFriendlyAttributes: {
        isRecyclable: true,
        isCompostable: true,
        recycledContentPercentage: 85,
      },
      minOrderQuantity: 1,
      isActive: true,
      tags: ['mailer', 'clothing', 'subscription', 'eco-friendly', 'fast-seal', 'vibrant'],
      variants: [
        {
          sku: 'MB-S-PINK',
          variantName: 'Small (25x18x8 cm) - Pastel Pink',
          dimensions: {
            outer: {
              cm: { length: 25, width: 18, height: 8 },
              inches: { length: 9.84, width: 7.09, height: 3.15 },
            },
            inner: {
              cm: { length: 24, width: 17.5, height: 7.5 },
              inches: { length: 9.45, width: 6.89, height: 2.95 },
            },
          },
          wallThicknessMm: 1.8,
          fluteType: FluteType.E_FLUTE,
          finishType: FinishType.MATTE,
          colorName: BoxColor.PINK,
          colorHex: '#F472B6',
          loadCapacity: { kg: 5, lbs: 11 },
          tareWeightGrams: 110,
          burstStrengthPsi: 125,
          price: 22.0,
          costPrice: 10.0,
          stockQuantity: 1200,
          minOrderQuantity: 1,
          isAvailable: true,
          images: [
            'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80',
            'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
          ],
          bulkPricingTiers: [
            { minQuantity: 10, unitPrice: 19.5, discountPercentage: 11 },
            { minQuantity: 50, unitPrice: 17.0, discountPercentage: 23 },
            { minQuantity: 200, unitPrice: 14.0, discountPercentage: 36 },
          ],
        },
        {
          sku: 'MB-M-WHITE',
          variantName: 'Medium (32x24x10 cm) - Crisp Snow White',
          dimensions: {
            outer: {
              cm: { length: 32, width: 24, height: 10 },
              inches: { length: 12.6, width: 9.45, height: 3.94 },
            },
            inner: {
              cm: { length: 31, width: 23.5, height: 9.5 },
              inches: { length: 12.2, width: 9.25, height: 3.74 },
            },
          },
          wallThicknessMm: 2.0,
          fluteType: FluteType.E_FLUTE,
          finishType: FinishType.GLOSS,
          colorName: BoxColor.WHITE,
          colorHex: '#FFFFFF',
          loadCapacity: { kg: 8, lbs: 17.6 },
          tareWeightGrams: 185,
          burstStrengthPsi: 150,
          price: 28.0,
          costPrice: 13.0,
          stockQuantity: 850,
          minOrderQuantity: 1,
          isAvailable: true,
          images: [
            'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
            'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=800&q=80',
          ],
          bulkPricingTiers: [
            { minQuantity: 10, unitPrice: 24.5, discountPercentage: 12 },
            { minQuantity: 50, unitPrice: 21.0, discountPercentage: 25 },
            { minQuantity: 200, unitPrice: 17.5, discountPercentage: 38 },
          ],
        },
      ],
    },
    {
      title: 'Heavy-Duty Moving & Shipping Carton',
      slug: 'heavy-duty-moving-storage-carton',
      description:
        'Built tough for moving, fragile glassware, and heavy transport. Maximum stacking strength and reinforced corners.',
      boxType: BoxType.HEAVY_DUTY_STORAGE,
      useCaseCategories: [
        UseCaseCategory.MOVING_STORAGE,
        UseCaseCategory.HEAVY_INDUSTRIAL,
        UseCaseCategory.FRAGILE_GLASSWARE,
      ],
      availableColors: [BoxColor.KRAFT_NATURAL],
      materialType: MaterialType.DOUBLE_WALL,
      brand: 'TitanShield Logistics',
      ecoFriendlyAttributes: {
        isRecyclable: true,
        isCompostable: false,
        recycledContentPercentage: 70,
      },
      minOrderQuantity: 1,
      isActive: true,
      tags: ['heavy-duty', 'moving', 'storage', 'shipping'],
      variants: [
        {
          sku: 'HD-L-KRAFT',
          variantName: 'Large Heavy-Duty (50x40x40 cm)',
          dimensions: {
            outer: {
              cm: { length: 50, width: 40, height: 40 },
              inches: { length: 19.68, width: 15.75, height: 15.75 },
            },
            inner: {
              cm: { length: 48.5, width: 38.5, height: 38.5 },
              inches: { length: 19.09, width: 15.16, height: 15.16 },
            },
          },
          wallThicknessMm: 6.5,
          fluteType: FluteType.BC_FLUTE,
          finishType: FinishType.KRAFT_NATURAL,
          colorName: BoxColor.KRAFT_NATURAL,
          colorHex: '#D97706',
          loadCapacity: { kg: 45, lbs: 99.2 },
          tareWeightGrams: 890,
          burstStrengthPsi: 275,
          price: 65.0,
          costPrice: 30.0,
          stockQuantity: 420,
          minOrderQuantity: 1,
          isAvailable: true,
          images: [
            'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
            'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=80',
          ],
          bulkPricingTiers: [
            { minQuantity: 5, unitPrice: 58.0, discountPercentage: 11 },
            { minQuantity: 20, unitPrice: 52.0, discountPercentage: 20 },
            { minQuantity: 100, unitPrice: 45.0, discountPercentage: 31 },
          ],
        },
      ],
    },
    {
      title: 'Luxury Velvet-Lined Magnetic Watch & Jewelry Box',
      slug: 'luxury-magnetic-closure-watch-box',
      description:
        'Exquisite premium presentation case with hidden magnetic closure and soft-touch cushioned velvet interior. Elevate unboxing for timepieces, fine necklaces, and heirloom rings.',
      boxType: BoxType.WATCH_BOX,
      useCaseCategories: [
        UseCaseCategory.WATCH_JEWELRY_BOXES,
        UseCaseCategory.COSMETICS_BEAUTY,
      ],
      availableColors: [BoxColor.GOLD, BoxColor.BLACK, BoxColor.RED],
      materialType: MaterialType.RIGID,
      brand: 'Aura Packaging Co.',
      ecoFriendlyAttributes: {
        isRecyclable: false,
        isCompostable: false,
        recycledContentPercentage: 40,
      },
      minOrderQuantity: 1,
      isActive: true,
      tags: ['luxury', 'watch', 'jewelry', 'magnetic-closure', 'gold-trim'],
      variants: [
        {
          sku: 'RIGID-WATCH-GOLD',
          variantName: 'Single Watch Case - Royal Emerald & Gold',
          dimensions: {
            outer: {
              cm: { length: 12, width: 12, height: 8.5 },
              inches: { length: 4.72, width: 4.72, height: 3.35 },
            },
            inner: {
              cm: { length: 10.5, width: 10.5, height: 7.5 },
              inches: { length: 4.13, width: 4.13, height: 2.95 },
            },
          },
          wallThicknessMm: 3.0,
          fluteType: FluteType.NONE,
          finishType: FinishType.SOFT_TOUCH,
          colorName: BoxColor.GOLD,
          colorHex: '#EAB308',
          loadCapacity: { kg: 2, lbs: 4.4 },
          tareWeightGrams: 280,
          price: 95.0,
          costPrice: 45.0,
          stockQuantity: 310,
          minOrderQuantity: 1,
          isAvailable: true,
          images: [
            'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80',
            'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
          ],
          bulkPricingTiers: [
            { minQuantity: 5, unitPrice: 85.0, discountPercentage: 11 },
            { minQuantity: 25, unitPrice: 75.0, discountPercentage: 21 },
            { minQuantity: 100, unitPrice: 60.0, discountPercentage: 37 },
          ],
        },
      ],
    },
    {
      title: 'Clear-View Window Bakery & Cake Presentation Box',
      slug: 'clear-view-window-bakery-cake-box',
      description:
        'Display your baked creations with pride. Anti-fog crystal clear window, grease-resistant coating, and easy-lock fold corners. Buy from just 1 unit for special events!',
      boxType: BoxType.BAKERY_CAKE_BOX,
      useCaseCategories: [
        UseCaseCategory.FOOD_BAKERY,
      ],
      availableColors: [BoxColor.WHITE, BoxColor.PINK],
      materialType: MaterialType.KRAFT_PAPER,
      brand: 'SweetSafe Packaging',
      ecoFriendlyAttributes: {
        isRecyclable: true,
        isCompostable: true,
        recycledContentPercentage: 90,
      },
      minOrderQuantity: 1,
      isActive: true,
      tags: ['bakery', 'cake', 'food', 'clear-window', 'celebration'],
      variants: [
        {
          sku: 'BAKE-10INCH-WHT',
          variantName: '10-inch Cake Box - Celebration Pastel',
          dimensions: {
            outer: {
              cm: { length: 26, width: 26, height: 15 },
              inches: { length: 10.24, width: 10.24, height: 5.91 },
            },
            inner: {
              cm: { length: 25.5, width: 25.5, height: 14.5 },
              inches: { length: 10.04, width: 10.04, height: 5.71 },
            },
          },
          wallThicknessMm: 0.8,
          fluteType: FluteType.NONE,
          finishType: FinishType.GLOSS,
          colorName: BoxColor.WHITE,
          colorHex: '#38BDF8',
          loadCapacity: { kg: 3, lbs: 6.6 },
          tareWeightGrams: 140,
          price: 25.0,
          costPrice: 11.0,
          stockQuantity: 650,
          minOrderQuantity: 1,
          isAvailable: true,
          images: [
            'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
            'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=800&q=80',
          ],
          bulkPricingTiers: [
            { minQuantity: 10, unitPrice: 22.0, discountPercentage: 12 },
            { minQuantity: 50, unitPrice: 18.5, discountPercentage: 26 },
            { minQuantity: 250, unitPrice: 15.0, discountPercentage: 40 },
          ],
        },
      ],
    },
    {
      title: 'Surprise Pop-Up Balloon Box for Celebrations',
      slug: 'surprise-pop-up-balloon-box',
      description:
        'The viral TikTok favorite! When the satin ribbon is untied, all 4 vibrant side walls fold down flat instantly, sending helium balloons and confetti floating into the air.',
      boxType: BoxType.BALLOON_BOX,
      useCaseCategories: [
        UseCaseCategory.BALLOON_BOXES,
      ],
      availableColors: [BoxColor.PINK, BoxColor.GOLD, BoxColor.RED],
      materialType: MaterialType.SINGLE_WALL,
      brand: 'PartyCraft Boxes',
      ecoFriendlyAttributes: {
        isRecyclable: true,
        isCompostable: true,
        recycledContentPercentage: 75,
      },
      minOrderQuantity: 1,
      isActive: true,
      tags: ['balloon', 'surprise', 'party', 'birthday', 'celebration', 'viral'],
      variants: [
        {
          sku: 'BALLOON-50CM-PNK',
          variantName: '50cm Cube - Radiant Hot Pink & Shimmer',
          dimensions: {
            outer: {
              cm: { length: 50, width: 50, height: 50 },
              inches: { length: 19.68, width: 19.68, height: 19.68 },
            },
            inner: {
              cm: { length: 49, width: 49, height: 49 },
              inches: { length: 19.29, width: 19.29, height: 19.29 },
            },
          },
          wallThicknessMm: 1.5,
          fluteType: FluteType.F_FLUTE,
          finishType: FinishType.GLOSS,
          colorName: BoxColor.PINK,
          colorHex: '#EC4899',
          loadCapacity: { kg: 2, lbs: 4.4 },
          tareWeightGrams: 520,
          price: 85.0,
          costPrice: 38.0,
          stockQuantity: 180,
          minOrderQuantity: 1,
          isAvailable: true,
          images: [
            'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800&q=80',
            'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
          ],
          bulkPricingTiers: [
            { minQuantity: 3, unitPrice: 76.0, discountPercentage: 11 },
            { minQuantity: 10, unitPrice: 66.0, discountPercentage: 22 },
            { minQuantity: 50, unitPrice: 55.0, discountPercentage: 35 },
          ],
        },
      ],
    },
  ];

  await BoxProductModel.insertMany(sampleProducts);
  console.log(`✅ Seeded ${sampleProducts.length} packaging products with MOQ=1 and vibrant styling.`);

  await mongoose.disconnect();
  console.log('Database connection closed.');
}

seed().catch(err => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
