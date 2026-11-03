<?php

declare(strict_types=1);

/*
 * Link previews for /promo-code/{CODE} and /promoters/{username}.
 *
 * WhatsApp, Viber, Facebook and the other link previewers do not run JavaScript, so they only see
 * the meta tags of the served HTML. This serves the built SPA (dist/index.html) with the title,
 * description and image of the code or the promoter already filled in; the app then renders as usual.
 */

const SITE_ORIGIN = 'https://snovi.fm';
const DEFAULT_IMAGE = SITE_ORIGIN.'/img/snovi1.jpg';

$apiOrigin = rtrim((string) (getenv('SNOVI_API_ORIGIN') ?: 'https://snovi.flexguide.org'), '/');
$template = @file_get_contents(__DIR__.'/dist/index.html');

if ($template === false) {
    http_response_code(503);
    exit('snovi.fm se upravo osvježava. Pokušajte ponovo za minut.');
}

/** GET {API}/api/{path} as an array; null when the API is down, slow or says 404. */
$fetchApi = static function (string $path) use ($apiOrigin): ?array {
    $curl = curl_init($apiOrigin.'/api/'.$path);
    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 2,
        CURLOPT_TIMEOUT => 3,
        CURLOPT_HTTPHEADER => ['Accept: application/json'],
    ]);
    $body = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    if ($status !== 200 || !is_string($body)) {
        return null;
    }

    $json = json_decode($body, true);

    return is_array($json['data'] ?? null) ? $json['data'] : null;
};

$absoluteUrl = static fn (?string $url): ?string => $url
    ? (preg_match('#^https?://#i', $url) ? $url : $apiOrigin.'/'.ltrim($url, '/'))
    : null;

$formatCode = static fn (string $code): string => implode(' ', str_split($code, 4));

/** 1 besplatan kod, 2-4 besplatna koda, 5+ besplatnih kodova (11-14 too). */
$codesWord = static function (int $count): string {
    $lastTwo = $count % 100;
    $last = $count % 10;

    return match (true) {
        $last === 1 && $lastTwo !== 11 => 'besplatan kod',
        $last >= 2 && $last <= 4 && ($lastTwo < 12 || $lastTwo > 14) => 'besplatna koda',
        default => 'besplatnih kodova',
    };
};

$route = (string) ($_GET['route'] ?? '');
$id = (string) ($_GET['id'] ?? '');

$meta = [
    'title' => 'snovi.fm - Vaš vaučer',
    'description' => 'Aktivirajte snovi.fm premium kodom iz vaučera: preuzmite aplikaciju i otvorite link na telefonu.',
    'image' => DEFAULT_IMAGE,
    'imageAlt' => 'Majka i dijete slušaju snovi.fm priču pred spavanje',
    'path' => '/promo-code',
    'type' => 'website',
    'robots' => 'noindex,nofollow',
];

if ($route === 'promo-code') {
    $code = strtoupper((string) preg_replace('/[^A-Za-z0-9]/', '', $id));

    if (strlen($code) === 12) {
        $meta['path'] = '/promo-code/'.$code;
        $preview = $fetchApi('gift-codes/'.rawurlencode($code).'/preview');
        $promoter = $preview['promoter'] ?? null;
        $state = $preview['state'] ?? 'valid';

        if ($state === 'used') {
            $meta['title'] = 'snovi.fm vaučer '.$formatCode($code).' je već aktiviran';
            $meta['description'] = 'Ovaj poklon je već iskorišten. snovi.fm donosi priče, uspavanke i ambijente za mirniji san djece.';
        } elseif ($state === 'expired') {
            $meta['title'] = 'snovi.fm vaučer '.$formatCode($code).' je istekao';
            $meta['description'] = 'Ovaj kod više ne važi. Pretplatu na snovi.fm možete obnoviti na snovi.fm/pretplata.';
        } else {
            $meta['title'] = $promoter
                ? 'Poklon od '.$promoter['name'].': snovi.fm premium'
                : 'Poklon za vas: snovi.fm premium';
            $meta['description'] = 'Kod '.$formatCode($code).' otključava sve priče, uspavanke i ambijente za mirniji san djece. Otvorite link na telefonu i poklon se aktivira u aplikaciji.';
        }

        if ($promoter && $absoluteUrl($promoter['photo_url'] ?? null)) {
            $meta['image'] = $absoluteUrl($promoter['photo_url']);
            $meta['imageAlt'] = $promoter['name'];
        }
    }
} elseif ($route === 'promoters') {
    $username = strtolower((string) preg_replace('/[^A-Za-z0-9._-]/', '', $id));
    $meta['path'] = '/promoters/'.$username;
    $promoter = $username !== '' ? $fetchApi('promoters/'.rawurlencode($username)) : null;

    if ($promoter) {
        $available = (int) ($promoter['codes_available'] ?? count($promoter['codes'] ?? []));
        $meta['title'] = $promoter['name'].' poklanja snovi.fm premium';
        $meta['description'] = trim(($promoter['headline'] ? rtrim($promoter['headline'], '.').'. ' : '')
            .($available > 0
                ? 'Još '.$available.' '.$codesWord($available).' za priče, uspavanke i ambijente za laku noć. Ko prvi aktivira, njegov je.'
                : 'Priče, uspavanke i ambijenti za mirniji san djece, uz preporuku '.$promoter['first_name'].'.'));
        $meta['image'] = $absoluteUrl($promoter['photo_url'] ?? null) ?? DEFAULT_IMAGE;
        $meta['imageAlt'] = $promoter['name'];
        $meta['type'] = 'profile';
        $meta['robots'] = 'index,follow,max-image-preview:large';
    } else {
        http_response_code(404);
        $meta['title'] = 'snovi.fm - Promoter nije pronađen';
        $meta['description'] = 'Priče, uspavanke i ambijenti za mirniji san djece.';
    }
}

$url = SITE_ORIGIN.$meta['path'];
$escape = static fn (string $value): string => htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');

$setTag = static function (string $html, string $tag, string $attrName, string $attrValue, string $valueAttr, string $value) use ($escape): string {
    $pattern = '/<'.$tag.'\b(?=[^>]*\b'.$attrName.'="'.preg_quote($attrValue, '/').'")[^>]*\/?>/is';
    $replacement = '<'.$tag.' '.$attrName.'="'.$attrValue.'" '.$valueAttr.'="'.$escape($value).'">';

    return preg_match($pattern, $html)
        ? (string) preg_replace_callback($pattern, static fn () => $replacement, $html, 1)
        : str_replace('</head>', $replacement."\n</head>", $html);
};

$html = (string) preg_replace_callback('/<title>[^<]*<\/title>/i', static fn () => '<title>'.$escape($meta['title']).'</title>', $template, 1);

foreach ([
    ['name', 'title', $meta['title']],
    ['name', 'description', $meta['description']],
    ['name', 'robots', $meta['robots']],
    ['property', 'og:type', $meta['type']],
    ['property', 'og:url', $url],
    ['property', 'og:title', $meta['title']],
    ['property', 'og:description', $meta['description']],
    ['property', 'og:image', $meta['image']],
    ['property', 'og:image:secure_url', $meta['image']],
    ['property', 'og:image:alt', $meta['imageAlt']],
    ['name', 'twitter:url', $url],
    ['name', 'twitter:title', $meta['title']],
    ['name', 'twitter:description', $meta['description']],
    ['name', 'twitter:image', $meta['image']],
] as [$attrName, $attrValue, $value]) {
    $html = $setTag($html, 'meta', $attrName, $attrValue, 'content', $value);
}

$html = $setTag($html, 'link', 'rel', 'canonical', 'href', $url);

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: public, max-age=300');
echo $html;
