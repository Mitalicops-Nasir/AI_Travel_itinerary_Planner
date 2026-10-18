export type TripPromptInput = {
  country: string;
  duration: number;
  budgetEstimate: string;
  interests: string;
  travelStyle: string;
  groupType: string;
};

export function buildTripPrompt(input: TripPromptInput): string {
  return `Generate a ${input.duration}-day travel itinerary for ${input.country} based on the following user information:
    Budget: '${input.budgetEstimate}'
    Interests: '${input.interests}'
    TravelStyle: '${input.travelStyle}'
    GroupType: '${input.groupType}'
    Additional rules to follow when generating the itinerary:
     1. Always recommend realistic transportation methods between cities (e.g., train, bus, car).
     2. Include estimated travel time when moving between cities or regions.
     3. If travel occurs on a day, include a "Getting There" section with details on how the trip continues from the previous city.
     4. Avoid impractical back-and-forth travel — follow a logical geographic flow.
     5. Make sure all activities and transport fit within the selected budget (e.g., "Budget", "Mid-range", "Luxury").
     6. Do not repeat cities unless it is realistic for return travel or departure.
     7. Only add the "Midnight" activity to places known for nightlife or late-night activities; omit it when nothing applies.

    Return ONLY a valid JSON object (no markdown, no code fences) with exactly this structure:
    {
      "name": "A descriptive title for the trip",
      "description": "A brief description of the trip and its highlights not exceeding 100 words",
      "estimatedPrice": "6000",
      "duration": ${input.duration},
      "budget": "${input.budgetEstimate}",
      "travelStyle": "${input.travelStyle}",
      "country": "${input.country}",
      "interests": "${input.interests}",
      "groupType": "${input.groupType}",
      "tags": ["Catchy tag 1", "Catchy tag 2", "Catchy tag 3", "Catchy tag 4"],
      "bestTimeToVisit": [
        "🌸 Season (from month to month): reason to visit",
        "☀️ Season (from month to month): reason to visit",
        "🍁 Season (from month to month): reason to visit",
        "❄️ Season (from month to month): reason to visit"
      ],
      "weatherInfo": [
        "☀️ Season: temperature range in Celsius (temperature range in Fahrenheit)",
        "🌦️ Season: temperature range in Celsius (temperature range in Fahrenheit)",
        "🌧️ Season: temperature range in Celsius (temperature range in Fahrenheit)",
        "❄️ Season: temperature range in Celsius (temperature range in Fahrenheit)"
      ],
      "location": {
        "city": "Name of the city or region",
        "coordinates": [latitude, longitude]
      },
      "itinerary": [
        {
          "day": 1,
          "location": "City/Region Name",
          "gettingThere": "",
          "activities": [
            {"time": "Morning", "description": "🏰 Visit the local historic castle and enjoy a scenic walk"},
            {"time": "Afternoon", "description": "🖼️ Explore a famous art museum with a guided tour"},
            {"time": "Evening", "description": "🍷 Dine at a rooftop restaurant with local wine"}
          ]
        }
      ]
    }`;
}
