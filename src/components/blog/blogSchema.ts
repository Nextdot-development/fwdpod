import type { BlogPost } from '../../data/blogCatalog';
import { absoluteImageUrl, INSIGHTS_PATH, postPath, toPlainText } from '../../data/blogCatalog';
import { categoryPath, getCategory, type BlogCategoryDef } from '../../data/blogCategories';
import { SITE_BASE_URL, SITE_NAME } from '../SEO';

export const BLOG_TITLE = 'AI Engineering Insights & LLM Development Blog | Fwdpod';
export const BLOG_DESCRIPTION =
  'Deep-dives into LLM agent architectures, RAG systems, voice AI pipelines, enterprise compliance AI, and the economics of productised AI engineering teams.';

export function postUrl(post: BlogPost): string {
  return `${SITE_BASE_URL}${postPath(post)}`;
}

function postAuthor(post: BlogPost) {
  return post.author === SITE_NAME
    ? { '@id': `${SITE_BASE_URL}/#organization` }
    : { '@type': 'Person', name: post.author };
}

/** Listing page: the Blog entity and the posts it shows. */
export function buildBlogListSchema(posts: BlogPost[]) {
  const pageUrl = `${SITE_BASE_URL}${INSIGHTS_PATH}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: BLOG_TITLE,
        description: BLOG_DESCRIPTION,
        isPartOf: { '@id': `${SITE_BASE_URL}/#website` },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Insights', item: pageUrl },
          ],
        },
      },
      {
        '@type': 'Blog',
        '@id': `${SITE_BASE_URL}/#blog-entity`,
        name: 'Fwdpod Insights',
        publisher: { '@id': `${SITE_BASE_URL}/#organization` },
        // Placeholder cards carry no real article, so they stay out of schema
        blogPost: posts
          .filter(post => !post.placeholder)
          .map(post => ({
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            author: postAuthor(post),
            datePublished: post.isoDate,
            url: postUrl(post),
            keywords: post.category,
          })),
      },
    ],
  };
}

/**
 * Category page: a CollectionPage listing the posts it shows, plus the
 * breadcrumb trail. Only the posts on this page are listed, so the ItemList
 * matches what a reader sees.
 */
export function buildCategorySchema(
  category: BlogCategoryDef,
  posts: BlogPost[],
  page = 1
) {
  const pageUrl = `${SITE_BASE_URL}${categoryPath(category.slug, page)}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: category.seoTitle,
        description: category.metaDescription,
        isPartOf: { '@id': `${SITE_BASE_URL}/#website` },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_BASE_URL}/` },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Insights',
              item: `${SITE_BASE_URL}${INSIGHTS_PATH}`,
            },
            { '@type': 'ListItem', position: 3, name: category.name, item: pageUrl },
          ],
        },
        mainEntity: {
          '@type': 'ItemList',
          itemListOrder: 'https://schema.org/ItemListOrderDescending',
          numberOfItems: posts.length,
          itemListElement: posts.map((post, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: postUrl(post),
            name: post.title,
          })),
        },
      },
    ],
  };
}

/**
 * Article page: one WebPage, one BlogPosting, and one FAQPage when the body
 * has an FAQ section. Nothing here is asserted that the page does not show.
 */
export function buildArticleSchema(post: BlogPost) {
  const url = postUrl(post);
  const faqs = post.faqs ?? [];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: `${post.title} | Fwdpod Insights`,
        description: post.excerpt,
        isPartOf: { '@id': `${SITE_BASE_URL}/#website` },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Insights', item: `${SITE_BASE_URL}${INSIGHTS_PATH}` },
            {
              '@type': 'ListItem',
              position: 3,
              name: getCategory(post.categorySlug)?.name ?? post.category,
              item: `${SITE_BASE_URL}${categoryPath(post.categorySlug)}`,
            },
            { '@type': 'ListItem', position: 4, name: post.title, item: url },
          ],
        },
      },
      {
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        mainEntityOfPage: { '@id': `${url}#webpage` },
        headline: post.title,
        description: post.excerpt,
        articleBody: toPlainText(post.content),
        articleSection: post.category,
        keywords: post.keywords?.length ? post.keywords.join(', ') : post.category,
        author: postAuthor(post),
        publisher: { '@id': `${SITE_BASE_URL}/#organization` },
        datePublished: post.isoDate,
        dateModified: post.isoDate,
        image: post.image
          ? {
              '@type': 'ImageObject',
              url: absoluteImageUrl(post.image),
              caption: post.imageAlt ?? post.title,
            }
          : undefined,
        url,
        inLanguage: 'en-US',
      },
      ...(faqs.length
        ? [
            {
              '@type': 'FAQPage',
              '@id': `${url}#faq`,
              isPartOf: { '@id': `${url}#webpage` },
              mainEntity: faqs.map(faq => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: { '@type': 'Answer', text: faq.answer },
              })),
            },
          ]
        : []),
    ],
  };
}
