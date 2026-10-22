// src/lib/deliveryPricing.ts
// Dynamic Delivery Urgency Pricing Engine & Fee Matrix

export enum DeliveryTier {
  EXPRESS_SAME_DAY = 'EXPRESS_SAME_DAY',
  EXPRESS_NEXT_DAY = 'EXPRESS_NEXT_DAY',
  SCHEDULED_PRIORITY = 'SCHEDULED_PRIORITY',
  STANDARD = 'STANDARD',
}

export interface DeliveryTierItem {
  id: DeliveryTier;
  tier: DeliveryTier;
  name: string;
  label: string;
  leadTime: string;
  multiplier: number;
  description: string;
}

export const ALL_TIERS: DeliveryTierItem[] = [
  {
    id: DeliveryTier.EXPRESS_SAME_DAY,
    tier: DeliveryTier.EXPRESS_SAME_DAY,
    name: 'Same-Day Express',
    label: 'Same-Day (0 days)',
    leadTime: 'Same day (0 days)',
    multiplier: 2.0,
    description: '+100% surge fee multiplier (2.0x base delivery rate)',
  },
  {
    id: DeliveryTier.EXPRESS_NEXT_DAY,
    tier: DeliveryTier.EXPRESS_NEXT_DAY,
    name: 'Next-Day Express',
    label: 'Next-Day (1 day)',
    leadTime: 'Next day (1 day)',
    multiplier: 1.5,
    description: '+50% surge fee multiplier (1.5x base delivery rate)',
  },
  {
    id: DeliveryTier.SCHEDULED_PRIORITY,
    tier: DeliveryTier.SCHEDULED_PRIORITY,
    name: 'Scheduled Priority',
    label: 'Priority (2–3 days)',
    leadTime: 'Priority (2–3 days)',
    multiplier: 1.2,
    description: '+20% priority fee multiplier (1.2x base delivery rate)',
  },
  {
    id: DeliveryTier.STANDARD,
    tier: DeliveryTier.STANDARD,
    name: 'Standard Delivery',
    label: 'Standard (4+ days)',
    leadTime: 'Standard (4+ days)',
    multiplier: 1.0,
    description: 'Charged at standard base rate (1.0x base delivery rate)',
  },
];

export function getDeliveryTier(leadDays: number): { tier: DeliveryTier; multiplier: number } {
  const days = Math.max(0, Math.floor(leadDays));
  if (days === 0) return { tier: DeliveryTier.EXPRESS_SAME_DAY, multiplier: 2.0 };
  if (days === 1) return { tier: DeliveryTier.EXPRESS_NEXT_DAY, multiplier: 1.5 };
  if (days >= 2 && days <= 3) return { tier: DeliveryTier.SCHEDULED_PRIORITY, multiplier: 1.2 };
  return { tier: DeliveryTier.STANDARD, multiplier: 1.0 };
}

export function calculateDeliveryFee(
  baseRate: number,
  preferredDate: Date,
  today: Date = new Date()
): { fee: number; tier: DeliveryTier; multiplier: number; leadDays: number } {
  const msPerDay = 1000 * 60 * 60 * 24;
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const targetMidnight = new Date(preferredDate.getFullYear(), preferredDate.getMonth(), preferredDate.getDate());
  const leadDays = Math.round((targetMidnight.getTime() - todayMidnight.getTime()) / msPerDay);
  const { tier, multiplier } = getDeliveryTier(leadDays);
  const fee = Number((baseRate * multiplier).toFixed(2));
  return { fee, tier, multiplier, leadDays };
}

export function tierLabel(tier: DeliveryTier): string {
  switch (tier) {
    case DeliveryTier.EXPRESS_SAME_DAY:
      return 'Same-Day Express (+100%)';
    case DeliveryTier.EXPRESS_NEXT_DAY:
      return 'Next-Day Express (+50%)';
    case DeliveryTier.SCHEDULED_PRIORITY:
      return 'Priority 2–3 Days (+20%)';
    case DeliveryTier.STANDARD:
      return 'Standard 4+ Days';
    default:
      return 'Unknown';
  }
}
