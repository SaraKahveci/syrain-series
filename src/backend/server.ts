import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

type Comment = {
  id: string
  seriesId: string
  text: string
  createdAt: string
}

let comments: Comment[] = []

app.get('/api/comments', (req, res) => {
  const { seriesId } = req.query
  const filtered = comments.filter(c => c.seriesId === seriesId)
  res.json(filtered)
})

app.post('/api/comments', (req, res) => {
  const { seriesId, text } = req.body

  const newComment: Comment = {
    id: crypto.randomUUID(),
    seriesId,
    text,
    createdAt: new Date().toISOString()
  }

  comments.unshift(newComment)
  res.json(newComment)
})

app.listen(4000, () => {
  console.log('API running on http://localhost:4000')
})
