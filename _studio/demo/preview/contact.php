<?php
$siteName = 'Studioform';
$page = [
  'title'       => 'Contact',
  'description' => 'Start a project with Studioform. We take on a small number of projects each year. Tell us about yours.',
  'slug'        => 'contact',
];
include '_partials/header.php';
?>

<!-- Page Header -->
<section class="page-header">
  <div class="page-header-inner" data-reveal>
    <span class="eyebrow">Get in touch</span>
    <h1 class="page-title">Let's talk.</h1>
    <p class="page-subtitle">
      Tell us about your project. We respond to every enquiry within
      two business days — even if the answer is that we're not the
      right studio for it.
    </p>
  </div>
</section>

<!-- Contact Body -->
<section class="contact-section">
  <div class="contact-inner">

    <!-- Form -->
    <div class="contact-form-col" data-reveal>
      <form method="POST" action="/submit.php" id="form-contact" class="contact-form" novalidate>
        <input type="hidden" name="form_id" value="contact">
        <div style="position:absolute;left:-9999px;top:-9999px" aria-hidden="true">
          <input type="text" name="_website" tabindex="-1" autocomplete="off">
        </div>
        <input type="hidden" name="_timestamp" value="<?= time() ?>">

        <div class="form-row form-row--half">
          <div class="form-group">
            <label class="form-label" for="full_name">Name</label>
            <input class="form-input" type="text" id="full_name" name="full_name"
                   placeholder="Your name" required autocomplete="name">
          </div>
          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input class="form-input" type="email" id="email" name="email"
                   placeholder="you@company.com" required autocomplete="email">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="organisation">Organisation</label>
          <input class="form-input" type="text" id="organisation" name="organisation"
                 placeholder="Company or project name">
        </div>

        <div class="form-group">
          <label class="form-label" for="project_type">Type of project</label>
          <select class="form-input form-select" id="project_type" name="project_type" required>
            <option value="" disabled selected>Select a service</option>
            <option value="brand_identity">Brand Identity</option>
            <option value="website_design">Website Design</option>
            <option value="creative_strategy">Creative Strategy</option>
            <option value="full_project">Brand + Web (full project)</option>
            <option value="other">Something else</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="budget">Approximate budget</label>
          <select class="form-input form-select" id="budget" name="budget">
            <option value="" disabled selected>Select a range</option>
            <option value="under_10k">Under £10,000</option>
            <option value="10k_25k">£10,000 – £25,000</option>
            <option value="25k_50k">£25,000 – £50,000</option>
            <option value="50k_plus">£50,000+</option>
            <option value="not_sure">Not sure yet</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="message">Tell us about your project</label>
          <textarea class="form-input form-textarea" id="message" name="message"
                    rows="6"
                    placeholder="What are you working on? What problem are you trying to solve? Any context about your timeline or goals is helpful."
                    required></textarea>
        </div>

        <div class="form-group form-group--checkbox">
          <label class="form-checkbox-label">
            <input type="checkbox" name="privacy_consent" value="1" required>
            <span class="form-checkbox-text">
              I agree to Studioform storing my details to respond to this enquiry.
            </span>
          </label>
        </div>

        <button type="submit" class="btn-primary btn-submit">Send enquiry</button>
      </form>
    </div>

    <!-- Info -->
    <div class="contact-info-col" data-reveal>
      <div class="contact-info-block">
        <h2 class="contact-info-heading">Good to know</h2>
        <div class="contact-info-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <div>
            <strong>Response time</strong>
            <p>We reply within two business days, typically sooner.</p>
          </div>
        </div>
        <div class="contact-info-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <div>
            <strong>Availability</strong>
            <p>We book projects 6–8 weeks in advance. Start the conversation early.</p>
          </div>
        </div>
        <div class="contact-info-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <div>
            <strong>Location</strong>
            <p>London-based. We work with clients everywhere.</p>
          </div>
        </div>
      </div>

      <div class="contact-process-note">
        <h3 class="contact-process-title">What happens next</h3>
        <ol class="contact-process-list">
          <li>You submit the form</li>
          <li>We read it carefully</li>
          <li>We reply with honest thoughts and, if we're a good fit, a call invitation</li>
          <li>We talk. No pitch, no pressure.</li>
        </ol>
      </div>
    </div>

  </div>
</section>

<?php include '_partials/footer.php'; ?>