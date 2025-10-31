import { useEffect } from 'react'
import './App.css'

const BACKEND_URL = "http://localhost:3000";




function App() {
  useEffect(() => {
  const makeRequest = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          "model": "openai/gpt-4o",
          "message": "What is 2+2"
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        const chunk = decoder.decode(value, { stream: true });
        console.log('Received chunk:', chunk);
        
        // Process the streaming data here
        // You can update state, display content, etc.
      }
    } catch (error) {
      console.error('Error making request:', error);
    }
  }

  makeRequest();
}, [])
  return (
    <>
      hii
    </>
  )
}

export default App
