import React from 'react';
import NextHead from 'next/head';
import { string } from 'prop-types';

const defaultDescription = '';
const defaultOGURL = '';
const defaultOGImage = '';

const Head = props => (
  <NextHead>
    <meta charSet="UTF-8" />
    <title>{props.title || ''}</title>
    <meta
      name="description"
      content={props.description || defaultDescription}
    />
    <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no" />
    <link rel="icon" href="/favicon.ico" />
    <meta property="og:url" content={props.url || defaultOGURL} />
    <meta property="og:title" content={props.title || ''} />
    <meta
      property="og:description"
      content={props.description || defaultDescription}
    />
    <meta name="twitter:site" content={props.url || defaultOGURL} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content={props.ogImage || defaultOGImage} />
    <meta property="og:image" content={props.ogImage || defaultOGImage} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    {/* <!-- UC Mobile Browser  --> */}
    <meta name="full-screen" content="yes" />
    <meta name="browsermode" content="application" />

    {/* <!-- Android  --> */}
    <meta name="theme-color" content="white" />
    <meta name="mobile-web-app-capable" content="yes" />

    {/* <!-- iOS --> */}
    <meta name="apple-mobile-web-app-title" content={props.title || ''} />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />

    {/* <!-- Windows  --> */}
    <meta name="msapplication-navbutton-color" content="white" />
    <meta name="msapplication-TileColor" content="white" />
    <meta name="msapplication-TileImage" content="ms-icon-144x144.png" />
    <meta name="msapplication-config" content="browserconfig.xml" />

    {/* <!-- Pinned Sites  --> */}
    <meta name="application-name" content={props.title || ''} />
    <meta name="msapplication-tooltip" content="Tooltip Text" />
    <meta name="msapplication-starturl" content="/" />

    <meta name="screen-orientation" content="portrait" />

    <link href="icon-192x192.png" rel="icon" sizes="192x192" />
    <link href="icon-128x128.png" rel="icon" sizes="128x128" />

    <link href="/manifest.json" rel="manifest" />
  </NextHead>
);

Head.propTypes = {
  title: string,
  description: string,
  url: string,
  ogImage: string,
};

export default Head;
