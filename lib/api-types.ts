// Shared API types used by client wrappers and route handlers

export type ApiTank = {
    name: string
    status: "Active" | "Rehabilitation" | string
    levelMm?: number
    volumeM3?: number
    waterCm?: number | null
    sg?: number | null
    tempC?: number | null
    volAt20C?: number | null
    mts?: number | null
}

export type ApiSummary = {
    tfarmDischargeM3: number
    kigamboniDischargeM3: number
    netDeliveryM3At20C: number
    netDeliveryMT: number
    pumpOverDate: string // YYYY-MM-DD
    prevVolumeM3: number
    opUllageVolM3: number
}

export type ApiEntry = {
    tanks: ApiTank[]
    summary: ApiSummary
    remarks: string[]
}

export type SaveEntryRequest = {
    stationId: string
    date: string // YYYY-MM-DD
    entry: ApiEntry
}

export type StationDto = {
    id: string
    name: string
    createdAt?: string
    updatedAt?: string
}
