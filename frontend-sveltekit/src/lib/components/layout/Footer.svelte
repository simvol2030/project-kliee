<script lang="ts">
  /**
   * Footer Component
   * Receives localized footer data from layout server
   */

  interface SocialLink {
    platform: string;
    label: string;
    badge: string | null;
    url: string;
    icon: string;
  }

  interface FooterData {
    brand: {
      title: string;
      subtitle: string;
      quote: string;
    };
    social: {
      title: string;
      links: SocialLink[];
    };
    contact: {
      title: string;
      email: string;
    };
    copyright: string;
  }

  interface Props {
    footerData: FooterData;
  }

  let { footerData }: Props = $props();

  // Get translated strings from footer data
  const brandTitle = $derived(footerData.brand.title);
  const brandSubtitle = $derived(footerData.brand.subtitle);
  const brandQuote = $derived(footerData.brand.quote);
  const socialTitle = $derived(footerData.social.title);
  const contactTitle = $derived(footerData.contact.title);
  const copyright = $derived(footerData.copyright);
</script>

<footer class="footer">
  <div class="container">
    <div class="footer-content">
      <!-- Brand Column -->
      <div class="footer-col footer-brand">
        <h3 class="brand-title">{brandTitle}</h3>
        <p class="brand-subtitle">{brandSubtitle}</p>
        <p class="brand-quote">{brandQuote}</p>
      </div>

      <!-- Social Links Column -->
      <div class="footer-col footer-social">
        <h3 class="social-title">{socialTitle}</h3>
        <div class="social-links">
          {#each footerData.social.links as link}
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              class="social-link"
              aria-label="{link.platform} - {link.label}"
            >
              <span class="social-label">{link.label}</span>
              {#if link.badge}
                <span class="social-badge">{link.badge}</span>
              {/if}
            </a>
          {/each}
        </div>
      </div>

      <!-- Contact Column -->
      <div class="footer-col footer-contact">
        <h3 class="contact-title">{contactTitle}</h3>
        <p class="contact-email">
          <a href="mailto:{footerData.contact.email}">
            {footerData.contact.email}
          </a>
        </p>
      </div>
    </div>

    <!-- Copyright Bar -->
    <div class="footer-bottom">
      <p class="copyright">{copyright}</p>
    </div>
  </div>
</footer>

<style>
  /* Footer */
  .footer {
    background: var(--white, #fff);
    color: var(--black, #000);
    padding: 60px 0 30px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }

  :global(.dark) .footer {
    background: var(--gray-900, #0d0d0d);
    color: var(--gray-100, #f5f5f5);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px;
  }

  /* Footer Content Grid */
  .footer-content {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 60px;
    margin-bottom: 40px;
  }

  .footer-col h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--black, #000);
  }

  :global(.dark) .footer-col h3 {
    color: var(--white, #fff);
  }

  /* Brand Column */
  .footer-brand .brand-title {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 12px;
    letter-spacing: 1px;
  }

  .brand-subtitle {
    font-size: 16px;
    color: var(--gray-600, #666);
    margin-bottom: 16px;
  }

  :global(.dark) .brand-subtitle {
    color: var(--gray-300, #ccc);
  }

  .brand-quote {
    font-size: 15px;
    font-style: italic;
    color: var(--accent, #d4af37);
    line-height: 1.6;
  }

  /* Social Links Column */
  .social-links {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .social-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 6px;
    color: var(--gray-700, #444);
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  :global(.dark) .social-link {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--gray-200, #e5e5e5);
  }

  .social-link:hover {
    background: rgba(0, 0, 0, 0.1);
    border-color: var(--accent, #d4af37);
    color: var(--accent, #d4af37);
    transform: translateY(-2px);
  }

  :global(.dark) .social-link:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .social-badge {
    display: inline-block;
    padding: 2px 6px;
    background: var(--accent, #d4af37);
    color: var(--white, #fff);
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  :global(.dark) .social-badge {
    color: var(--black, #000);
  }

  /* Contact Column */
  .contact-email a {
    color: var(--gray-700, #444);
    text-decoration: none;
    transition: color 0.3s ease;
  }

  :global(.dark) .contact-email a {
    color: var(--gray-200, #e5e5e5);
  }

  .contact-email a:hover {
    color: var(--accent, #d4af37);
    text-decoration: underline;
  }

  /* Footer Bottom */
  .footer-bottom {
    padding-top: 30px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }

  :global(.dark) .footer-bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .copyright {
    text-align: center;
    font-size: 14px;
    color: var(--gray-600, #666);
    margin: 0;
  }

  :global(.dark) .copyright {
    color: var(--gray-400, #999);
  }

  /* Responsive: Tablet */
  @media (max-width: 1024px) {
    .footer-content {
      grid-template-columns: 1fr 1fr;
      gap: 40px;
    }

    .footer-brand {
      grid-column: 1 / -1;
    }
  }

  /* Responsive: Mobile */
  @media (max-width: 768px) {
    .footer {
      padding: 40px 0 24px;
    }

    .container {
      padding: 0 24px;
    }

    .footer-content {
      grid-template-columns: 1fr;
      gap: 32px;
      margin-bottom: 32px;
    }

    .footer-brand {
      grid-column: 1;
    }

    .footer-brand .brand-title {
      font-size: 20px;
    }

    .brand-subtitle {
      font-size: 15px;
    }

    .brand-quote {
      font-size: 14px;
    }

    .footer-col h3 {
      font-size: 16px;
      margin-bottom: 12px;
    }

    .social-links {
      gap: 8px;
    }

    .social-link {
      padding: 6px 12px;
      font-size: 12px;
    }

    .footer-bottom {
      padding-top: 24px;
    }

    .copyright {
      font-size: 13px;
    }
  }

  /* Accessibility: Focus states */
  .social-link:focus,
  .contact-email a:focus {
    outline: 2px solid var(--accent, #d4af37);
    outline-offset: 2px;
  }
</style>
