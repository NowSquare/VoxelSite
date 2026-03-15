<?php
/**
 * Schema.org JSON-LD — Demo Mode
 *
 * This is the demo-isolated version. It outputs hardcoded
 * Studioform schema data instead of reading from live
 * assets/data/site.json (which would leak real site info).
 */

$_vxSchema = [
    '@context'    => 'https://schema.org',
    '@type'       => 'ProfessionalService',
    'name'        => 'Studioform',
    'description' => 'Brand identity and digital design practice. Identity systems, websites, and creative strategy for startups, cultural organisations, and product companies.',
    'url'         => '',
    'email'       => 'studio@example.com',
    'address'     => [
        '@type'           => 'PostalAddress',
        'addressLocality' => 'London',
        'addressCountry'  => 'GB',
    ],
];

echo '<script type="application/ld+json">' . "\n";
echo json_encode($_vxSchema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
echo "\n" . '</script>' . "\n";