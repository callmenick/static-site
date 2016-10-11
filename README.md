# static-site

A very basic static site generator. Includes:

* pug
* sass

Works with github pages. Configure github pages to work from the `gh-pages` branch.

## Commands

* `npm run serve` - launches a local dev server
* `npm run build` - builds site for production
* `npm run deploy` - deploys site

## Configure

Configure the site by editing the two files in the config directory:

* `development.js`
* `production.js`

## Templating

This uses [pug](https://pugjs.org/api/getting-started.html) for templating. The templates are in the `src/views` directory. Note the following:

* main site layouts live in the `_layouts` directory, and can be used for major layouts. They can be extended.
* partials like headers and footers live in the `_partials` directory. They can be included.
* templates for various pages live in the `_templates` directory. They are optional, but can be helpful if you have templated pages like blog posts, etc.
* all other pages can exist anywhere, but should follow the format `page-name/index.pug`. That will get compiled to `page-name/index.html`, and therefore accessed on the live site via `http://sitename/page-name/`

Each template may include a variable block up top to configure the meta stuff. You can optionally add the following variables:

* `title` - overwrites the page title
* `description` - overwrites the page description

## CSS

This uses SCSS, and files live in the `src/scss` directory.

## JS

You can use es* JS. Just put files in the `src/js` directory.

## Images

They go in the `src/img` directory.

## Fonts

They go in the `src/fonts` directory.
