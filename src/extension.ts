// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as lodash from 'lodash';
import fetch from 'node-fetch';
import { randomUUID } from 'crypto';

type Changelog = Record<string, {
	chars: number,
	lines: number,
}>;

const changeLog: Changelog = {};
const sessionId = randomUUID();
let productivity = 0;

const updateChangeLog = (props: {changeLog: Changelog, change: vscode.TextDocumentChangeEvent}): void => {
	const {change, changeLog} = props;

	const fileName = change.document.fileName;

	const log = changeLog[fileName];

	if(!log){
		changeLog[fileName] = {
			lines: 1,
			chars: 1,
		};
		return;
	}

	changeLog[fileName] = {
		lines: log.lines !== change.document.lineCount ? log.lines + 1 : log.lines,
		chars: log.chars + 1
	};
	return;
};

const headers ={
	'x-api-key': '4VP2CuScoJGs56cfiQlftyNMASdIB3ZebRWuIjLMK20Ih7Be0vHQFsxyoRiR1gqKk2y9EyAPdH7kuBYtxASp7eUW1mTnP4peCznerkqFX8srZ6fIHHUBLFcOnGzZ6dKj',
	'Content-Type': 'application/json'
};

const sendRequest = async (obj: any) => {
	console.log('sending request', JSON.stringify(obj));
	const response = await fetch('http://0.0.0.0:8080/flow-state', {method: 'POST', headers, body: JSON.stringify(obj) });

	const data = response.status;
	return obj;
};

const getUserInput = async () => {
    const userInput = await vscode.window.showInputBox({
        placeHolder: '1-10',
        prompt: 'Productivity report...',
    });

    if (userInput) {
		productivity = Number(userInput);
        vscode.window.showInformationMessage(`You entered: ${userInput}`);
    }
}

const throttleRequest = lodash.throttle(sendRequest, 30000);

const throttleInput = lodash.throttle(getUserInput, 600000, { leading: false });

const handleChange = (e: vscode.TextDocumentChangeEvent) => {
	console.log(JSON.stringify(e));
	updateChangeLog({changeLog, change: e});
	throttleRequest({sessionId, productivity, timeStamp: new Date().getTime(), changeLog});
	throttleInput();
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "flow-state" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('flow-state.launch', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello VS Code');
	});

	context.subscriptions.push(disposable);

	vscode.workspace.onDidChangeTextDocument(handleChange);
}

// This method is called when your extension is deactivated
export function deactivate() {}