// API calls for AI text enhancement and vision analysis

export async function callTextAI(apiConfig, systemPrompt, userInput) {
  if (apiConfig.provider === 'openai') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.key}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput }
        ]
      })
    })
    const data = await response.json()
    if (data.error) {
      throw new Error(data.error.message)
    }
    return data.choices[0].message.content
  } else {
    // Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiConfig.key}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: systemPrompt + '\nInput: ' + userInput }]
        }]
      })
    })
    const data = await response.json()
    if (data.error) {
      throw new Error(data.error.message)
    }
    return data.candidates[0].content.parts[0].text
  }
}

export async function callVisionAI(apiConfig, systemPrompt, imageBase64, imageMime) {
  if (apiConfig.provider === 'openai') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.key}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: systemPrompt },
            {
              type: 'image_url',
              image_url: { url: `data:${imageMime};base64,${imageBase64}` }
            }
          ]
        }]
      })
    })
    const data = await response.json()
    if (data.error) {
      throw new Error(data.error.message)
    }
    return data.choices[0].message.content
  } else {
    // Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiConfig.key}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: systemPrompt },
            { inlineData: { mimeType: imageMime, data: imageBase64 } }
          ]
        }]
      })
    })
    const data = await response.json()
    if (data.error) {
      throw new Error(data.error.message)
    }
    return data.candidates[0].content.parts[0].text
  }
}
