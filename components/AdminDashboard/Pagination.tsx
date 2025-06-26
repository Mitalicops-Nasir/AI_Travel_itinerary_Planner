"use client";

import { TotalPaginations } from "@/constants";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const Pagination = ({}) => {
  const [currentPage, setPageNum] = useState(1);
  let itemsPerPage = 8;

  const startingIndex = (currentPage - 1) * itemsPerPage;
  const endingIndex = currentPage * itemsPerPage;

  return (
    <div className="pt-[16px] pb-[16px] pr-[22px] pl-[22px] rounded-bl-[13px] rounded-br-[13px] border-1 bg-[#fff] border-[#EAECF0] flex items-center justify-between">
      <div
        className="pl-[14px] pr-[14px] pt-[8px] pb-[8px] cursor-pointer bg-[#FFFFFF] shadow-2xl rounded-[8px] border border-solid border-[#EAECF0]"
        onClick={() => setPageNum(currentPage - 1)}
      >
        <span className="flex gap-2 items-center">
          <FaArrowLeft size={14} />
          <p className="text-[#2E2C48] text-[14px] font-[500]">Previous</p>
        </span>
      </div>

      <div className="flex items-center gap-4 max-[580px]:hidden">
        {TotalPaginations.map((item) => (
          <div
            key={item.value}
            className={cn(
              "pl-[14px] pr-[14px] pt-[8px] pb-[8px] cursor-pointer shadow-2xl rounded-[8px] border border-solid border-[#EAECF0]",
              `${
                currentPage === item.value
                  ? "bg-blue-500 text-[#fff]"
                  : "bg-transparent"
              }`
            )}
            onClick={() => setPageNum(item.value)}
          >
            <span>{item.valueInString}</span>
          </div>
        ))}
      </div>

      <div
        className="pl-[14px] pr-[14px] pt-[8px] pb-[8px] cursor-pointer bg-[#FFFFFF] shadow-2xl rounded-[8px] border border-solid border-[#EAECF0]"
        onClick={() => setPageNum(currentPage + 1)}
      >
        <span className="flex gap-2 items-center">
          <p className="text-[#2E2C48] text-[14px] font-[500]">Next</p>

          <FaArrowRight size={14} />
        </span>
      </div>
    </div>
  );
};

export default Pagination;
