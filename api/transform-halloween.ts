// api/transform-halloween.ts
export default function handler(req: any, res: any) {
  console.log('=== TRANSFORM API CALLED ===')
  console.log('Method:', req.method)
  console.log('Headers:', JSON.stringify(req.headers, null, 2))
  
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request')
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    console.log('Non-POST method received:', req.method)
    return res.status(405).json({ error: 'POST method required' })
  }

  console.log('Processing POST request')
  console.log('Body:', JSON.stringify(req.body, null, 2))

  return res.status(200).json({
    success: true,
    message: 'Transform API is working',
    receivedMethod: req.method,
    hasBody: !!req.body,
    timestamp: new Date().toISOString()
  })
}