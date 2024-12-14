"use client"
import { UserButton } from '@clerk/nextjs'
import React from 'react'
import { ChartNoAxesGantt } from 'lucide-react'
const UserMenu = () => {
  return (<UserButton appearance={{
    elements:{
        avatarBox:"w-10 h-10",
    },
  }}>
    <UserButton.MenuItems>
        <UserButton.Link label="DashBoard" labelIcon={<ChartNoAxesGantt size={15} />} href="/dashboard" />
        <UserButton.Action label="manageAccount" />
    </UserButton.MenuItems>
    
  </UserButton>)
}

export default UserMenu
