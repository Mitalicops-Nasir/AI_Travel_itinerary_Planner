import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const FeaturedTravelSpot = () => {
  return (
    <section className="bg-[#F9FBFC] w-full pl-[140px] pt-[50px] pb-[80px] max-[768px]:pr-[40px] max-[768px]:pl-[40px] pr-[140px]">
      <div className="mb-8">
        <h1 className="text-[36px] font-[700] leading-[44px] mb-3">
          Featured Travel Destinations
        </h1>
        <p className="text-[18px] leading-[30px] font-[400] text-[#7F7E83]">
          Check out some of the best places you can visit around the world.
        </p>
      </div>

      <div className=" mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(200px,auto)]">
          <div
            className="col-span-1 md:col-span-2 row-span-1 bg-[url('/card-img-1.png')] bg-cover bg-center bg-no-repeat w-full
           rounded-lg p-6 flex justify-between flex-col text-2xl font-bold"
          >
            <span className="bg-white pr-[19px] pl-[19px] pb-[2px] pt-[2px] rounded-[20px] w-[65px] h-[28px] align-middle text-[#FF543D] text-[18px] font-[700]">
              3.5
            </span>
            <div>
              <h1 className="text-[30px] font-[700] text-white">
                Barcelona Tour
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Avatar>
                  <AvatarImage
                    height={40}
                    width={40}
                    src="https://github.com/shadcn.png"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>

                <h1 className="text-[18px] font-[400] text-white">
                  196 Activities
                </h1>
              </div>
            </div>
          </div>

          <div
            className="row-span-1 bg-[url('/card-img-4.png')] bg-cover bg-center bg-no-repeat w-full
           rounded-lg p-6 flex justify-between flex-col text-2xl font-bold"
          >
            <span className="bg-white pr-[19px] pl-[19px] pb-[2px] pt-[2px] rounded-[20px] w-[65px] h-[28px] align-middle text-[#FF543D] text-[18px] font-[700]">
              3.5
            </span>
            <div>
              <h1 className="text-[30px] font-[700] text-white">
                Australia Tour
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Avatar>
                  <AvatarImage
                    height={40}
                    width={40}
                    src="https://github.com/shadcn.png"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>

                <h1 className="text-[18px] font-[400] text-white">
                  196 Activities
                </h1>
              </div>
            </div>
          </div>

          <div
            className="row-span-2 bg-[url('/card-img-2.png')] bg-cover bg-center bg-no-repeat w-full
           rounded-lg p-6 flex justify-between flex-col text-2xl font-bold"
          >
            <span className="bg-white pr-[19px] pl-[19px] pb-[2px] pt-[2px] rounded-[20px] w-[65px] h-[28px] align-middle text-[#FF543D] text-[18px] font-[700]">
              3.5
            </span>
            <div>
              <h1 className="text-[30px] font-[700] text-white">
                London Tour
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Avatar>
                  <AvatarImage
                    height={40}
                    width={40}
                    src="https://github.com/shadcn.png"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>

                <h1 className="text-[18px] font-[400] text-white">
                  196 Activities
                </h1>
              </div>
            </div>
          </div>

          <div
            className="row-span-2 bg-[url('/card-img-3.png')] bg-cover bg-center bg-no-repeat w-full
           rounded-lg p-6 flex justify-between flex-col text-2xl font-bold"
          >
            <span className="bg-white pr-[19px] pl-[19px] pb-[2px] pt-[2px] rounded-[20px] w-[65px] h-[28px] align-middle text-[#FF543D] text-[18px] font-[700]">
              3.5
            </span>
            <div>
              <h1 className="text-[30px] font-[700] text-white">
                Australia Tour
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Avatar>
                  <AvatarImage
                    height={40}
                    width={40}
                    src="https://github.com/shadcn.png"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>

                <h1 className="text-[18px] font-[400] text-white">
                  196 Activities
                </h1>
              </div>
            </div>
          </div>

          <div
            className="row-span-1 bg-[url('/card-img-5.png')] bg-cover bg-center bg-no-repeat w-full
           rounded-lg p-6 flex justify-between flex-col text-2xl font-bold"
          >
            <span className="bg-white pr-[19px] pl-[19px] pb-[2px] pt-[2px] rounded-[20px] w-[65px] h-[28px] align-middle text-[#FF543D] text-[18px] font-[700]">
              3.5
            </span>
            <div>
              <h1 className="text-[30px] font-[700] text-white">
                Japan Tour
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Avatar>
                  <AvatarImage
                    height={40}
                    width={40}
                    src="https://github.com/shadcn.png"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>

                <h1 className="text-[18px] font-[400] text-white">
                  196 Activities
                </h1>
              </div>
            </div>
          </div>

          <div
            className="row-span-1 bg-[url('/card-img-6.png')] bg-cover bg-center bg-no-repeat w-full
           rounded-lg p-6 flex justify-between flex-col text-2xl font-bold"
          >
            <span className="bg-white pr-[19px] pl-[19px] pb-[2px] pt-[2px] rounded-[20px] w-[65px] h-[28px] align-middle text-[#FF543D] text-[18px] font-[700]">
              3.5
            </span>
            <div>
              <h1 className="text-[30px] font-[700] text-white">
                Japan Tour
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Avatar>
                  <AvatarImage
                    height={40}
                    width={40}
                    src="https://github.com/shadcn.png"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>

                <h1 className="text-[18px] font-[400] text-white">
                  196 Activities
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTravelSpot;
