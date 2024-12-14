"use server"
import { auth } from "@clerk/nextjs/server"
import { getPixbayImage } from "./public";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { MOODS } from "@/app/lib/moods";
import { request } from "@arcjet/next";
import aj from "@/lib/arcjet";
import { getMoodById } from "@/app/lib/moods";
export async function createJournalEntry(data){
    try{
        const {userId}=await auth()
        if (!userId) throw new Error("unauthorized");
        
        const req=await request()
        const descision=await aj.protect(req,{
            userId,
            requested:1,
        })
        if(descision.isDenied()){
            if(descision.reason.isRateLimit()){
                const {remaining,reset}=descision.reason
                console.log({
                    code:"RATE_LIMIT_EXCEEDED",
                    details:{
                        remaining,
                        resetInSeconds:reset
                    }
                });
                throw new Error("Too Many requests.Please try again later.")
            }
            throw new Error("Too many requests.please try again later")
        }
        const user=await db.user.findUnique({
            where:{
                clerkUserId:userId
            }
        });
        if(!user){
            throw new Error("user not found")
        }
        const mood=MOODS[data.mood.toUpperCase()]
        if(!mood) throw new Error("Invalid mood")
        const moodImageUrl=await getPixbayImage(data.moodQuery)
        const entry=await db.entry.create({
            data:{
                title:data.title,
                content:data.content,
                mood:mood.id,
                moodScore:mood.score,
                moodImageUrl,
                userId:user.id,
                collectionId:data.collectionId || null,

            }
        })
        await db.draft.deleteMany({
            where:{
                userId:user.id
            }
        })
        revalidatePath("/dashboard");
        return entry;
    }catch(error){
       console.error("Error in createJournalEntry:", {
        message: error.message,
        stack: error.stack,
    });
    throw new Error("Failed to create journal entry. Please try again.");
    }
}


export async function getJournalEntries({collectionId,orderBy="desc"}={}){
    try{
        const {userId}=await auth()
         const user=await db.user.findUnique({
            where:{
                clerkUserId:userId
            }
        });
        if(!user){
            throw new Error("user not found")
        }
        const entries=await db.entry.findMany({
            where:{
                userId:user.id,
                ...(collectionId==="unorganized"?{collectionId:null}:collectionId?{collectionId}:{})
            },
            include:{
                collection:{
                    select:{
                        id:true,
                        name:true
                    }
                }
            },
            orderBy:{
                createdAt:orderBy
            }
        })
        const entriesWithMood= entries.map((entry=>({
            ...entry,
            moodData:getMoodById(entry.mood)
        })))
        return{
            success:true,
            data:{
                entries:entriesWithMood
            }
        }
    }catch(error){
        return {success:false,error:error.message}
    }
}

export async function getJournalEntry(id) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const entry = await db.entry.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        collection: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!entry) throw new Error("Entry not found");

    return entry;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function deleteJournalEntry(id) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Check if entry exists and belongs to user
    const entry = await db.entry.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!entry) throw new Error("Entry not found");

    // Delete the entry
    await db.entry.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
    return entry;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function updateJournalEntry(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Check if entry exists and belongs to user
    const existingEntry = await db.entry.findFirst({
      where: {
        id: data.id,
        userId: user.id,
      },
    });

    if (!existingEntry) throw new Error("Entry not found");

    // Get mood data
    const mood = MOODS[data.mood.toUpperCase()];
    if (!mood) throw new Error("Invalid mood");

    // Get new mood image if mood changed
    let moodImageUrl = existingEntry.moodImageUrl;
    if (existingEntry.mood !== mood.id) {
      moodImageUrl = await getPixbayImage(data.moodQuery);
    }

    // Update the entry
    const updatedEntry = await db.entry.update({
      where: { id: data.id },
      data: {
        title: data.title,
        content: data.content,
        mood: mood.id,
        moodScore: mood.score,
        moodImageUrl,
        collectionId: data.collectionId || null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/journal/${data.id}`);
    return updatedEntry;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getDraft() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const draft = await db.draft.findUnique({
      where: { userId: user.id },
    });

    return { success: true, data: draft };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function saveDraft(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const draft = await db.draft.upsert({
      where: { userId: user.id },
      create: {
        title: data.title,
        content: data.content,
        mood: data.mood,
        userId: user.id,
      },
      update: {
        title: data.title,
        content: data.content,
        mood: data.mood,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: draft };
  } catch (error) {
    return { success: false, error: error.message };
  }
}