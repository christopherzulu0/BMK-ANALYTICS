// Client-side helpers to talk to our API routes

import type { ApiEntry, SaveEntryRequest, StationDto } from "./api-types"

async function json<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(text || `Request failed with ${res.status}`)
    }
    return res.json()
}

export async function listStations(): Promise<StationDto[]> {
    const res = await fetch("/api/stations", { cache: "no-store" })
    return json(res)
}

export async function createStation(name: string): Promise<StationDto> {
    const res = await fetch("/api/stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
    })
    return json(res)
}

export async function renameStation(id: string, name: string): Promise<StationDto> {
    const res = await fetch(`/api/stations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
    })
    return json(res)
}

export async function deleteStation(id: string): Promise<{ ok: true }> {
    const res = await fetch(`/api/stations/${id}`, { method: "DELETE" })
    return json(res)
}

export async function getEntry(stationId: string, date: string): Promise<ApiEntry | null> {
    const url = `/api/entries?stationId=${encodeURIComponent(stationId)}&date=${encodeURIComponent(date)}`
    const res = await fetch(url, { cache: "no-store" })
    if (res.status === 404) return null
    return json(res)
}

export async function saveEntry(payload: SaveEntryRequest): Promise<{ ok: true }> {
    const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    })
    return json(res)
}

export async function listEntryHistory(stationId: string): Promise<{ date: string; entry: ApiEntry }[]> {
    const url = `/api/entries/history?stationId=${encodeURIComponent(stationId)}`
    const res = await fetch(url, { cache: "no-store" })
    return json(res)
}
