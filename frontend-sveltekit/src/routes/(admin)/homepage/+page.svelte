<script lang="ts">
	import { page } from '$app/stores';
	import LanguageTabs from '$lib/components/admin/LanguageTabs.svelte';
	import MediaPicker from '$lib/components/admin/MediaPicker.svelte';

	let { data } = $props();

	// Helper to get CSRF headers
	function csrfHeaders(): Record<string, string> {
		return {
			'Content-Type': 'application/json',
			'x-csrf-token': $page.data.csrfToken || ''
		};
	}

	function csrfDeleteHeaders(): Record<string, string> {
		return { 'x-csrf-token': $page.data.csrfToken || '' };
	}

	let isSaving = $state(false);

	// Hero state - use Record to allow dynamic key access
	let hero = $state<Record<string, any>>(data.hero || {
		title_en: '', title_ru: '', title_es: '', title_zh: '',
		subtitle_en: '', subtitle_ru: '', subtitle_es: '', subtitle_zh: '',
		quote_en: '', quote_ru: '', quote_es: '', quote_zh: '',
		announcement_highlight_en: '', announcement_highlight_ru: '', announcement_highlight_es: '', announcement_highlight_zh: '',
		announcement_text_en: '', announcement_text_ru: '', announcement_text_es: '', announcement_text_zh: ''
	});
	let slides = $state<any[]>(data.slides || []);

	// About state - use Record to allow dynamic key access
	let about = $state<Record<string, any>>(data.about || {
		title_en: '', title_ru: '', title_es: '', title_zh: '',
		text_en: '', text_ru: '', text_es: '', text_zh: '',
		image_id: null, image: null,
		cta_text_en: '', cta_text_ru: '', cta_text_es: '', cta_text_zh: '',
		cta_href: ''
	});

	// News state
	let news = $state(data.news || []);
	let newsModalOpen = $state(false);
	let editingNews = $state<any>(null);

	// Testimonials state
	let testimonials = $state(data.testimonials || []);
	let testimonialModalOpen = $state(false);
	let editingTestimonial = $state<any>(null);

	// Process state
	let processSteps = $state(data.process || []);
	let processModalOpen = $state(false);
	let editingProcess = $state<any>(null);

	// Featured Collections state
	let collections = $state(data.collections || []);
	let allSeries = $state(data.allSeries || []);
	let collectionModalOpen = $state(false);
	let editingCollection = $state<any>(null);

	// Exhibitions state
	let allExhibitions = $state(data.allExhibitions || []);
	let exhibitionsSection = $state<Record<string, any>>(data.exhibitionsSection || {
		title_en: '', title_ru: '', title_es: '', title_zh: '',
		subtitle_en: '', subtitle_ru: '', subtitle_es: '', subtitle_zh: ''
	});
	let selectedExhibitionId = $state<number | null>(
		data.allExhibitions?.find((e: any) => e.is_homepage_featured)?.id ?? null
	);

	// Hero functions
	async function saveHero() {
		isSaving = true;
		try {
			await fetch('/api/homepage/hero', {
				method: 'POST',
				headers: csrfHeaders(),
				body: JSON.stringify({ action: 'updateHero', ...hero })
			});
		} finally {
			isSaving = false;
		}
	}

	async function addSlide(mediaId: number) {
		await fetch('/api/homepage/hero', {
			method: 'POST',
			headers: csrfHeaders(),
			body: JSON.stringify({ action: 'addSlide', media_id: mediaId, order_index: slides.length })
		});
		await loadHero();
	}

	async function deleteSlide(id: number) {
		if (!confirm('Delete this slide?')) return;
		await fetch(`/api/homepage/hero/slide/${id}`, { method: 'DELETE', headers: csrfDeleteHeaders() });
		await loadHero();
	}

	async function loadHero() {
		const res = await fetch('/api/homepage/hero');
		const result = await res.json();
		hero = result.hero || hero;
		slides = result.slides || [];
	}

	// About functions
	async function saveAbout() {
		isSaving = true;
		try {
			await fetch('/api/homepage/about', {
				method: 'POST',
				headers: csrfHeaders(),
				body: JSON.stringify(about)
			});
		} finally {
			isSaving = false;
		}
	}

	function handleAboutImageSelect(e: CustomEvent) {
		about.image_id = e.detail.id;
		about.image = e.detail;
	}

	// News functions
	function openNewsModal(item?: any) {
		editingNews = item ? { ...item } : {
			title_en: '', title_ru: '', title_es: '', title_zh: '',
			excerpt_en: '', excerpt_ru: '', excerpt_es: '', excerpt_zh: '',
			image_id: null, image: null, link: '', date: new Date().toISOString().split('T')[0],
			order_index: news.length, is_visible: true
		};
		newsModalOpen = true;
	}

	async function saveNews() {
		isSaving = true;
		try {
			const url = editingNews.id ? `/api/homepage/news/${editingNews.id}` : '/api/homepage/news';
			const method = editingNews.id ? 'PATCH' : 'POST';
			await fetch(url, { method, headers: csrfHeaders(), body: JSON.stringify(editingNews) });
			await loadNews();
			newsModalOpen = false;
		} finally {
			isSaving = false;
		}
	}

	async function deleteNews(id: number) {
		if (!confirm('Delete this news item?')) return;
		await fetch(`/api/homepage/news/${id}`, { method: 'DELETE', headers: csrfDeleteHeaders() });
		await loadNews();
	}

	async function loadNews() {
		const res = await fetch('/api/homepage/news');
		const result = await res.json();
		news = result.items || [];
	}

	// Testimonial functions
	function openTestimonialModal(item?: any) {
		editingTestimonial = item ? { ...item } : {
			quote_en: '', quote_ru: '', quote_es: '', quote_zh: '',
			author: '', role_en: '', role_ru: '', role_es: '', role_zh: '',
			avatar_id: null, avatar: null, order_index: testimonials.length, is_visible: true
		};
		testimonialModalOpen = true;
	}

	async function saveTestimonial() {
		isSaving = true;
		try {
			const url = editingTestimonial.id ? `/api/homepage/testimonials/${editingTestimonial.id}` : '/api/homepage/testimonials';
			const method = editingTestimonial.id ? 'PATCH' : 'POST';
			await fetch(url, { method, headers: csrfHeaders(), body: JSON.stringify(editingTestimonial) });
			await loadTestimonials();
			testimonialModalOpen = false;
		} finally {
			isSaving = false;
		}
	}

	async function deleteTestimonial(id: number) {
		if (!confirm('Delete this testimonial?')) return;
		await fetch(`/api/homepage/testimonials/${id}`, { method: 'DELETE', headers: csrfDeleteHeaders() });
		await loadTestimonials();
	}

	async function loadTestimonials() {
		const res = await fetch('/api/homepage/testimonials');
		const result = await res.json();
		testimonials = result.items || [];
	}

	// Process functions
	function openProcessModal(item?: any) {
		editingProcess = item ? { ...item } : {
			title_en: '', title_ru: '', title_es: '', title_zh: '',
			description_en: '', description_ru: '', description_es: '', description_zh: '',
			icon: '', step_number: processSteps.length + 1, order_index: processSteps.length, is_visible: true
		};
		processModalOpen = true;
	}

	async function saveProcess() {
		isSaving = true;
		try {
			const url = editingProcess.id ? `/api/homepage/process/${editingProcess.id}` : '/api/homepage/process';
			const method = editingProcess.id ? 'PATCH' : 'POST';
			await fetch(url, { method, headers: csrfHeaders(), body: JSON.stringify(editingProcess) });
			await loadProcess();
			processModalOpen = false;
		} finally {
			isSaving = false;
		}
	}

	async function deleteProcess(id: number) {
		if (!confirm('Delete this process step?')) return;
		await fetch(`/api/homepage/process/${id}`, { method: 'DELETE', headers: csrfDeleteHeaders() });
		await loadProcess();
	}

	async function loadProcess() {
		const res = await fetch('/api/homepage/process');
		const result = await res.json();
		processSteps = result.items || [];
	}

	// Collections functions
	function openCollectionModal(item?: any) {
		editingCollection = item ? { ...item } : {
			series_id: '',
			title_override_en: '', title_override_ru: '', title_override_es: '', title_override_zh: '',
			description_override_en: '', description_override_ru: '', description_override_es: '', description_override_zh: '',
			cover_image_id: null, cover_image: null, link: '',
			order_index: collections.length, is_visible: true
		};
		collectionModalOpen = true;
	}

	async function saveCollection() {
		isSaving = true;
		try {
			const url = editingCollection.id ? `/api/homepage/collections/${editingCollection.id}` : '/api/homepage/collections';
			const method = editingCollection.id ? 'PATCH' : 'POST';
			await fetch(url, { method, headers: csrfHeaders(), body: JSON.stringify(editingCollection) });
			await loadCollections();
			collectionModalOpen = false;
		} finally {
			isSaving = false;
		}
	}

	async function deleteCollection(id: number) {
		if (!confirm('Delete this collection?')) return;
		await fetch(`/api/homepage/collections/${id}`, { method: 'DELETE', headers: csrfDeleteHeaders() });
		await loadCollections();
	}

	async function loadCollections() {
		const res = await fetch('/api/homepage/collections');
		const result = await res.json();
		collections = result.items || [];
	}

	// Exhibitions functions
	async function saveExhibitionsConfig() {
		isSaving = true;
		try {
			await fetch('/api/homepage/exhibitions', {
				method: 'POST',
				headers: csrfHeaders(),
				body: JSON.stringify({
					featured_exhibition_id: selectedExhibitionId,
					...exhibitionsSection
				})
			});
		} finally {
			isSaving = false;
		}
	}
</script>

<svelte:head>
	<title>Homepage | Admin</title>
</svelte:head>

<div class="homepage-admin">
	<header class="page-header">
		<h1>Homepage Settings</h1>
		<p class="subtitle">Configure all homepage sections (4 languages)</p>
	</header>

	<!-- Sticky Quick Nav -->
	<nav class="quick-nav" aria-label="Section navigation">
		<a href="#hero" class="quick-nav-link">Hero</a>
		<a href="#slides" class="quick-nav-link">Slides</a>
		<a href="#about" class="quick-nav-link">About</a>
		<a href="#news" class="quick-nav-link">News</a>
		<a href="#testimonials" class="quick-nav-link">Testimonials</a>
		<a href="#process" class="quick-nav-link">Process</a>
		<a href="#collections" class="quick-nav-link">Collections</a>
		<a href="#exhibitions" class="quick-nav-link">Exhibitions</a>
	</nav>

	<div class="sections-scroll">

		<!-- HERO SECTION -->
		<section id="hero" class="page-section">
			<div class="card">
				<h2>Hero Content</h2>
				<form onsubmit={(e) => { e.preventDefault(); saveHero(); }}>
					<h3>Title</h3>
					<LanguageTabs>
						{#snippet children(lang)}
							<div class="form-group">
								<input type="text" bind:value={hero[`title_${lang}`]} placeholder="Main title..." />
							</div>
						{/snippet}
					</LanguageTabs>

					<h3>Subtitle</h3>
					<LanguageTabs>
						{#snippet children(lang)}
							<div class="form-group">
								<input type="text" bind:value={hero[`subtitle_${lang}`]} placeholder="Subtitle..." />
							</div>
						{/snippet}
					</LanguageTabs>

					<h3>Quote</h3>
					<LanguageTabs>
						{#snippet children(lang)}
							<div class="form-group">
								<textarea bind:value={hero[`quote_${lang}`]} rows="2" placeholder="Quote..."></textarea>
							</div>
						{/snippet}
					</LanguageTabs>

					<h3>Announcement</h3>
					<LanguageTabs>
						{#snippet children(lang)}
							<div class="form-row">
								<div class="form-group">
									<label>Highlight</label>
									<input type="text" bind:value={hero[`announcement_highlight_${lang}`]} placeholder="NEW" />
								</div>
								<div class="form-group">
									<label>Text</label>
									<input type="text" bind:value={hero[`announcement_text_${lang}`]} placeholder="Announcement text..." />
								</div>
							</div>
						{/snippet}
					</LanguageTabs>

					<button type="submit" class="btn-save" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Hero'}</button>
				</form>
			</div>
		</section>

		<!-- SLIDES SECTION -->
		<section id="slides" class="page-section">
			<div class="card">
				<div class="card-header">
					<h2>Hero Slides</h2>
					<MediaPicker label="" onselect={(e) => addSlide(e.detail.id)} />
				</div>

				<div class="slides-grid">
					{#each slides as slide}
						<div class="slide-card">
							{#if slide.image}
								<img src={slide.image.url} alt="Slide" />
							{:else}
								<div class="no-image">No Image</div>
							{/if}
							<div class="slide-actions">
								<span class="duration">{slide.duration}ms</span>
								<button type="button" class="btn-delete" onclick={() => deleteSlide(slide.id)}>×</button>
							</div>
						</div>
					{:else}
						<p class="empty">No slides yet. Add images to create a slideshow.</p>
					{/each}
				</div>
			</div>
		</section>

		<!-- ABOUT SECTION -->
		<section id="about" class="page-section">
			<div class="card">
				<h2>About Preview Section</h2>
				<form onsubmit={(e) => { e.preventDefault(); saveAbout(); }}>
					<h3>Title</h3>
					<LanguageTabs>
						{#snippet children(lang)}
							<div class="form-group">
								<input type="text" bind:value={about[`title_${lang}`]} placeholder="About title..." />
							</div>
						{/snippet}
					</LanguageTabs>

					<h3>Text</h3>
					<LanguageTabs>
						{#snippet children(lang)}
							<div class="form-group">
								<textarea bind:value={about[`text_${lang}`]} rows="4" placeholder="About text..."></textarea>
							</div>
						{/snippet}
					</LanguageTabs>

					<h3>Image</h3>
					<MediaPicker
						label="About Image"
						value={about.image}
						onselect={handleAboutImageSelect}
						onclear={() => { about.image_id = null; about.image = null; }}
					/>

					<h3>Call to Action</h3>
					<div class="form-group">
						<label>Link URL</label>
						<input type="text" bind:value={about.cta_href} placeholder="/about" />
					</div>
					<LanguageTabs>
						{#snippet children(lang)}
							<div class="form-group">
								<label>Button Text ({lang.toUpperCase()})</label>
								<input type="text" bind:value={about[`cta_text_${lang}`]} placeholder="Learn more..." />
							</div>
						{/snippet}
					</LanguageTabs>

					<button type="submit" class="btn-save" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save About'}</button>
				</form>
			</div>
		</section>

		<!-- NEWS SECTION -->
		<section id="news" class="page-section">
			<div class="card">
				<div class="card-header">
					<h2>News Grid</h2>
					<button type="button" class="btn-primary" onclick={() => openNewsModal()}>+ Add News</button>
				</div>

				<div class="items-list">
					{#each news as item}
						<div class="list-item">
							{#if item.image}
								<img src={item.image.url} alt="" class="item-thumb" />
							{/if}
							<div class="item-info">
								<strong>{item.title_en}</strong>
								<span class="meta">{item.date}</span>
							</div>
							<div class="item-actions">
								<button type="button" class="btn-edit" onclick={() => openNewsModal(item)}>Edit</button>
								<button type="button" class="btn-delete" onclick={() => deleteNews(item.id)}>Delete</button>
							</div>
						</div>
					{:else}
						<p class="empty">No news items yet.</p>
					{/each}
				</div>
			</div>
		</section>

		<!-- TESTIMONIALS SECTION -->
		<section id="testimonials" class="page-section">
			<div class="card">
				<div class="card-header">
					<h2>Testimonials</h2>
					<button type="button" class="btn-primary" onclick={() => openTestimonialModal()}>+ Add Testimonial</button>
				</div>

				<div class="items-list">
					{#each testimonials as item}
						<div class="list-item">
							{#if item.avatar}
								<img src={item.avatar.url} alt="" class="item-avatar" />
							{/if}
							<div class="item-info">
								<strong>{item.author}</strong>
								<span class="meta">{item.role_en}</span>
							</div>
							<div class="item-actions">
								<button type="button" class="btn-edit" onclick={() => openTestimonialModal(item)}>Edit</button>
								<button type="button" class="btn-delete" onclick={() => deleteTestimonial(item.id)}>Delete</button>
							</div>
						</div>
					{:else}
						<p class="empty">No testimonials yet.</p>
					{/each}
				</div>
			</div>
		</section>

		<!-- PROCESS SECTION -->
		<section id="process" class="page-section">
			<div class="card">
				<div class="card-header">
					<h2>Creative Process Steps</h2>
					<button type="button" class="btn-primary" onclick={() => openProcessModal()}>+ Add Step</button>
				</div>

				<div class="items-list">
					{#each processSteps as item}
						<div class="list-item">
							<div class="step-number">{item.step_number}</div>
							<div class="item-info">
								<strong>{item.title_en}</strong>
								<span class="meta">{item.icon}</span>
							</div>
							<div class="item-actions">
								<button type="button" class="btn-edit" onclick={() => openProcessModal(item)}>Edit</button>
								<button type="button" class="btn-delete" onclick={() => deleteProcess(item.id)}>Delete</button>
							</div>
						</div>
					{:else}
						<p class="empty">No process steps yet.</p>
					{/each}
				</div>
			</div>
		</section>

		<!-- FEATURED COLLECTIONS SECTION -->
		<section id="collections" class="page-section">
			<div class="card">
				<div class="card-header">
					<h2>Featured Collections</h2>
					<button type="button" class="btn-primary" onclick={() => openCollectionModal()}>+ Add Collection</button>
				</div>
				<p class="section-hint">Select series to feature on the homepage. Override title/description if needed.</p>

				<div class="items-list">
					{#each collections as item}
						<div class="list-item">
							{#if item.cover_image}
								<img src={item.cover_image.url} alt="" class="item-thumb" />
							{/if}
							<div class="item-info">
								<strong>{item.title_override_en || item.series?.name_en || '(no series)'}</strong>
								<span class="meta">Series: {item.series?.name_en || item.series_id || '—'} · Order: {item.order_index}</span>
							</div>
							<div class="item-actions">
								<button type="button" class="btn-edit" onclick={() => openCollectionModal(item)}>Edit</button>
								<button type="button" class="btn-delete" onclick={() => deleteCollection(item.id)}>Delete</button>
							</div>
						</div>
					{:else}
						<p class="empty">No featured collections yet.</p>
					{/each}
				</div>
			</div>
		</section>

		<!-- EXHIBITIONS SECTION -->
		<section id="exhibitions" class="page-section">
			<div class="card">
				<h2>Exhibitions Preview</h2>
				<p class="section-hint">Select one exhibition to feature on the homepage and set the section title.</p>

				<form onsubmit={(e) => { e.preventDefault(); saveExhibitionsConfig(); }}>
					<h3>Section Title &amp; Subtitle</h3>
					<LanguageTabs>
						{#snippet children(lang)}
							<div class="form-row">
								<div class="form-group">
									<label>Title ({lang.toUpperCase()})</label>
									<input type="text" bind:value={exhibitionsSection[`title_${lang}`]} placeholder="Current Exhibitions" />
								</div>
								<div class="form-group">
									<label>Subtitle ({lang.toUpperCase()})</label>
									<input type="text" bind:value={exhibitionsSection[`subtitle_${lang}`]} placeholder="Curated presentations..." />
								</div>
							</div>
						{/snippet}
					</LanguageTabs>

					<h3>Featured Exhibition</h3>
					<div class="form-group">
						<label>Select exhibition to show on homepage</label>
						<select bind:value={selectedExhibitionId}>
							<option value={null}>— None (fallback to JSON) —</option>
							{#each allExhibitions as ex}
								<option value={ex.id}>{ex.title_en}{ex.year ? ` (${ex.year})` : ''}</option>
							{/each}
						</select>
					</div>

					{#if selectedExhibitionId}
						{@const selected = allExhibitions.find((e: any) => e.id === selectedExhibitionId)}
						{#if selected}
							<div class="selected-exhibition">
								{#if selected.cover_image}
									<img src={selected.cover_image.url} alt="" class="exhibition-preview-img" />
								{/if}
								<div>
									<strong>{selected.title_en}</strong>
									<p class="meta">{selected.description_en || ''}</p>
								</div>
							</div>
						{/if}
					{/if}

					<button type="submit" class="btn-save" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Exhibitions Config'}</button>
				</form>
			</div>
		</section>

	</div>
</div>

<!-- NEWS MODAL -->
{#if newsModalOpen && editingNews}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => (newsModalOpen = false)}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>{editingNews.id ? 'Edit News' : 'New News Item'}</h2>
				<button type="button" class="btn-close" onclick={() => (newsModalOpen = false)}>×</button>
			</div>
			<form class="modal-body" onsubmit={(e) => { e.preventDefault(); saveNews(); }}>
				<LanguageTabs>
					{#snippet children(lang)}
						<div class="form-group">
							<label>Title ({lang.toUpperCase()})</label>
							<input type="text" bind:value={editingNews[`title_${lang}`]} />
						</div>
						<div class="form-group">
							<label>Excerpt ({lang.toUpperCase()})</label>
							<textarea bind:value={editingNews[`excerpt_${lang}`]} rows="2"></textarea>
						</div>
					{/snippet}
				</LanguageTabs>

				<div class="form-row">
					<div class="form-group">
						<label>Link</label>
						<input type="text" bind:value={editingNews.link} placeholder="/news/..." />
					</div>
					<div class="form-group">
						<label>Date</label>
						<input type="date" bind:value={editingNews.date} />
					</div>
				</div>

				<MediaPicker
					label="Image"
					value={editingNews.image}
					onselect={(e) => { editingNews.image_id = e.detail.id; editingNews.image = e.detail; }}
					onclear={() => { editingNews.image_id = null; editingNews.image = null; }}
				/>

				<div class="modal-footer">
					<button type="submit" class="btn-save" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</button>
					<button type="button" class="btn-cancel" onclick={() => (newsModalOpen = false)}>Cancel</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- TESTIMONIAL MODAL -->
{#if testimonialModalOpen && editingTestimonial}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => (testimonialModalOpen = false)}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>{editingTestimonial.id ? 'Edit Testimonial' : 'New Testimonial'}</h2>
				<button type="button" class="btn-close" onclick={() => (testimonialModalOpen = false)}>×</button>
			</div>
			<form class="modal-body" onsubmit={(e) => { e.preventDefault(); saveTestimonial(); }}>
				<div class="form-group">
					<label>Author Name</label>
					<input type="text" bind:value={editingTestimonial.author} placeholder="John Doe" />
				</div>

				<LanguageTabs>
					{#snippet children(lang)}
						<div class="form-group">
							<label>Quote ({lang.toUpperCase()})</label>
							<textarea bind:value={editingTestimonial[`quote_${lang}`]} rows="3"></textarea>
						</div>
						<div class="form-group">
							<label>Role ({lang.toUpperCase()})</label>
							<input type="text" bind:value={editingTestimonial[`role_${lang}`]} placeholder="Art Collector" />
						</div>
					{/snippet}
				</LanguageTabs>

				<MediaPicker
					label="Avatar"
					value={editingTestimonial.avatar}
					onselect={(e) => { editingTestimonial.avatar_id = e.detail.id; editingTestimonial.avatar = e.detail; }}
					onclear={() => { editingTestimonial.avatar_id = null; editingTestimonial.avatar = null; }}
				/>

				<div class="modal-footer">
					<button type="submit" class="btn-save" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</button>
					<button type="button" class="btn-cancel" onclick={() => (testimonialModalOpen = false)}>Cancel</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- PROCESS MODAL -->
{#if processModalOpen && editingProcess}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => (processModalOpen = false)}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>{editingProcess.id ? 'Edit Step' : 'New Process Step'}</h2>
				<button type="button" class="btn-close" onclick={() => (processModalOpen = false)}>×</button>
			</div>
			<form class="modal-body" onsubmit={(e) => { e.preventDefault(); saveProcess(); }}>
				<div class="form-row">
					<div class="form-group">
						<label>Step Number</label>
						<input type="number" bind:value={editingProcess.step_number} min="1" />
					</div>
					<div class="form-group">
						<label>Icon</label>
						<input type="text" bind:value={editingProcess.icon} placeholder="palette" />
					</div>
				</div>

				<LanguageTabs>
					{#snippet children(lang)}
						<div class="form-group">
							<label>Title ({lang.toUpperCase()})</label>
							<input type="text" bind:value={editingProcess[`title_${lang}`]} />
						</div>
						<div class="form-group">
							<label>Description ({lang.toUpperCase()})</label>
							<textarea bind:value={editingProcess[`description_${lang}`]} rows="2"></textarea>
						</div>
					{/snippet}
				</LanguageTabs>

				<div class="modal-footer">
					<button type="submit" class="btn-save" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</button>
					<button type="button" class="btn-cancel" onclick={() => (processModalOpen = false)}>Cancel</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- COLLECTION MODAL -->
{#if collectionModalOpen && editingCollection}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => (collectionModalOpen = false)}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>{editingCollection.id ? 'Edit Collection' : 'New Featured Collection'}</h2>
				<button type="button" class="btn-close" onclick={() => (collectionModalOpen = false)}>×</button>
			</div>
			<form class="modal-body" onsubmit={(e) => { e.preventDefault(); saveCollection(); }}>
				<div class="form-group">
					<label>Series</label>
					<select bind:value={editingCollection.series_id}>
						<option value="">— None —</option>
						{#each allSeries as s}
							<option value={s.id}>{s.name_en}</option>
						{/each}
					</select>
				</div>

				<h3>Title Override (optional)</h3>
				<LanguageTabs>
					{#snippet children(lang)}
						<div class="form-group">
							<input type="text" bind:value={editingCollection[`title_override_${lang}`]} placeholder="Leave blank to use series title" />
						</div>
					{/snippet}
				</LanguageTabs>

				<h3>Description Override (optional)</h3>
				<LanguageTabs>
					{#snippet children(lang)}
						<div class="form-group">
							<textarea bind:value={editingCollection[`description_override_${lang}`]} rows="2" placeholder="Leave blank to use series description"></textarea>
						</div>
					{/snippet}
				</LanguageTabs>

				<div class="form-row">
					<div class="form-group">
						<label>Link (URL override)</label>
						<input type="text" bind:value={editingCollection.link} placeholder="/works/series-slug" />
					</div>
					<div class="form-group">
						<label>Order Index</label>
						<input type="number" bind:value={editingCollection.order_index} min="0" />
					</div>
				</div>

				<MediaPicker
					label="Cover Image Override"
					value={editingCollection.cover_image}
					onselect={(e) => { editingCollection.cover_image_id = e.detail.id; editingCollection.cover_image = e.detail; }}
					onclear={() => { editingCollection.cover_image_id = null; editingCollection.cover_image = null; }}
				/>

				<div class="modal-footer">
					<button type="submit" class="btn-save" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</button>
					<button type="button" class="btn-cancel" onclick={() => (collectionModalOpen = false)}>Cancel</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.homepage-admin { padding: 2rem; }
	.page-header { margin-bottom: 1.5rem; }

	.selected-exhibition {
		display: flex; gap: 1rem; padding: 1rem; background: #f9f9f9;
		border-radius: 8px; margin: 0.5rem 0 1.5rem; align-items: flex-start;
	}
	.exhibition-preview-img { width: 80px; height: 60px; object-fit: cover; border-radius: 4px; flex-shrink: 0; }
	.page-header h1 { margin: 0; font-size: 1.75rem; }
	.subtitle { color: var(--color-text-secondary, #666); margin: 0.25rem 0 0; }

	/* Sticky Quick Nav */
	.quick-nav {
		position: sticky;
		top: 0;
		z-index: 50;
		display: flex;
		gap: 0.375rem;
		flex-wrap: wrap;
		padding: 0.75rem 2rem;
		margin: 0 -2rem 1.5rem;
		background: var(--color-bg, #f9fafb);
		border-bottom: 1px solid var(--color-border, #e5e7eb);
	}

	.quick-nav-link {
		padding: 0.375rem 0.875rem;
		background: white;
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 999px;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--color-text-secondary, #555);
		text-decoration: none;
		transition: all 0.15s;
		white-space: nowrap;
	}

	.quick-nav-link:hover {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-color: transparent;
		color: white;
	}

	/* Sections */
	.sections-scroll {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.page-section {
		scroll-margin-top: 3.5rem;
	}

	.card {
		background: white; border: 1px solid var(--color-border, #ddd);
		border-radius: 8px; padding: 1.5rem;
	}
	.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
	.card h2 { margin: 0 0 1rem; font-size: 1.25rem; }
	.card h3 { margin: 1.5rem 0 0.75rem; font-size: 1rem; color: var(--color-text-secondary, #666); }

	.btn-primary {
		padding: 0.5rem 1rem; background: var(--color-primary, #333);
		color: white; border: none; border-radius: 4px; cursor: pointer;
	}

	.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
	.form-group { margin-bottom: 1rem; }
	.form-group label { display: block; margin-bottom: 0.25rem; font-weight: 500; font-size: 0.875rem; }
	.form-group input, .form-group textarea {
		width: 100%; padding: 0.75rem; border: 1px solid var(--color-border, #ddd);
		border-radius: 4px; font-size: 1rem; font-family: inherit;
	}

	.btn-save {
		padding: 0.75rem 1.5rem; background: var(--color-primary, #333);
		color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;
	}
	.btn-save:disabled { opacity: 0.6; cursor: wait; }

	.slides-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; }
	.slide-card {
		position: relative; background: #f5f5f5; border-radius: 8px; overflow: hidden;
		aspect-ratio: 16/9;
	}
	.slide-card img { width: 100%; height: 100%; object-fit: cover; }
	.no-image { display: flex; align-items: center; justify-content: center; height: 100%; color: #999; }
	.slide-actions {
		position: absolute; bottom: 0; left: 0; right: 0; padding: 0.5rem;
		background: rgba(0,0,0,0.7); display: flex; justify-content: space-between; align-items: center;
	}
	.duration { color: white; font-size: 0.75rem; }
	.slide-actions .btn-delete {
		background: #c00; color: white; border: none; width: 24px; height: 24px;
		border-radius: 50%; cursor: pointer; font-size: 1rem; line-height: 1;
	}

	.items-list { display: flex; flex-direction: column; gap: 0.5rem; }
	.list-item {
		display: flex; align-items: center; gap: 1rem; padding: 1rem;
		background: #f9f9f9; border-radius: 4px;
	}
	.item-thumb { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; }
	.item-avatar { width: 48px; height: 48px; object-fit: cover; border-radius: 50%; }
	.step-number {
		width: 40px; height: 40px; background: var(--color-primary, #333); color: white;
		border-radius: 50%; display: flex; align-items: center; justify-content: center;
		font-weight: bold;
	}
	.item-info { flex: 1; }
	.item-info strong { display: block; }
	.meta { font-size: 0.875rem; color: var(--color-text-secondary, #666); }
	.item-actions { display: flex; gap: 0.5rem; }

	.btn-edit, .btn-delete {
		padding: 0.5rem 1rem; border: 1px solid var(--color-border, #ddd);
		border-radius: 4px; background: white; cursor: pointer; font-size: 0.875rem;
	}
	.btn-edit:hover { background: var(--color-primary, #333); color: white; border-color: var(--color-primary, #333); }
	.btn-delete:hover { background: #fee; border-color: #f88; color: #c00; }

	.empty { text-align: center; padding: 2rem; color: var(--color-text-secondary, #666); }

	/* Modal */
	.modal-overlay {
		position: fixed; top: 0; left: 0; right: 0; bottom: 0;
		background: rgba(0,0,0,0.5); display: flex; align-items: center;
		justify-content: center; z-index: 1000;
	}
	.modal-content {
		background: white; border-radius: 8px; width: 90%; max-width: 600px;
		max-height: 90vh; overflow-y: auto;
	}
	.modal-header {
		display: flex; justify-content: space-between; align-items: center;
		padding: 1rem 1.5rem; border-bottom: 1px solid var(--color-border, #ddd);
	}
	.modal-header h2 { margin: 0; font-size: 1.25rem; }
	.btn-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; line-height: 1; }
	.modal-body { padding: 1.5rem; }
	.modal-footer {
		display: flex; gap: 0.75rem; padding-top: 1rem;
		border-top: 1px solid var(--color-border, #ddd); justify-content: flex-end;
	}
	.btn-cancel {
		padding: 0.75rem 1.5rem; background: white;
		border: 1px solid var(--color-border, #ddd); border-radius: 4px; cursor: pointer;
	}

	/* Dark theme support */
	:global(.dark) .page-header h1 { color: #f9fafb; }
	:global(.dark) .subtitle { color: #9ca3af; }

	:global(.dark) .quick-nav {
		background: #111827;
		border-color: #374151;
	}
	:global(.dark) .quick-nav-link {
		background: #1f2937;
		border-color: #374151;
		color: #9ca3af;
	}
	:global(.dark) .quick-nav-link:hover {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-color: transparent;
		color: white;
	}

	:global(.dark) .card {
		background: #1f2937;
		border-color: #374151;
	}
	:global(.dark) .card h2 { color: #f9fafb; }
	:global(.dark) .card h3 { color: #9ca3af; }
	:global(.dark) .card-header { border-color: #374151; }

	:global(.dark) .form-group label { color: #e5e7eb; }
	:global(.dark) .form-group input,
	:global(.dark) .form-group textarea {
		background: #374151;
		border-color: #4b5563;
		color: #f9fafb;
	}
	:global(.dark) .form-group input::placeholder,
	:global(.dark) .form-group textarea::placeholder { color: #9ca3af; }

	:global(.dark) .slide-card { background: #374151; }
	:global(.dark) .no-image { color: #9ca3af; }

	:global(.dark) .list-item { background: #374151; }
	:global(.dark) .item-info strong { color: #f9fafb; }
	:global(.dark) .meta { color: #9ca3af; }
	:global(.dark) .step-number {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	:global(.dark) .btn-edit,
	:global(.dark) .btn-delete {
		background: #374151;
		border-color: #4b5563;
		color: #e5e7eb;
	}
	:global(.dark) .btn-edit:hover {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-color: transparent;
		color: white;
	}
	:global(.dark) .btn-delete:hover {
		background: #7f1d1d;
		border-color: #991b1b;
		color: #fecaca;
	}

	:global(.dark) .empty { color: #9ca3af; }

	:global(.dark) .modal-content { background: #1f2937; }
	:global(.dark) .modal-header { border-color: #374151; }
	:global(.dark) .modal-header h2 { color: #f9fafb; }
	:global(.dark) .btn-close { color: #9ca3af; }
	:global(.dark) .btn-close:hover { color: #f9fafb; }
	:global(.dark) .modal-footer { border-color: #374151; }
	:global(.dark) .btn-cancel {
		background: #374151;
		border-color: #4b5563;
		color: #e5e7eb;
	}
</style>
