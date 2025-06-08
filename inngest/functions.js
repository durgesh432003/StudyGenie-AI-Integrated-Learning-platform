import { db } from "@/configs/db";
import { inngest } from "./client";
import {
  CHAPTER_NOTES_TABLE,
  STUDY_MATERIAL_TABLE,
  STUDY_TYPE_CONTENT_TABLE,
  USER_TABLE,
} from "@/configs/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import {
  courseOutlineAIModel,
  generateNotesAiModel,
  GenerateQnAAiModel,
  GenerateQuizAiModel,
  GenerateStudyTypeContentAiModel,
} from "@/configs/AiModel";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { event, body: "Hello World!" };
  }
);


export const GenerateNotes = inngest.createFunction(
  { id: "generate-course" },
  { event: "notes.generate" },
  async ({ event, step }) => {
    const { course, courseId } = event.data;

    try {
      // Generate notes for each chapter with ai
      const notesResult = await step.run("Generate Chapter Notes", async () => {
        const chapters = course?.courseLayout?.chapters;

        if (!chapters || !Array.isArray(chapters)) {
          throw new Error("No chapters found in course layout");
        }

        // Use Promise.all to wait for all chapter notes to be generated
        await Promise.all(
          chapters.map(async (chapter, index) => {
            const PROMPT =
              "Generate exam material detail content for each chapter. Make sure to include all topic point in the content, make sure to give content in HTML format (DO not add HTML, Head, Body, title tag), The Chapters:" +
              JSON.stringify(chapter);

            const result = await generateNotesAiModel.sendMessage(PROMPT);
            const aiResp = await result.response.text();

            // Insert notes into CHAPTER_NOTES_TABLE
            await db.insert(CHAPTER_NOTES_TABLE).values({
              chapterId: index + 1, // Using 1-based indexing for chapters
              courseId: courseId,
              notes: aiResp,
            });
          })
        );

        return "Completed";
      });

      // Update Status to ready in STUDY_MATERIAL_TABLE
      const updateCourseStatusResult = await step.run(
        "Update Course Status to Ready",
        async () => {
          await db
            .update(STUDY_MATERIAL_TABLE)
            .set({
              status: "Ready",
            })
            .where(eq(STUDY_MATERIAL_TABLE.courseId, courseId));
          return "Success";
        }
      );

      return {
        status: "success",
        notesResult,
        updateCourseStatusResult,
      };
    } catch (error) {
      console.error("Error in GenerateNotes:", error);

      // Update status to error in case of failure
      await db
        .update(STUDY_MATERIAL_TABLE)
        .set({
          status: "Error",
        })
        .where(eq(STUDY_MATERIAL_TABLE.courseId, courseId));

      throw error; // Re-throw to let Inngest handle the error
    }
  }
);

//Used to generate flash cards, quiz and qna
export const GenerateStudyTypeContent = inngest.createFunction(
  { id: "Generate Study Type Content" },
  { event: "studyType.content" },

  async ({ event, step }) => {
    const { studyType, prompt, courseId, recordId } = event.data;

    const AiResult = await step.run(
      "Generating FlashCard using Ai",
      async () => {
        let result;
        if (studyType === "Flashcard") {
          result = await GenerateStudyTypeContentAiModel.sendMessage(prompt);
        } else if (studyType === "Quiz") {
          result = await GenerateQuizAiModel.sendMessage(prompt);
        } else if (studyType === "QA") {
          result = await GenerateQnAAiModel.sendMessage(prompt); // Add new condition
        } else {
          throw new Error(`Unsupported studyType: ${studyType}`);
        }
        const AIResult = JSON.parse(result.response.text());
        return AIResult;
      }
    );

    //Save the result
    const DbResult = await step.run("Save Result to DB", async () => {
      const result = await db
        .update(STUDY_TYPE_CONTENT_TABLE)
        .set({
          content: AiResult,
          status: "Ready",
        })
        .where(eq(STUDY_TYPE_CONTENT_TABLE.id, recordId));

      return "Data Inserted";
    });
  }
);

export const CreateNewUser = inngest.createFunction(
  { id: "create-new-user" },
  { event: "user.create" },
  async ({ event, step }) => {
    const { user } = event.data;

    const existingUser = await step.run("Check for Existing User", async () => {
      const result = await db
        .select()
        .from(USER_TABLE)
        .where(eq(USER_TABLE.email, user.primaryEmailAddress.emailAddress));
      return result.length > 0 ? result[0] : null;
    });

    if (existingUser) {
      return { status: "success", message: "User already exists" };
    }

    const newUser = await step.run("Create New User", async () => {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const customer = await stripe.customers.create({
        email: user.primaryEmailAddress.emailAddress,
        name: user.fullName,
      });

      const result = await db.insert(USER_TABLE).values({
        fullName: user.fullName,
        email: user.primaryEmailAddress.emailAddress,
        clerkId: user.id,
        stripeCustomerId: customer.id,
      });
      return result;
    });

    return { status: "success", user: newUser };
  }
);

// New function to handle course outline generation in the background
export const GenerateCourseOutline = inngest.createFunction(
  { id: "generate-course-outline" },
  { event: "course.generate-outline" },
  async ({ event, step }) => {
    const { courseId, topic, courseType, difficultyLevel, createdBy, dbRecordId } = event.data;

    try {
      // Step 1: Generate the course outline with AI
      const aiResult = await step.run("Generate Course Outline with AI", async () => {
        const PROMPT = `
          generate a study material for '${topic}' for '${courseType}' 
          and level of Difficulty will be '${difficultyLevel}' 
          with course title, summary of course, List of chapters along with the summary and Emoji icon for each chapter, 
          Topic list in each chapter in JSON format
        `;

        const aiResp = await courseOutlineAIModel.sendMessage(PROMPT);
        
        try {
          return JSON.parse(aiResp.response.text());
        } catch (e) {
          console.error("Failed to parse AI response:", e);
          throw new Error("Invalid JSON response from AI");
        }
      });

      // Step 2: Update the database record with the AI-generated content
      const updateResult = await step.run("Update Course with AI Content", async () => {
        return await db
          .update(STUDY_MATERIAL_TABLE)
          .set({
            courseLayout: aiResult,
            status: "Generating", // Will be updated to "Ready" after notes are generated
          })
          .where(eq(STUDY_MATERIAL_TABLE.id, dbRecordId))
          .returning({ 
            resp: STUDY_MATERIAL_TABLE,
            courseId: STUDY_MATERIAL_TABLE.courseId 
          });
      });

      // Step 3: Trigger the notes generation function
      await step.run("Trigger Notes Generation", async () => {
        return await inngest.send({
          name: "notes.generate",
          data: {
            course: updateResult[0].resp,
            courseId: updateResult[0].courseId,
          },
        });
      });

      return { 
        status: "success", 
        message: "Course outline generated and notes generation triggered" 
      };
    } catch (error) {
      console.error("Error in GenerateCourseOutline:", error);
      
      // Update the record to show the error
      await db
        .update(STUDY_MATERIAL_TABLE)
        .set({
          status: "Error",
        })
        .where(eq(STUDY_MATERIAL_TABLE.id, dbRecordId));
      
      throw error; // Re-throw to let Inngest handle the error
    }
  }
);
