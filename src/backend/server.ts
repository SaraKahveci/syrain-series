import express from 'express'
import cors from 'cors'
import type { Request, Response } from 'express'
import { readDB, writeDB } from './db'

type Comment = {
  id: string
  seriesId: string
  text: string
  createdAt: string
}

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/comments', (req: Request, res: Response) => {
  const { seriesId } = req.query
  const comments = readDB().filter((c: Comment) => c.seriesId === seriesId)
  res.json(comments)
})

app.post('/api/comments', (req: Request, res: Response) => {
  const { seriesId, text } = req.body

  const newComment: Comment = {
    id: crypto.randomUUID(),
    seriesId,
    text,
    createdAt: new Date().toISOString()
  }

  const db = readDB()
  db.push(newComment)
  writeDB(db)

  res.json(newComment)
})

app.listen(4000, () => {
  console.log('API running on http://localhost:4000')
})
