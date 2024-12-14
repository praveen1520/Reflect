'use client';
import { collectionSchema } from '@/app/lib/schema';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { BarLoader } from 'react-spinners';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import React from 'react';
import { Button } from './ui/button';


const CollectionForm = ({ open, setOpen ,loading,onSuccess}) => {
  const {register,handleSubmit,formState:{errors}}=useForm({
    resolver:zodResolver(collectionSchema),
    defaultValues:{
        name:"",
        descripition:""
    }
  })
  const onSubmit=handleSubmit(async(data)=>{
    onSuccess(data)
  })
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new Collection</DialogTitle>
          
        </DialogHeader>
        {loading&& <BarLoader color="orange" width={"100%"} />}
        <form onSubmit={onSubmit}>
            <div className="space-y-2">
                <label className='text-sm font-medium'>Title</label>
                <Input disabled={loading}{...register("name")} placeholder="Entry collection Name" className={` ${errors.name?"border-red-500":""}`}  />
                {errors.title&&(
                    <p className='text-red-500 text-sm'>{errors.name.message}</p>
                )}
            </div>
            <div className="space-y-2">
                <label className='text-sm font-medium'>Title</label>
                <Input disabled={loading}{...register("descripition")} placeholder="Describe your Collection" className={` ${errors.descripition?"border-red-500":""}`}  />
                {errors.descripition &&(
                    <p className='text-red-500 text-sm'>{errors.name.message}</p>
                )}
            </div>
            <div className='flex justify-end gap-4 mt-4'>
                <Button type="button" variant="ghost" onClick={()=>setOpen(false)}>Cancel</Button>
                <Button type="submit" variant="journal">Create Collection</Button>
            </div>
        </form>

      </DialogContent>
    </Dialog>
  );
}

export default CollectionForm;
