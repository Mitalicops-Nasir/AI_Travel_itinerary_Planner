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
    id: 2,
    icon: "/assets/icons/users.svg",
    label: "All Users",
    href: "/all-users",
  },
  {
    id: 3,
    icon: "/assets/icons/itinerary.svg",
    label: "AI Trips",
    href: "/AI-Trips",
  },
  {
    id: 4,
    icon: "/assets/icons/plus.svg",
    label: "Create Trips",
    href: "/Create-Trips",
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
