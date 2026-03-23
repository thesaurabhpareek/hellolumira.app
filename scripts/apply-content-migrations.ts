/**
 * Applies content migration SQL files to Supabase via the REST API.
 * Parses INSERT statements and bulk-inserts via PostgREST.
 */

const SUPABASE_URL = 'https://gomjthjjqcmrhnpwsdqh.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const MIGRATION_FILES = [
  'lumira_v43_content_health_safety.sql',
]

const MIGRATIONS_DIR = './supabase/migrations'

// Column order as defined in migrations
type Article = {
  stage: string
  week_or_month: number
  title: string
  subtitle: string
  body: string
  category: string
  reading_time_minutes: number
  tags: string[]
  medically_reviewed: boolean
  culturally_sensitive: boolean
  author: string
}

/**
 * Parse a SQL INSERT file and extract article rows.
 * Handles multi-line strings, escaped quotes (''), and ARRAY[] syntax.
 */
function parseSQLInserts(sql: string): Article[] {
  const articles: Article[] = []

  // Find the VALUES section
  const valuesStart = sql.search(/VALUES\s*\n/i)
  if (valuesStart === -1) {
    console.warn('  No VALUES found in SQL')
    return articles
  }

  const valuesSection = sql.slice(valuesStart + sql.slice(valuesStart).search(/\n/) + 1)

  // State machine to parse rows
  let pos = 0
  const len = valuesSection.length

  while (pos < len) {
    // Skip whitespace and comments
    while (pos < len && (valuesSection[pos] === ' ' || valuesSection[pos] === '\n' || valuesSection[pos] === '\r' || valuesSection[pos] === '\t')) {
      pos++
    }
    if (pos >= len) break

    // Skip comment lines
    if (valuesSection[pos] === '-' && valuesSection[pos + 1] === '-') {
      while (pos < len && valuesSection[pos] !== '\n') pos++
      continue
    }

    // Expect '(' to start a row
    if (valuesSection[pos] !== '(') {
      pos++
      continue
    }
    pos++ // skip '('

    // Parse 11 fields
    const fields: string[] = []
    for (let fieldIdx = 0; fieldIdx < 11; fieldIdx++) {
      // Skip whitespace
      while (pos < len && (valuesSection[pos] === ' ' || valuesSection[pos] === '\n' || valuesSection[pos] === '\r' || valuesSection[pos] === '\t')) {
        pos++
      }

      const isEscape = valuesSection[pos] === 'E' && valuesSection[pos + 1] === "'"
      if (isEscape) pos++ // skip E prefix

      if (valuesSection[pos] === "'") {
        // String field (regular or E'...' escape string)
        pos++ // skip opening quote
        let value = ''
        while (pos < len) {
          if (valuesSection[pos] === "'" && valuesSection[pos + 1] === "'") {
            // Escaped quote ('' in SQL)
            value += "'"
            pos += 2
          } else if (valuesSection[pos] === "'") {
            pos++ // skip closing quote
            break
          } else if (isEscape && valuesSection[pos] === '\\') {
            // Handle escape sequences in E'...' strings
            const next = valuesSection[pos + 1]
            if (next === 'n') { value += '\n'; pos += 2 }
            else if (next === 't') { value += '\t'; pos += 2 }
            else if (next === 'r') { value += '\r'; pos += 2 }
            else if (next === '\\') { value += '\\'; pos += 2 }
            else if (next === "'") { value += "'"; pos += 2 }
            else if (next === 'u') {
              // \uXXXX unicode escape
              const hex = valuesSection.slice(pos + 2, pos + 6)
              value += String.fromCharCode(parseInt(hex, 16))
              pos += 6
            } else {
              value += valuesSection[pos]
              pos++
            }
          } else {
            value += valuesSection[pos]
            pos++
          }
        }
        fields.push(value)
      } else if (valuesSection.slice(pos, pos + 5).toUpperCase() === 'ARRAY') {
        // ARRAY['tag1', 'tag2'] syntax
        pos += 5 // skip 'ARRAY'
        if (valuesSection[pos] === '[') {
          pos++ // skip '['
          const tags: string[] = []
          while (pos < len && valuesSection[pos] !== ']') {
            if (valuesSection[pos] === "'") {
              pos++
              let tag = ''
              while (pos < len && valuesSection[pos] !== "'") {
                tag += valuesSection[pos]
                pos++
              }
              pos++ // skip closing quote
              tags.push(tag)
            } else {
              pos++
            }
          }
          pos++ // skip ']'
          fields.push(JSON.stringify(tags))
        }
      } else if (valuesSection.slice(pos, pos + 4) === 'true') {
        fields.push('true')
        pos += 4
      } else if (valuesSection.slice(pos, pos + 5) === 'false') {
        fields.push('false')
        pos += 5
      } else if (valuesSection.slice(pos, pos + 4) === 'null' || valuesSection.slice(pos, pos + 4) === 'NULL') {
        fields.push('null')
        pos += 4
      } else {
        // Number or other value
        let value = ''
        while (pos < len && valuesSection[pos] !== ',' && valuesSection[pos] !== ')' && valuesSection[pos] !== '\n') {
          value += valuesSection[pos]
          pos++
        }
        fields.push(value.trim())
      }

      // Skip comma separator (but not after last field)
      if (fieldIdx < 10) {
        while (pos < len && (valuesSection[pos] === ' ' || valuesSection[pos] === '\n' || valuesSection[pos] === '\r' || valuesSection[pos] === '\t')) {
          pos++
        }
        if (valuesSection[pos] === ',') pos++
      }
    }

    // Skip to closing ')' of this row
    while (pos < len && valuesSection[pos] !== ')') pos++
    pos++ // skip ')'

    // Skip comma or semicolon between rows
    while (pos < len && (valuesSection[pos] === ',' || valuesSection[pos] === ';' || valuesSection[pos] === ' ' || valuesSection[pos] === '\n' || valuesSection[pos] === '\r' || valuesSection[pos] === '\t')) {
      pos++
    }

    if (fields.length >= 11) {
      try {
        const article: Article = {
          stage: fields[0],
          week_or_month: parseInt(fields[1]) || 0,
          title: fields[2],
          subtitle: fields[3],
          body: fields[4],
          category: fields[5],
          reading_time_minutes: parseInt(fields[6]) || 5,
          tags: JSON.parse(fields[7] || '[]'),
          medically_reviewed: fields[8] === 'true',
          culturally_sensitive: fields[9] === 'true',
          author: fields[10],
        }
        articles.push(article)
      } catch (e) {
        console.error('  Failed to parse row:', fields.slice(0, 3), e)
      }
    }
  }

  return articles
}

async function insertBatch(articles: Article[], batchSize = 25): Promise<number> {
  let inserted = 0
  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize)
    const res = await fetch(`${SUPABASE_URL}/rest/v1/content_articles`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal,resolution=ignore-duplicates',
      },
      body: JSON.stringify(batch),
    })
    if (!res.ok) {
      const text = await res.text()
      console.error(`  Batch ${i}-${i + batch.length} failed (${res.status}):`, text.slice(0, 200))
    } else {
      inserted += batch.length
      process.stdout.write(`  ${inserted}/${articles.length} inserted...\r`)
    }
  }
  return inserted
}

async function getArticleCount(): Promise<number> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/content_articles?select=count`, {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      Prefer: 'count=exact',
    },
  })
  const data = await res.json() as Array<{count: number}>
  return data[0]?.count ?? 0
}

async function main() {
  if (!SERVICE_ROLE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY not set')
    process.exit(1)
  }

  const before = await getArticleCount()
  console.log(`\nStarting migration. Current article count: ${before}\n`)

  let totalInserted = 0

  for (const file of MIGRATION_FILES) {
    const path = `${MIGRATIONS_DIR}/${file}`
    let sql: string
    try {
      sql = await Bun.file(path).text()
    } catch {
      console.log(`⏭  ${file} — file not found, skipping`)
      continue
    }

    console.log(`📄 ${file}`)
    const articles = parseSQLInserts(sql)
    console.log(`  Parsed ${articles.length} articles`)

    if (articles.length === 0) {
      console.log('  ⚠️  No articles parsed — check SQL format')
      continue
    }

    const inserted = await insertBatch(articles)
    console.log(`\n  ✓ ${inserted} articles inserted`)
    totalInserted += inserted
  }

  const after = await getArticleCount()
  console.log(`\n✅ Done! Articles: ${before} → ${after} (+${after - before})`)
}

main().catch(console.error)
