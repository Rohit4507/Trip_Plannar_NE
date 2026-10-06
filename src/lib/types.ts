export type StateCode = "AR" | "AS" | "ML" | "MN" | "MZ" | "NL" | "SK" | "TR";

export type Interest =
  | "nature"
  | "culture"
  | "adventure"
  | "wildlife"
  | "food"
  | "festivals"
  | "spiritual"
  | "photography"
  | "relax"
  | "offbeat";

export type Tier = "budget" | "mid" | "comfort";
export type Pace = "relaxed" | "balanced" | "packed";
export type Traveller = "solo" | "couple" | "friends" | "family";
export type Nationality = "indian" | "foreign";

export interface Place {
  id: string;
  n: string;
  st: StateCode;
  region: string;
  lat: number;
  lng: number;
  alt: number;
  tags: Interest[];
  /** typical sightseeing hours */
  hrs: number;
  /** ideal nights to actually experience the place */
  nights: number;
  gem: boolean;
  crowd: 1 | 2 | 3 | 4 | 5;
  fee: number;
  best: number[];
  avoid: number[];
  /** per person per night (stay + food) by tier */
  cost: Record<Tier, number>;
  blurb: string;
  photo: string;
  highlights: string[];
  hub?: boolean;
  gateway?: string;
}

export interface Edge {
  a: string;
  b: string;
  km: number;
  hrs: number;
  road: "highway" | "good" | "winding" | "rough" | "trek";
  note?: string;
}

export interface StateMeta {
  code: StateCode;
  name: string;
  nickname: string;
  color: string;
  permit: "none" | "ILP" | "PAP";
  bestWindow: string;
  monsoon: string;
  gateway: string;
  transit: string;
  photo: string;
  tagline: string;
  food: string[];
  fact: string;
}

export interface PermitInfo {
  state: StateCode;
  stateName: string;
  indian: string;
  foreign: string;
  portal: string;
  feeIndian: string;
  feeForeign: string;
  processing: string;
  validity: string;
  documents: string[];
  tips: string[];
}

export interface Festival {
  name: string;
  state: StateCode;
  where: string;
  month: number;
  days: string;
  what: string;
}

export interface PlannerInput {
  months: number[];
  days: number;
  interests: Interest[];
  tier: Tier;
  pace: Pace;
  traveller: Traveller;
  people: number;
  nationality: Nationality;
  states: StateCode[];
  budget?: number;
  start?: string;
  avoidPermits?: boolean;
  seed?: string;
}

export type BlockKind =
  | "travel"
  | "sight"
  | "meal"
  | "experience"
  | "stay"
  | "permit"
  | "buffer";

export interface PlanBlock {
  time: string;
  kind: BlockKind;
  title: string;
  placeId?: string;
  detail?: string;
  cost?: number;
  minutes?: number;
}

export interface PlanDay {
  index: number;
  date?: string;
  title: string;
  baseId: string;
  base: string;
  state: StateCode;
  driveKm: number;
  driveHrs: number;
  blocks: PlanBlock[];
  alt?: string;
  note?: string;
}

export interface BudgetLine {
  key: string;
  label: string;
  amount: number;
  detail: string;
  color: string;
}

export interface Leg {
  fromId: string;
  toId: string;
  from: string;
  to: string;
  km: number;
  hrs: number;
  mode: string;
  cost: number;
  road: string;
  note?: string;
}

export interface Itinerary {
  slug: string;
  createdAt: string;
  title: string;
  summary: string;
  input: PlannerInput;
  gateway: { id: string; name: string; code: string; note: string };
  places: Place[];
  days: PlanDay[];
  legs: Leg[];
  budget: {
    perPerson: number;
    total: number;
    lines: BudgetLine[];
    dailyAvg: number;
    fitsBudget: boolean;
    userBudget?: number;
  };
  permits: {
    needed: StateCode[];
    indian: { state: string; fee: string; portal: string; processing: string; note?: string }[];
    foreign: { state: string; fee: string; portal: string; processing: string; note?: string }[];
    steps: string[];
    costPerPerson: number;
  };
  hiddenGems: { place: Place; why: string; when: string }[];
  alternatives: { title: string; body: string; save?: string }[];
  packing: string[];
  tips: string[];
  reasoning: { label: string; text: string }[];
  metrics: {
    km: number;
    driveHrs: number;
    states: number;
    experiences: number;
    gems: number;
    greenScore: number;
  };
}
