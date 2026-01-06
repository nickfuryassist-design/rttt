import React from 'react'
import Header from './components/Header'
import { Outlet } from 'react-router-dom'
import { Pointer } from "@/components/ui/pointer"

function Layout() {
  return (
    <>
    <Pointer className="fill-blue-500 "/>
    <Header/>
    <Outlet/>
    </>
  )
}

export default Layout