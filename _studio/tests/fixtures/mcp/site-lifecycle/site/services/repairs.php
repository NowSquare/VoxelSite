<?php
$siteRoot = dirname(__DIR__);
$page = ['slug' => 'services/repairs', 'title' => 'Workshop repairs', 'description' => 'Inspect the nested page, structured data, interaction, and enquiry form.'];
$services = json_decode(file_get_contents($siteRoot . '/assets/data/services.json'), true, 32, JSON_THROW_ON_ERROR);
include $siteRoot . '/_partials/header.php';
include $siteRoot . '/_partials/nav.php';
?>
<section class="mx-auto max-w-5xl px-6 py-16">
  <h1 class="text-4xl font-bold">Workshop repairs</h1>
  <ul class="mt-6 space-y-3">
    <?php foreach ($services['services'] as $service): ?>
      <li><?= htmlspecialchars($service['name'], ENT_QUOTES, 'UTF-8') ?></li>
    <?php endforeach; ?>
  </ul>
  <button type="button" aria-expanded="false" aria-controls="repair-detail" data-repair-toggle class="mt-8 rounded-lg border px-5 py-3">What to bring</button>
  <p id="repair-detail" hidden class="mt-4">Bring the item and any loose pieces.</p>
  <p data-service-status role="status" class="mt-4"></p>
  <form action="/submit.php" method="post" data-vs-form="enquiry" class="mt-12 max-w-lg space-y-5">
    <h2 class="text-2xl font-semibold">Ask about a repair</h2>
    <input type="hidden" name="form_id" value="enquiry">
    <input type="hidden" name="_timestamp" value="<?= time() ?>">
    <div hidden aria-hidden="true"><label>Leave empty<input name="_website" tabindex="-1" autocomplete="off"></label></div>
    <div><label for="enquiry-name" class="block">Name</label><input id="enquiry-name" name="name" required maxlength="120" autocomplete="name" class="mt-2 w-full rounded-lg border px-3 py-2"></div>
    <div><label for="enquiry-email" class="block">Email</label><input id="enquiry-email" name="email" type="email" required autocomplete="email" class="mt-2 w-full rounded-lg border px-3 py-2"></div>
    <div><label for="enquiry-message" class="block">What needs repair?</label><textarea id="enquiry-message" name="message" required maxlength="2000" class="mt-2 w-full rounded-lg border px-3 py-2"></textarea></div>
    <button type="submit" class="rounded-lg bg-primary px-5 py-3 text-white">Send enquiry</button>
  </form>
</section>
<?php include $siteRoot . '/_partials/footer.php'; ?>
