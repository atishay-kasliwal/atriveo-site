import {defineConfig} from 'astro/config';
import sitemap from '@astrojs/sitemap';
export default defineConfig({site:'https://medscan.atriveo.com',integrations:[sitemap()],trailingSlash:'always'});
