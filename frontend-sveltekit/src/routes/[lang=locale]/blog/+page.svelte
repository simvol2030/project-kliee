<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import type { LanguageCode } from '$lib/types/layout.types';

	let { data }: { data: PageData } = $props();

	const locale = $derived(($page.data.locale as LanguageCode) || 'en');
	const currentUrl = $derived($page.url.href);
	const baseUrl = $derived($page.url.origin);

	const alternateUrls = $derived({
		en: `${baseUrl}/en/blog`,
		ru: `${baseUrl}/ru/blog`,
		es: `${baseUrl}/es/blog`,
		zh: `${baseUrl}/zh/blog`
	});

	const headings = {
		en: { title: 'Blog', subtitle: 'Stories, insights, and updates from the studio' },
		ru: { title: 'Блог', subtitle: 'Истории, размышления и новости из мастерской' },
		es: { title: 'Blog', subtitle: 'Historias, ideas y novedades del estudio' },
		zh: { title: '博客', subtitle: '工作室的故事、见解与动态' }
	};

	const readMoreLabel: Record<LanguageCode, string> = { en: 'Read More →', ru: 'Читать →', es: 'Leer más →', zh: '阅读 →' };
	const featuredLabel: Record<LanguageCode, string> = { en: 'Featured', ru: 'Рекомендуем', es: 'Destacado', zh: '精选' };

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function getTitle(post: any, lang: LanguageCode): string {
		return post[`title_${lang}`] || post.title_en || '';
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function getExcerpt(post: any, lang: LanguageCode): string {
		return post[`excerpt_${lang}`] || post.excerpt_en || '';
	}

	function formatDate(dateStr: string | null | undefined, lang: LanguageCode): string {
		if (!dateStr) return '';
		try {
			const localeMap: Record<LanguageCode, string> = {
				en: 'en-GB',
				ru: 'ru-RU',
				es: 'es-ES',
				zh: 'zh-CN'
			};
			return new Date(dateStr).toLocaleDateString(localeMap[lang] || 'en-GB', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		} catch {
			return dateStr;
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function estimateReadTime(post: any): string {
		const content: string = post[`content_${locale}`] || '';
		const words = content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
		const minutes = Math.max(1, Math.ceil(words / 200));
		return locale === 'ru' ? `${minutes} мин` : locale === 'es' ? `${minutes} min` : locale === 'zh' ? `${minutes} 分钟` : `${minutes} min`;
	}

	// Pagination
	const POSTS_PER_PAGE = 9;
	let visibleCount = $state(POSTS_PER_PAGE);
	const hasMore = $derived(data.regularPosts.length > visibleCount);
	const visiblePosts = $derived(data.regularPosts.slice(0, visibleCount));

	function loadMore() {
		visibleCount += POSTS_PER_PAGE;
	}
</script>

<svelte:head>
	<title>{data.seo.title}</title>
	<meta name="description" content={data.seo.description} />
	<link rel="canonical" href={currentUrl} />
	<link rel="alternate" href={alternateUrls.en} hreflang="en" />
	<link rel="alternate" href={alternateUrls.ru} hreflang="ru" />
	<link rel="alternate" href={alternateUrls.es} hreflang="es" />
	<link rel="alternate" href={alternateUrls.zh} hreflang="zh" />
	<link rel="alternate" href={alternateUrls.en} hreflang="x-default" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta property="og:title" content={data.seo.title} />
	<meta property="og:description" content={data.seo.description} />
</svelte:head>

<main class="blog-page">
	<!-- Page Header -->
	<section class="blog-hero">
		<div class="container">
			<h1>{headings[locale]?.title || headings.en.title}</h1>
			<p class="hero-subtitle">{headings[locale]?.subtitle || headings.en.subtitle}</p>
		</div>
	</section>

	<div class="container">
		<!-- Featured Post -->
		{#if data.featuredPost}
			<section class="featured-section">
				<a href="/{locale}/blog/{data.featuredPost.slug}" class="featured-card">
					{#if data.featuredPost.cover?.url}
						<div class="featured-image">
							<img
								src={data.featuredPost.cover.url}
								alt={data.featuredPost.cover.alt_en || getTitle(data.featuredPost, locale)}
								loading="eager"
							/>
						</div>
					{/if}
					<div class="featured-body">
						<span class="tag featured-tag">{featuredLabel[locale]}</span>
						<h2 class="featured-title">{getTitle(data.featuredPost, locale)}</h2>
						<p class="post-meta">
							{formatDate(data.featuredPost.published_at, locale)}
							&nbsp;·&nbsp;
							{estimateReadTime(data.featuredPost)}
						</p>
						{#if getExcerpt(data.featuredPost, locale)}
							<p class="featured-excerpt">{getExcerpt(data.featuredPost, locale)}</p>
						{/if}
						<span class="read-more">{readMoreLabel[locale]}</span>
					</div>
				</a>
			</section>
		{/if}

		<!-- Posts Grid -->
		{#if visiblePosts.length > 0}
			<section class="posts-grid">
				{#each visiblePosts as post (post.id)}
					<a href="/{locale}/blog/{post.slug}" class="post-card">
						{#if post.cover?.url}
							<div class="card-image">
								<img
									src={post.cover.url}
									alt={post.cover.alt_en || getTitle(post, locale)}
									loading="lazy"
								/>
							</div>
						{:else}
							<div class="card-image card-image--placeholder">
								<span class="placeholder-icon">📝</span>
							</div>
						{/if}
						<div class="card-body">
							<p class="card-date">{formatDate(post.published_at, locale)}</p>
							<h3 class="card-title">{getTitle(post, locale)}</h3>
							{#if getExcerpt(post, locale)}
								<p class="card-excerpt">{getExcerpt(post, locale)}</p>
							{/if}
						</div>
					</a>
				{/each}
			</section>
		{:else if !data.featuredPost}
			<div class="empty-state">
				<p>No posts yet.</p>
			</div>
		{/if}

		<!-- Load More -->
		{#if hasMore}
			<div class="load-more-container">
				<button type="button" class="btn-load-more" onclick={loadMore}>
					{locale === 'ru' ? 'Загрузить ещё' : locale === 'es' ? 'Cargar más' : locale === 'zh' ? '加载更多' : 'Load More Posts'}
				</button>
			</div>
		{/if}
	</div>
</main>

<style>
	.blog-page {
		min-height: 60vh;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	/* Hero */
	.blog-hero {
		padding: 4rem 0 2.5rem;
		text-align: center;
	}

	.blog-hero h1 {
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 700;
		margin: 0 0 0.75rem;
		color: var(--color-text, #111827);
	}

	.hero-subtitle {
		font-size: 1.125rem;
		color: var(--color-text-muted, #6b7280);
		margin: 0;
	}

	/* Featured */
	.featured-section {
		margin-bottom: 3rem;
	}

	.featured-card {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0;
		border-radius: 1rem;
		overflow: hidden;
		text-decoration: none;
		background: var(--color-surface, #fff);
		border: 1px solid var(--color-border, #e5e7eb);
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
		transition: box-shadow 0.2s, transform 0.2s;
	}

	.featured-card:hover {
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
		transform: translateY(-2px);
	}

	.featured-image {
		overflow: hidden;
	}

	.featured-image img {
		width: 100%;
		height: 100%;
		min-height: 320px;
		object-fit: cover;
		display: block;
	}

	.featured-body {
		padding: 2rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.75rem;
	}

	.tag {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.featured-tag {
		background: #ede9fe;
		color: #7c3aed;
		align-self: flex-start;
	}

	.featured-title {
		font-size: clamp(1.25rem, 3vw, 1.75rem);
		font-weight: 700;
		margin: 0;
		color: var(--color-text, #111827);
		line-height: 1.3;
	}

	.post-meta {
		font-size: 0.875rem;
		color: var(--color-text-muted, #6b7280);
		margin: 0;
	}

	.featured-excerpt {
		font-size: 1rem;
		color: var(--color-text-secondary, #374151);
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.read-more {
		font-size: 0.875rem;
		font-weight: 600;
		color: #6366f1;
		margin-top: auto;
	}

	/* Posts Grid */
	.posts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.post-card {
		display: flex;
		flex-direction: column;
		border-radius: 0.75rem;
		overflow: hidden;
		text-decoration: none;
		background: var(--color-surface, #fff);
		border: 1px solid var(--color-border, #e5e7eb);
		transition: box-shadow 0.2s, transform 0.2s;
	}

	.post-card:hover {
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
		transform: translateY(-2px);
	}

	.card-image {
		height: 200px;
		overflow: hidden;
	}

	.card-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 0.3s;
	}

	.post-card:hover .card-image img {
		transform: scale(1.03);
	}

	.card-image--placeholder {
		background: #f3f4f6;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.placeholder-icon {
		font-size: 2.5rem;
		opacity: 0.3;
	}

	.card-body {
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
	}

	.card-date {
		font-size: 0.8125rem;
		color: var(--color-text-muted, #9ca3af);
		margin: 0;
	}

	.card-title {
		font-size: 1.0625rem;
		font-weight: 600;
		margin: 0;
		color: var(--color-text, #111827);
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-excerpt {
		font-size: 0.875rem;
		color: var(--color-text-secondary, #6b7280);
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* Load More */
	.load-more-container {
		text-align: center;
		margin-bottom: 3rem;
	}

	.btn-load-more {
		padding: 0.875rem 2rem;
		background: transparent;
		border: 2px solid #6366f1;
		border-radius: 0.5rem;
		color: #6366f1;
		font-size: 0.9375rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-load-more:hover {
		background: #6366f1;
		color: white;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 0;
		color: var(--color-text-muted, #9ca3af);
	}

	/* Mobile */
	@media (max-width: 768px) {
		.featured-card {
			grid-template-columns: 1fr;
		}

		.featured-image img {
			min-height: 220px;
		}

		.featured-body {
			padding: 1.25rem;
		}

		.posts-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Dark theme */
	:global(.dark) .blog-hero h1 { color: #f9fafb; }
	:global(.dark) .hero-subtitle { color: #9ca3af; }
	:global(.dark) .featured-card,
	:global(.dark) .post-card {
		background: #1f2937;
		border-color: #374151;
	}
	:global(.dark) .featured-card:hover,
	:global(.dark) .post-card:hover {
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
	}
	:global(.dark) .featured-title,
	:global(.dark) .card-title { color: #f9fafb; }
	:global(.dark) .featured-excerpt,
	:global(.dark) .card-excerpt { color: #d1d5db; }
	:global(.dark) .post-meta,
	:global(.dark) .card-date { color: #9ca3af; }
	:global(.dark) .card-image--placeholder { background: #374151; }
	:global(.dark) .featured-tag {
		background: #312e81;
		color: #c4b5fd;
	}
	:global(.dark) .btn-load-more {
		border-color: #818cf8;
		color: #818cf8;
	}
	:global(.dark) .btn-load-more:hover {
		background: #818cf8;
		color: #111827;
	}
	:global(.dark) .empty-state { color: #6b7280; }
</style>
