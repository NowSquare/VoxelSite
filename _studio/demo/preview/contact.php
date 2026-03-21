<?php
$siteName = 'Studioform';
$page = [
  'title'       => 'Contact',
  'description' => 'Start a conversation with Studioform. Tell us about your project and we will respond within two working days.',
  'slug'        => 'contact',
];
include '_partials/header.php';
?>

<!-- Page Header -->
<section class="pt-40 pb-20 px-6 lg:px-10 max-w-[var(--max-width)] mx-auto border-b border-[var(--color-border)]">
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-end" data-reveal>
    <div>
      <p class="text-xs tracking-[0.14em] uppercase text-[var(--color-muted)] font-medium mb-6">Get in touch</p>
      <h1 class="font-['Cormorant_Garamond'] text-[clamp(3rem,6vw,5.5rem)] font-light text-[var(--color-ink)] leading-[1.05]">
        Start a<br><em class="italic">conversation.</em>
      </h1>
    </div>
    <div>
      <p class="text-sm text-[var(--color-muted)] leading-relaxed font-light max-w-sm">
        Tell us a little about your project and what you are trying to achieve. We respond to every enquiry within two working days.
      </p>
    </div>
  </div>
</section>

<!-- Contact Form + Info -->
<section class="py-20 px-6 lg:px-10 max-w-[var(--max-width)] mx-auto">
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-16">

    <!-- Form -->
    <div class="lg:col-span-7" data-reveal>
      <form method="POST" action="/submit.php" id="form-contact" class="flex flex-col gap-8" novalidate>
        <input type="hidden" name="form_id" value="contact">
        <div style="position:absolute;left:-9999px;top:-9999px" aria-hidden="true">
          <input type="text" name="_website" tabindex="-1" autocomplete="off">
        </div>
        <input type="hidden" name="_timestamp" value="<?= time() ?>">

        <!-- Name + Company -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="flex flex-col gap-2">
            <label for="full_name" class="text-xs tracking-[0.1em] uppercase text-[var(--color-muted)] font-medium">
              Name <span class="text-[var(--color-primary)]">*</span>
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              required
              placeholder="Your name"
              class="contact-input w-full border-b border-[var(--color-border)] bg-transparent py-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/50 focus:outline-none focus:border-[var(--color-ink)] transition-colors duration-200">
          </div>
          <div class="flex flex-col gap-2">
            <label for="company" class="text-xs tracking-[0.1em] uppercase text-[var(--color-muted)] font-medium">
              Company
            </label>
            <input
              type="text"
              id="company"
              name="company"
              placeholder="Your company"
              class="contact-input w-full border-b border-[var(--color-border)] bg-transparent py-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/50 focus:outline-none focus:border-[var(--color-ink)] transition-colors duration-200">
          </div>
        </div>

        <!-- Email -->
        <div class="flex flex-col gap-2">
          <label for="email" class="text-xs tracking-[0.1em] uppercase text-[var(--color-muted)] font-medium">
            Email <span class="text-[var(--color-primary)]">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="your@email.com"
            class="contact-input w-full border-b border-[var(--color-border)] bg-transparent py-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/50 focus:outline-none focus:border-[var(--color-ink)] transition-colors duration-200">
        </div>

        <!-- Project type -->
        <div class="flex flex-col gap-2">
          <label for="project_type" class="text-xs tracking-[0.1em] uppercase text-[var(--color-muted)] font-medium">
            I am interested in <span class="text-[var(--color-primary)]">*</span>
          </label>
          <select
            id="project_type"
            name="project_type"
            required
            class="contact-input w-full border-b border-[var(--color-border)] bg-transparent py-3 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] transition-colors duration-200 cursor-pointer appearance-none">
            <option value="" disabled selected>Select a discipline</option>
            <option value="identity">Brand Identity</option>
            <option value="web">Website Design</option>
            <option value="strategy">Creative Strategy</option>
            <option value="combined">Combined engagement</option>
            <option value="other">Not sure yet</option>
          </select>
        </div>

        <!-- Budget -->
        <div class="flex flex-col gap-2">
          <label for="budget" class="text-xs tracking-[0.1em] uppercase text-[var(--color-muted)] font-medium">
            Approximate budget
          </label>
          <select
            id="budget"
            name="budget"
            class="contact-input w-full border-b border-[var(--color-border)] bg-transparent py-3 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] transition-colors duration-200 cursor-pointer appearance-none">
            <option value="" disabled selected>Select a range</option>
            <option value="under-5k">Under £5,000</option>
            <option value="5k-15k">£5,000 – £15,000</option>
            <option value="15k-30k">£15,000 – £30,000</option>
            <option value="30k-plus">£30,000+</option>
            <option value="unknown">Not sure yet</option>
          </select>
        </div>

        <!-- Message -->
        <div class="flex flex-col gap-2">
          <label for="message" class="text-xs tracking-[0.1em] uppercase text-[var(--color-muted)] font-medium">
            Tell us about your project <span class="text-[var(--color-primary)]">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows="5"
            placeholder="What are you trying to achieve? Where are you now, and where do you want to be?"
            class="contact-input w-full border-b border-[var(--color-border)] bg-transparent py-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/50 focus:outline-none focus:border-[var(--color-ink)] transition-colors duration-200 resize-none leading-relaxed"></textarea>
        </div>

        <!-- Submit -->
        <div class="pt-4">
          <button
            type="submit"
            class="inline-flex items-center gap-3 text-sm font-medium tracking-[0.08em] uppercase text-[var(--color-ink)] border-b border-[var(--color-ink)] pb-1 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors duration-300 bg-transparent cursor-pointer">
            Send enquiry
            <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
          </button>
          <p class="text-xs text-[var(--color-muted)] font-light mt-4">
            We respond to every message within two working days.
          </p>
        </div>

      </form>
    </div>

    <!-- Info sidebar -->
    <aside class="lg:col-span-4 lg:col-start-9" data-reveal>
      <div class="flex flex-col gap-12 pt-2">

        <div class="pt-8 border-t border-[var(--color-border)]">
          <p class="text-xs tracking-[0.12em] uppercase text-[var(--color-muted)] font-medium mb-4">New projects</p>
          <p class="text-sm text-[var(--color-muted)] leading-relaxed font-light">
            We are currently accepting enquiries for projects starting from Q3 2026. Use the form to tell us about your brief and timeline.
          </p>
        </div>

        <div class="pt-8 border-t border-[var(--color-border)]">
          <p class="text-xs tracking-[0.12em] uppercase text-[var(--color-muted)] font-medium mb-4">Typical engagement</p>
          <p class="text-sm text-[var(--color-muted)] leading-relaxed font-light">
            Brand identity projects typically run 8–12 weeks. Web design projects run 10–16 weeks. Combined engagements are structured to suit the brief.
          </p>
        </div>

        <div class="pt-8 border-t border-[var(--color-border)]">
          <p class="text-xs tracking-[0.12em] uppercase text-[var(--color-muted)] font-medium mb-4">Before we begin</p>
          <p class="text-sm text-[var(--color-muted)] leading-relaxed font-light">
            Every project starts with a no-commitment discovery call. We want to understand your brief properly before we propose a scope or a fee.
          </p>
        </div>

      </div>
    </aside>

  </div>
</section>

<?php include '_partials/footer.php'; ?>