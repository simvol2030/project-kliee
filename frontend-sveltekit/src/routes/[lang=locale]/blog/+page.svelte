<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const locale = $derived(($page.data.locale as 'en' | 'ru' | 'es' | 'zh') || 'en');

	const titles: Record<string, string> = {
		en: 'Blog',
		ru: 'Блог',
		es: 'Blog',
		zh: '博客'
	};
	const subtitles: Record<string, string> = {
		en: 'News and insights from the studio',
		ru: 'Новости и мысли из мастерской',
		es: 'Noticias e ideas del estudio',
		zh: '来自工作室的新闻与见解'
	};
	const noPosts: Record<string, string> = {
		en: 'No posts published yet.',
		ru: 'Записей пока нет.',
		es: 'Aún no hay publicaciones.',
		zh: '暂无发布的文章。'
	};
</script>

<svelte:head>
	<title>{titles[locale]} | K-LIÉE</title>
	<meta name="description" content={subtitles[locale]} />
</svelte:head>

<div class="blog-page">
	<section class="blog-hero">
		<div class="container">
			<h1 class="blog-title">{titles[locale]}</h1>
			<p class="blog-subtitle">{subtitles[locale]}</p>
		</div>
	</section>

	<section class="blog-list">
		<div class="container">
			{#if data.posts.length === 0}
				<p class="empty">{noPosts[locale]}</p>
			{:else}
				<ul class="posts">
					{#each data.posts as post}
						<li class="post-card">
							<div class="post-meta">
								<time class="post-date">
									{new Date(post.created_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale, {
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									})}
								</time>
								{#if post.author_name}
									<span class="post-author">{post.author_name}</span>
								{/if}
							</div>
							<h2 class="post-title">{post.title}</h2>
							{#if post.content}
								<p class="post-excerpt">
									{post.content.length > 200
										? post.content.substring(0, 200) + '…'
										: post.content}
								</p>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</section>
</div>

<style>
	.blog-page {
		min-height: 60vh;
	}

	.blog-hero {
		padding: 60px 0 40px;
		border-bottom: 1px solid var(--gray-200, #e5e5e5);
	}

	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 0 24px;
	}

	.blog-title {
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 700;
		letter-spacing: 0.05em;
		color: var(--black, #000);
		margin: 0 0 0.5rem;
	}

	:global(.dark) .blog-title {
		color: var(--white, #fff);
	}

	.blog-subtitle {
		font-size: 1.125rem;
		color: var(--gray-600, #666);
		margin: 0;
	}

	.blog-list {
		padding: 48px 0 80px;
	}

	.empty {
		color: var(--gray-500, #888);
		text-align: center;
		padding: 48px 0;
		font-size: 1rem;
	}

	.posts {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 32px;
	}

	.post-card {
		padding: 32px 0;
		border-bottom: 1px solid var(--gray-200, #e5e5e5);
	}

	:global(.dark) .post-card {
		border-bottom-color: var(--gray-700, #333);
	}

	.post-card:first-child {
		padding-top: 0;
	}

	.post-card:last-child {
		border-bottom: none;
	}

	.post-meta {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 12px;
	}

	.post-date {
		font-size: 0.875rem;
		color: var(--gray-500, #888);
	}

	.post-author {
		font-size: 0.875rem;
		color: var(--accent, #d4af37);
		font-weight: 500;
	}

	.post-author::before {
		content: '·';
		margin-right: 12px;
		color: var(--gray-400, #aaa);
	}

	.post-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--black, #000);
		margin: 0 0 12px;
		line-height: 1.3;
	}

	:global(.dark) .post-title {
		color: var(--white, #fff);
	}

	.post-excerpt {
		font-size: 1rem;
		color: var(--gray-600, #555);
		line-height: 1.7;
		margin: 0;
	}

	:global(.dark) .post-excerpt {
		color: var(--gray-400, #aaa);
	}

	@media (max-width: 768px) {
		.blog-hero {
			padding: 40px 0 28px;
		}

		.blog-list {
			padding: 32px 0 60px;
		}

		.post-card {
			padding: 24px 0;
		}

		.post-title {
			font-size: 1.25rem;
		}
	}
</style>
