import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const BASE_DIR = '/var/www/skill'
const CATEGORIES_DIR = join(BASE_DIR, 'categories')

export interface Skill {
  name: string
  source: string
  repo: string
  stars: number
  desc: string
  url: string
  install?: string
  functionCategory: string
  supportedAgents: string[]
}

export interface Category {
  id: string
  path: string
  count: number
}

export interface CategoryIndex {
  categories: Category[]
  totalSkills: number
}

let _categoryIndex: CategoryIndex | null = null

export function getCategoryIndex(): CategoryIndex {
  if (_categoryIndex) return _categoryIndex
  const data = JSON.parse(readFileSync(join(CATEGORIES_DIR, 'index.json'), 'utf-8'))
  _categoryIndex = data
  return data
}

export function getAllCategories(): Category[] {
  return getCategoryIndex().categories
}

export function getCategoryById(id: string): Category | null {
  return getAllCategories().find(c => c.id === id) || null
}

export function getSkillsByCategory(categoryId: string): Skill[] {
  const filePath = join(CATEGORIES_DIR, categoryId, 'skills.json')
  if (!existsSync(filePath)) return []
  const data = JSON.parse(readFileSync(filePath, 'utf-8'))
  return data.skills || []
}

export function getSkillCount(): number {
  return getCategoryIndex().totalSkills
}

export function getAllSkills(): Skill[] {
  const categories = getAllCategories()
  const skills: Skill[] = []
  for (const cat of categories) {
    skills.push(...getSkillsByCategory(cat.id))
  }
  return skills
}

let _fuseModule: any = null
function getFuse() {
  if (!_fuseModule) {
    // Dynamic import not available in sync context, use require
    _fuseModule = require('fuse.js')
  }
  return _fuseModule.default || _fuseModule
}

let _allSkills: Skill[] | null = null

export function searchSkills(query: string): Skill[] {
  const q = query.toLowerCase().trim()
  if (q.length < 2) {
    return getAllSkills().filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.desc.toLowerCase().includes(q) ||
      (s.repo && s.repo.toLowerCase().includes(q))
    )
  }

  // Fuse.js fuzzy search
  if (!_allSkills) _allSkills = getAllSkills()
  const Fuse = getFuse()
  const fuse = new Fuse(_allSkills, {
    keys: ['name', 'desc', 'repo'],
    threshold: 0.4,
    distance: 100,
    minMatchCharLength: 1,
    ignoreLocation: true,
  })

  return fuse.search(q).map(r => r.item)
}

export function getSkillByName(name: string): Skill | null {
  return getAllSkills().find(s => s.name === name) || null
}