import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "Free URL Shortener - Create Short Links Instantly | LinkShort",
  description = "Create short URLs instantly with our free URL shortener. Track clicks, set expiration times, and manage your links with detailed analytics. No registration required.",
  keywords = "URL shortener, short links, link shortener, free URL shortener, link analytics, click tracking, custom short codes, link management",
  canonicalUrl = "/",
  ogImage = "/logo.png"
}) => {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      
      {/* Twitter */}
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      <meta property="twitter:url" content={canonicalUrl} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
};

export default SEOHead;