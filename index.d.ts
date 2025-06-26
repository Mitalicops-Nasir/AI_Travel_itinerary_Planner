type TheTripInDB = {
  country: string;
  duration: number;
  groupType: string;
  travelStyle: string;
  interests: string;
  budgetEstimate: string;
  id: string;
  createdAt: Date;
  userId: string;
  aiResponse: {
    tags: string[];
    images: string[];
    estimatedPrice: string;
    location: {
      city: string;
      coordinates: number[];
    } | null;
  } | null;
};

type TheSingleTrip = {
  // Main trip fields
  id: string;
  userId: string;
  country: string;
  duration: number;
  groupType: string;
  travelStyle: string;
  interests: string;
  budgetEstimate: string;
  aiResponse: {
    // AI response fields (flattened into this type)
    id: string;
    tripId: string;
    title: string;
    description: string;
    estimatedPrice: string;
    budget: string;
    tags: string[];
    bestTimeToVisit: string[];
    weatherInfo: string[];
    images: string[];
    location: {
      city: string;
      coordinates: number[];
    };
    itinerary: {
      day: {
        day: number;
        location: string;
        gettingThere: string;
        activities: {
          time: string;
          description: string;
        }[];
      }[];
    };
  };
  createdAt: Date;
};

declare interface Country {
  name: string;
  coordinates: [number, number];
  value: string;
  openStreetMap?: string;
}

declare interface Activity {
  time: string;
  description: string;
}

declare interface DayPlan {
  day: number;
  gettingThere: string;
  location: string;
  activities: Activity[];
}

declare interface TheLocation {
  city: string;
  coordinates: number[];
}

declare interface Trip {
  name: string;
  description: string;
  estimatedPrice: string;
  duration: number;
  budget: string;
  travelStyle: string;
  interests: string;
  groupType: string;
  country: string;
  imageUrls: string[];
  itinerary: DayPlan[];
  tags: string[];
  bestTimeToVisit: string[];
  weatherInfo: string[];
  location: TheLocation;
  payment_link?: string;
}

declare interface TripCardProps {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  tags: string[];
  price: string;
}

declare interface StatsCard {
  headerTitle: string;
  total: number;
  lastMonthCount: number;
  currentMonthCount: number;
}

declare interface TrendResult {
  trend: "increment" | "decrement" | "no change";
  percentage: number;
}

declare interface DashboardStats {
  totalUsers: number;
  usersJoined: {
    currentMonth: number;
    lastMonth: number;
  };
  userRole: {
    total: number;
    currentMonth: number;
    lastMonth: number;
  };
  totalTrips: number;
  tripsCreated: {
    currentMonth: number;
    lastMonth: number;
  };
}

declare interface DestinationProps {
  containerClass?: string;
  bigCard?: boolean;
  activityCount: number;
  rating: number;
  bgImage: string;
  title: string;
}

type GetAllTripsResponse = {
  allTrips: Models.Document[];
  total: number;
};

declare interface UsersItineraryCount {
  imageUrl: string;
  name: string;
  count: number;
}

declare interface TripsInterest {
  imageUrl: string;
  name: string;
  interest: string;
}

declare interface InfoPillProps {
  text: string;
  image: string;
}

declare interface TripFormData {
  country: string;
  travelStyle: string;
  interest: string;
  budget: string;
  duration: number;
  groupType: string;
}
