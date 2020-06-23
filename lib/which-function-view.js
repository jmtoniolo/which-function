'use babel';
import { CompositeDisposable } from 'atom';

export default class WhichFunctionView {

    constructor(statusBar) {
        this.currentFunction = "";
        this.currentFileType = "";
        this.currentEditor = "";
        this.statusBar = statusBar;

        this.element = document.createElement('encoding-selector-status')
        this.element.classList.add('encoding-status', 'inline-block')

        this.tile = this.statusBar.addLeftTile({priority: 0, item: this.element})

        this.cpp = ["cpp", "java"];
        this.python = ["py", "pl", "rb"];

        //functions needed for initial startup
        this.checkFileType();
        this.checkCurrentFunction();
        this.resetListeners();
    }

    debug() {
        console.log('---debug output---')
        console.log('function', this.currentFunction)
        console.log('filetype', this.currentFileType)
        console.log('editor', this.currentEditor)
    }

    // Returns an object that can be retrieved when package is activated
    serialize() {}
    
    resetListeners() {
        if( this.eventListeners )
            this.eventListeners.dispose();
        this.eventListeners = new CompositeDisposable();
        this.eventListeners.add(atom.workspace.onDidChangeActivePaneItem(() => {
            this.checkFileType();
            this.checkCurrentFunction();
            this.resetListeners() }));//any time the pane changes, call this function, dispose of all event listeners and remake them so they do not accumulate
        if( this.currentEditor ) {
            this.element.style.display = '';
            this.eventListeners.add(this.currentEditor.onDidChangeCursorPosition(( event ) => {            
                this.checkCurrentFunction();
            }));
        }
        else { //hide the status bar item if you are not currently in an editor (ex. settings page)
            this.element.style.display = 'none';
        }
    }

    // Tear down any state and detach
    destroy() {
        this.eventListeners.dispose();
        this.tile.destroy();
    }

    getElement() {
        return this.element;
    }

    checkCurrentFunction() {
        if(this.cpp.includes(this.currentFileType)) {
            this.checkCurrentFunctionCPP()
        }
        else if(this.python.includes(this.currentFileType)) {
            this.checkCurrentFunctionPython()
        }
        else {
            console.log('unsupported file type')
        }
        this.element.textContent = this.currentFunction;
    }

    checkFileType() {
        this.currentEditor = atom.workspace.getActiveTextEditor();
        if (this.currentEditor){
            currentFile = this.currentEditor.getTitle();
            splitFileName = currentFile.split('.');
            if(splitFileName.length > 1) {
                this.currentFileType = splitFileName[splitFileName.length - 1];
                this.checkCurrentFunction();
            }
            else {
                this.currentFileType = "";
            }
        }
        else {
            this.currentFileType = "";
        }
    }

    //check functions for CPP, also works for java since it finds the line of code thats a function
    //definition, then looks for the first word to the left of a '('
    checkCurrentFunctionCPP() {
        var cursorPosition = this.currentEditor.getCursorBufferPosition();
        var text = this.currentEditor.lineTextForBufferRow(cursorPosition.row);

        var hasLeft = false;
        var lastLeft = -1;
        if( text.includes('{') ) {
            hasLeft = true;
            lastLeft = cursorPosition.row;
        }

        //find the first { in a function
        var i;
        for( i = cursorPosition.row - 1; i >= -1; --i ) {
            if( i == -1 ) {
                this.currentFunction = "???";
                lastLeft = -1;
                break;
            }
            text = this.currentEditor.lineTextForBufferRow(i); //get line above cursor
            var includes = text.includes('}');
            if( includes && hasLeft ) { //if it has an ending bracket and last row read was beginning bracket
                break;
            }
            else if(text.includes('{')) {
                hasLeft = true;
                lastLeft = i;
            }
        }

        //find the function identifier mode immidietly to the left of the first { found above
        var functionLine;
        var done = false;
        for( i = lastLeft; i >= 0; --i ) {
            if(this.currentEditor.lineTextForBufferRow(i).includes('(')) {
                functionLine = this.currentEditor.lineTextForBufferRow(i).split(' ');
                var j;
                for( j = 0; j < functionLine.length; ++j ) {
                    if(functionLine[j].includes('(')){
                        //handle func (...
                        if( functionLine[j][0] == '(') {
                            this.currentFunction = functionLine[i-1];
                            done = true;
                        }
                        //handle func(...
                        else {
                            console.log('asdfasdfasdfasdfadsf')
                            this.currentFunction = (functionLine[j]).slice(0,(functionLine[j].length - 1));
                            done = true;
                        }
                    }
                    if(done) {
                        break;
                    }
                }
            }
            if(done) {
                break;
            }
        }
    }

    //looks for the 'def' or 'sub' reserved word that ruby/python/perl use
    //to define functions, simply looks for second word after def/sub
    checkCurrentFunctionPython() {
        var cursorPosition = this.currentEditor.getCursorBufferPosition();
        var text
        var i
        for( i = cursorPosition.row; i >= 0; --i ) {
            text = this.currentEditor.lineTextForBufferRow( i );
            text = text.split(' ');

            var isFunctionLinePy = text.includes('def')
            var isFunctionLinePerl = text.includes('sub')

            var keyword = '';
            if( isFunctionLinePy )      keyword = 'def'
            else if( isFunctionLinePy ) keyword = 'sub'
            
            if( keyword != '' ) {                
                defIndex = text.indexOf( keyword );

                var n = text[ defIndex + 1 ].indexOf( '(' )
                if( n > -1 ) {
                    text[ defIndex + 1 ] = text[ defIndex + 1 ].slice(0, n)
                }
                this.currentFunction = text[ defIndex + 1 ]
                break
            }
            else if( i == 0 ) {//the case where you are above the top level function and in the global scope, not a function scope
                this.currentFunction = "???";
            }
        }
    }
}
