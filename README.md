# which-function

*Currently in development. Please report bugs.*

![which-function demo](https://raw.githubusercontent.com/jmtoniolo/which-function/master/img/cppzoomy.gif) ![which-function demo](https://raw.githubusercontent.com/jmtoniolo/which-function/master/img/pythonzoomy.gif)

# What is which-function?
which-function is an open sourced extension package for the Atom text editor. When your cursor changes positions the package searches the lines above your cursor until it finds a function signature (performed asynchronously so as not to interupt the main thread). The package currently displays the nearest function above your cursor, so if you are below a function but outside its scope, it will still display that function as your "current function". The function identifier is displayed in the status bar, adjacent to the file path. If no function is found above the cursor "???" is displayed. 

![status bar image](https://raw.githubusercontent.com/jmtoniolo/which-function/master/img/statusBar.gif)

## which-function supported languages
- Python
- Ruby
- Pearl
- C++

### language support currently in development
- *Java*
- *Lua*
- *Javascript*
- *C#*

