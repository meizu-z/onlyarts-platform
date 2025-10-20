import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { label: 'About', path: '/about' },
      { label: 'Features', path: '/features' },
      { label: 'Pricing', path: '/subscriptions' },
      { label: 'Blog', path: '/blog' },
    ],
    resources: [
      { label: 'Help Center', path: '/help' },
      { label: 'Community', path: '/community' },
      { label: 'Artist Guide', path: '/guide' },
      { label: 'API Docs', path: '/docs' },
    ],
    legal: [
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Cookie Policy', path: '/cookies' },
      { label: 'Guidelines', path: '/guidelines' },
    ],
  };

  return (
    <footer className="bg-[#121212] border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="text-2xl font-bold gradient-text mb-4">
              OnlyArts
            </div>
            <p className="text-[#f2e9dd]/70 text-sm mb-4">
              A premium platform for artists and collectors to connect, create, and trade digital art.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <span className="text-[#f2e9dd]">𝕏</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <span className="text-[#f2e9dd]">IG</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <span className="text-[#f2e9dd]">DC</span>
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-bold text-[#f2e9dd] mb-4">Platform</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-[#f2e9dd]/70 hover:text-[#f2e9dd] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-[#f2e9dd] mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-[#f2e9dd]/70 hover:text-[#f2e9dd] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-[#f2e9dd] mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-[#f2e9dd]/70 hover:text-[#f2e9dd] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#f2e9dd]/50 text-sm">
            © {currentYear} OnlyArts. All rights reserved.
          </p>
          <p className="text-[#f2e9dd]/50 text-sm">
            Made with 💜 in the Philippines
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;