"use server"

import { unstable_cache } from "next/cache";

export async function getPixbayImage(query){
    try{

        const res=await fetch(`https://pixabay.com/api?q=${query}&key=${process.env.PIXBAY_API_KEY}&min_width=1280&min_height=720&image_type=illustration&category=feelings`)
        const data=await res.json()
       console.log(data); // Log the response to check the structure
        return data.hits[0]?.largeImageURL || null;
    }catch(err){
        console.log("PIXABAY_API_ERROR",err)
    }
}



export const getDailyPrompt=unstable_cache(async()=>{
    try{
        const res=await fetch("https://api.adivceslip.com/advice",{cache:"no-store"})
        const data=await res.json()
        return data.slip.advice
    }catch(error){
        console.log("error")
        
           
    }

    },["daily-prompt"],
    {
        revalidate:86400,
        tags:["daily-prompt"]
    }
)