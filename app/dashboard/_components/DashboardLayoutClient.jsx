"use client";
import React, { useState, useEffect, useContext } from "react";
import SideBar from "./SideBar";
import DashboardHeader from "./DashboardHeader";
import { CourseCountContext } from "../../_context/CourseCountContext";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { UserDetailContext } from "@/app/_context/UserDetailContext";
import axios from "axios";

function DashboardLayoutClient({ children }) {
  const [totalCourse, setTotalCourse] = useState(0);
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { setUserDetail } = useContext(UserDetailContext);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isLoaded && user) {
      createOrGetUserDetail();
    }
  }, [isLoaded, user]);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  const createOrGetUserDetail = async () => {
    try {
      // Ensure we have a valid name
      const userName = user.fullName || 
        (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 
        user.firstName || user.lastName || user.primaryEmailAddress.emailAddress.split('@')[0]);

      // First, try to create the user (this will return existing user if already exists)
      const createResult = await axios.post("/api/create-user", {
        user: {
          primaryEmailAddress: { emailAddress: user.primaryEmailAddress.emailAddress },
          fullName: userName
        }
      });
      
      setUserDetail(createResult.data);
    } catch (error) {
      console.error("Error creating user:", error);
      
      // Fallback to get-user-detail if create-user fails
      try {
        const result = await axios.get(
          "/api/get-user-detail/" + user.primaryEmailAddress.emailAddress
        );
        setUserDetail(result.data);
      } catch (getError) {
        console.error("Error getting user details:", getError);
      }
    }
  };

  if (!mounted || !isLoaded || !user) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <CourseCountContext.Provider value={{ totalCourse, setTotalCourse }}>
      <div>
        <div className="md:w-64 hidden md:block fixed">
          <SideBar />
        </div>
        <div className="md:ml-64">
          <DashboardHeader />
          <div className="p-10">{children}</div>
        </div>
      </div>
    </CourseCountContext.Provider>
  );
}

export default DashboardLayoutClient;
