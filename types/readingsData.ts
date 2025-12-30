export interface ReadingsData{
    id:number;
    date:Date;
    lineNo:number;
    reading:string;
    flowMeter1:number;
    flowMeter2:number;
    flowRate1:number;
    flowRate2:number;
    sampleTemp:number;
    obsDensity:number;
    kgInAirPerLitre:number;
    remarks:string;
    check:string;
    previousReadingMeter1:number;
    previousReadingMeter2:number; 
}