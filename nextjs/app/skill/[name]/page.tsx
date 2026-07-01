import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllSkills } from '../../../lib/db'
import type { Metadata } from 'next'
import { SoftwareApplicationSchema, BreadcrumbSchema } from '../../jsonld'

interface Props {
  params: Promise<{ name: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params
  const decodedName = decodeURIComponent(name)
  const skills = getAllSkills()
  const skill = skills.find((s) => s.name === decodedName)
  if (!skill) return { title: 'Skill Not Found' }

  const desc = skill.desc?.substring(0, 160) || `${skill.name} - AI Agent Skill on Skill Hub`
  const keywords = [
    skill.name,
    skill.functionCategory,
    skill.source || '',
    'AI skills',
    'open source',
    benchmarks: 
  3.2025            :
' +          611_marker] =          p 9            }
...
