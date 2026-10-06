import type { Festival, Interest, PermitInfo, StateCode, StateMeta } from "@/lib/types";

export const STATE_META: Record<StateCode, StateMeta> = {
  AR: { code: "AR", name: "Arunachal Pradesh", nickname: "Land of the Dawn-Lit Mountains", color: "#E4623F", permit: "PAP", bestWindow: "Oct–Apr", monsoon: "Landslides close Tawang road for days", gateway: "Guwahati (GAU) / Dibrugarh (DIB)", transit: "Shared Sumo + private cab; Bhalukpong, Kimin, Kanubari checkgates", photo: "/images/hero.jpg", tagline: "India's last frontier — 26 tribes, 4 big cats, 10,000 ft monasteries", food: ["Thukpa", "Momos (Memba style)", "Bamboo shoot pork", "Apong rice beer", "Zan"] , fact: "Tawang Monastery is the largest in India and second largest in the world." },
  AS: { code: "AS", name: "Assam", nickname: "Gateway to the Seven Sisters", color: "#C05621", permit: "none", bestWindow: "Nov–Apr", monsoon: "Kaziranga closes Jun–Oct (flooding)", gateway: "Guwahati (GAU)", transit: "Best rail + road network in the NE; NH715 4-lane", photo: "/images/hero.jpg", tagline: "Rhinos, Brahmaputra sunsets, tea bungalows and the world's largest river island", food: ["Masor tenga", "Khar", "Jadoh", "Pitha", "Assam tea"], fact: "Kaziranga holds two-thirds of the world's one-horned rhino population." },
  ML: { code: "ML", name: "Meghalaya", nickname: "Abode of Clouds", color: "#1FA97A", permit: "none", bestWindow: "Oct–Apr (waterfalls Jun–Sep)", monsoon: "Heaviest rain on earth — spectacular, but trails close", gateway: "Guwahati (GAU)", transit: "Shared Sumo from Police Bazaar; NH6 to Guwahati", photo: "/images/root-bridge.jpg", tagline: "Living root bridges, crystal rivers, and the wettest places on the planet", food: ["Jadoh", "Doh khleh", "Nakham bitchi", "Tungrymbai", "Pukhlein"], fact: "Nongriat's double-decker root bridge has been growing for roughly 500 years." },
  MN: { code: "MN", name: "Manipur", nickname: "Jewel of India", color: "#7C5CFF", permit: "none", bestWindow: "Oct–Mar", monsoon: "Heavy rain, poor road to Imphal", gateway: "Imphal (IMF)", transit: "Imphal airport; NH2 from Dimapur", photo: "/images/loktak.jpg", tagline: "A floating national park, a market of 5,000 women, and the Shirui lily", food: ["Eromba", "Chak-hao kheer", "Singju", "Ngari", "Chamthong"], fact: "Keibul Lamjao is the only floating national park on earth — home of the sangai deer." },
  MZ: { code: "MZ", name: "Mizoram", nickname: "Land of the Highlanders", color: "#2E7DAF", permit: "ILP", bestWindow: "Oct–Mar", monsoon: "Steep, landslide-prone hill roads", gateway: "Aizawl (AJL) via Kolkata/Guwahati", transit: "Sumo network along NH6; Silchar entry at Vairengte", photo: "/images/hero.jpg", tagline: "Ridge cities, bamboo hills and the cleanest state in India", food: ["Bai", "Vawksa rep", "Misa mach poora", "Chhangban", "Panchan"], fact: "Aizawl runs along a single ridge at 1,132 m — the whole city is one street." },
  NL: { code: "NL", name: "Nagaland", nickname: "Land of Festivals", color: "#D64545", permit: "ILP", bestWindow: "Oct–Dec (Hornbill 1–10 Dec)", monsoon: "Dzukou trek gets dangerous", gateway: "Dimapur (DMU)", transit: "Rail at Dimapur; NH29 from Guwahati, NH2 to Imphal", photo: "/images/hornbill.jpg", tagline: "Sixteen tribes, the last tattooed head-hunters, and one epic December festival", food: ["Smoked pork with akhuni", "Bamboo shoot stew", "Axone chutney", "Zutho rice beer", "Boiled yam"], fact: "The Hornbill Festival gathers all 16 Naga tribes in one heritage village each December." },
  SK: { code: "SK", name: "Sikkim", nickname: "The Brother State", color: "#5B8DEF", permit: "none", bestWindow: "Mar–May, Oct–Dec", monsoon: "North Sikkim roads routinely wash out", gateway: "Bagdogra (IXB) / Pakyong (PKY)", transit: "Shared jeeps from Gangtok; permits needed for Nathu La & North Sikkim", photo: "/images/hero.jpg", tagline: "Kanchenjunga up close, alpine lakes and the Goechala trail", food: ["Momo", "Thukpa", "Phagshapa", "Gundruk", "Chhurpi soup"], fact: "Sikkim is India's first fully organic state — and its least polluted." },
  TR: { code: "TR", name: "Tripura", nickname: "Land of Fourteen Gods", color: "#B7791F", permit: "none", bestWindow: "Oct–Mar", monsoon: "Hot and humid Apr–Sep", gateway: "Agartala (IXA)", transit: "Agartala airport & rail; winding roads to Unakoti", photo: "/images/hero.jpg", tagline: "A water palace, a lake of carved gods and orange hills on the Myanmar border", food: ["Mui borok", "Berma", "Chakhwi", "Wahan mosdeng", "Panchi"], fact: "Neermahal, built in 1930, is India's only lake palace outside Rajasthan." },
};

export const STATES: StateMeta[] = Object.values(STATE_META);

export const PERMITS: Record<StateCode, PermitInfo> = {
  AR: {
    state: "AR", stateName: "Arunachal Pradesh",
    indian: "Inner Line Permit (eILP) — mandatory for every non-resident Indian. Checked at Bhalukpong, Kimin, Kanubari and other gates.",
    foreign: "Protected Area Permit (PAP) — not an ILP. Must be filed by a government-registered tour operator, minimum group of 2, 2–4 weeks processing.",
    portal: "arunachalilp.com",
    feeIndian: "₹300 (up to 3 days) · ₹500 (up to 14 days)",
    feeForeign: "USD 50 + operator handling (₹4,500–₹5,500 all-in)",
    processing: "24–48 hrs online · same-day at Arunachal Bhawan Delhi/Guwahati",
    validity: "Up to 30 days from entry date (eILP); 30 days for PAP",
    documents: ["Aadhaar / Passport / Voter ID scan", "Passport-size photo on white background (20–50 KB)", "Exact entry date + every district you may visit"],
    tips: [
      "Add every district you might possibly enter — adding later means reapplying. Going to Tawang? Add Tawang, West Kameng and Tawang's border belt.",
      "Bum La Pass needs a separate Army permit arranged in Tawang the day before — carry 2 photocopies of your ILP and ID.",
      "Print the ILP twice. Physical copies are still demanded at checkgates where network fails.",
      "Foreign nationals: solo travel is not permitted. Book with a registered operator at least 3 weeks out.",
    ],
  },
  NL: {
    state: "NL", stateName: "Nagaland",
    indian: "Inner Line Permit required for non-resident Indians entering Nagaland (Dimapur is exempt for some travellers, but carry it anyway).",
    foreign: "Foreigners must register on the FRRO/Foreigners Registration portal and RAP rules apply — no separate fee, but details are logged.",
    portal: "ilpnagaland.com / ilp.nagaland.gov.in",
    feeIndian: "₹20 form + ₹120 processing (₹50 at Nagaland House Delhi)",
    feeForeign: "Free registration, mandatory reporting",
    processing: "1–3 days online · same-day at Nagaland House (Delhi/Kolkata) or Dimapur DC office",
    validity: "15 days, extendable by a further 15",
    documents: ["Photo ID (Aadhaar/PAN/Voter ID)", "1 passport photo", "Duration and purpose of visit"],
    tips: [
      "Apply for ILP at least 4 days before Hornbill week — the office gets slammed in late November.",
      "Kohima is reachable without leaving the permit zone only if your ILP lists Kohima district; list Kohima, Dimapur, Mokokchung and Mon if you're going east.",
      "Carry cash for the Hornbill Festival — most stalls and homestays are cash-only.",
    ],
  },
  MZ: {
    state: "MZ", stateName: "Mizoram",
    indian: "Inner Line Permit required for non-resident Indians. Issued at Vairengte checkgate on NH6 or online.",
    foreign: "Foreigners must register with the FRRO within 24 hours of arrival; no PAP needed for the main circuits.",
    portal: "mizoramilp.mizoram.gov.in",
    feeIndian: "₹120 processing",
    feeForeign: "Free registration, mandatory FRRO reporting",
    processing: "1–3 days online · 2–3 hrs at Vairengte gate",
    validity: "15 days (temporary) / 30 days (regular)",
    documents: ["Photo ID", "1 photo", "Address proof for longer stays"],
    tips: [
      "Mizoram Sundays are silent — shops shut, transport stops. Plan arrival on a weekday.",
      "Aizawl to Champhai is 7 hrs of hairpins; break it at Saitual or Ngopa.",
    ],
  },
  MN: {
    state: "MN", stateName: "Manipur",
    indian: "No permit for Indian nationals (ILP was notified but is not enforced for tourists — carry ID).",
    foreign: "No RAP/PAP for Imphal, Loktak and Ukhrul circuits. Register with the FRRO if staying beyond 180 days.",
    portal: "—",
    feeIndian: "Free",
    feeForeign: "Free",
    processing: "Instant",
    validity: "—",
    documents: ["Government photo ID", "Hotel booking proof for checkpoints"],
    tips: ["NH2 from Dimapur to Imphal has army convoys — leave early, allow 6–7 hrs.", "Loktak boat rides are best before 9 am for mirror conditions."],
  },
  SK: {
    state: "SK", stateName: "Sikkim",
    indian: "No ILP for Sikkim. Nathu La, Tsomgo, Gurudongmar and North Sikkim need a Protected Area Permit arranged in Gangtok.",
    foreign: "No RAP for Gangtok/Pelling/Ravangla. Nathu La and Gurudongmar are closed to foreign nationals.",
    portal: "Sikkim Tourism / registered Gangtok operator",
    feeIndian: "₹0 permit + ₹2,000–3,000 vehicle & guide",
    feeForeign: "Free (areas restricted)",
    processing: "Same day in Gangtok with 2 photos + ID",
    validity: "Specific dates only, usually 1–3 days",
    documents: ["2 passport photos", "Photo ID", "Vehicle details"],
    tips: ["Tsomgo–Nathu La is closed on Tuesdays for maintenance.", "Gurudongmar needs an early 4 am start from Lachung; carry a permit photocopy for each checkpoint."],
  },
  AS: {
    state: "AS", stateName: "Assam",
    indian: "No permit of any kind.",
    foreign: "No permit. Standard Indian visa applies.",
    portal: "—", feeIndian: "Free", feeForeign: "Free", processing: "—", validity: "—",
    documents: ["Photo ID"],
    tips: ["Kaziranga is closed mid-June to mid-October. Book safaris in the Kohora (Central) and Bagori (Western) ranges online in peak season."],
  },
  ML: {
    state: "ML", stateName: "Meghalaya",
    indian: "No permit of any kind — the easiest state to enter in the Northeast.",
    foreign: "No permit required.",
    portal: "—", feeIndian: "Free", feeForeign: "Free", processing: "—", validity: "—",
    documents: ["Photo ID"],
    tips: ["Dawki water is only glass-clear from November to March.", "Mobile networks die in Nongriat — tell someone before you descend the 3,500 steps."],
  },
  TR: {
    state: "TR", stateName: "Tripura",
    indian: "No permit required.",
    foreign: "No permit. Being a border state, carry your passport at all times as checks are common.",
    portal: "—", feeIndian: "Free", feeForeign: "Free", processing: "—", validity: "—",
    documents: ["Photo ID"],
    tips: ["ATMs are sparse beyond Agartala — withdraw before Unakoti or Jampui."],
  },
};

export const FESTIVALS: Festival[] = [
  { name: "Magh Bihu / Bhogali Bihu", state: "AS", where: "Across Assam", month: 1, days: "14–16 Jan", what: "Harvest feasting around bonfires — strangers will pull you in to eat." },
  { name: "Nongkrem Dance", state: "ML", where: "Smit, near Shillong", month: 11, days: "Nov (5 days)", what: "Khasi thanksgiving dance in full regalia at the Syiem's palace." },
  { name: "Losar", state: "AR", where: "Tawang & West Kameng", month: 2, days: "Feb (3 days)", what: "Monpa New Year — masked cham dances at Tawang Monastery." },
  { name: "Chapchar Kut", state: "MZ", where: "Aizawl", month: 3, days: "Mar (2 days)", what: "Mizo spring festival — Cheraw bamboo dance in the state capital." },
  { name: "Shirui Lily Festival", state: "MN", where: "Ukhrul", month: 5, days: "May (4 days)", what: "Celebrate the lily that grows nowhere else, with Tangkhul Naga culture." },
  { name: "Moatsü", state: "NL", where: "Mokokchung", month: 5, days: "1–3 May", what: "Ao Naga sowing festival — storytelling, tug-of-war and zutho." },
  { name: "Rongali / Bohag Bihu", state: "AS", where: "Across Assam", month: 4, days: "14–20 Apr", what: "The Assamese new year — husori singing, dhol and bihu dance." },
  { name: "Ziro Music Festival", state: "AR", where: "Ziro Valley", month: 9, days: "Late Sep (4 days)", what: "Indie bands in an Apatani paddy field. India's most beautiful festival site." },
  { name: "Durga Puja", state: "TR", where: "Agartala", month: 10, days: "Oct (5 days)", what: "Bengali-scale pandals in a princely city — book rooms a month out." },
  { name: "Sangai Festival", state: "MN", where: "Imphal", month: 11, days: "21–30 Nov", what: "Manipur's flagship festival — dance, polo, canoe races and Manipuri handloom." },
  { name: "Wangala", state: "ML", where: "Asanang, Tura", month: 11, days: "Nov (2 days)", what: "Hundred-drum Garo harvest festival — the largest indigenous gathering in the Garo Hills." },
  { name: "Hornbill Festival", state: "NL", where: "Kisama, Kohima", month: 12, days: "1–10 Dec", what: "All 16 Naga tribes in one valley — morungs, war dances, the Naga Idol contest and India's biggest indie-rock night." },
];

export const INTEREST_META: { id: Interest; label: string; emoji: string; hint: string }[] = [
  { id: "nature", label: "Nature & Landscapes", emoji: "🏞️", hint: "Waterfalls, lakes, valleys, canyons" },
  { id: "culture", label: "Tribal Culture", emoji: "🪘", hint: "Villages, weaves, monasteries, markets" },
  { id: "adventure", label: "Trek & Adventure", emoji: "🥾", hint: "Treks, rafting, caving, climbing" },
  { id: "wildlife", label: "Wildlife", emoji: "🦏", hint: "Rhinos, tigers, gibbons, birding" },
  { id: "food", label: "Food & Brews", emoji: "🍲", hint: "Naga kitchens, jadoh, tea, rice beer" },
  { id: "festivals", label: "Festivals", emoji: "🎉", hint: "Hornbill, Ziro, Bihu, Wangala" },
  { id: "spiritual", label: "Monasteries & Temples", emoji: "🛕", hint: "Gompas, satras, shrines" },
  { id: "photography", label: "Photography", emoji: "📷", hint: "Golden-hour icon spots" },
  { id: "relax", label: "Slow & Scenic", emoji: "🫖", hint: "Estate stays, lakes, hammocks" },
  { id: "offbeat", label: "Hidden Gems", emoji: "💎", hint: "Places with almost no tourists" },
];

export const GATEWAYS: { id: string; name: string; code: string; note: string }[] = [
  { id: "guwahati", name: "Guwahati", code: "GAU / LGB", note: "Best connected. Direct flights from Delhi, Mumbai, Kolkata, Bengaluru; rail hub for the whole NE." },
  { id: "dimapur", name: "Dimapur", code: "DMU", note: "Rail + airport. Best for Nagaland and a scenic NH2 run to Imphal." },
  { id: "jorhat", name: "Jorhat", code: "JRT / JRH", note: "Upper Assam — closest airport to Majuli and the tea estates." },
  { id: "dibru", name: "Dibrugarh", code: "DIB", note: "Eastern Assam. Gateway to Namdapha, Roing and the Dibang valley." },
  { id: "itanagar", name: "Naharlagun", code: "HNL", note: "Railhead and airport for Itanagar and Ziro." },
  { id: "imphal", name: "Imphal", code: "IMF", note: "Manipur's airport — also the fastest way into Loktak." },
  { id: "aizawl", name: "Aizawl", code: "AJL", note: "Mizoram — connect via Kolkata or Guwahati." },
  { id: "agartala", name: "Agartala", code: "IXA", note: "Tripura — direct flights from Kolkata and Guwahati." },
  { id: "gangtok", name: "Bagdogra / Siliguri", code: "IXB / NJP", note: "Sikkim — 4.5 hrs to Gangtok, shared jeeps available." },
];

export const SEASON_NOTES: { months: number[]; label: string; title: string; body: string; tone: "peak" | "good" | "risk" }[] = [
  { months: [10, 11], label: "Peak · Oct–Nov", title: "The sweet spot", body: "Monsoon has retreated, Kaziranga has just reopened, landscapes are impossibly green and Hornbill hasn't started. Best weather-to-crowd ratio of the year.", tone: "peak" },
  { months: [12, 1, 2], label: "Winter · Dec–Feb", title: "Festivals and frost", body: "Hornbill (1–10 Dec), Losar and Magh Bihu. Clear Himalayan views, cold nights at altitude, Sela Pass snowbound. Book 2 months ahead for December.", tone: "peak" },
  { months: [3, 4, 5], label: "Spring · Mar–May", title: "Blooms and empty trails", body: "Rhododendrons in Sikkim and Arunachal, Shirui lilies in Ukhrul, Rongali Bihu. Warm days, cold mornings, almost no crowds outside Ziro.", tone: "good" },
  { months: [6, 7, 8, 9], label: "Monsoon · Jun–Sep", title: "Spectacular and difficult", body: "Cherrapunji and Mawsynram at full fury — waterfalls you'll never forget. But trails close, roads landslide, and Kaziranga shuts. September is the best compromise (Ziro Festival).", tone: "risk" },
];

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const PRACTICAL_TIPS = [
  "Carry cash. UPI works in Guwahati, Shillong and Gangtok — but not in Nongriat, Mechuka, Longwa or Mawphanlur. Withdraw in the nearest big town.",
  "Networks: Jio and Airtel are the most reliable across the Northeast. BSNL is the only option in some Arunachal valleys.",
  "Shared Sumos are the backbone of Northeast travel — 10-seater jeeps on fixed routes for ₹150–500 a seat. They leave when full, usually 6–9 am.",
  "Build in a buffer day. Landslides, fog on Sela, and Bandh calls (strikes) are real. Never plan a flight for the same day as a long mountain drive.",
  "Ask before photographing people, especially elders in Nagaland and Arunachal. Many will say yes; some will ask for a copy — take a WhatsApp number.",
  "In Meghalaya and Nagaland, pork and beef are everyday food. Vegetarians will survive on jadoh (ask for the no-meat version), dal, momos and seasonal vegetables — but tell your host in advance.",
  "Sunscreen and a down jacket in the same bag: 15°C in the valley, -5°C on Sela the same afternoon.",
  "Respect dry days: Nagaland, Mizoram and Manipur are largely dry states. Don't carry alcohol across state lines.",
  "Homestays are the point, not a compromise. A Khasi, Apatani or Angami family will feed you better than any hotel for a third of the price.",
];

export const PACKING: Record<string, string[]> = {
  all: ["Layered clothing — fleece + windproof shell", "Rain shell or umbrella (it is the wettest region on earth)", "Power bank (10,000 mAh+) and a 3-socket strip for homestays", "Torch / headlamp for power cuts", "Basic medical kit + altitude meds if crossing Sela or Gurudongmar", "Photocopies of ID, permits and passport — 3 sets", "Reusable water bottle + purification tablets"],
  winter: ["Down jacket (Sela, Tawang, Gurudongmar go below -5°C)", "Thermal inners, woollen cap, gloves", "Waterproof trekking boots"],
  monsoon: ["Quick-dry clothing", "Waterproof phone pouch and dry bag", "Leech socks for Meghalaya treks", "Sandals with grip"],
  summer: ["Sunscreen SPF 50, sunglasses, cap", "Light long sleeves for sun and insects"],
  trek: ["Broken-in trekking shoes", "Daypack with rain cover", "Trekking pole for Dzukou / Goechala / Nongriat"],
};
