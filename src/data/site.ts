import villa from "@/assets/prop-villa.jpg";
import apartment from "@/assets/prop-apartment.jpg";
import house from "@/assets/prop-house.jpg";
import interior from "@/assets/interior.jpg";
import construction from "@/assets/construction.jpg";
import plots from "@/assets/plots.jpg";

export const company = {
  name: "A & I Realty",
  city: "Hyderabad",
  email: "aandirealtyhyd@gmail.com",
  phone: "+91 86048 60493",
  phoneHref: "tel:+918604860493",
  whatsapp: "918604860493",
  region: "Hyderabad, Telangana, India",
  tagline: "Dream. Build. Own.",
};

export const images = { villa, apartment, house, interior, construction, plots };

export type Property = {
  id: string;
  title: string;
  type: "Apartment" | "Villa" | "Independent House" | "Open Plot";
  status: "Sale" | "Rent";
  price: number; // INR (monthly for rent)
  locality: string;
  beds?: number;
  baths?: number;
  area: number; // in areaUnit (sq ft by default)
  areaUnit?: "sq ft" | "sq yd";
  lat: number;
  lng: number;
  images: string[];
  summary: string;
  amenities: string[];
};

// DEMO listings — illustrative only. Coordinates are neighbourhood centres, not real addresses.
export const properties: Property[] = [
  { id: "gachibowli-3bhk-premium-apartment", title: "3 BHK Premium Apartment", type: "Apartment", status: "Sale", price: 13800000, locality: "Gachibowli", beds: 3, baths: 3, area: 1850, lat: 17.4401, lng: 78.3489, images: [apartment, interior, villa], summary: "A bright corner apartment on a high floor with a deep sit-out balcony, minutes from the tech corridor and international schools.", amenities: ["Clubhouse", "Swimming pool", "Gym", "Power backup", "Covered parking", "24×7 security"] },
  { id: "kondapur-2bhk-modern-apartment", title: "2 BHK Modern Apartment", type: "Apartment", status: "Sale", price: 8200000, locality: "Kondapur", beds: 2, baths: 2, area: 1260, lat: 17.4632, lng: 78.3637, images: [apartment, interior, house], summary: "A well-planned two-bedroom home with an open kitchen and cross ventilation, in a gated community close to shopping and the metro.", amenities: ["Lift", "Children's play area", "Power backup", "Car parking", "CCTV"] },
  { id: "narsingi-4bhk-luxury-villa", title: "4 BHK Luxury Villa", type: "Villa", status: "Sale", price: 32500000, locality: "Narsingi", beds: 4, baths: 5, area: 3100, lat: 17.3850, lng: 78.3570, images: [villa, interior, house], summary: "A contemporary villa with double-height living, a private garden and a rooftop terrace, in a quiet gated villa community near the Outer Ring Road.", amenities: ["Private garden", "Rooftop terrace", "Clubhouse", "Gated community", "Solar water heating"] },
  { id: "miyapur-2bhk-family-apartment", title: "2 BHK Family Apartment", type: "Apartment", status: "Rent", price: 24000, locality: "Miyapur", beds: 2, baths: 2, area: 1120, lat: 17.4969, lng: 78.3578, images: [apartment, interior, house], summary: "A comfortable semi-furnished apartment for families, close to the Miyapur metro station, schools and daily shopping.", amenities: ["Semi-furnished", "Lift", "Metro nearby", "Power backup", "Security"] },
  { id: "manikonda-3bhk-premium-residence", title: "3 BHK Premium Residence", type: "Apartment", status: "Rent", price: 42000, locality: "Manikonda", beds: 3, baths: 3, area: 1650, lat: 17.4040, lng: 78.3870, images: [interior, apartment, villa], summary: "A spacious, well-finished residence with modular kitchen and wardrobes, a short drive from the Financial District.", amenities: ["Modular kitchen", "Wardrobes", "Gym", "Swimming pool", "Covered parking"] },
  { id: "tellapur-4bhk-independent-house", title: "4 BHK Independent House", type: "Independent House", status: "Sale", price: 24500000, locality: "Tellapur", beds: 4, baths: 4, area: 2850, lat: 17.4630, lng: 78.2860, images: [house, interior, villa], summary: "A G+1 independent house with a car porch, front garden and a family lounge upstairs, in one of the city's fastest-growing neighbourhoods.", amenities: ["Car porch", "Front garden", "Modular kitchen", "Rainwater harvesting", "Vastu-compliant"] },
  { id: "kukatpally-3bhk-residential-apartment", title: "3 BHK Residential Apartment", type: "Apartment", status: "Sale", price: 11200000, locality: "Kukatpally", beds: 3, baths: 3, area: 1720, lat: 17.4849, lng: 78.4138, images: [apartment, interior, house], summary: "A ready-to-move apartment with good natural light, close to KPHB, the metro line, hospitals and shopping.", amenities: ["Lift", "Clubhouse", "Power backup", "Play area", "24×7 security"] },
  { id: "shamshabad-residential-plot", title: "Residential Plot", type: "Open Plot", status: "Sale", price: 6900000, locality: "Shamshabad", area: 220, areaUnit: "sq yd", lat: 17.2403, lng: 78.4294, images: [plots, construction, house], summary: "An east-facing residential plot in a layout with laid roads and avenue planting, with easy access to the airport and the Outer Ring Road.", amenities: ["Laid roads", "Avenue trees", "Water lines", "Gated layout", "Near airport"] },
];

/** "1,850 sq ft" / "220 sq yd" */
export const sizeLabel = (p: Property) => `${p.area.toLocaleString("en-IN")} ${p.areaUnit ?? "sq ft"}`;
/** Size in sq ft, for filtering. */
export const areaSqft = (p: Property) => (p.areaUnit === "sq yd" ? p.area * 9 : p.area);

export const whatsappLink = (message: string) => `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(message)}`;
export const propertyWhatsApp = (title: string) => whatsappLink(`Hello A & I Realty, I'm interested in the ${title} listed on your website. Please share more details.`);

export const formatINR = (n: number, rent = false) => {
  const s =
    n >= 10000000 ? `₹${(n / 10000000).toFixed(n % 10000000 ? 2 : 0)} Cr`
    : n >= 100000 ? `₹${(n / 100000).toFixed(n % 100000 ? 1 : 0)} Lakh`
    : `₹${n.toLocaleString("en-IN")}`;
  return rent ? `${s}/mo` : s;
};

export type Service = { slug: string; title: string; short: string; body: string; image: string; points: string[] };

// Services verified from aandirealty.in
export const services: Service[] = [
  { slug: "buy-sell-rent", title: "Buying, Selling & Rentals", short: "Open plots, homes and commercial spaces across Hyderabad.", body: "We guide you through every stage of a property decision — shortlisting, site visits, documentation and handover — with our network of legal and technical experts alongside.", image: villa, points: ["Open plots", "Residential homes", "Commercial spaces", "Rental support"] },
  { slug: "residential-construction", title: "Residential Construction", short: "From foundation to finishing, homes built with care.", body: "Full-service construction for independent houses and villas, with clear stage-wise planning and quality checks at every milestone.", image: construction, points: ["Design coordination", "Stage-wise planning", "Material selection", "Timely delivery"] },
  { slug: "commercial-construction", title: "Commercial Construction", short: "Smart, durable spaces for business.", body: "Commercial buildings planned around function, compliance and long-term value — delivered with transparency on cost and timelines.", image: apartment, points: ["Offices & retail", "Structural planning", "Compliance support", "Project management"] },
  { slug: "architecture-interiors", title: "Architecture & Interiors", short: "Spaces shaped around how you live.", body: "Architectural planning and interior design that balance light, material and everyday comfort — from concept sketches to final styling.", image: interior, points: ["Space planning", "3D visualisation", "Interior design", "Material palettes"] },
  { slug: "quality-inspection", title: "Quality Inspection", short: "Independent checks before you commit.", body: "Detailed inspection of new and resale properties, so you understand structure, finishing and workmanship before you buy or take handover.", image: house, points: ["Structural review", "Finishing audit", "Snag lists", "Handover checks"] },
  { slug: "property-maintenance", title: "Property Maintenance", short: "Care for the places you own.", body: "Ongoing maintenance for homes, plots and rental properties, so your investment stays in good condition.", image: plots, points: ["Plot upkeep", "Repairs", "Tenant handover", "Periodic visits"] },
  { slug: "loans", title: "Loan Assistance", short: "Support with home and construction loans.", body: "We help you understand loan options and prepare documentation, working alongside banking partners to make financing simpler.", image: apartment, points: ["Eligibility guidance", "Documentation", "Bank coordination", "Construction loans"] },
];

export type Project = { slug: string; title: string; kind: string; image: string; note: string };

// Conceptual design studies — not completed A & I Realty projects.
export const projects: Project[] = [
  { slug: "courtyard-villa-study", title: "Courtyard Villa", kind: "Residential study", image: villa, note: "A layered stone villa organised around a shaded courtyard." },
  { slug: "garden-house-study", title: "Garden House", kind: "Independent home study", image: house, note: "Teak louvers and planted edges for a quiet suburban plot." },
  { slug: "living-room-study", title: "Double-Height Living", kind: "Interior study", image: interior, note: "Stone, walnut and linen under a wall of glass." },
  { slug: "tower-study", title: "Green Terraces", kind: "Mid-rise residential study", image: apartment, note: "Deep planted balconies for a hot, bright climate." },
];
