'use client'

import React, {useEffect, useState} from "react";
import {TankVisualization} from "@/components/tank-visualization";

interface TankEntry {
  id: string
  name: string
  product?: string
  capacity?: number
  level?: number
}

export default  function Visual(){
    const [tanks,setTanks] = useState<TankEntry[]>([]);

    useEffect(() => {
        fetch('api/entries')
            .then((res)=> res.json())
            .then((data: TankEntry[])=> setTanks(data))
    }, []);

    return(
        <>
            <TankVisualization
                tanks={tanks.map((tank) => ({
                    id: tank.id,
                    name: tank.name,
                    level: tank.level ?? 0,
                    product: tank.product || "Default",
                    capacity: tank.capacity ?? 0,
                }))}
            />
        </>
    )
}