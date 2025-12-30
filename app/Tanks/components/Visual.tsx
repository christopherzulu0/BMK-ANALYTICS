'use client'

import React, {useEffect, useState} from "react";
import {TankVisualization} from "@/components/tank-visualization";


export default  function Visual(){
    const [tanks,setTanks] = useState([]);

    useEffect(() => {
        fetch('api/entries')
            .then((res)=> res.json())
            .then((data)=> setTanks(data))
    }, []);

    return(
        <>
            <TankVisualization
                tanks={tanks.map((tank) => ({
                    id: tank.id,
                    name: tank.name,
                    level: (currentTankData[tank.id as keyof typeof currentTankData] as number) || 0,
                    product: tank.product,
                    capacity: tank.capacity,
                }))}
            />
        </>
    )
}