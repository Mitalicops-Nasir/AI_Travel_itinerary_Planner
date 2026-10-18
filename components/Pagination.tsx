"use client";

import { cn } from "@/lib/utils";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const Pagination = ({
  page,
  totalPages,
  onPageChange,
  className,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div
        className={cn(
          "pl-[14px] pr-[14px] pt-[8px] pb-[8px] bg-[#FFFFFF] shadow-2xl rounded-[8px] border border-solid border-[#EAECF0]",
          page > 1 ? "cursor-pointer" : "opacity-50"
        )}
        onClick={() => onPageChange(page - 1)}
      >
        <span className="flex gap-2 items-center">
          <FaArrowLeft size={14} />
          <p className="text-[#2E2C48] text-[14px] font-[500]">Previous</p>
        </span>
      </div>

      <div className="flex items-center gap-4 max-[580px]:hidden">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
          (pageNumber) => (
            <div
              key={pageNumber}
              className={cn(
                "pl-[14px] pr-[14px] pt-[8px] pb-[8px] cursor-pointer shadow-2xl rounded-[8px] border border-solid border-[#EAECF0]",
                pageNumber === page
                  ? "bg-blue-500 text-[#fff]"
                  : "bg-transparent"
              )}
              onClick={() => onPageChange(pageNumber)}
            >
              <span>{pageNumber}</span>
            </div>
          )
        )}
      </div>

      <div
        className={cn(
          "pl-[14px] pr-[14px] pt-[8px] pb-[8px] bg-[#FFFFFF] shadow-2xl rounded-[8px] border border-solid border-[#EAECF0]",
          page < totalPages ? "cursor-pointer" : "opacity-50"
        )}
        onClick={() => onPageChange(page + 1)}
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
