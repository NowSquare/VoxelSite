  </main>

  <!-- Footer -->
  <footer class="bg-[var(--color-ink)] text-white">

    <!-- Main footer -->
    <div class="max-w-[var(--max-width)] mx-auto px-6 lg:px-10 pt-20 pb-10">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 pb-16 border-b border-white/10">

        <!-- Studio -->
        <div class="lg:col-span-2">
          <p class="font-['Cormorant_Garamond'] text-3xl font-light tracking-tight mb-6">Studioform</p>
          <p class="text-white/60 text-sm leading-relaxed max-w-xs font-light">
            Brand identity systems, website design, and creative strategy for businesses that care about how they show up in the world.
          </p>
        </div>

        <!-- Navigation -->
        <div>
          <p class="text-xs tracking-[0.12em] uppercase text-white/40 font-medium mb-5">Studio</p>
          <ul class="list-none flex flex-col gap-3">
            <li><a href="/portfolio" class="text-sm text-white/70 hover:text-white transition-colors duration-200">Work</a></li>
            <li><a href="/services" class="text-sm text-white/70 hover:text-white transition-colors duration-200">Services</a></li>
            <li><a href="/about" class="text-sm text-white/70 hover:text-white transition-colors duration-200">About</a></li>
            <li><a href="/contact" class="text-sm text-white/70 hover:text-white transition-colors duration-200">Contact</a></li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <p class="text-xs tracking-[0.12em] uppercase text-white/40 font-medium mb-5">Contact</p>
          <ul class="list-none flex flex-col gap-3">
            <li>
              <a href="/contact" class="text-sm text-white/70 hover:text-white transition-colors duration-200">
                Start a project
              </a>
            </li>
          </ul>
        </div>

      </div>

      <!-- Bottom bar -->
      <div class="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p class="text-xs text-white/30 font-light">
          &copy; <?= date('Y') ?> Studioform. All rights reserved.
        </p>
        <p class="text-xs text-white/20 font-light tracking-[0.06em]">
          Brand &amp; Digital Design Practice
        </p>
      </div>
    </div>

  </footer>

  <script src="/assets/js/main.js" defer></script>
  <script src="/assets/js/navigation.js" defer></script>
  <script src="/assets/js/icon-resolver.js" defer></script>
<script src="/assets/js/form-handler.js" defer></script>
</body>
</html>