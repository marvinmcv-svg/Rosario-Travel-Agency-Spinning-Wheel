import {
  Binoculars,
  Camera,
  CarFront,
  Flame,
  Footprints,
  Landmark,
  Moon,
  Sailboat,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Telescope,
  TrainFront,
  Users,
  UtensilsCrossed,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { ActivityKind, TimeOfDay } from "@/lib/experiences";

export const kindIcon: Record<ActivityKind, LucideIcon> = {
  hike: Footprints,
  boat: Sailboat,
  wildlife: Binoculars,
  stars: Telescope,
  culture: Users,
  food: UtensilsCrossed,
  photo: Camera,
  train: TrainFront,
  geyser: Flame,
  ruins: Landmark,
  drive: CarFront,
  adventure: Zap,
};

export const timeIcon: Record<TimeOfDay, LucideIcon> = {
  dawn: Sunrise,
  morning: Sun,
  midday: Sun,
  afternoon: Sun,
  sunset: Sunset,
  night: Moon,
};

export { Sparkles };
