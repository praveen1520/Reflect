export const dynamic = "force-dynamic"; 

import { getCollections } from '@/actions/collection';
import { getJournalEntries } from '@/actions/journal';
import React from 'react';
import Collections from './_collections/collections';
import MoodAnalytics from './_collections/mood-analytics';

const Dashboard = async () => {
  try {
    // Fetch collections and journal entries
    const collections = await getCollections();
    const entriesData = await getJournalEntries();

    // Organize entries by collection
    const entriesByCollection = entriesData?.data.entries.reduce((acc, entry) => {
      const collectionId = entry.collectionId || "unorganized";
      if (!acc[collectionId]) {
        acc[collectionId] = [];
      }
      acc[collectionId].push(entry);
      return acc;
    }, {});

    // Render the Dashboard UI
    return (
      <div className="px-8 py-8 space-y-8">
        <section>
          <MoodAnalytics />
        </section>
        <Collections collections={collections} entriesByCollection={entriesByCollection} />
      </div>
    );
  } catch (error) {
    console.error("Error rendering Dashboard:", error);
    return <div className="text-red-500">Failed to load Dashboard data. Please try again later.</div>;
  }
};

export default Dashboard;
