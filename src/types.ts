export type TweetTone = 'Professional' | 'Casual' | 'Humorous' | 'Motivational' | 'Controversial' | 'Educational' | 'Enthusiastic'
export type TweetLength = 'Short' | 'Medium' | 'Long'
export type ThreadStyle = 'Storytelling' | 'Tips' | 'FAQ' | 'Standard'
export type ThreadStructure = 'Opening-Content-Closing' | 'Sequential' | 'Problem-Solution'

export interface Tweet {
  content: string
  hashtags?: string[]
  tone: TweetTone
  length: TweetLength
  threadIndex?: number
  threadTotal?: number
  threadRole?: 'opening' | 'content' | 'closing'
}

export interface ThreadOptions {
  style: ThreadStyle
  structure: ThreadStructure
  count: number
}
