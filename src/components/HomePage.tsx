import { Calendar, Users, MessageSquare, TrendingUp, CheckCircle, Star, ArrowRight } from 'lucide-react';

interface HomePageProps {
  onGetStarted: () => void;
}

export default function HomePage({ onGetStarted }: HomePageProps) {
  const features = [
    {
      icon: Calendar,
      title: 'Post Your Event',
      description: 'Create a request with your event details and service needs'
    },
    {
      icon: Users,
      title: 'Receive Bids',
      description: 'Get competitive bids from verified vendors in minutes'
    },
    {
      icon: MessageSquare,
      title: 'Chat & Compare',
      description: 'Communicate directly with vendors to discuss details'
    },
    {
      icon: CheckCircle,
      title: 'Award & Celebrate',
      description: 'Choose the best vendor and make your event memorable'
    }
  ];

  const categories = [
    'Catering',
    'Photography',
    'Flowers & Decoration',
    'Music & Entertainment',
    'Venue',
    'Planning & Coordination'
  ];

  const stats = [
    { number: '10,000+', label: 'Events Hosted' },
    { number: '5,000+', label: 'Verified Vendors' },
    { number: '98%', label: 'Satisfaction Rate' },
    { number: '50+', label: 'Service Categories' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                EventHub
              </span>
            </div>
            <button
              onClick={onGetStarted}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-sm hover:shadow-md"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-blue-600/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4" />
              The Marketplace for Event Services
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Find Perfect Vendors
              <span className="block mt-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                For Your Events
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Connect with top-rated event service providers. Post your requirements, receive competitive bids, and choose the perfect vendor for your special day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="group px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Start Your Event Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition border-2 border-gray-200 shadow-sm hover:shadow-md"
              >
                Browse Vendors
              </button>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-blue-600 mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A simple, transparent process to connect with the best event vendors
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="relative group">
                  <div className="p-8 bg-gradient-to-br from-white to-blue-50 rounded-2xl border-2 border-gray-100 hover:border-blue-200 transition-all hover:shadow-xl">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute top-4 right-4 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                  {index < features.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-300 to-transparent"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNEgxNHYtMjBoMjJ2MjB6bTAtMjBoMjJ2LTIwSDM2djIwem0yMiAyMHYyMEgzNnYtMjBoMjJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Service Categories</h2>
            <p className="text-lg text-blue-100">
              Everything you need for your perfect event
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <div
                key={index}
                className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition text-center group cursor-pointer"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {index === 0 && '🍽️'}
                  {index === 1 && '📸'}
                  {index === 2 && '💐'}
                  {index === 3 && '🎵'}
                  {index === 4 && '🏛️'}
                  {index === 5 && '📋'}
                </div>
                <div className="font-medium text-sm">{category}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
                <Star className="w-4 h-4" />
                For Clients
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Get Multiple Competitive Bids
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Save time and money by receiving proposals from multiple qualified vendors. Compare pricing, reviews, and portfolios all in one place.
              </p>
              <ul className="space-y-4">
                {[
                  'Post your event requirements in minutes',
                  'Receive bids from verified vendors',
                  'Chat directly with potential vendors',
                  'Review ratings and past work',
                  'Award the contract with confidence'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="w-full space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold text-blue-600">${500 * i}</div>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 rounded-3xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="w-full">
                    <div className="bg-white rounded-xl p-6 shadow-lg mb-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Calendar className="w-8 h-8 text-blue-600" />
                        <div>
                          <div className="font-semibold">New Request</div>
                          <div className="text-sm text-gray-500">Wedding Ceremony</div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>Date: June 15, 2025</div>
                        <div>Location: Downtown</div>
                        <div>Budget: $2,000 - $3,000</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-4 shadow-lg text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">24</div>
                        <div className="text-xs text-gray-500">Bids Received</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-lg text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">12</div>
                        <div className="text-xs text-gray-500">Active Chats</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                <Users className="w-4 h-4" />
                For Vendors
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Grow Your Business
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Access a steady stream of qualified leads. Connect with clients looking for your services and build your reputation.
              </p>
              <ul className="space-y-4">
                {[
                  'Receive notifications for relevant requests',
                  'Submit competitive bids with your pricing',
                  'Showcase your portfolio and reviews',
                  'Direct messaging with potential clients',
                  'Get paid securely through the platform'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Join thousands of clients and vendors making memorable events happen
          </p>
          <button
            onClick={onGetStarted}
            className="group px-10 py-5 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-gray-50 transition shadow-xl hover:shadow-2xl inline-flex items-center gap-3"
          >
            Create Your Free Account
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-lg">EventHub</span>
              </div>
              <p className="text-sm leading-relaxed">
                The trusted marketplace connecting clients with professional event service vendors.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Clients</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Browse Vendors</a></li>
                <li><a href="#" className="hover:text-white transition">Post a Request</a></li>
                <li><a href="#" className="hover:text-white transition">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Vendors</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Become a Vendor</a></li>
                <li><a href="#" className="hover:text-white transition">View Requests</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; 2025 EventHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
