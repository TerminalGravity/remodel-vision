import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock } from 'lucide-react';
import { Card } from '@remodelvision/ui';

// Mock blog posts - in production, fetch from Supabase
const blogPosts = [
  {
    id: '1',
    slug: 'ai-revolution-home-design',
    title: 'The AI Revolution in Home Design: What to Expect in 2025',
    excerpt: 'Artificial intelligence is transforming how we approach home renovation. From automated floor plans to style recommendations, here\'s what the future holds.',
    author: 'Sarah Chen',
    authorAvatar: 'SC',
    date: '2024-12-15',
    readTime: 8,
    category: 'AI & Technology',
    featured: true,
  },
  {
    id: '2',
    slug: 'property-intelligence-guide',
    title: 'Complete Guide to Property Intelligence for Designers',
    excerpt: 'Learn how to leverage property data from Zillow, Redfin, and county records to deliver better renovation proposals.',
    author: 'Marcus Rodriguez',
    authorAvatar: 'MR',
    date: '2024-12-10',
    readTime: 12,
    category: 'Guides',
    featured: true,
  },
  {
    id: '3',
    slug: 'client-presentations-3d',
    title: 'How 3D Visualization Transformed Our Client Presentations',
    excerpt: 'A case study on how one design firm increased their close rate by 40% using interactive 3D walkthroughs.',
    author: 'Emily Watson',
    authorAvatar: 'EW',
    date: '2024-12-05',
    readTime: 6,
    category: 'Case Studies',
    featured: false,
  },
  {
    id: '4',
    slug: 'renovation-budget-tips',
    title: '10 Tips for Accurate Renovation Budgets',
    excerpt: 'Stop surprising your clients with cost overruns. Here are proven strategies for creating accurate renovation estimates.',
    author: 'David Park',
    authorAvatar: 'DP',
    date: '2024-11-28',
    readTime: 10,
    category: 'Business',
    featured: false,
  },
  {
    id: '5',
    slug: 'sustainable-remodeling-trends',
    title: 'Sustainable Remodeling: Trends for Eco-Conscious Homeowners',
    excerpt: 'From energy-efficient windows to recycled materials, discover the latest trends in sustainable home renovation.',
    author: 'Lisa Wang',
    authorAvatar: 'LW',
    date: '2024-11-20',
    readTime: 7,
    category: 'Trends',
    featured: false,
  },
  {
    id: '6',
    slug: 'kitchen-remodel-roi',
    title: 'Kitchen Remodels with the Best ROI in 2024',
    excerpt: 'Which kitchen upgrades provide the best return on investment? We analyzed the data to find out.',
    author: 'Sarah Chen',
    authorAvatar: 'SC',
    date: '2024-11-15',
    readTime: 9,
    category: 'Research',
    featured: false,
  },
];

const categories = ['All', 'AI & Technology', 'Guides', 'Case Studies', 'Business', 'Trends', 'Research'];

export const BlogPage = () => {
  const featuredPosts = blogPosts.filter((post) => post.featured);
  const regularPosts = blogPosts.filter((post) => !post.featured);

  return (
    <>
      <Helmet>
        <title>Blog - RemodelVision</title>
        <meta
          name="description"
          content="Insights, guides, and trends in AI-powered home design and renovation. Stay updated with the latest from RemodelVision."
        />
      </Helmet>

      {/* Hero */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Blog</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Insights, guides, and trends in AI-powered home design and renovation.
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === 'All'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8">Featured</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {featuredPosts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`}>
                <Card className="h-full overflow-hidden bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors group">
                  <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-400 mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs">
                            {post.authorAvatar}
                          </div>
                          <span>{post.author}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime} min
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="py-16 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8">Latest Posts</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`}>
                <Card className="h-full overflow-hidden bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors group">
                  <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-700" />
                  <div className="p-5">
                    <span className="text-xs font-medium text-blue-400 mb-2 block">
                      {post.category}
                    </span>
                    <h3 className="font-semibold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{post.author}</span>
                      <span>{post.readTime} min read</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
              Load More Posts
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-slate-400 mb-8">
            Get the latest insights on AI design and renovation trends delivered to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
};
