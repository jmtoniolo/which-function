'use babel';

import WhichFunctionView from './which-function-view';
import { CompositeDisposable } from 'atom';

export default {

    whichFunctionView: null,
    modalPanel: null,
    subscriptions: null,


    activate(state) {
        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'which-function:toggle': () => this.toggle(),
            'which-function:debug': () => this.debug()
        }));
    },

    consumeStatusBar( statusBar ) {
        this.whichFunctionView = new WhichFunctionView(statusBar);
    },

    deactivate() {
        this.modalPanel.destroy();
        this.subscriptions.dispose();
        this.whichFunctionView.destroy();
        this.statusBarTile.detroy();
    },

    serialize() {
        return null;

    },

    toggle() {
        console.log('WhichFunction was toggled!');     
    },

    debug() {
        this.whichFunctionView.debug();
    }

};





