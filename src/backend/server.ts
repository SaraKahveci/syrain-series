import express from 'express'
import cors from 'cors'
import type { Request, Response } from 'express'
import { readDB, writeDB } from './db'

type Comment = {
  id: string
  seriesId: string
  text: string
  userId: string
  email: string
  createdAt: string
}

const ADMIN_EMAIL = 'sarakahveci3@gmail.com'

const app = express()

app.use(cors({
  origin: 'http://localhost:5173'
}))
app.use(express.json())

app.get('/api/comments', (req: Request, res: Response) => {
  const { seriesId } = req.query
  const comments = readDB().filter((c: Comment) => c.seriesId === seriesId)
  res.json(comments)
})

app.post('/api/comments', (req: Request, res: Response) => {
  const { seriesId, text, userId, email } = req.body

  if (!seriesId || !text || !userId) {
    return res.status(400).json({ error: 'Invalid payload' })
  }

  const newComment: Comment = {
    id: crypto.randomUUID(),
    seriesId,
    text,
    userId,
    email,
    createdAt: new Date().toISOString()
  }

  const db = readDB()
  db.push(newComment)
  writeDB(db)

  res.json(newComment)
})

app.delete('/api/comments/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const { email } = req.body

  if (email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Admin only' })
  }

  const db = readDB()
  const newDB = db.filter((c: Comment) => c.id !== id)
  writeDB(newDB)

  res.json({ success: true })
})

app.listen(4000, () => {
  console.log('API running on http://localhost:4000')
})
