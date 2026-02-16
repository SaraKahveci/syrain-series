import fs from 'fs'
import path from 'path'

const filePath = path.join(process.cwd(), 'comments.json')

export function readDB() {
  if (!fs.existsSync(filePath)) return []
  const data = fs.readFileSync(filePath, 'utf-8')
  return data ? JSON.parse(data) : []
}

export function writeDB(data: any[]) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}
