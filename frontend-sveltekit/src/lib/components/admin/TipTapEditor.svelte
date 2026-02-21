<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Image from '@tiptap/extension-image';
	import Link from '@tiptap/extension-link';

	let {
		content = $bindable(''),
		placeholder = 'Start writing...'
	}: { content: string; placeholder?: string } = $props();

	let editorElement: HTMLElement;
	let editor: Editor | null = null;

	// Track if we're updating internally to avoid loop
	let isUpdating = false;

	onMount(() => {
		editor = new Editor({
			element: editorElement,
			extensions: [
				StarterKit,
				Image.configure({
					inline: false,
					allowBase64: false
				}),
				Link.configure({
					openOnClick: false,
					HTMLAttributes: {
						target: '_blank',
						rel: 'noopener noreferrer'
					}
				})
			],
			content: content || '',
			editorProps: {
				attributes: {
					class: 'tiptap-content',
					'data-placeholder': placeholder
				}
			},
			onUpdate: ({ editor: e }) => {
				isUpdating = true;
				content = e.getHTML();
				isUpdating = false;
			}
		});
	});

	// Watch content changes from outside (language tab switch)
	$effect(() => {
		if (editor && !isUpdating && content !== editor.getHTML()) {
			editor.commands.setContent(content || '', false);
		}
	});

	onDestroy(() => {
		editor?.destroy();
	});

	function setLink() {
		const url = prompt('Enter URL:');
		if (url === null) return;
		if (url === '') {
			editor?.chain().focus().unsetLink().run();
			return;
		}
		editor?.chain().focus().setLink({ href: url }).run();
	}

	function addImage() {
		const url = prompt('Enter image URL:');
		if (url) {
			editor?.chain().focus().setImage({ src: url }).run();
		}
	}
</script>

<div class="tiptap-editor">
	<div class="toolbar">
		<button
			type="button"
			class="toolbar-btn"
			class:active={editor?.isActive('bold')}
			onclick={() => editor?.chain().focus().toggleBold().run()}
			title="Bold (Ctrl+B)"
		>
			<strong>B</strong>
		</button>
		<button
			type="button"
			class="toolbar-btn"
			class:active={editor?.isActive('italic')}
			onclick={() => editor?.chain().focus().toggleItalic().run()}
			title="Italic (Ctrl+I)"
		>
			<em>I</em>
		</button>

		<div class="toolbar-separator"></div>

		<button
			type="button"
			class="toolbar-btn"
			class:active={editor?.isActive('heading', { level: 2 })}
			onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
			title="Heading 2"
		>
			H2
		</button>
		<button
			type="button"
			class="toolbar-btn"
			class:active={editor?.isActive('heading', { level: 3 })}
			onclick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
			title="Heading 3"
		>
			H3
		</button>

		<div class="toolbar-separator"></div>

		<button
			type="button"
			class="toolbar-btn"
			class:active={editor?.isActive('bulletList')}
			onclick={() => editor?.chain().focus().toggleBulletList().run()}
			title="Bullet List"
		>
			• —
		</button>
		<button
			type="button"
			class="toolbar-btn"
			class:active={editor?.isActive('orderedList')}
			onclick={() => editor?.chain().focus().toggleOrderedList().run()}
			title="Ordered List"
		>
			1.—
		</button>
		<button
			type="button"
			class="toolbar-btn"
			class:active={editor?.isActive('blockquote')}
			onclick={() => editor?.chain().focus().toggleBlockquote().run()}
			title="Blockquote"
		>
			❝
		</button>

		<div class="toolbar-separator"></div>

		<button
			type="button"
			class="toolbar-btn"
			class:active={editor?.isActive('link')}
			onclick={setLink}
			title="Link"
		>
			🔗
		</button>
		<button
			type="button"
			class="toolbar-btn"
			onclick={addImage}
			title="Insert Image"
		>
			🖼
		</button>
	</div>

	<div class="editor-area" bind:this={editorElement}></div>
</div>

<style>
	.tiptap-editor {
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		overflow: hidden;
		background: #fff;
	}

	.toolbar {
		display: flex;
		align-items: center;
		gap: 0.125rem;
		padding: 0.5rem;
		background: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
		flex-wrap: wrap;
	}

	.toolbar-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2rem;
		height: 2rem;
		padding: 0 0.375rem;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 0.25rem;
		cursor: pointer;
		font-size: 0.8125rem;
		color: #374151;
		transition: all 0.15s;
	}

	.toolbar-btn:hover {
		background: #e5e7eb;
		border-color: #d1d5db;
	}

	.toolbar-btn.active {
		background: #6366f1;
		border-color: #6366f1;
		color: white;
	}

	.toolbar-separator {
		width: 1px;
		height: 1.5rem;
		background: #e5e7eb;
		margin: 0 0.25rem;
	}

	.editor-area {
		min-height: 300px;
		padding: 1rem;
	}

	:global(.tiptap-content) {
		outline: none;
		min-height: 280px;
		font-size: 0.9375rem;
		line-height: 1.7;
		color: #111827;
	}

	:global(.tiptap-content p) {
		margin: 0 0 0.75rem 0;
	}

	:global(.tiptap-content h2) {
		font-size: 1.375rem;
		font-weight: 700;
		margin: 1.25rem 0 0.5rem;
		color: #111827;
	}

	:global(.tiptap-content h3) {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 1rem 0 0.5rem;
		color: #111827;
	}

	:global(.tiptap-content ul),
	:global(.tiptap-content ol) {
		padding-left: 1.5rem;
		margin: 0 0 0.75rem 0;
	}

	:global(.tiptap-content li) {
		margin-bottom: 0.25rem;
	}

	:global(.tiptap-content blockquote) {
		border-left: 3px solid #6366f1;
		padding: 0.5rem 1rem;
		margin: 0.75rem 0;
		color: #6b7280;
		font-style: italic;
	}

	:global(.tiptap-content a) {
		color: #6366f1;
		text-decoration: underline;
	}

	:global(.tiptap-content img) {
		max-width: 100%;
		height: auto;
		border-radius: 0.25rem;
	}

	:global(.tiptap-content.is-editor-empty::before) {
		content: attr(data-placeholder);
		color: #9ca3af;
		pointer-events: none;
		float: left;
		height: 0;
	}

	/* Dark theme */
	:global(.dark) .tiptap-editor {
		background: #1f2937;
		border-color: #374151;
	}

	:global(.dark) .toolbar {
		background: #111827;
		border-color: #374151;
	}

	:global(.dark) .toolbar-btn {
		color: #d1d5db;
	}

	:global(.dark) .toolbar-btn:hover {
		background: #374151;
		border-color: #4b5563;
	}

	:global(.dark) .toolbar-separator {
		background: #374151;
	}

	:global(.dark) :global(.tiptap-content) {
		color: #f9fafb;
	}

	:global(.dark) :global(.tiptap-content h2),
	:global(.dark) :global(.tiptap-content h3) {
		color: #f9fafb;
	}
</style>
