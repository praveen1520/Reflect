import { getCollections } from '@/actions/collection'
import { getJournalEntries } from '@/actions/journal'
import React from 'react'
import Collections from './_collections/collections'
import MoodAnalytics from './_collections/mood-analytics'
const Dashboard = async () => {
  const collections=await getCollections()
  const entriesData=await getJournalEntries()
  console.log("Entries Data:", entriesData);
  const entriesByCollection=entriesData?.data.entries.reduce(
    (acc,entry)=>{
      const collectionId=entry.collectionId || "unorganized";
      if (!acc[collectionId]){
        acc[collectionId]=[]
      }
      acc[collectionId].push(entry);
      return acc;
    },{}
  )

  return (
    <div className='px-8 py-8 space-y-8'>
      <section className="">
        <MoodAnalytics />
      </section>
      <Collections collections={collections} entriesByCollection={entriesByCollection} />
    </div>
  )
}

export default Dashboard
