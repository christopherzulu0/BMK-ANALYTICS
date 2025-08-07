import { ReadingsData } from '@/types/readingsData'

export function convertToCSV(data: ReadingsData[]): string {
    const headers = ['Date', 'Line No', 'Reading', 'Flow Meter 1', 'Flow Meter 2']
    const rows = data.map(item => [
        item.date,
        item.lineNo,
        item.reading,
        item.flowMeter1,
        item.flowMeter2
    ])

    // Add Excel-specific formatting for autofitting columns
    const excelStr = '\uFEFF' // BOM for Excel to recognize UTF-8
    const columnWidths = headers.map(header => Math.max(header.length, ...rows.map(row => row[headers.indexOf(header)].toString().length)))

    const formattedHeaders = headers.map((header, index) => `${header}`.padEnd(columnWidths[index]))
    const formattedRows = rows.map(row => row.map((cell, index) => `${cell}`.padEnd(columnWidths[index])))

    return excelStr + [
        formattedHeaders.join(','),
        ...formattedRows.map(row => row.join(','))
    ].join('\n')
}
