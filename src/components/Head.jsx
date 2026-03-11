import NextHead from 'next/head';

const defaultDescription = 'Alkitab Mini — daily Bible verse reader';
const defaultOGURL = '';
const defaultOGImage = '/android-chrome-512x512.png';

const Head = (props) => (
  <NextHead>
    <meta charSet="UTF-8" />
    <title>
      {props.title ? `${props.title} · Alkitab Mini` : 'Alkitab Mini'}
    </title>
    <meta
      name="description"
      content={props.description || defaultDescription}
    />
    <meta
      name="viewport"
      content="width=device-width,initial-scale=1,minimum-scale=1,viewport-fit=cover"
    />
    <link rel="icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

    {/* Open Graph */}
    <meta property="og:url" content={props.url || defaultOGURL} />
    <meta property="og:title" content={props.title || 'Alkitab Mini'} />
    <meta
      property="og:description"
      content={props.description || defaultDescription}
    />
    <meta property="og:image" content={props.ogImage || defaultOGImage} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    {/* Twitter / X Card */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content={props.url || defaultOGURL} />
    <meta name="twitter:title" content={props.title || 'Alkitab Mini'} />
    <meta
      name="twitter:description"
      content={props.description || defaultDescription}
    />
    <meta name="twitter:image" content={props.ogImage || defaultOGImage} />

    {/* PWA / Mobile */}
    <meta name="theme-color" content="white" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta
      name="apple-mobile-web-app-title"
      content={props.title || 'Alkitab Mini'}
    />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="msapplication-navbutton-color" content="white" />
    <meta name="msapplication-TileColor" content="white" />
    <meta
      name="msapplication-TileImage"
      content="/android-chrome-192x192.png"
    />
    <meta name="application-name" content={props.title || 'Alkitab Mini'} />
    <meta name="screen-orientation" content="portrait" />
    <meta name="full-screen" content="yes" />
    <meta name="browsermode" content="application" />

    <link href="/manifest.json" rel="manifest" />
  </NextHead>
);

export default Head;
