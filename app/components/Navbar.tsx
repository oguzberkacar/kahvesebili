import React from "react";

type Props = {};

function Navbar({}: Props) {
  return (
    <div className="flex items-center justify-between p-4 text-black">
      <div className="bg-black-2 py-5 text-[28px] font-bold leading-10  px-[22px]  rounded-full">08:45 pm</div>
      <div className="bg-black-2 size-20 text-[28px] flex items-center justify-center font-bold leading-10    rounded-full">
        en
      </div>
    </div>
  );
}

export default Navbar;
