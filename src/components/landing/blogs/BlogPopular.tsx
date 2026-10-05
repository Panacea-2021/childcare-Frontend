'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  categoryLabel,
  getFeaturedArticle,
  getPopularArticles,
} from './data';
import { BlogCoverArt } from './BlogCoverArt';
import { BlReveal } from './BlReveal';
import { fadeUp, staggerContainer } from './motion';

export function BlogPopular() {
  const featured = getFeaturedArticle();
  const popular = getPopularArticles().filter((a) => a.id !== featured.id).slice(0, 4);

  return (
    <section className="bl-popular">
      <BlReveal>
        <h2 className="bl-sectionTitle">Most Popular</h2>
      </BlReveal>

      <div className="bl-popularGrid">
        <BlReveal className="bl-featured">
          <Link href={`/resources/blogs/${featured.slug}`} className="bl-featuredLink">
            <div className="bl-featuredMedia">
              <BlogCoverArt article={featured} size="lg" />
            </div>
            <div className="bl-cardMeta">
              <span className="bl-cat">{categoryLabel(featured.category)}</span>
              <span className="bl-read">{featured.readTime}</span>
            </div>
            <h3>{featured.title}</h3>
            <p>{featured.excerpt}</p>
          </Link>
        </BlReveal>

        <motion.ul
          className="bl-popularList"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {popular.map((item) => (
            <motion.li key={item.id} variants={fadeUp}>
              <Link href={`/resources/blogs/${item.slug}`} className="bl-popularRow">
                <span className="bl-popularThumb">
                  <BlogCoverArt article={item} size="sm" />
                </span>
                <span className="bl-popularBody">
                  <em className="bl-cat">{categoryLabel(item.category)}</em>
                  <strong>{item.title}</strong>
                  <span className="bl-read">{item.readTime}</span>
                </span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
