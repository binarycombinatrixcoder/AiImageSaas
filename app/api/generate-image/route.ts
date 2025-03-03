import { Client } from '@gradio/client'
import { NextResponse } from 'next/server' // Import NextResponse for returning responses

export async function POST(req: Request) {
  // Or GET depending on your needs
  try {
    const { prompt, width, height } = await req.json() // Get prompt from request body
    console.log('prompt', prompt, 'width', width, 'height', height)
    const client = await Client.connect('black-forest-labs/FLUX.1-schnell')
    const result: any = await client.predict('/infer', {
      prompt: prompt || 'Your prompt here', // Use prompt from request, with a default
      height: parseInt(height || '1080'),
      width: parseInt(width || '1920'),
      num_inference_steps: 1
    })

    if (result?.data?.[0]?.url) {
      const imageUrl = result.data[0].url
      return NextResponse.json({ imageUrl }) // Return the URL as JSON
    } else {
      return NextResponse.json({ error: 'No image URL returned from Gradio' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}
