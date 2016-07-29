# Virtual DOM for Elm

A virtual DOM implementation that backs Elm's core libraries for [HTML](http://package.elm-lang.org/packages/elm-lang/html/latest/) and [SVG](http://package.elm-lang.org/packages/elm-lang/html/latest/). You should almost certainly use those higher-level libraries directly.

## About fork

This project is fork, which uses [snabbdom](https://github.com/paldepind/snabbdom) and [snabbdom-edge](https://github.com/katyo/snabbdom-edge).

The differences and improvements:

* Reading DOM tree before first patch (virtualizing real DOM tree)
* Abble to attach to root node (document.documentElement)

TODO:

* Server-side rendering

## How to use

I don't know the elegant way of overriding Elm packages for now.
You can experimenting with it by replacing original virtual-dom package in elm-stuff/packages.

Also, for now I use commonjs module system, so you must install snabbdom and snabbdom-edge using NPM or similar things and use browserify or webpack to build bundle.

I use `process.env.RUN_MODE` for conditional compilation for server or client.
You must use things like envify to set/replace this variable with "client" or "server".

The demo comming soon.
