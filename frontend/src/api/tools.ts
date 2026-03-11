import client from './client'
import type { ToolFormData } from '../types/arsenal'

export interface ToolResponse {
  id: string
  name: string
  description: string
  category: string
  icon: string
  tags: string[]
  license: string | null
  github_url: string | null
  official_url: string | null
  download_url: string | null
  is_published: boolean
  owner_id: string
  created_at: string
  updated_at: string
  average_rating: number | null
  rating_count: number
  user_rating: number | null
  is_favorited?: boolean | null
}

export interface MyToolsResponse {
  items: ToolResponse[]
  total: number
}

export async function getMyTools(
  skip = 0,
  limit = 50,
  params?: { category?: string; search?: string; sort?: string }
): Promise<MyToolsResponse> {
  const { data } = await client.get<MyToolsResponse>('/tools/my', {
    params: { skip, limit, ...params },
  })
  return data
}

export async function createTool(form: ToolFormData): Promise<ToolResponse> {
  const { data } = await client.post<ToolResponse>('/tools/', {
    name: form.name,
    description: form.description,
    category: form.category,
    icon: form.icon,
    tags: form.tags,
    license: form.license || null,
    github_url: form.githubUrl || null,
    official_url: form.officialUrl || null,
    download_url: form.downloadUrl || null,
  })
  return data
}

export async function updateTool(
  id: string,
  updates: Partial<ToolFormData> & { aboutContent?: string | null }
): Promise<ToolResponse> {
  const payload: Record<string, unknown> = {}
  if (updates.name !== undefined) payload.name = updates.name
  if (updates.description !== undefined) payload.description = updates.description
  if (updates.category !== undefined) payload.category = updates.category
  if (updates.icon !== undefined) payload.icon = updates.icon
  if (updates.tags !== undefined) payload.tags = updates.tags
  if (updates.license !== undefined) payload.license = updates.license || null
  if (updates.githubUrl !== undefined) payload.github_url = updates.githubUrl || null
  if (updates.officialUrl !== undefined) payload.official_url = updates.officialUrl || null
  if (updates.downloadUrl !== undefined) payload.download_url = updates.downloadUrl || null
  if (updates.aboutContent !== undefined) payload.about_content = updates.aboutContent

  const { data } = await client.put<ToolResponse>(`/tools/${id}`, payload)
  return data
}

export async function publishTool(id: string): Promise<ToolResponse> {
  const { data } = await client.patch<ToolResponse>(`/tools/${id}/publish`)
  return data
}

export async function unpublishTool(id: string): Promise<ToolResponse> {
  const { data } = await client.patch<ToolResponse>(`/tools/${id}/unpublish`)
  return data
}

export async function deleteTool(id: string): Promise<void> {
  await client.delete(`/tools/${id}`)
}

export interface ToolDetailResponse extends ToolResponse {
  readme_content: string | null
  about_content: string | null
}

export async function getToolDetail(id: string): Promise<ToolDetailResponse> {
  const { data } = await client.get<ToolDetailResponse>(`/tools/detail/${id}`)
  return data
}

export async function refreshReadme(id: string): Promise<ToolDetailResponse> {
  const { data } = await client.patch<ToolDetailResponse>(`/tools/${id}/refresh-readme`)
  return data
}

export interface LibraryListResponse {
  items: ToolResponse[]
  total: number
}

export async function getLibrary(params?: {
  skip?: number
  limit?: number
  category?: string
  search?: string
  min_rating?: number
  sort?: string
}): Promise<LibraryListResponse> {
  const { data } = await client.get<LibraryListResponse>('/tools/library', { params })
  return data
}

export interface LibraryStats {
  total: number
  new: number
}

export async function getLibraryStats(): Promise<LibraryStats> {
  const { data } = await client.get<LibraryStats>('/tools/library/stats')
  return data
}

export async function setToolRating(toolId: string, value: number): Promise<ToolResponse> {
  const { data } = await client.put<ToolResponse>(`/tools/${toolId}/rating`, { value })
  return data
}

export async function getFavorites(skip = 0, limit = 50): Promise<ToolResponse[]> {
  const { data } = await client.get<ToolResponse[]>('/tools/favorites', { params: { skip, limit } })
  return data
}

export async function addFavorite(toolId: string): Promise<ToolResponse> {
  const { data } = await client.post<ToolResponse>(`/tools/${toolId}/favorite`)
  return data
}

export async function removeFavorite(toolId: string): Promise<void> {
  await client.delete(`/tools/${toolId}/favorite`)
}
