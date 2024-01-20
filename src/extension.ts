import postcss from 'postcss';
import nested from 'postcss-nested';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext): void {
    let disposable = vscode.commands.registerTextEditorCommand(
        'extension.nest',
        function (textEditor: vscode.TextEditor) {
            const selectedText = textEditor.document.getText(textEditor.selection);
            const processedText = processCss(selectedText, true);
            updateEditor(textEditor, processedText);
        }
    );
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerTextEditorCommand(
        'extension.unNest',
        function (textEditor: vscode.TextEditor) {
            const selectedText = textEditor.document.getText(textEditor.selection);
            const processedText = processCss(selectedText, false);
            updateEditor(textEditor, processedText);
        }
    );
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerTextEditorCommand(
        'extension.nestAndUnNest',
        function (textEditor: vscode.TextEditor) {
            const selectedText = textEditor.document.getText(textEditor.selection);
            // Toggle between nesting and unnesting based on the current indentation
            const isIndented = selectedText.startsWith('  ');
            const processedText = processCss(selectedText, !isIndented);
            updateEditor(textEditor, processedText);
        }
    );
    context.subscriptions.push(disposable);
}

function nestUnnest(text: string, nest: boolean): string {
    // Implement your logic to nest or unnest CSS rules here.
    // You might want to use a CSS parser to manipulate the rules.

    // For simplicity, let's assume a simple implementation.
    const lines = text.split('\n');
    const indentedLines = lines.map((line) => (nest ? '  ' + line : line.trim()));

    return indentedLines.join('\n');
}

function processCss(input: string, nest: boolean): string {
    const result = postcss([nested]).process(input, {
        syntax: require('postcss-scss'), // Assuming the input might be SCSS syntax
        from: undefined
    });

    const processed = nest ? result.css : result.root!.toString();

    return processed;
}

function updateEditor(editor: vscode.TextEditor, newText: string) {
    const currentSelection = editor.selection;
    editor.edit((editBuilder) => {
        editBuilder.replace(currentSelection, newText);
    });
}

// function nestStructure(scssCode: string): string {
//   // Your custom nesting logic using regular expressions
//   // This is a simple example; you may need to enhance it based on your specific needs
//   return scssCode.replace(
//     /(\s*)\.([^{]+)(?:\s*\{([^{}]+)\})?/g,
//     (match, spaces, selector, innerContent) => {
//       if (innerContent) {
//         // Add spaces before selector to match the indentation level
//         const indentedSelector = spaces + selector.trim();
//         // Indent the inner content
//         const indentedInnerContent = innerContent.replace(
//           /\n/g,
//           "\n" + spaces + "  "
//         );
//         // Nest the structure
//         return `${indentedSelector} {\n${spaces}  ${indentedInnerContent}\n${spaces}}`;
//       } else {
//         return match;
//       }
//     }
//   );
// }

// function nestSelectedScss(
//   textEditor: vscode.TextEditor,
//   textEditorEdit: vscode.TextEditorEdit
// ) {
//   const config = vscode.workspace.getConfiguration("nest-scss");
//   const pxPerRem = config.get("px-per-rem");
//   var regexStr = "([0-9]*\\.?[0-9]+)rem";
//   placeholder(
//     regexStr,
//     (match, value) => `${rem2Px(value, pxPerRem)}px`,
//     textEditor,
//     textEditorEdit
//   );

//   const editor = vscode.window.activeTextEditor;

//   if (editor) {
//     const document = editor.document;
//     const selection = editor.selection;

//     if (!selection.isEmpty) {
//       const range = new vscode.Range(selection.start, selection.end);
//       const selectedText = document.getText(range);

//       // Nest the selected SCSS code
//       const nestedScss = nestStructure(selectedText);

//       editor.edit((editBuilder) => {
//         editBuilder.replace(range, nestedScss);
//       });
//     }
//   }
// }

export function deactivate() {}

// function px2Rem(px: number): number {
//     return parseFloat((px / 16).toFixed(3));
// }

// function rem2Px(rem: number): number {
//     return parseFloat((rem * 16).toFixed(3));
// }

// function findValueRangeToConvert(
//     selection: vscode.Selection,
//     regexString: string,
//     textEditor: vscode.TextEditor
// ): vscode.Range | null {
//     const line = selection.start.line;
//     const startChar = selection.start.character;
//     const text = textEditor.document.lineAt(line).text;
//     const regexExpG = new RegExp(regexString, 'ig');

//     let result;
//     while ((result = regexExpG.exec(text))) {
//         const resultStart = result.index;
//         const resultEnd = result.index + result[0].length;
//         if (startChar >= resultStart && startChar <= resultEnd) {
//             return new vscode.Range(line, resultStart, line, resultEnd);
//         }
//     }
//     return null;
// }

// function placeholder(
//     regexString: string,
//     replaceFunction: (match: string, ...args: string[]) => string,
//     textEditor: vscode.TextEditor,
//     textEditorEdit: vscode.TextEditorEdit
// ) {
//     let regexExpG = new RegExp(regexString, 'ig');
//     // clones selections
//     const selections = textEditor.selections;
//     // Check if there is some text selected
//     if ((selections?.reduce((acc, val) => acc || val.isEmpty), false)) {
//         return;
//     }
//     const changesMade = new Map();
//     textEditor
//         .edit((builder) => {
//             // Declaration of auxiliar variables
//             let numOcurrences = 0;
//             selections.forEach((selection) => {
//                 // Iterates over each selected line
//                 for (let i: number = selection.start.line; i <= selection.end.line; i++) {
//                     let start = 0,
//                         end = textEditor.document.lineAt(i).range.end.character;
//                     // Gets the first and last selected characters for the line
//                     if (i === selection.start.line) {
//                         let tmpSelection = new vscode.Selection(selection.start, selection.start);
//                         let range = findValueRangeToConvert(tmpSelection, regexString, textEditor);
//                         if (range) {
//                             start = range.start.character;
//                         } else {
//                             start = selection.start.character;
//                         }
//                     }
//                     if (i === selection.end.line) {
//                         let tmpSelection = new vscode.Selection(selection.end, selection.end);
//                         let range = findValueRangeToConvert(tmpSelection, regexString, textEditor);
//                         if (range) {
//                             end = range.end.character;
//                         } else {
//                             end = selection.end.character;
//                         }
//                     }
//                     // Gets the text of the line
//                     let text = textEditor.document.lineAt(i).text.slice(start, end);
//                     // Counts the number of times the regex appears in the line
//                     const matches = text.match(regexExpG);
//                     numOcurrences += matches ? matches.length : 0;
//                     if (numOcurrences === 0) {
//                         continue;
//                     } // No occurrences, so it's worth continuing
//                     //
//                     const newText = text.replace(regexExpG, replaceFunction);
//                     // Replace text in the text file
//                     const selectionTmp = new vscode.Selection(i, start, i, end);
//                     const key = `${i}-${start}-${end}`;
//                     if (!changesMade.has(key)) {
//                         changesMade.set(key, true);
//                         builder.replace(selectionTmp, newText);
//                     }
//                 }
//                 return;
//             });
//             if (numOcurrences === 0) {
//                 vscode.window.showWarningMessage('There were no values to transform');
//             }
//         })
//         .then((success) => {
//             textEditor.selections = textEditor.selections.map((selection, index) => {
//                 if (selections[index].start.isEqual(selections[index].end)) {
//                     const newPosition = selection.end;
//                     return new vscode.Selection(newPosition, newPosition);
//                 }
//                 return selection;
//             });

//             if (!success) {
//                 console.log(`Error: ${success}`);
//             }
//         });
// }
