import { getCollection } from 'astro:content';

export async function GET() {
  const docs = await getCollection('docs');
  
  const searchIndex = docs.map((doc) => {
    // Strip common Markdown characters
    const plainText = doc.body
      .replace(/[#*`_[\]()\-+!]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
      
    // Excerpt for rendering in results
    const excerpt = plainText.length > 120 
      ? plainText.slice(0, 120) + '...' 
      : plainText;

    // Determine title: from frontmatter, first markdown heading, or file name fallback
    let title = doc.data.title;
    if (!title) {
      const headingMatch = doc.body.match(/^#\s+(.+)$/m);
      if (headingMatch) {
        title = headingMatch[1].trim();
      } else {
        title = doc.id.split('/').pop()?.replace(/-/g, ' ') || 'Documentation';
      }
    }
    
    return {
      title,
      slug: doc.id,
      excerpt,
      content: `${title} ${plainText}`.toLowerCase(),
    };
  });

  return new Response(JSON.stringify(searchIndex), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
