export enum FormFieldType {
  INPUT = "input",
  MARKDOWN_EDITOR = "markdownEditor",
  TEXTAREA = "textarea",
  PHONE_INPUT = "phoneInput",
  CHECKBOX = "checkbox",
  DATE_PICKER = "datePicker",
  SELECT = "select",
  SKELETON = "skeleton",
  PASSWORD = "password",
  NUMBER = "number",
}

export const sidebarItems = [
  {
    id: 1,
    icon: "/assets/icons/home.svg",
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    id: 3,
    icon: "/assets/icons/users.svg",
    label: "All Users",
    href: "/all-users",
  },
  {
    id: 4,
    icon: "/assets/icons/itinerary.svg",
    label: "AI Trips",
    href: "/AI-Trips",
  },
];

export const travelStyles = [
  "Relaxed",
  "Luxury",
  "Adventure",
  "Cultural",
  "Nature & Outdoors",
  "City Exploration",
];

export const interests = [
  "Food & Culinary",
  "Historical Sites",
  "Hiking & Nature Walks",
  "Beaches & Water Activities",
  "Museums & Art",
  "Nightlife & Bars",
  "Photography Spots",
  "Shopping",
  "Local Experiences",
];

export const budgetOptions = ["Budget", "Mid-range", "Luxury", "Premium"];

export const groupTypes = ["Solo", "Couple", "Family", "Friends", "Business"];

export const footers = ["Terms & Condition", "Privacy Policy"];

export const HandPickedTrips = [
  {
    id: 1,
    name: "Thornridge Cir. Shiloh",
    location: "St George’s Ln Singapore",
    price: "$300",
    imageDescription: "/assets/images/sample1.jpg",
    tags: ["Mountains", "City"],
  },
  {
    id: 2,
    name: "Roraima Tepui",
    location: "Canaima National Park, Venezuela",
    price: "$790",
    imageDescription: "/assets/images/sample2.jpg",
    tags: ["Solo travel", "Budget"],
  },
  {
    id: 3,
    name: "Socotra Island",
    location: "Yemen",
    price: "$870",
    imageDescription: "/assets/images/sample3.jpg",
    tags: ["Luxury", "Beach"],
  },
  {
    id: 4,
    name: "San Lake Baikal",
    location: "Siberia, Russia",
    price: "$604",
    imageDescription: "/assets/images/sample4.jpg",
    tags: ["Sports", "Adventurous"],
  },
  {
    id: 5,
    name: "Anse Source d'Argent",
    location: "La Digue, Seychelles",
    price: "$870",
    imageDescription: "/assets/images/sample.jpeg",
    tags: ["Beach", "Luxury"],
  },
  {
    id: 6,
    name: "Aysén Region",
    location: "Patagonia, Chile",
    price: "$604",
    imageDescription: "/assets/images/sample2.jpg",
    tags: ["Sports", "Adventurous"],
  },
  {
    id: 7,
    name: "Taman Negara",
    location: "Peninsular Malaysia",
    price: "$300",
    imageDescription: "/assets/images/sample4.jpg",
    tags: ["Mountains", "Budget"],
  },
  {
    id: 8,
    name: "Zhangye Landform",
    location: "Gansu, China",
    price: "$790",
    imageDescription: "/assets/images/sample.jpeg",
    tags: ["Solo travel", "City"],
  },
];

export const TotalPaginations = [
  {
    id: 1,
    value: 1,
    valueInString: "1",
  },
  {
    id: 2,
    value: 2,
    valueInString: "2",
  },
  {
    id: 3,
    value: 3,
    valueInString: "3",
  },
  {
    id: 4,
    value: 4,
    valueInString: "4",
  },
  {
    id: 5,
    value: 5,
    valueInString: "5",
  },
  {
    id: 6,
    value: 6,
    valueInString: "6",
  },
];

export const DemoTags = [
  {
    id: 1,
    tag: "Luxury",
  },
  {
    id: 2,
    tag: "Beach",
  },
  {
    id: 3,
    tag: "Mountains",
  },
  {
    id: 4,
    tag: "Budget",
  },
];

export const DemoStars = [
  {
    id: 1,
    number: "1",
    name: "/assets/icons/star.svg",
  },
  {
    id: 2,
    number: "2",
    name: "/assets/icons/star.svg",
  },
  {
    id: 3,
    number: "3",
    name: "/assets/icons/star.svg",
  },
  {
    id: 4,
    number: "4",
    name: "/assets/icons/star.svg",
  },
  {
    id: 5,
    number: "5",
    name: "/assets/icons/star.svg",
  },
];
