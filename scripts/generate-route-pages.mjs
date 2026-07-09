import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const templatePath = path.join(distDir, 'index.html');
const siteOrigin = 'https://snovi.fm';

const pages = [
  {
    route: '/sos-djecije-selo',
    lang: 'bs',
    locale: 'bs_BA',
    title: 'snovi.fm x SOS Dječije selo',
    description:
      'Kupi godišnju pretplatu za snovi.fm aplikaciju i podrži SOS Dječija sela. snovi.fm donira 20% od svake godišnje pretplate.',
    keywords: 'snovi.fm, SOS Dječije selo, SOS Dječija sela, godišnja pretplata, donacija, priče za djecu',
    image: `${siteOrigin}/img/sos-family-bg.jpg`,
    imageAlt: 'Porodica zajedno čita kao podrška snovi.fm i SOS Dječijim selima',
  },
  {
    route: '/metodologija',
    lang: 'bs',
    locale: 'bs_BA',
    title: 'snovi.fm - Metodologija',
    description: 'Saznajte kako snovi.fm koristi priče, neuroakustiku i večernje rituale za mirniji odlazak djece na spavanje.',
    keywords: 'snovi.fm metodologija, neuroakustika, spavanje djece, priče za laku noć',
    image: `${siteOrigin}/img/snovi34.jpg`,
    imageAlt: 'snovi.fm metodologija za dječije priče i miran san',
  },
  {
    route: '/ambijenti',
    lang: 'bs',
    locale: 'bs_BA',
    title: 'snovi.fm - Ambijenti',
    description: 'Istražite snovi.fm ambijente i zvučne pejzaže: kiša, šuma, valovi, vatra i drugi zvukovi za mirnije večeri.',
    keywords: 'snovi.fm ambijenti, zvučni pejzaži, bijeli šum, zvukovi za spavanje',
    image: `${siteOrigin}/img/snovi34.jpg`,
    imageAlt: 'snovi.fm ambijenti i zvučni pejzaži',
  },
  {
    route: '/biblioteka',
    lang: 'bs',
    locale: 'bs_BA',
    title: 'snovi.fm - Biblioteka snova',
    description: 'Pregledajte biblioteku snovi.fm priča, naratora i audio sadržaja za djecu i porodične večernje rituale.',
    keywords: 'snovi.fm biblioteka, priče za djecu, audio priče, bajke za laku noć',
    image: `${siteOrigin}/img/snovi34.jpg`,
    imageAlt: 'snovi.fm biblioteka priča za djecu',
  },
];

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

const replaceOrThrow = (html, pattern, replacement, label) => {
  if (!pattern.test(html)) {
    throw new Error(`Could not find ${label} in dist/index.html`);
  }

  return html.replace(pattern, replacement);
};

const setMetaTag = (html, attrName, attrValue, content) =>
  replaceOrThrow(
    html,
    new RegExp(`<meta\\b(?=[^>]*\\b${attrName}="${attrValue}")(?=[^>]*\\bcontent="[^"]*")[^>]*\\/?>`, 'is'),
    `<meta ${attrName}="${attrValue}" content="${escapeHtml(content)}">`,
    `meta ${attrName}=${attrValue}`,
  );

const setLinkTag = (html, rel, href) =>
  replaceOrThrow(
    html,
    new RegExp(`<link\\b(?=[^>]*\\brel="${rel}")(?=[^>]*\\bhref="[^"]*")[^>]*\\/?>`, 'is'),
    `<link rel="${rel}" href="${escapeHtml(href)}">`,
    `link rel=${rel}`,
  );

const setTitleTag = (html, title) =>
  replaceOrThrow(html, /<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`, 'title tag');

const setHtmlLang = (html, lang) =>
  replaceOrThrow(html, /<html\s+lang="[^"]+"/i, `<html lang="${lang}"`, 'html lang');

const buildPageHtml = (template, page) => {
  const url = `${siteOrigin}${page.route}`;
  let html = template;

  html = setHtmlLang(html, page.lang);
  html = setTitleTag(html, page.title);
  html = setMetaTag(html, 'name', 'title', page.title);
  html = setMetaTag(html, 'name', 'description', page.description);
  html = setMetaTag(html, 'name', 'keywords', page.keywords);
  html = setLinkTag(html, 'canonical', url);
  html = setMetaTag(html, 'property', 'og:locale', page.locale);
  html = setMetaTag(html, 'property', 'og:url', url);
  html = setMetaTag(html, 'property', 'og:title', page.title);
  html = setMetaTag(html, 'property', 'og:description', page.description);
  html = setMetaTag(html, 'property', 'og:image', page.image);
  html = setMetaTag(html, 'property', 'og:image:secure_url', page.image);
  html = setMetaTag(html, 'property', 'og:image:alt', page.imageAlt);
  html = setMetaTag(html, 'name', 'twitter:url', url);
  html = setMetaTag(html, 'name', 'twitter:title', page.title);
  html = setMetaTag(html, 'name', 'twitter:description', page.description);
  html = setMetaTag(html, 'name', 'twitter:image', page.image);

  return html;
};

const main = async () => {
  const template = await readFile(templatePath, 'utf8');

  await Promise.all(
    pages.map(async (page) => {
      const outputDir = path.join(distDir, page.route.replace(/^\//, ''));
      const outputPath = path.join(outputDir, 'index.html');
      const html = buildPageHtml(template, page);

      await mkdir(outputDir, { recursive: true });
      await writeFile(outputPath, html, 'utf8');
    }),
  );
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
