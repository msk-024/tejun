import mammoth from 'mammoth'
import * as XLSX from 'xlsx'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function excelToHtml(buffer: Buffer): string {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const parts: string[] = []

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '' })
    const nonEmptyRows = rows.filter((row) => row.some((cell) => String(cell).trim() !== ''))

    if (nonEmptyRows.length === 0) continue

    if (workbook.SheetNames.length > 1) {
      parts.push(`<h2>${escapeHtml(sheetName)}</h2>`)
    }

    const colCount = Math.max(...nonEmptyRows.map((r) => r.length))

    if (colCount <= 1) {
      for (const row of nonEmptyRows) {
        const cell = escapeHtml(String(row[0] ?? '').trim())
        if (cell) parts.push(`<p>${cell}</p>`)
      }
    } else {
      parts.push('<table>')
      for (const row of nonEmptyRows) {
        const cells = Array.from({ length: colCount }, (_, i) =>
          escapeHtml(String(row[i] ?? '').trim()),
        )
        parts.push(`<tr>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`)
      }
      parts.push('</table>')
    }
  }

  return parts.join('\n')
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return Response.json({ error: 'ファイルが見つかりません' }, { status: 400 })
  }

  const name = file.name.toLowerCase()
  const buffer = Buffer.from(await file.arrayBuffer())

  if (name.endsWith('.docx')) {
    const result = await mammoth.convertToHtml({ buffer })
    return Response.json({ html: result.value })
  }

  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    const html = excelToHtml(buffer)
    return Response.json({ html })
  }

  return Response.json(
    { error: 'Word（.docx）またはExcel（.xlsx / .xls）ファイルを選択してください' },
    { status: 400 },
  )
}
