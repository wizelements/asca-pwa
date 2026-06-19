import { NextResponse } from 'next/server';
import { createBlogPost, createGalleryImage, getBlogPosts, getGalleryImages } from '@/lib/db/queries';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  const validKey = process.env.SEED_KEY || process.env.NEXTAUTH_SECRET;
  if (!validKey || key !== validKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, string> = {};

  try {
    const existingPosts = await getBlogPosts();
    if (existingPosts.length === 0) {
      await createBlogPost({
        title: 'Feeling good with Horses: Benefits of Equine Assisted Therapy',
        slug: 'benefits-of-equine-assisted-therapy',
        excerpt: 'Equine-Assisted Therapy (EAT) can be beneficial for people of all ages in numerous ways.',
        content: `Equine-assisted therapy encompasses a range of treatments that involve activities with horses and other equines to promote human physical and mental health.

Here are some of the benefits:

**Physical Benefits:**
- Improved balance, coordination, and motor skills
- Strengthened core muscles
- Better posture and flexibility

**Emotional Benefits:**
- Reduced anxiety and stress
- Increased self-confidence and self-esteem
- Enhanced emotional awareness

**Social Benefits:**
- Improved communication skills
- Better teamwork and cooperation
- Increased empathy and trust`,
        author: 'Clariece Pinkney',
        category: 'Wellness',
        image: '/images/gallery/blog-member.jpg',
        published: true,
      } as any);
      results.blog = 'Blog post seeded';
    } else {
      results.blog = 'Blog posts already exist';
    }

    const existingGallery = await getGalleryImages();
    if (existingGallery.length === 0) {
      await createGalleryImage({ title: 'Our Horses', image: '/images/gallery/horse-closeup.jpg', description: 'ASCA horses up close', category: 'Horses', alt: 'ASCA horse close-up' } as any);
      await createGalleryImage({ title: 'Trail Rides', image: '/images/gallery/rider.jpg', description: 'Members on horseback', category: 'Trail Rides', alt: 'ASCA rider on horseback' } as any);
      await createGalleryImage({ title: 'Community', image: '/images/gallery/blog-member.jpg', description: 'ASCA community gathering', category: 'Community', alt: 'ASCA community gathering' } as any);
      await createGalleryImage({ title: 'Activities', image: '/images/gallery/activity.jpg', description: 'ASCA activities and events', category: 'Activities', alt: 'ASCA activities' } as any);
      await createGalleryImage({ title: 'Events', image: '/images/gallery/event.jpg', description: 'Community event photos', category: 'Events', alt: 'ASCA event' } as any);
      await createGalleryImage({ title: 'Members', image: '/images/members/member-1.jpg', description: 'ASCA members', category: 'Members', alt: 'ASCA members' } as any);
      results.gallery = '6 gallery images seeded';
    } else {
      results.gallery = `Gallery already has ${existingGallery.length} images`;
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('[SEED]', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    );
  }
}
