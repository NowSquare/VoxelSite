<?php
$siteRoot = __DIR__;
$page = ['slug' => 'index', 'title' => 'Repair a useful thing', 'description' => 'A synthetic workshop for Studio MCP lifecycle tests.'];
include $siteRoot . '/_partials/header.php';
include $siteRoot . '/_partials/nav.php';
?>
<section class="mx-auto max-w-5xl px-6 py-16">
  <h1 class="text-4xl font-bold tracking-tight">Repair a useful thing.</h1>
  <p class="mt-6 max-w-xl text-lg">A test workshop for chairs, tables, and the things worth keeping.</p>
  <a href="/services/repairs" class="mt-8 inline-block rounded-lg bg-primary px-6 py-3 text-white">Explore repairs</a>
  <img src="/assets/images/workshop.png" width="320" height="240" alt="Synthetic workshop test image" class="mt-10 w-full max-w-md rounded-lg">
</section>
<?php include $siteRoot . '/_partials/footer.php'; ?>
