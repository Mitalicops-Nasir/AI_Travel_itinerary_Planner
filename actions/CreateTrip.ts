"use server";

import { db } from "@/data/db";
import {
  NewTrip,
  TripGenerateSchema,
} from "@/FormsRelatedConfig/validationZod/TripGenerateSchema";
import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";

type TripGenerateOutput = z.infer<typeof TripGenerateSchema>;

export async function createTrip(
  values: z.infer<typeof NewTrip>,
  userId: string,
) {
  try {
    const trip = await db.trip.create({
      data: {
        userId: userId,
        country: values.country,
        duration: values.duration,
        groupType: values.groupType,
        travelStyle: values.travelStyle,
        interests: values.interests,
        budgetEstimate: values.budgetEstimate,
      },
    });

    return {
      success: "Trip created successfully",
      trip: trip,
    };
  } catch (error) {
    console.error("Error creating trip:", error);
    throw new Error("Failed to create trip");
  }
}

export async function GenerateAITripIternary(
  values: z.infer<typeof NewTrip>,
  userId: string,
) {
  try {
    const unsplashApiKey = process.env.UNSPLASH_ACCESS_KEY!;

    const imageResponse = await fetch(
      `https://api.unsplash.com/search/photos?query=${values.country} ${values.interests} ${values.travelStyle}&client_id=${unsplashApiKey}`,
    );

    const imageUrls = (await imageResponse.json()).results
      .slice(0, 3)
      .map((result: any) => result.urls?.regular || null);

    const prompt = `Generate a ${values.duration}-day travel itinerary for ${values.country} based on the following user information:
    Budget: '${values.budgetEstimate}'
    Interests: '${values.interests}'
    TravelStyle: '${values.travelStyle}'
    GroupType: '${values.groupType}'
    Additional rules to follow when generating the itinerary:
     1. Always recommend realistic transportation methods between cities (e.g., train, bus, car).
     2. Include estimated travel time when moving between cities or regions.
     3. If travel occurs on a day, include a "Getting There" section with details on how the trip continues from the previous city.
     4. Avoid impractical back-and-forth travel — follow a logical geographic flow.
     5. Make sure all activities and transport fit within the selected budget (e.g., "Budget", "Mid-range", "Luxury").
     6. Do not repeat cities unless it is realistic for return travel or departure.
     7. The Midnight activity should should be given to cities or places that are known for nightlife or late-night activities. 
        also dont add the array element if no midnight is applicable to the place

    Return the itinerary and lowest estimated price in a clean, non-markdown JSON format with the following structure:
    {
    "name": "A descriptive title for the trip",
    "description": "A brief description of the trip and its highlights not exceeding 100 words",
    "estimatedPrice": "Lowest average price for the trip in USD, e.g.price only in digits like 6000, no currency sign",
    "duration": ${values.duration},
    "budget": "${values.budgetEstimate}",
    "travelStyle": "${values.travelStyle}",
    "country": "${values.country}",
    "interests": ${values.interests},
    "groupType": "${values.groupType}",
    "tags": [
      'Like Mountains',
      'Like cool stuff about the place',
      'Weather It is cheap or expensive idk something like that',
      'something else that when user sees they click'
    ],
    "bestTimeToVisit": [
      '🌸 Season (from month to month): reason to visit',
      '☀️ Season (from month to month): reason to visit',
      '🍁 Season (from month to month): reason to visit',
      '❄️ Season (from month to month): reason to visit'
    ],
    "weatherInfo": [
      '☀️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
      '🌦️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
      '🌧️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
      '❄️ Season: temperature range in Celsius (temperature range in Fahrenheit)'
    ],
    "location": {
      "city": "name of the city or region",
      "coordinates": [latitude, longitude],
      "openStreetMap": "link to open street map"
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
        {"time": "Midnight", "description": ""}
      ]
    },
    ...
    ]
    }`;

    const model = google("gemini-2.5-flash");

    // const { object: aiTrip } = await <Trip>({
    //   model,
    //   prompt,
    //   schema: TripGenerateSchema,
    // });

    const result = await generateText({
      model: model,
      // @ts-expect-error - complex schema causes deep type instantiation
      output: Output.object({ schema: TripGenerateSchema }),
      prompt: prompt,
    });

    const aiTrip = result.output as any as TripGenerateOutput;

    if (!aiTrip) {
      return { success: false, error: "Failed to generate AI trip itinerary" };
    }

    const makeTripInDB = await createTrip(values, userId);

    const MakeAITripResponseInDB = await db.aIResponse.create({
      data: {
        tripId: makeTripInDB.trip.id,
        title: aiTrip.name as string,
        description: aiTrip.description as string,
        estimatedPrice: aiTrip.estimatedPrice as string,
        duration: aiTrip.duration as number,
        budget: aiTrip.budget as string,
        travelStyle: aiTrip.travelStyle as string,
        interests: aiTrip.interests as string,
        groupType: aiTrip.groupType as string,
        tags: aiTrip.tags as string[],
        country: aiTrip.country as string,
        images: imageUrls,
        itinerary: {
          // @ts-expect-error - complex schema causes deep type instantiation
          day: aiTrip.itinerary.map(
            // @ts-expect-error - complex schema causes deep type instantiation
            (day: (typeof aiTrip.itinerary)[number]) => ({
              day: day.day,
              location: day.location,
              gettingThere: day.gettingThere,
              activities: day.activities.map(
                (activity: (typeof day.activities)[number]) => ({
                  time: activity.time,
                  description: activity.description,
                }),
              ),
            }),
          ),
        },
        bestTimeToVisit: aiTrip.bestTimeToVisit as string[],
        weatherInfo: aiTrip.weatherInfo as string[],
        location: {
          // @ts-expect-error - complex schema causes deep type instantiation
          city: aiTrip.location.city as any,
          // @ts-expect-error - complex schema causes deep type instantiation
          coordinates: aiTrip.location.coordinates as [number, number],
        },
      },
    });

    return {
      success: true,
      aiTrip: MakeAITripResponseInDB,
    };
  } catch (error) {
    console.log("Error generating AI trip itinerary:", error);
    return { success: false, error: "Failed to generate AI trip itinerary" };
  }
}
