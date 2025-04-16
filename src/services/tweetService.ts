import { createWorker } from 'tesseract.js'
import { PDFDocument } from 'pdf-lib'
import { Tweet, TweetLength, TweetTone, ThreadStyle, ThreadStructure } from '../types'

interface GenerateTweetsParams {
  topic: string
  tone: TweetTone
  length: TweetLength
  threadMode: boolean
  threadCount: number
  threadStyle?: ThreadStyle
  threadStructure?: ThreadStructure
  file: File | null
}

export async function generateTweets(params: GenerateTweetsParams): Promise<Tweet[]> {
  const { topic, tone, length, threadMode, threadCount, threadStyle, threadStructure, file } = params
  
  // Extract content from file if provided
  let fileContent = ''
  if (file) {
    try {
      fileContent = await extractContentFromFile(file)
    } catch (error) {
      console.error('Error extracting file content:', error)
      // Continue with empty file content if extraction fails
    }
  }
  
  // Instead of calling OpenAI, we'll generate mock tweets
  return generateMockTweets(
    topic, 
    fileContent, 
    tone, 
    length, 
    threadMode, 
    threadCount, 
    threadStyle, 
    threadStructure
  )
}

async function extractContentFromFile(file: File): Promise<string> {
  // Safely check file type with null checks
  if (!file || !file.type) {
    return ''
  }
  
  const fileType = file.type
  
  try {
    if (fileType === 'application/pdf') {
      return extractTextFromPDF(file)
    } else if (fileType.startsWith('text/')) {
      return extractTextFromTextFile(file)
    } else if (fileType.startsWith('image/')) {
      return extractTextFromImage(file)
    }
  } catch (error) {
    console.error('Error in extractContentFromFile:', error)
    return ''
  }
  
  return ''
}

async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    
    // This is a simplified approach - pdf-lib doesn't directly extract text
    // In a production app, you'd use a more robust PDF text extraction library
    const pageCount = pdfDoc.getPageCount()
    return `PDF document with ${pageCount} pages. Please generate tweets based on this PDF.`
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    return 'Error extracting text from PDF'
  }
}

async function extractTextFromTextFile(file: File): Promise<string> {
  try {
    return await file.text()
  } catch (error) {
    console.error('Error extracting text from text file:', error)
    return 'Error extracting text from text file'
  }
}

async function extractTextFromImage(file: File): Promise<string> {
  try {
    const worker = await createWorker()
    
    const imageData = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    })
    
    await worker.load()
    await worker.loadLanguage('eng')
    await worker.initialize('eng')
    
    const { data } = await worker.recognize(imageData)
    await worker.terminate()
    
    return data.text
  } catch (error) {
    console.error('Error extracting text from image:', error)
    return 'Error extracting text from image'
  }
}

// Mock tweet generation function that doesn't require OpenAI
function generateMockTweets(
  topic: string,
  fileContent: string,
  tone: TweetTone,
  length: TweetLength,
  threadMode: boolean,
  threadCount: number,
  threadStyle?: ThreadStyle,
  threadStructure?: ThreadStructure
): Promise<Tweet[]> {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      const tweets: Tweet[] = []
      
      // Generate appropriate number of tweets
      const count = threadMode ? threadCount : 1
      
      if (threadMode && threadStructure === 'Opening-Content-Closing') {
        // Create opening tweet
        tweets.push(createStructuredTweet(topic, fileContent, tone, length, 0, count, 'opening', threadStyle))
        
        // Create content tweets
        for (let i = 1; i < count - 1; i++) {
          tweets.push(createStructuredTweet(topic, fileContent, tone, length, i, count, 'content', threadStyle))
        }
        
        // Create closing tweet
        if (count > 1) {
          tweets.push(createStructuredTweet(topic, fileContent, tone, length, count - 1, count, 'closing', threadStyle))
        }
      } else if (threadMode && threadStructure === 'Problem-Solution') {
        // Create problem tweets for the first half
        const problemCount = Math.ceil(count / 2)
        for (let i = 0; i < problemCount; i++) {
          tweets.push(createProblemSolutionTweet(topic, fileContent, tone, length, i, count, 'problem', threadStyle))
        }
        
        // Create solution tweets for the second half
        for (let i = problemCount; i < count; i++) {
          tweets.push(createProblemSolutionTweet(topic, fileContent, tone, length, i, count, 'solution', threadStyle))
        }
      } else {
        // Standard sequential tweets
        for (let i = 0; i < count; i++) {
          let content = createTweetContent(topic, fileContent, tone, length, i, threadStyle)
          
          // Generate hashtags
          const hashtags = generateHashtags(topic)
          
          // Add to tweets array
          tweets.push({
            content,
            hashtags,
            tone,
            length,
            ...(threadMode && { threadIndex: i, threadTotal: count })
          })
        }
      }
      
      resolve(tweets)
    }, 1500) // Simulate processing time
  })
}

function createStructuredTweet(
  topic: string,
  fileContent: string,
  tone: TweetTone,
  length: TweetLength,
  index: number,
  total: number,
  role: 'opening' | 'content' | 'closing',
  style?: ThreadStyle
): Tweet {
  let content = ''
  const hashtags = generateHashtags(topic)
  
  if (role === 'opening') {
    content = createOpeningTweet(topic, fileContent, tone, style)
  } else if (role === 'content') {
    content = createContentTweet(topic, fileContent, tone, length, index, style)
  } else if (role === 'closing') {
    content = createClosingTweet(topic, fileContent, tone, style)
  }
  
  return {
    content,
    hashtags,
    tone,
    length,
    threadIndex: index,
    threadTotal: total,
    threadRole: role
  }
}

function createProblemSolutionTweet(
  topic: string,
  fileContent: string,
  tone: TweetTone,
  length: TweetLength,
  index: number,
  total: number,
  type: 'problem' | 'solution',
  style?: ThreadStyle
): Tweet {
  let content = ''
  const hashtags = generateHashtags(topic)
  
  if (type === 'problem') {
    const problemIntros = [
      `Challenge #${index + 1} with ${topic}:`,
      `A common issue in ${topic} is`,
      `Many people struggle with this aspect of ${topic}:`,
      `Here's a problem that needs solving in ${topic}:`
    ]
    
    const intro = problemIntros[index % problemIntros.length]
    content = `${intro} ${createProblemContent(topic, fileContent, tone, length)}`
  } else {
    const solutionIntros = [
      `Solution to challenge #${index - Math.floor(total / 2) + 1}:`,
      `Here's how to solve this:`,
      `The answer is simple:`,
      `Let me show you how to fix this:`
    ]
    
    const intro = solutionIntros[(index - Math.floor(total / 2)) % solutionIntros.length]
    content = `${intro} ${createSolutionContent(topic, fileContent, tone, length)}`
  }
  
  return {
    content,
    hashtags,
    tone,
    length,
    threadIndex: index,
    threadTotal: total,
    threadRole: type === 'problem' ? 'opening' : 'closing'
  }
}

function createOpeningTweet(topic: string, fileContent: string, tone: TweetTone, style?: ThreadStyle): string {
  const openingIntros: Record<TweetTone, string[]> = {
    'Professional': [
      `I'd like to share some insights about ${topic}. Thread 🧵`,
      `Let's explore ${topic} in detail. Here's what you need to know: 🧵`,
      `A comprehensive analysis of ${topic} (thread): 🧵`,
      `${topic}: A professional perspective. Thread follows 👇`
    ],
    'Casual': [
      `Hey everyone! Let's talk about ${topic}... 🧵`,
      `So I've been thinking about ${topic} lately... Thread! 👇`,
      `${topic} - my thoughts in this thread 👇`,
      `Let me tell you about ${topic}... 🧵`
    ],
    'Humorous': [
      `You won't believe what I discovered about ${topic}! 😂 Thread 👇`,
      `${topic}: a comedy of errors (and what I learned). Thread! 🤣`,
      `The hilarious truth about ${topic}... 😆 🧵`,
      `${topic} - prepare to laugh! Thread incoming 👇`
    ],
    'Motivational': [
      `How ${topic} changed my life - and how it can change yours too. Thread 🔥`,
      `The journey to mastering ${topic} starts here. Thread 💪`,
      `Transform your approach to ${topic} with these insights. Thread 🌟`,
      `Your ${topic} breakthrough is waiting. Let me show you how... 🧵`
    ],
    'Controversial': [
      `Why everything you know about ${topic} is wrong. Thread 👇`,
      `The uncomfortable truth about ${topic} that nobody talks about. 🧵`,
      `${topic}: It's time to challenge the status quo. Thread 👇`,
      `My unpopular take on ${topic}... Thread incoming 🔥`
    ],
    'Educational': [
      `${topic} explained: A comprehensive thread 📚`,
      `Everything you need to know about ${topic}. Thread 👇`,
      `${topic} 101: Let's break it down. 🧵`,
      `The ultimate guide to understanding ${topic}. Thread follows 👇`
    ],
    'Enthusiastic': [
      `I'M SO EXCITED to share these ${topic} insights with you! THREAD! 🎉`,
      `${topic} is ABSOLUTELY AMAZING and here's why! Thread 🤩`,
      `I can't contain my excitement about ${topic}! Thread incoming! 💖`,
      `${topic} has CHANGED EVERYTHING! Let me show you why! Thread 👇`
    ]
  }
  
  // Select a random intro based on tone
  const intros = openingIntros[tone]
  const intro = intros[Math.floor(Math.random() * intros.length)]
  
  // Add style-specific elements
  if (style === 'Storytelling') {
    return `${intro}\n\nOnce upon a time, I encountered a situation with ${topic} that changed my perspective forever...`
  } else if (style === 'Tips') {
    return `${intro}\n\nI've compiled my top tips about ${topic} that you won't want to miss!`
  } else if (style === 'FAQ') {
    return `${intro}\n\nI've answered the most common questions about ${topic} in this thread.`
  } else {
    return intro
  }
}

function createContentTweet(
  topic: string, 
  fileContent: string, 
  tone: TweetTone, 
  length: TweetLength, 
  index: number,
  style?: ThreadStyle
): string {
  // Base content
  let content = ''
  
  // Style-specific content
  if (style === 'Storytelling') {
    const storyParts = [
      `As I delved deeper into ${topic}, I discovered something unexpected...`,
      `The turning point came when I realized that ${topic} wasn't what it seemed.`,
      `What happened next with ${topic} surprised even me.`,
      `The plot thickened when a new aspect of ${topic} emerged.`
    ]
    content = storyParts[index % storyParts.length]
  } else if (style === 'Tips') {
    content = `Tip #${index}: When working with ${topic}, always remember to focus on the fundamentals first. This will save you time and effort in the long run.`
  } else if (style === 'FAQ') {
    const questions = [
      `Q: "What's the biggest misconception about ${topic}?"`,
      `Q: "How do I get started with ${topic}?"`,
      `Q: "What tools do I need for ${topic}?"`,
      `Q: "Is ${topic} worth the investment?"`
    ]
    const answers = [
      `A: The biggest misconception is that ${topic} is complicated. In reality, it's quite approachable if you take it step by step.`,
      `A: Start small with ${topic}. Begin with the basics and gradually build your knowledge and skills.`,
      `A: You don't need fancy tools for ${topic}. The essentials are often enough to get great results.`,
      `A: Absolutely! ${topic} offers tremendous value, especially if you're looking to enhance your skills or business.`
    ]
    content = `${questions[index % questions.length]}\n\n${answers[index % answers.length]}`
  } else {
    // Standard content
    content = createTweetContent(topic, fileContent, tone, length, index)
  }
  
  return content
}

function createClosingTweet(topic: string, fileContent: string, tone: TweetTone, style?: ThreadStyle): string {
  const closingOutros: Record<TweetTone, string[]> = {
    'Professional': [
      `In conclusion, ${topic} represents a significant opportunity for growth and innovation.`,
      `To summarize the key points about ${topic}...`,
      `The future of ${topic} depends on our ability to adapt and evolve.`,
      `I hope this thread on ${topic} has provided valuable insights for your work.`
    ],
    'Casual': [
      `So that's my take on ${topic}! What do you think?`,
      `And that wraps up my thoughts on ${topic}. Let me know if you have questions!`,
      `Thanks for reading my thread about ${topic}! Would love to hear your experiences.`,
      `That's all I've got on ${topic} for now. Hope it was helpful!`
    ],
    'Humorous': [
      `And that's how I became a ${topic} expert... or at least how I pretend to be one! 😂`,
      `If you made it this far in my ${topic} thread, you deserve a medal! Or at least a follow. 🏆`,
      `That's all folks! My ${topic} TED Talk is now complete. Tips accepted in the form of likes and retweets! 😆`,
      `In conclusion: ${topic} is wild, Ifunction createClosingTweet(topic: string, fileContent: string, tone: TweetTone, style?: ThreadStyle): string {
  const closingOutros: Record<TweetTone, string[]> = {
    'Professional': [
      `In conclusion, ${topic} represents a significant opportunity for growth and innovation.`,
      `To summarize the key points about ${topic}...`,
      `The future of ${topic} depends on our ability to adapt and evolve.`,
      `I hope this thread on ${topic} has provided valuable insights for your work.`
    ],
    'Casual': [
      `So that's my take on ${topic}! What do you think?`,
      `And that wraps up my thoughts on ${topic}. Let me know if you have questions!`,
      `Thanks for reading my thread about ${topic}! Would love to hear your experiences.`,
      `That's all I've got on ${topic} for now. Hope it was helpful!`
    ],
    'Humorous': [
      `And that's how I became a ${topic} expert... or at least how I pretend to be one! 😂`,
      `If you made it this far in my ${topic} thread, you deserve a medal! Or at least a follow. 🏆`,
      `That's all folks! My ${topic} TED Talk is now complete. Tips accepted in the form of likes and retweets! 😆`,
      `In conclusion: ${topic} is wild, I'm exhausted, and my thumbs hurt from typing this thread. 🤣`
    ],
    'Motivational': [
      `Remember: Your journey with ${topic} is unique. Embrace the challenges and celebrate the victories! 🔥`,
      `Don't just read about ${topic} - take action today! Your future self will thank you. 💪`,
      `I believe in your ability to master ${topic}. The only limit is the one you place on yourself! ✨`,
      `This is just the beginning of your ${topic} journey. Keep pushing forward! 🚀`
    ],
    'Controversial': [
      `I know my views on ${topic} might ruffle some feathers, but sometimes the truth needs to be said.`,
      `If this thread on ${topic} made you uncomfortable, it's probably because it needed to be addressed.`,
      `Disagree with my take on ${topic}? Let's have a respectful debate in the replies.`,
      `The conversation about ${topic} is just beginning. It's time we all spoke up.`
    ],
    'Educational': [
      `I hope this thread has demystified ${topic} for you. Remember: learning is a lifelong journey! 📚`,
      `To recap what we've learned about ${topic}...`,
      `Keep exploring ${topic} - there's always more to discover and understand!`,
      `Education about ${topic} is the first step toward innovation. Keep learning! 🧠`
    ],
    'Enthusiastic': [
      `I'm STILL BUZZING about ${topic} and can't wait to see what comes next! WHO'S WITH ME?! 🎉`,
      `That's all for now on ${topic} but I'M NOT DONE YET! Stay tuned for MORE AMAZING content! 💖`,
      `If you loved this thread on ${topic}, SMASH that like button and SHARE with your friends! 🤩`,
      `I could talk about ${topic} ALL DAY LONG! Let me know if you want MORE THREADS like this! 🔥`
    ]
  }
  
  // Select a random outro based on tone
  const outros = closingOutros[tone]
  const outro = outros[Math.floor(Math.random() * outros.length)]
  
  // Add call to action
  const ctas = [
    `Follow me for more content on ${topic} and related subjects!`,
    `Like and retweet if you found this thread valuable!`,
    `Share your thoughts in the replies!`,
    `Save this thread for future reference!`
  ]
  const cta = ctas[Math.floor(Math.random() * ctas.length)]
  
  // Add style-specific elements
  if (style === 'Storytelling') {
    return `${outro}\n\nThe moral of this ${topic} story? Never underestimate the power of persistence and curiosity.\n\n${cta}`
  } else if (style === 'Tips') {
    return `${outro}\n\nImplement these tips on ${topic} one by one, and you'll see remarkable improvements.\n\n${cta}`
  } else if (style === 'FAQ') {
    return `${outro}\n\nStill have questions about ${topic}? Drop them in the replies and I'll do my best to answer!\n\n${cta}`
  } else {
    return `${outro}\n\n${cta}`
  }
}

function createProblemContent(topic: string, fileContent: string, tone: TweetTone, length: TweetLength): string {
  const problems = [
    `Many people struggle with understanding the complexity of ${topic}.`,
    `A common obstacle in ${topic} is the lack of clear information and guidance.`,
    `The rapidly changing nature of ${topic} makes it difficult to stay current.`,
    `The high cost associated with ${topic} creates barriers to entry for many.`,
    `Misconceptions about ${topic} lead to ineffective approaches and wasted effort.`
  ]
  
  return problems[Math.floor(Math.random() * problems.length)]
}

function createSolutionContent(topic: string, fileContent: string, tone: TweetTone, length: TweetLength): string {
  const solutions = [
    `Break down ${topic} into smaller, manageable components to better understand the whole.`,
    `Invest in quality resources and education about ${topic} - it pays dividends in the long run.`,
    `Join communities focused on ${topic} to share knowledge and stay updated on changes.`,
    `Start with a minimal viable approach to ${topic} and iterate based on feedback and results.`,
    `Challenge your assumptions about ${topic} regularly and be open to new perspectives.`
  ]
  
  return solutions[Math.floor(Math.random() * solutions.length)]
}

function createTweetContent(
  topic: string,
  fileContent: string,
  tone: TweetTone,
  length: TweetLength,
  index: number,
  style?: ThreadStyle
): string {
  // Base content on the topic
  let baseContent = ''
  
  // If we have file content, use that as a basis
  if (fileContent && fileContent.length > 0) {
    // Extract a relevant portion of the file content
    const excerpt = fileContent.substring(0, 100) + '...'
    baseContent = `Based on this content: "${excerpt}"\n\n`
  }
  
  // Different intros based on tone
  const intros: Record<TweetTone, string[]> = {
    'Professional': [
      'New research shows that',
      'Industry experts agree:',
      'A recent study reveals',
      'According to leading professionals,'
    ],
    'Casual': [
      'Hey everyone! Did you know',
      'Just found out that',
      'So I was thinking about',
      'Check this out:'
    ],
    'Humorous': [
      'You won\'t believe what happens when',
      'In a plot twist nobody saw coming:',
      'If I had a dollar for every time',
      'My face when I learned about'
    ],
    'Motivational': [
      'Never underestimate the power of',
      'Your journey with',
      'The secret to success is',
      'Today is your day to embrace'
    ],
    'Controversial': [
      'Unpopular opinion:',
      'Hot take:',
      'Why is nobody talking about',
      'Let\'s be honest about'
    ],
    'Educational': [
      'Did you know that',
      'Here\'s an interesting fact about',
      'The history of',
      'Understanding the basics of'
    ],
    'Enthusiastic': [
      'I\'m SO excited about',
      'Can\'t contain my excitement for',
      'ABSOLUTELY LOVING',
      'This is GAME-CHANGING:'
    ]
  }
  
  // Select a random intro based on tone
  const intro = intros[tone][Math.floor(Math.random() * intros[tone].length)]
  
  // Create middle content based on topic and index (for threads)
  let middleContent = topic
  if (index > 0) {
    const threadContinuations = [
      `Continuing on ${topic}...`,
      `Furthermore, when we look at ${topic}...`,
      `Another aspect of ${topic} to consider:`,
      `Let's explore ${topic} from a different angle:`
    ]
    middleContent = threadContinuations[index % threadContinuations.length]
  }
  
  // Create conclusions
  const conclusions = [
    'What do you think?',
    'Thoughts?',
    'Would love to hear your perspective!',
    'Share your experiences below!',
    'Agree or disagree?'
  ]
  
  // Select a random conclusion
  const conclusion = conclusions[Math.floor(Math.random() * conclusions.length)]
  
  // Add emojis based on tone
  const emojis: Record<TweetTone, string[]> = {
    'Professional': ['📊', '📈', '💼', '🔍', '📱'],
    'Casual': ['😊', '👍', '✌️', '🙌', '💯'],
    'Humorous': ['😂', '🤣', '😜', '🙃', '🤪'],
    'Motivational': ['💪', '🔥', '⭐', '🚀', '✨'],
    'Controversial': ['🤔', '👀', '💭', '❓', '⚠️'],
    'Educational': ['📚', '🧠', '💡', '🔬', '📝'],
    'Enthusiastic': ['🤩', '😍', '💖', '🎉', '🙌']
  }
  
  // Select random emojis
  const emoji1 = emojis[tone][Math.floor(Math.random() * emojis[tone].length)]
  const emoji2 = emojis[tone][Math.floor(Math.random() * emojis[tone].length)]
  
  // Style-specific formatting
  if (style === 'Tips' && index > 0) {
    return `Tip #${index + 1}: When dealing with ${topic}, remember that consistency is key. ${emoji1}\n\nThis approach will help you achieve better results with less effort.\n\n${conclusion} ${emoji2}`
  } else if (style === 'FAQ' && index > 0) {
    const questions = [
      `"What's the most important thing to know about ${topic}?"`,
      `"How can I improve my ${topic} skills quickly?"`,
      `"What common mistakes should I avoid with ${topic}?"`,
      `"How do experts approach ${topic} differently?"`
    ]
    return `Q: ${questions[index % questions.length]}\n\nA: The key is to focus on fundamentals first. ${middleContent} ${emoji1}\n\n${conclusion} ${emoji2}`
  } else if (style === 'Storytelling' && index > 0) {
    const storyParts = [
      `Chapter ${index + 1}: As my ${topic} journey continued, I discovered that...`,
      `The plot thickens: Just when I thought I understood ${topic}...`,
      `The turning point in my ${topic} story came when...`,
      `And then it happened - the ${topic} revelation that changed everything:`
    ]
    return `${storyParts[index % storyParts.length]} ${emoji1}\n\n${middleContent}\n\n${conclusion} ${emoji2}`
  } else {
    // Combine all parts for standard format
    let content = `${intro} ${middleContent} ${emoji1}\n\n`
    
    // Add more content based on length
    if (length === 'Medium' || length === 'Long') {
      content += `This is something that's been on my mind lately. ${topic} is changing how we think about everything.\n\n`
    }
    
    if (length === 'Long') {
      content += `When we consider the implications of ${topic}, we need to take into account various factors and perspectives. It's not just about the surface level understanding.\n\n`
    }
    
    // Add conclusion
    content += `${conclusion} ${emoji2}`
    
    return content
  }
}

function generateHashtags(topic: string): string[] {
  // Extract potential hashtag words from the topic
  const words = topic.split(' ')
  const hashtags: string[] = []
  
  // Convert some words to hashtags
  words.forEach(word => {
    if (word.length > 3 && Math.random() > 0.5) {
      hashtags.push('#' + word.replace(/[^a-zA-Z0-9]/g, ''))
    }
  })
  
  // Add some generic popular hashtags
  const popularHashtags = [
    '#trending', '#viral', '#socialmedia', '#content', '#digital',
    '#growth', '#strategy', '#marketing', '#business', '#success',
    '#innovation', '#technology', '#future', '#insights', '#tips'
  ]
  
  // Add 2-3 random popular hashtags
  const numToAdd = 2 + Math.floor(Math.random() * 2)
  for (let i = 0; i < numToAdd; i++) {
    const randomHashtag = popularHashtags[Math.floor(Math.random() * popularHashtags.length)]
    if (!hashtags.includes(randomHashtag)) {
      hashtags.push(randomHashtag)
    }
  }
  
  return hashtags
}
