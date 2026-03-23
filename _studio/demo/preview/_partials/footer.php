<?php
// _partials/footer.php
// Closes <main>, renders site footer, loads scripts.
?>
  </main>

  <footer class="bg-[#111110] text-[#F8F7F4]">

    <!-- Top footer -->
    <div class="max-w-[1200px] mx-auto px-6 pt-20 pb-10">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/10">

        <!-- Studio identity -->
        <div class="md:col-span-5">
          <p class="font-heading text-4xl font-light tracking-tight text-white mb-6">Studioform</p>
          <p class="text-sm leading-relaxed text-white/50 max-w-xs">
            A brand and digital design practice. We build identity systems, websites, and creative strategy for organisations that care about how they show up.
          </p>
        </div>

        <!-- Navigation -->
        <div class="md:col-span-3 md:col-start-7">
          <p class="text-xs tracking-widest uppercase text-white/30 mb-5">Navigation</p>
          <ul class="list-none space-y-3">
            <li><a href="/" class="text-sm text-white/60 hover:text-white transition-colors duration-200">Home</a></li>
            <li><a href="/portfolio" class="text-sm text-white/60 hover:text-white transition-colors duration-200">Work</a></li>
            <li><a href="/services" class="text-sm text-white/60 hover:text-white transition-colors duration-200">Services</a></li>
            <li><a href="/about" class="text-sm text-white/60 hover:text-white transition-colors duration-200">About</a></li>
            <li><a href="/contact" class="text-sm text-white/60 hover:text-white transition-colors duration-200">Contact</a></li>
          </ul>
        </div>

        <!-- Services -->
        <div class="md:col-span-3">
          <p class="text-xs tracking-widest uppercase text-white/30 mb-5">Disciplines</p>
          <ul class="list-none space-y-3">
            <li><span class="text-sm text-white/60">Brand Identity</span></li>
            <li><span class="text-sm text-white/60">Website Design</span></li>
            <li><span class="text-sm text-white/60">Creative Strategy</span></li>
          </ul>
        </div>

      </div>

      <!-- Bottom bar -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8">
        <p class="text-xs text-white/30">
          &copy; <?= date('Y') ?> Studioform. All rights reserved.
        </p>
        <p class="text-xs text-white/30">
          Minimal, considered, built to last.
        </p>
      </div>
    </div>

  </footer>

  <!-- Scripts -->
  <script src="/assets/js/main.js" defer></script>
  <script src="/assets/js/navigation.js?v=25f38c27" defer></script>
  <script src="/assets/js/icon-resolver.js?v=8e57c563" defer></script>

<script src="/assets/js/form-handler.js?v=951abe29" defer></script>
</body>
</html>