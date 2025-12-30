'use client'
import React,{ useEffect } from "react";
import Providers from "@/app/providers";
import ReadingUploader from "@/components/ReadingUploader";
import { requireAuth } from "@/lib/auth";


export default  function ReadingsUpload(){
    
 
    return(
        <>
        <Providers>
        <ReadingUploader/>
        </Providers>
        </>
    )
}
