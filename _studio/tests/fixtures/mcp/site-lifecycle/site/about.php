<?php
$siteRoot = __DIR__;
$page = ['slug' => 'about', 'title' => 'About the workshop', 'description' => 'Background and contact details for a synthetic test business.'];
include $siteRoot . '/_partials/header.php';
include $siteRoot . '/_partials/nav.php';
?>
<section class="mx-auto max-w-5xl px-6 py-16">
  <h1 class="text-4xl font-bold">Keep it in use.</h1>
  <p class="mt-6 max-w-xl">The workshop is a fictional business used only in automated qualification fixtures.</p>
  <div role="img" aria-label="Synthetic checkerboard swatch" class="mt-6 h-12 w-24 bg-[url('../images/workshop.png')]"></div>
  <p class="mt-4"><a href="mailto:hello@example.test" class="underline">hello@example.test</a></p>
</section>
<?php include $siteRoot . '/_partials/footer.php'; ?>
