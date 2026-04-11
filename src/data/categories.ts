import {
  Landmark, TreePine, UtensilsCrossed, Music, ShoppingBag,
  Castle, Moon, Leaf, SmilePlus, Sparkles,
} from 'lucide-react';

export interface TripCategory {
  id: string;
  label: string;
  icon: typeof Landmark;
  description: string;
}

export const TRIP_CATEGORIES: TripCategory[] = [
  { id: 'culture', label: 'Culture', icon: Landmark, description: 'Museums, galleries, architecture, art spaces' },
  { id: 'nature', label: 'Nature', icon: TreePine, description: 'Parks, lakes, mountains, scenic walks' },
  { id: 'food-drink', label: 'Food & Drink', icon: UtensilsCrossed, description: 'Restaurants, cafés, street food, markets' },
  { id: 'entertainment', label: 'Entertainment', icon: Music, description: 'Concerts, shows, festivals, events' },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag, description: 'Boutiques, markets, shopping streets' },
  { id: 'history', label: 'History', icon: Castle, description: 'Castles, palaces, old towns, heritage sites' },
  { id: 'nightlife', label: 'Nightlife', icon: Moon, description: 'Bars, clubs, late-night music venues' },
  { id: 'relaxation', label: 'Relaxation', icon: Leaf, description: 'Spas, thermal baths, quiet parks' },
  { id: 'family', label: 'Family-Friendly', icon: SmilePlus, description: 'Zoos, interactive museums, kid-friendly' },
  { id: 'hidden-gems', label: 'Hidden Gems', icon: Sparkles, description: 'Lesser-known local favorites' },
];
