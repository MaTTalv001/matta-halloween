// api/debug.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== DEBUG API CALLED ===')
  console.log('Method:', req.method)
  console.log('Node version:', process.version)
  console.log('Environment:', process.env.NODE_ENV)
  console.log('Has Gemini API Key:', !!process.env.GEMINI_API_KEY)
  
  return res.json({
    success: true,
    debug: {
      method: req.method,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
      hasApiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString()
    }
  })
}