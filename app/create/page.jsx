"use client";
import React, { useState, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import TopicInput from "./_components/TopicInput";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { markAndMeasure } from "@/lib/performance";

// Lazy load components for better initial page load performance
const SelectOption = lazy(() => {
  markAndMeasure('selectOption-load-start', 'selectOption-load');
  return import("./_components/SelectOption").then(module => {
    markAndMeasure('selectOption-load-end', 'selectOption-load', 'selectOption-load-start');
    return module;
  });
});

const TopicInput = lazy(() => {
  markAndMeasure('topicInput-load-start', 'topicInput-load');
  return import("./_components/TopicInput").then(module => {
    markAndMeasure('topicInput-load-end', 'topicInput-load', 'topicInput-load-start');
    return module;
  });
});

function CreateCourse() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const handleUserInput = (fieldName, fieldValue) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }));
    console.log(formData);
  };

  const GenerateCourseOutline = async () => {
    const courseId = uuidv4();
    setLoading(true);
    
    try {
      markAndMeasure('course-generation-start', 'course-generation');
      
      const result = await axios.post("/api/generate-course-outline", {
        courseId: courseId,
        ...formData,
        createdBy: user?.primaryEmailAddress?.emailAddress,
      });
      
      markAndMeasure('course-generation-end', 'course-generation', 'course-generation-start');
      
      toast.success("Your course is being generated in the background!");
      router.replace("/dashboard");
      
      // More informative toast with better UX
      toast("Your course content is generating. You'll be notified when it's ready.", {
        duration: 5000,
        description: "This process may take a few minutes. You can continue using the app."
      });
    } catch (error) {
      console.error("Error generating course:", error);
      toast.error("Failed to generate course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-5 md:px-24 lg:px-36 mt-20">
      <h2 className="font-bold text-4xl text-primary ">
        Start Building your Personal Study Material
      </h2>
      <p className="text-gray-500 text-lg">
        Fill all details in order to generate study material for your next
        project
      </p>
      <div className="mt-10 w-full">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-gray-50 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-gray-200 mb-4"></div>
            <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-64 bg-gray-200 rounded"></div>
          </div>
        }>
          {step == 0 ? (
            <SelectOption
              selectedStudyType={(value) => handleUserInput("courseType", value)}
            />
          ) : (
            <TopicInput
              setDifficultyLevel={(value) =>
                handleUserInput("difficultyLevel", value)
              }
              setTopic={(value) => handleUserInput("topic", value)}
            />
          )}
        </Suspense>
      </div>

      <div className="flex justify-between w-full md:w-[60%] mt-32">
        {step != 0 ? (
          <Button variant="outline" onClick={() => setStep(0)} disabled={loading}>
            Previous
          </Button>
        ) : (
          <div></div> /* Empty div for flex spacing */
        )}
        {step == 0 ? (
          <Button onClick={() => setStep(1)}>Next</Button>
        ) : (
          <Button 
            onClick={GenerateCourseOutline} 
            disabled={loading}
            className={loading ? "opacity-70" : ""}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export default CreateCourse;
