
import React from "react";
import Providers from "@/app/providers";
import CsvUploader from "@/components/CsvUploader";
import { requireAuth } from "@/lib/auth";

export default  function MetricsUpload(){
    // await requireAuth("admin")
    return(
        <>
        <Providers>
            <CsvUploader/>
            </Providers>
        </>
    )
}
