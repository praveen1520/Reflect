"use client";

import React, { useState,useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import CollectionForm from "@/components/collections-dialog";
import CollectionsPreview from './collections-preview'
import { createCollection } from "@/actions/collection";

const Collections = ({collections=[],entriesByCollection}) => {
    const [isCollectionDialogOpen,setIsCollectionDialogOpen]=useState(false)
    const {loading:createCollectionLoading,fn:createCollectionFn,data:createdCollection}=useFetch(createCollection)
    const handleCreateCollection=(data)=>{
        createCollection(data)
    }
     useEffect(()=>{
        if(createdCollection){
            setIsCollectionDialogOpen(false)
            fetchCollections()
            
            toast.success(`Collection ${createdCollection.name} created!`);
        }
    },[createdCollection],)
  return (
    <section id="collections" className="space-y-6" draggable="true">
      <h2 className="text-3xl font-bold gradient-title ">Collections</h2>
      <div draggable="true" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CollectionsPreview isCreateNew={true} onCreateNew={()=>{
            setIsCollectionDialogOpen(true)
        }}/>
        {entriesByCollection?.unorganized?.length>0 && (
        <CollectionsPreview name="unorganized" entries={entriesByCollection.unorganized} isUnorganized={true} />
      )
      }
      {collections?.map((collection)=>(
        <CollectionsPreview key={collection.id} id={collection.id} name={collection.name} entries={entriesByCollection[collection.id]||[]} />
      ))}

      <CollectionForm loading={createCollectionLoading} onSuccess={handleCreateCollection} open={isCollectionDialogOpen} setOpen={setIsCollectionDialogOpen} />
      </div>
      
    </section>
  )
}

export default Collections
