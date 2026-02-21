<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import type { LanguageCode } from '$lib/types/layout.types';

	let { data }: { data: PageData } = $props();

	const locale = $derived(($page.data.locale as LanguageCode) || 'en');
	const currentUrl = $derived($page.url.href);
	const baseUrl = $derived($page.url.origin);

	const { post, relatedPosts, seo } = data;

	// Helper to get localized field
	function getField(p: Record<string, unknown>, field: string, lang: LanguageCode): string {
		const val = p[`${field}_${lang}`] as string | null;
		if (val) return val;
		return (p[`${field}_en`] as string | null) || '';
	}

	const postRecord = $derived(post as unknown as Record<string, unknown>);
	const title = $derived(getField(postRecord, 'title', locale));
	const content = $derived(getField(postRecord, 'content', locale));

	// Tags
	const tags = $derived.by(() => {
		try {
			const arr = JSON.parse(post.tags || '[]');
			return Array.isArray(arr) ? (arr as string[]) : [];
		} catch {
			return [] as string[];
		}
	});

	// Reading time
	const readTime = $derived.by(() => {
		const text = content.replace(/<[^>]+>/g, '');
		const words = text.split(/\s+/).filter(Boolean).length;
		const mins = Math.max(1, Math.ceil(words / 200));
		if (locale === 'ru') return `${mins} мин чтения`;
		if (locale === 'es') return `${mins} min de lectura`;
		if (locale === 'zh') return `${mins} 分钟阅读`;
		return `${mins} min read`;
	});

	// Date
	function formatDate(dateStr: string | null | undefined): string {
		if (!dateStr) return '';
		try {
			const localeMap: Record<LanguageCode, string> = {
				en: 'en-GB', ru: 'ru-RU', es: 'es-ES', zh: 'zh-CN'
			};
			return new Date(dateStr).toLocaleDateString(localeMap[locale] || 'en-GB', {
				year: 'numeric', month: 'long', day: 'numeric'
			});
		} catch {
			return dateStr;
		}
	}

	// Back label
	const backLabel = { en: '← Back to Blog', ru: '← Блог', es: '← Blog', zh: '← 博客' };

	// Related post helpers
	type RelatedPost = (typeof relatedPosts)[0];
	function getRelatedTitle(p: RelatedPost): string {
		const pr = p as unknown as Record<string, unknown>;
		const val = pr[`title_${locale}`] as string | null;
		return val || p.title_en || '';
	}

	// Share
	function copyLink() {
		navigator.clipboard.writeText(currentUrl).catch(() => {});
	}
</script>

<svelte:head>
	<title>{seo.title}</title>
	<meta name="description" content={seo.description} />
	<link rel="canonical" href={currentUrl} />

	<!-- Open Graph -->
	<meta property="og:type" content="article" />
	<meta property="og:url" content={currentUrl} />
	<meta property="og:title" content={seo.title} />
	<meta property="og:description" content={seo.description} />
	{#if seo.coverUrl}
		<meta property="og:image" content={`${baseUrl}${seo.coverUrl}`} />
	{/if}

	<!-- Article meta -->
	{#if post.published_at}
		<meta property="article:published_time" content={post.published_at} />
	{/if}
	{#if post.author_name}
		<meta property="article:author" content={post.author_name} />
	{/if}
</svelte:head>

<main class="article-page">
	<div class="container">
		<!-- Back link -->
		<a href="/{locale}/blog" class="back-link">{backLabel[locale]}</a>

		<!-- Cover Image -->
		{#if post.cover?.url}
			<div class="article-cover">
				<img
					src={post.cover.url}
					alt={post.cover.alt_en || title}
					loading="eager"
				/>
			</div>
		{/if}

		<!-- Article Header -->
		<header class="article-header">
			<h1 class="article-title">{title}</h1>

			<div class="article-meta">
				{#if post.author_name}
					<span class="author">
						<span class="avatar">{post.author_name.charAt(0).toUpperCase()}</span>
						{post.author_name}
					</span>
					<span class="sep">·</span>
				{/if}
				{#if post.published_at}
					<time datetime={post.published_at}>{formatDate(post.published_at)}</time>
					<span class="sep">·</span>
				{/if}
				<span class="read-time">{readTime}</span>
			</div>

			<!-- Tags -->
			{#if tags.length > 0}
				<div class="tags">
					{#each tags as tag}
						<span class="tag">{tag}</span>
					{/each}
				</div>
			{/if}
		</header>

		<hr class="divider" />

		<!-- Article Content -->
		<article class="article-content prose">
			{@html content}
		</article>

		<hr class="divider" />

		<!-- Share -->
		<div class="share-section">
			<span class="share-label">
				{locale === 'ru' ? 'Поделиться:' : locale === 'es' ? 'Compartir:' : locale === 'zh' ? '分享:' : 'Share:'}
			</span>
			<a
				href="https://twitter.com/intent/tweet?url={encodeURIComponent(currentUrl)}&text={encodeURIComponent(title)}"
				target="_blank"
				rel="noopener noreferrer"
				class="share-btn"
			>Twitter/X</a>
			<a
				href="https://www.facebook.com/sharer/sharer.php?u={encodeURIComponent(currentUrl)}"
				target="_blank"
				rel="noopener noreferrer"
				class="share-btn"
			>Facebook</a>
			<button type="button" class="share-btn" onclick={copyLink}>
				{locale === 'ru' ? 'Копировать ссылку' : locale === 'es' ? 'Copiar enlace' : locale === 'zh' ? '复制链接' : 'Copy Link'}
			</button>
		</div>
	</div>

	<!-- Related Posts -->
	{#if relatedPosts.length > 0}
		<section class="related-section">
			<div class="container">
				<h2 class="related-title">
					{locale === 'ru' ? 'Другие посты' : locale === 'es' ? 'Más artículos' : locale === 'zh' ? '更多文章' : 'More Posts'}
				</h2>
				<div class="related-grid">
					{#each relatedPosts as rpost (rpost.id)}
						<a href="/{locale}/blog/{rpost.slug}" class="related-card">
							{#if rpost.cover?.url}
								<div class="related-image">
									<img src={rpost.cover.url} alt={rpost.cover.alt_en || ''} loading="lazy" />
								</div>
							{/if}
							<div class="related-body">
								<p class="related-date">{formatDate(rpost.published_at)}</p>
								<p class="related-post-title">{getRelatedTitle(rpost)}</p>
							</div>
						</a>
					{/each}
				</div>
			</div>
		</section>
	{/if}
</main>

<style>
	.container {
		max-width: 760px;
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	.article-page {
		padding-bottom: 4rem;
	}

	/* Back link */
	.back-link {
		display: inline-block;
		margin: 2rem 0 1.5rem;
		color: #6366f1;
		text-decoration: none;
		font-size: 0.9375rem;
		font-weight: 500;
		transition: opacity 0.15s;
	}

	.back-link:hover {
		opacity: 0.75;
	}

	/* Cover */
	.article-cover {
		border-radius: 0.75rem;
		overflow: hidden;
		margin-bottom: 2rem;
		aspect-ratio: 16 / 7;
	}

	.article-cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* Header */
	.article-header {
		margin-bottom: 1.5rem;
	}

	.article-title {
		font-size: clamp(1.75rem, 5vw, 2.5rem);
		font-weight: 800;
		margin: 0 0 1rem;
		color: var(--color-text, #111827);
		line-height: 1.25;
	}

	.article-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		color: var(--color-text-muted, #6b7280);
		flex-wrap: wrap;
		margin-bottom: 1rem;
	}

	.author {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-weight: 500;
		color: var(--color-text, #374151);
	}

	.avatar {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea, #764ba2);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75rem;
		font-weight: 700;
	}

	.sep {
		color: #d1d5db;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tag {
		padding: 0.25rem 0.625rem;
		background: #f3f4f6;
		color: #374151;
		border-radius: 999px;
		font-size: 0.8125rem;
		font-weight: 500;
	}

	.divider {
		border: none;
		border-top: 1px solid var(--color-border, #e5e7eb);
		margin: 2rem 0;
	}

	/* Article Content */
	.article-content {
		font-size: 1.0625rem;
		line-height: 1.8;
		color: var(--color-text, #1f2937);
	}

	/* Prose styles for rendered HTML */
	:global(.prose p) {
		margin: 0 0 1.25rem;
	}

	:global(.prose h2) {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 2rem 0 0.75rem;
		color: var(--color-text, #111827);
	}

	:global(.prose h3) {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 1.5rem 0 0.5rem;
		color: var(--color-text, #111827);
	}

	:global(.prose ul),
	:global(.prose ol) {
		padding-left: 1.5rem;
		margin: 0 0 1.25rem;
	}

	:global(.prose li) {
		margin-bottom: 0.375rem;
	}

	:global(.prose blockquote) {
		border-left: 3px solid #6366f1;
		padding: 0.75rem 1.25rem;
		margin: 1.5rem 0;
		color: #6b7280;
		font-style: italic;
		background: #f5f3ff;
		border-radius: 0 0.375rem 0.375rem 0;
	}

	:global(.prose a) {
		color: #6366f1;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	:global(.prose a:hover) {
		color: #4f46e5;
	}

	:global(.prose img) {
		max-width: 100%;
		height: auto;
		border-radius: 0.5rem;
		margin: 1.5rem 0;
	}

	:global(.prose strong) {
		font-weight: 700;
		color: inherit;
	}

	:global(.prose em) {
		font-style: italic;
	}

	/* Share */
	.share-section {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.share-label {
		font-size: 0.875rem;
		color: var(--color-text-muted, #6b7280);
		font-weight: 500;
	}

	.share-btn {
		padding: 0.375rem 0.875rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: #374151;
		text-decoration: none;
		background: #f9fafb;
		cursor: pointer;
		transition: all 0.15s;
	}

	.share-btn:hover {
		border-color: #6366f1;
		color: #6366f1;
		background: #f5f3ff;
	}

	/* Related Posts */
	.related-section {
		margin-top: 4rem;
		padding: 3rem 0;
		background: var(--color-surface-secondary, #f9fafb);
		border-top: 1px solid var(--color-border, #e5e7eb);
	}

	.related-section .container {
		max-width: 1200px;
	}

	.related-title {
		font-size: 1.375rem;
		font-weight: 700;
		margin: 0 0 1.5rem;
		color: var(--color-text, #111827);
	}

	.related-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.25rem;
	}

	.related-card {
		text-decoration: none;
		border-radius: 0.5rem;
		overflow: hidden;
		background: var(--color-surface, #fff);
		border: 1px solid var(--color-border, #e5e7eb);
		transition: box-shadow 0.2s, transform 0.2s;
	}

	.related-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		transform: translateY(-2px);
	}

	.related-image {
		height: 160px;
		overflow: hidden;
	}

	.related-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.related-body {
		padding: 0.875rem;
	}

	.related-date {
		font-size: 0.8125rem;
		color: var(--color-text-muted, #9ca3af);
		margin: 0 0 0.25rem;
	}

	.related-post-title {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text, #111827);
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* Mobile */
	@media (max-width: 640px) {
		.article-cover {
			border-radius: 0.5rem;
			aspect-ratio: 16 / 9;
		}

		.related-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Dark theme */
	:global(.dark) .article-title { color: #f9fafb; }
	:global(.dark) .article-content { color: #e5e7eb; }
	:global(.dark) .article-meta { color: #9ca3af; }
	:global(.dark) .author { color: #d1d5db; }
	:global(.dark) .divider { border-color: #374151; }
	:global(.dark) .tag {
		background: #374151;
		color: #d1d5db;
	}
	:global(.dark) .share-btn {
		background: #374151;
		border-color: #4b5563;
		color: #d1d5db;
	}
	:global(.dark) .share-btn:hover {
		border-color: #818cf8;
		color: #818cf8;
		background: #1e1b4b;
	}
	:global(.dark) .related-section {
		background: #111827;
		border-color: #374151;
	}
	:global(.dark) .related-title { color: #f9fafb; }
	:global(.dark) .related-card {
		background: #1f2937;
		border-color: #374151;
	}
	:global(.dark) .related-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
	}
	:global(.dark) .related-post-title { color: #f9fafb; }
	:global(.dark) .related-date { color: #9ca3af; }
	:global(.dark) :global(.prose h2),
	:global(.dark) :global(.prose h3) { color: #f9fafb; }
	:global(.dark) :global(.prose blockquote) {
		background: #1e1b4b;
		color: #a5b4fc;
	}
</style>
