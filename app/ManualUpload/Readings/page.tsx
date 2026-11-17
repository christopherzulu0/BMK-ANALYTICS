import React from "react";
import Providers from "@/app/providers";
import ReadingUploader from "@/components/ReadingUploader";
import { requireAuth } from "@/lib/auth";


export default async function ReadingsUpload(){
  await requireAuth("admin")
 
  return(
    <>
      <Providers>
        <ReadingUploader/>
      </Providers>
    </>
  )
}
