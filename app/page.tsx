import { GetAllTrips } from "@/actions/Trip";
import FeaturedTravelSpot from "@/components/HomePage/FeaturedTravelSpot";
import Footer from "@/components/HomePage/footer";
import HandPickedTrip from "@/components/HomePage/HandPickedTrip";
import Hero from "@/components/HomePage/hero";
import { Navbar } from "@/components/HomePage/Navbar";

// New trips should show up immediately instead of being frozen at build time
export const dynamic = "force-dynamic";

export default async function Home() {
  const trips = await GetAllTrips();

  return (
    <div>
      <section className="bg-[url('/hero-img.png')] bg-cover bg-center bg-no-repeat w-full relative h-full">
        <div className="absolute bg-[linear-gradient(to_right,_#CFF1FFCC_20%,_#CFF1FF33_55%)]  inset-0" />
        <Navbar color="white" />
        <Hero />
      </section>

      <FeaturedTravelSpot />
      <HandPickedTrip theTrip={trips} />
      <Footer />
    </div>
  );
}
