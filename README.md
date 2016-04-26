# Client Code

The client is built using Sass, rather than straight CSS.

This makes the CSS much more maintainable and consistent.

However, you will need a Sass compiler.

There are many available, such as [Koala](http://koala-app.com/), or the
[Sass-autocompile](https://atom.io/packages/sass-autocompile) package for
Atom.

### Running the Client Locally

You'll need some sort of webserver to run the client locally.

If you have Python, a very simple option is to launch Python as a
local webserver from the command line:
```
$ cd cs171-project/client
$ python -m SimpleHTTPServer 8888 &
```

and then in your browser, go to http://localhost:8888


If you don't have Python, you can use [MAMP](https://www.mamp.info/en/),
a free webserver for OSX and Windows.
