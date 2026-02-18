import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Search, ChevronLeft, ChevronRight, ArrowRight, Mail } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import logo192 from '../../assets/favicon_io/android-chrome-192x192.png';

function Blog() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadBlogPosts();
  }, []);

  useEffect(() => {
    if (posts.length > 0 && slug) {
      const post = posts.find(p => p.slug === slug);
      setSelectedPost(post || null);
    } else if (!slug) {
      setSelectedPost(null);
    }
  }, [posts, slug]);

  useEffect(() => {
    const timer = setInterval(() => {
      const featuredPosts = posts.slice(0, 3);
      if (featuredPosts.length > 0) {
        setCurrentFeaturedIndex((prev) => (prev + 1) % featuredPosts.length);
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [posts]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedPost]);

  const loadBlogPosts = async () => {
    try {
      const modules = import.meta.glob('./blogFiles/*.json');
      const loadedPosts = [];

      for (const path in modules) {
        const module = await modules[path]();
        const post = module.default;
        const slug = path.split('/').pop().replace('.json', '');
        loadedPosts.push({ ...post, slug });
      }

      loadedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
      setPosts(loadedPosts);
      setLoading(false);
    } catch (error) {
      console.error('Error loading blog posts:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const categories = ['All', ...new Set(posts.map(post => post.category).filter(Boolean))];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = posts.slice(0, 3);
  const regularPosts = filteredPosts;

  const handleBack = () => {
    if (selectedPost) {
      navigate('/blog');
    } else {
      navigate('/');
    }
  };

  const handlePostClick = (post) => {
    navigate(`/blog/${post.slug}`);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert(`Thanks for subscribing with ${email}!`);
    setEmail('');
  };

  const getRelatedPosts = (currentPost) => {
    return posts
      .filter(post => 
        post.slug !== currentPost.slug && 
        post.category === currentPost.category
      )
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Article View
  if (selectedPost) {
    const relatedPosts = getRelatedPosts(selectedPost);
    
    return (
      <>
        <Helmet>
          <title>{selectedPost.title} | SBA Blog</title>
          <meta name="description" content={selectedPost.excerpt} />
          <meta property="og:title" content={selectedPost.title} />
          <meta property="og:description" content={selectedPost.excerpt} />
          <meta property="og:image" content={selectedPost.image} />
          <meta property="og:type" content="article" />
          <meta property="og:url" content={`${window.location.origin}/blog/${selectedPost.slug}`} />
          <link rel="canonical" href={`${window.location.origin}/blog/${selectedPost.slug}`} />
        </Helmet>

        <div className="min-h-screen bg-white">
          {/* Minimal Header */}
          <header className="border-b border-gray-200 bg-white sticky top-0 z-50 backdrop-blur-md bg-white/95">
            <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <img
                src={logo192}
                alt="SBA"
                className="w-8 h-8 cursor-pointer"
                onClick={() => navigate('/')}
              />
            </div>
          </header>

          {/* Article */}
          <article className="max-w-3xl mx-auto px-6 py-12 lg:py-16">
            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
              {selectedPost.category && (
                <span className="px-2.5 py-1 bg-black text-white font-medium uppercase tracking-wide rounded">
                  {selectedPost.category}
                </span>
              )}
              <time dateTime={selectedPost.date}>{formatDate(selectedPost.date)}</time>
              <span>·</span>
              <span>{selectedPost.readTime}</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight tracking-tight">
              {selectedPost.title}
            </h1>

            {/* Excerpt */}
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {selectedPost.excerpt}
            </p>

            {/* Author */}
            {selectedPost.author && (
              <div className="flex items-center gap-3 pb-8 mb-8 border-b border-gray-200">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {selectedPost.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedPost.author}</p>
                  <p className="text-xs text-gray-500">Content Team</p>
                </div>
              </div>
            )}

            {/* Featured Image */}
            {selectedPost.image && (
              <div className="mb-10 -mx-6 lg:mx-0">
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  className="w-full rounded-lg"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose-content">
              {selectedPost.content.map((section, index) => (
                <div key={index} className="mb-6">
                  {section.type === 'heading' && (
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-10">
                      {section.text}
                    </h2>
                  )}
                  {section.type === 'paragraph' && (
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {section.text}
                    </p>
                  )}
                  {section.type === 'list' && (
                    <ul className="space-y-2 mb-4 ml-4">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700">
                          <span className="w-1 h-1 bg-black rounded-full mt-2.5 flex-shrink-0"></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {section.type === 'quote' && (
                    <blockquote className="border-l-2 border-black pl-6 py-3 my-6 italic text-gray-800">
                      "{section.text}"
                    </blockquote>
                  )}
                </div>
              ))}
            </div>
          </article>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <section className="border-t border-gray-200 py-12 bg-gray-50">
              <div className="max-w-5xl mx-auto px-6">
                <h2 className="text-xl font-bold text-gray-900 mb-8">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((post, index) => (
                    <article
                      key={index}
                      onClick={() => handlePostClick(post)}
                      className="group cursor-pointer bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-black transition-all"
                    >
                      {post.image && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-2">{post.excerpt}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Newsletter */}
          <section className="bg-black text-white py-16">
            <div className="max-w-2xl mx-auto px-6 text-center">
              <h2 className="text-2xl font-bold mb-3">Stay Updated</h2>
              <p className="text-sm text-gray-400 mb-6">
                Get insights on tech education delivered to your inbox.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 px-4 py-2.5 text-sm rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-white text-black text-sm font-semibold rounded hover:bg-gray-100 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </section>
        </div>
      </>
    );
  }

  // Blog Listing View
  return (
    <>
      <Helmet>
        <title>Blog | SBA - Tech Education Insights</title>
        <meta name="description" content="Insights on tech education, bootcamp experiences, and career transformation." />
        <link rel="canonical" href={`${window.location.origin}/blog`} />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Header with Title */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50 backdrop-blur-md bg-white/95">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Home
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
                  <p className="text-sm text-gray-600 mt-0.5">Insights on tech education</p>
                </div>
              </div>
              <img
                src={logo192}
                alt="SBA"
                className="w-10 h-10 cursor-pointer"
                onClick={() => navigate('/')}
              />
            </div>
          </div>
        </header>

        {/* Featured Article Carousel */}
        {featuredPosts.length > 0 && (
          <section className="border-b border-gray-200 bg-white">
            <div className="max-w-6xl mx-auto px-6 py-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Featured</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentFeaturedIndex((prev) => (prev - 1 + featuredPosts.length) % featuredPosts.length)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-black transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentFeaturedIndex((prev) => (prev + 1) % featuredPosts.length)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-black transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden">
                {featuredPosts.map((post, index) => (
                  <div
                    key={index}
                    className={`transition-opacity duration-500 ${
                      index === currentFeaturedIndex ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
                    }`}
                  >
                    <div
                      onClick={() => handlePostClick(post)}
                      className="group cursor-pointer grid md:grid-cols-2 gap-8 items-center"
                    >
                      {/* Image */}
                      {post.image && (
                        <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div>
                        {post.category && (
                          <span className="inline-block px-2.5 py-1 bg-black text-white text-xs font-medium uppercase tracking-wide rounded mb-3">
                            {post.category}
                          </span>
                        )}
                        <h3 className="text-3xl font-bold text-gray-900 mb-3 group-hover:text-gray-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                          <time dateTime={post.date}>{formatDate(post.date)}</time>
                          <span>·</span>
                          <span>{post.readTime}</span>
                        </div>
                        <button className="flex items-center gap-2 text-sm font-semibold text-black group-hover:gap-3 transition-all">
                          Read Article
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Dots */}
                <div className="flex gap-1.5 mt-6">
                  {featuredPosts.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeaturedIndex(index)}
                      className={`h-1 rounded-full transition-all ${
                        index === currentFeaturedIndex ? 'bg-black w-8' : 'bg-gray-300 w-1'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Search and Filter */}
        <section className="border-b border-gray-200 bg-white sticky top-[97px] z-40 backdrop-blur-md bg-white/95">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
                />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                      selectedCategory === category
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* All Articles */}
        <section className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-6">All Articles</h2>
          
          {regularPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-gray-500">No articles found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post, index) => (
                <article
                  key={index}
                  onClick={() => handlePostClick(post)}
                  className="group cursor-pointer bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-black transition-all"
                >
                  {/* Image */}
                  {post.image && (
                    <div className="aspect-video overflow-hidden bg-gray-100">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5">
                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      {post.category && (
                        <>
                          <span className="font-medium">{post.category}</span>
                          <span>·</span>
                        </>
                      )}
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {post.excerpt}
                    </p>

                    {/* Read More */}
                    <div className="flex items-center text-sm font-semibold text-black group-hover:gap-2 transition-all">
                      Read
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:ml-0 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Newsletter */}
        <section className="bg-black text-white py-16">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <Mail className="w-10 h-10 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Never Miss an Update</h2>
            <p className="text-sm text-gray-400 mb-6">
              Join our community and get insights on tech education.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-2.5 text-sm rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-white text-black text-sm font-semibold rounded hover:bg-gray-100 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}

export default Blog;