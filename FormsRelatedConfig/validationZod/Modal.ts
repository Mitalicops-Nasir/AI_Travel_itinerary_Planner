import React from "react";

export const TheModalSwitch = (TheSwitch?: boolean) => {
  localStorage.setItem("credential", JSON.stringify(TheSwitch));

  if (TheSwitch === undefined) {
    TheSwitch = false;
    localStorage.setItem("Nothing", JSON.stringify(TheSwitch));
    const retrievedValue = localStorage.getItem("Nothing");

    return JSON.parse(retrievedValue!);
  } else {
    localStorage.setItem("credential", JSON.stringify(TheSwitch));
    const retrievedValue = localStorage.getItem("credential");

    return JSON.parse(retrievedValue!);
  }
};
