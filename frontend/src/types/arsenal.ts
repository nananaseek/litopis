export type ToolCategory = 'OSINT' | 'Аналітика' | 'Комунікації' | 'Безпека' | 'Моніторинг'

export interface Tool {
  id: string
  name: string
  description: string
  category: ToolCategory
  icon: string
  rating: number
  ratingCount?: number
  githubStars?: number
  forks?: number
  license?: string
  githubUrl?: string
  officialUrl?: string
  downloadUrl?: string
  version?: string
}

export interface ToolFormData {
  name: string
  description: string
  category: ToolCategory
  license: string
  icon: string
  tags: string[]
  githubUrl: string
  officialUrl: string
  downloadUrl: string
}
