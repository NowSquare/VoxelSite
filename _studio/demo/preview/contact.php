<?php
$siteName = 'Studioform';
$page = [
  'title'       => 'Contact',
  'description' => "Start a project with Studioform. We work with a limited number of clients each year — if you have a project in mind, get in touch and tell us about it.",
  'slug'        => 'contact',
];
include '_partials/header.php';
?>

<!-- ============================================================
     CONTACT HEADER
     ============================================================ -->
<section class="pt-32 pb-20 px-6">
  <div class="max-w-[1200px] mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12" data-reveal>
      <div class="lg:col-span-8">
        <p class="font-body text-xs tracking-widest uppercase text-[#6B6B68] mb-6">Contact</p>
        <h1 class="font-heading text-[clamp(3rem,7vw,5rem)] font-light leading-[1.05] tracking-tight text-[#111110] mb-8">
          Start a<br>conversation.
        </h1>
        <p class="font-body text-base leading-relaxed text-[#6B6B68] max-w-[50ch]">
          We take on a small number of projects each year. If you have something in mind, tell us about it — even if you're not sure it's the right fit.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- ============================================================
     CONTACT BODY — Form + Info
     ============================================================ -->
<section class="px-6 pb-40">
  <div class="max-w-[1200px] mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-20 border-t border-[#E2E1DD] pt-16">

      <!-- Form column -->
      <div class="lg:col-span-7" data-reveal>

        <form method="POST" action="/submit.php" id="form-contact" class="space-y-8" novalidate>

          <!-- Hidden identifiers -->
          <input type="hidden" name="form_id" value="contact">
          <input type="hidden" name="_timestamp" value="<?= time() ?>">

          <!-- Honeypot -->
          <div style="position:absolute;left:-9999px;top:-9999px" aria-hidden="true">
            <input type="text" name="_website" tabindex="-1" autocomplete="off">
          </div>

          <!-- Name + Company row -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label for="full_name" class="block font-body text-xs tracking-widest uppercase text-[#6B6B68] mb-3">
                Your name <span class="text-[#3D5A73]">*</span>
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                required
                autocomplete="name"
                placeholder="Jane Smith"
                class="w-full font-body text-sm text-[#111110] bg-transparent border-b border-[#E2E1DD] py-3 outline-none placeholder:text-[#B4B3B0] focus:border-[#111110] transition-colors duration-200">
            </div>
            <div>
              <label for="company" class="block font-body text-xs tracking-widest uppercase text-[#6B6B68] mb-3">
                Company / organisation
              </label>
              <input
                type="text"
                id="company"
                name="company"
                autocomplete="organization"
                placeholder="Acme Inc."
                class="w-full font-body text-sm text-[#111110] bg-transparent border-b border-[#E2E1DD] py-3 outline-none placeholder:text-[#B4B3B0] focus:border-[#111110] transition-colors duration-200">
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block font-body text-xs tracking-widest uppercase text-[#6B6B68] mb-3">
              Email address <span class="text-[#3D5A73]">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autocomplete="email"
              placeholder="jane@acmeinc.com"
              class="w-full font-body text-sm text-[#111110] bg-transparent border-b border-[#E2E1DD] py-3 outline-none placeholder:text-[#B4B3B0] focus:border-[#111110] transition-colors duration-200">
          </div>

          <!-- Services interest -->
          <div>
            <label class="block font-body text-xs tracking-widest uppercase text-[#6B6B68] mb-4">
              What are you interested in? <span class="text-[#3D5A73]">*</span>
            </label>
            <div class="flex flex-wrap gap-3" role="group" aria-label="Services">
              <?php
              $services = ['Brand Identity', 'Website Design', 'Creative Strategy', 'Full-studio engagement', "Not sure yet"];
              foreach ($services as $svc):
                $val = strtolower(str_replace([' ', '-'], '_', $svc));
              ?>
                <label class="inline-flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" name="services[]" value="<?= htmlspecialchars($val) ?>"
                    class="sr-only peer">
                  <span class="font-body text-xs tracking-wide px-4 py-2 rounded-full border border-[#E2E1DD] text-[#6B6B68] peer-checked:border-[#111110] peer-checked:text-[#111110] peer-checked:bg-[#F0EFEB] group-hover:border-[#B4B3B0] transition-all duration-200 cursor-pointer">
                    <?= htmlspecialchars($svc) ?>
                  </span>
                </label>
              <?php endforeach; ?>
            </div>
          </div>

          <!-- Budget -->
          <div>
            <label for="budget" class="block font-body text-xs tracking-widest uppercase text-[#6B6B68] mb-3">
              Approximate budget
            </label>
            <select id
              class="w-full font-body text-sm text-[#111110] bg-transparent border-b border-[#E2E1DD] py-3 outline-none focus:border-[#111110] transition-colors duration-200 appearance-none cursor-pointer">
              <option value="" disabled selected>Select a range</option>
              <option value="under_5k">Under £5,000</option>
              <option value="5_10k">£5,000 – £10,000</option>
              <option value="10_20k">£10,000 – £20,000</option>
              <option value="20k_plus">£20,000+</option>
              <option value="unsure">Not sure yet</option>
            </select>
          </div>

          <!-- Message -->
          <div>
            <label for="message" class="block font-body text-xs tracking-widest uppercase text-[#6B6B68] mb-3">
              Tell us about your project <span class="text-[#3D5A73]">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows="5"
              placeholder="What are you trying to achieve? What's the context? Even rough ideas are welcome."
              class="w-full font-body text-sm text-[#111110] bg-transparent border-b border-[#E2E1DD] py-3 outline-none placeholder:text-[#B4B3B0] focus:border-[#111110] transition-colors duration-200 resize-none"></textarea>
          </div>

          <!-- Privacy -->
          <div>
            <label class="inline-flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" name="privacy_consent" required class="mt-0.5 accent-[#111110] cursor-pointer flex-shrink-0">
              <span class="font-body text-xs leading-relaxed text-[#6B6B68]">
                I agree to my information being used to respond to this enquiry. We don't share it with anyone.
              </span>
            </label>
          </div>

          <!-- Submit -->
          <div class="pt-4">
            <button
              type="submit"
              class="inline-flex items-center gap-3 font-body text-sm font-medium tracking-widest uppercase text-white bg-[#111110] px-10 py-4 rounded-[2px] transition-all duration-200 hover:bg-[#3D5A73] hover:-translate-y-0.5 cursor-pointer border-0">
              Send message
              <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
            </button>
          </div>

        </form>

      </div>

      <!-- Info column -->
      <div class="lg:col-span-4 lg:col-start-9" data-reveal>

        <div class="space-y-12">

          <div>
            <p class="font-body text-xs tracking-widest uppercase text-[#6B6B68] mb-5">What to expect</p>
            <div class="space-y-5">
              <?php
              $expectations = [
                ['icon' => 'clock', 'text' => 'We respond to all enquiries within two business days.'],
                ['icon' =>  "message-square", 'text' => "If it sounds like a good fit, we'll arrange a short introductory call — no pitch, just a conversation."],
                ['icon' =>  "file-text", 'text' => "After that, we'll put together a scope and proposal. No obligation to proceed."],
              ];
              foreach ($expectations as $e): ?>
                <div class="flex items-start gap-4">
                  <i class="icon text-[#3D5A73] flex-shrink-0 mt-0.5" data-lucide="<?= $e['icon'] ?>" aria-hidden="true"></i>
                  <p class="font-body text-sm leading-relaxed text-[#6B6B68]"><?= htmlspecialchars($e['text']) ?></p>
                </div>
              <?php endforeach; ?>
            </div>
          </div>

          <div class="pt-8 border-t border-[#E2E1DD]">
            <p class="font-body text-xs tracking-widest uppercase text-[#6B6B68] mb-5">Availability</p>
            <p class="font-body text-sm leading-relaxed text-[#6B6B68] mb-5">
              We're currently taking enquiries for Q3 2026. New projects typically start 4–6 weeks after a proposal is agreed.
            </p>
            <div class="inline-flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
              <span class="font-body text-xs text-[#6B6B68]">Accepting new enquiries</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  </div>
</section>

<?php include '_partials/footer.php'; ?>