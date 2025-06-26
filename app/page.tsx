import { GetAllTrips } from "@/actions/Trip";
import FeaturedTravelSpot from "@/components/HomePage/FeaturedTravelSpot";
import Footer from "@/components/HomePage/footer";
import HandPickedTrip from "@/components/HomePage/HandPickedTrip";
import Hero from "@/components/HomePage/hero";
import { Navbar } from "@/components/HomePage/Navbar";

export default async function Home() {
  const TripRaw = await GetAllTrips();

  if (!TripRaw) {
    return <div>No trips found.</div>;
  }

  // Ensure aiResponse.location is always the expected object or null
  const Trip = TripRaw.map((trip) => ({
    ...trip,
    aiResponse: trip.aiResponse
      ? {
          ...trip.aiResponse,
          location:
            typeof trip.aiResponse.location === "string"
              ? JSON.parse(trip.aiResponse.location)
              : trip.aiResponse.location,
        }
      : null,
  }));

  return (
    <div>
      <section className="bg-[url('/hero-img.png')] bg-cover bg-center bg-no-repeat w-full relative h-full">
        <div className="absolute bg-[linear-gradient(to_right,_#CFF1FFCC_20%,_#CFF1FF33_55%)]  inset-0" />
        <Navbar color="white" />
        <Hero />
      </section>

      <FeaturedTravelSpot />
      <HandPickedTrip theTrip={Trip} />
      <Footer />
    </div>
  );
}
