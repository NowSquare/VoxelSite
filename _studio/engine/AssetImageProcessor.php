<?php
declare(strict_types=1);
namespace VoxelSite;

/** Shared Studio image dimensions, thumbnail and large-image optimization. */
final class AssetImageProcessor
{
public static function process(string $filePath, string $ext): array
{
    $result = [];

    if (!function_exists('getimagesize')) {
        return $result;
    }

    $dims = @getimagesize($filePath);
    if ($dims) {
        $result['width'] = $dims[0];
        $result['height'] = $dims[1];
    }

    // Only attempt processing if GD is available
    if (!function_exists('imagecreatetruecolor')) {
        return $result;
    }

    try {
        // Load source image
        $source = match ($ext) {
            'jpg', 'jpeg' => @imagecreatefromjpeg($filePath),
            'png'         => @imagecreatefrompng($filePath),
            'gif'         => @imagecreatefromgif($filePath),
            'webp'        => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($filePath) : false,
            default       => false,
        };

        if (!$source) return $result;

        $origW = imagesx($source);
        $origH = imagesy($source);

        // Generate thumbnail for the asset grid (240px — matches card width)
        $thumbDir = dirname($filePath) . '/thumbs';
        if (!is_dir($thumbDir)) mkdir($thumbDir, 0755, true);

        $thumbMaxW = 240;
        if ($origW > $thumbMaxW) {
            $thumbH = (int) round($origH * ($thumbMaxW / $origW));
            $thumb = imagecreatetruecolor($thumbMaxW, $thumbH);

            // Preserve transparency for PNG
            if ($ext === 'png') {
                imagealphablending($thumb, false);
                imagesavealpha($thumb, true);
            }

            imagecopyresampled($thumb, $source, 0, 0, 0, 0, $thumbMaxW, $thumbH, $origW, $origH);

            $thumbPath = $thumbDir . '/' . basename($filePath);
            match ($ext) {
                'jpg', 'jpeg' => imagejpeg($thumb, $thumbPath, 75),
                'png'         => imagepng($thumb, $thumbPath, 8),
                'gif'         => imagegif($thumb, $thumbPath),
                'webp'        => function_exists('imagewebp') ? imagewebp($thumb, $thumbPath, 75) : null,
                default       => null,
            };
            unset($thumb);

            $result['thumbnail'] = str_replace(dirname($filePath, 3), '', $thumbPath);
            $result['thumbnail'] = str_replace('\\', '/', $result['thumbnail']);
        }

        // Optimize if source is very large (>2000px)
        if ($origW > 2000) {
            $newW = 1920;
            $newH = (int) round($origH * ($newW / $origW));
            $optimized = imagecreatetruecolor($newW, $newH);

            if ($ext === 'png') {
                imagealphablending($optimized, false);
                imagesavealpha($optimized, true);
            }

            imagecopyresampled($optimized, $source, 0, 0, 0, 0, $newW, $newH, $origW, $origH);

            match ($ext) {
                'jpg', 'jpeg' => imagejpeg($optimized, $filePath, 90),
                'png'         => imagepng($optimized, $filePath, 6),
                'webp'        => function_exists('imagewebp') ? imagewebp($optimized, $filePath, 85) : null,
                default       => null,
            };
            unset($optimized);

            $result['optimized'] = true;
            $result['width'] = $newW;
            $result['height'] = $newH;
        }

        unset($source);
    } catch (\Throwable $e) {
        // Image processing failures are non-fatal — keep the original
        $result['processing_error'] = $e->getMessage();
    }

    return $result;
}
}
