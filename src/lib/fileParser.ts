import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export interface ParsedFile {
  headers: string[]
  rows: Record<string, string>[]
}

export function parseFile(file: File): Promise<ParsedFile> {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext === 'csv') return parseCsv(file)
  if (ext === 'xlsx' || ext === 'xls') return parseXlsx(file)
  return Promise.reject(new Error(`Unsupported file extension: .${ext}`))
}

function parseCsv(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete(results) {
        if (results.data.length === 0 && results.errors.length > 0) {
          reject(new Error(results.errors[0].message))
          return
        }
        resolve({
          headers: results.meta.fields ?? [],
          rows: results.data,
        })
      },
      error(err) {
        reject(new Error(err.message))
      },
    })
  })
}

async function parseXlsx(file: File): Promise<ParsedFile> {
  const buffer = await file.arrayBuffer()

  // Disable formula evaluation and HTML output to prevent macro/injection attacks
  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellFormula: false,
    cellHTML: false,
    cellStyles: false,
    cellDates: true,
    dense: false,
  })

  const sheetName = workbook.SheetNames[0]
  if (!sheetName) throw new Error('The workbook contains no sheets.')

  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    raw: false,  // coerce all values to strings via formatting
    defval: '',  // fill missing cells with empty string
  })

  const headers = rows.length > 0 ? Object.keys(rows[0]) : []
  return { headers, rows }
}
