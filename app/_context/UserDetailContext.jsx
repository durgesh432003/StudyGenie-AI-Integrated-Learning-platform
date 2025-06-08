"use client";
import React, { createContext, useState } from "react";

export const UserDetailContext = createContext(null);

export const UserDetailProvider = ({ children }) => {
  const [userDetail, setUserDetail] = useState(null);

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      {children}
    </UserDetailContext.Provider>
  );
};