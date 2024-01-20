import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("extension.nestScss", () => {
    nestSelectedScss();
  });

  context.subscriptions.push(disposable);

  // Register a keybinding for Alt + N
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      "extension.nestScssKeybinding",
      (editor, edit) => {
        nestSelectedScss();
      }
    )
  );
}

function nestStructure(scssCode: string): string {
  // Your custom nesting logic using regular expressions
  // This is a simple example; you may need to enhance it based on your specific needs
  return scssCode.replace(
    /(\s*)\.([^{]+)(?:\s*\{([^{}]+)\})?/g,
    (match, spaces, selector, innerContent) => {
      if (innerContent) {
        // Add spaces before selector to match the indentation level
        const indentedSelector = spaces + selector.trim();
        // Indent the inner content
        const indentedInnerContent = innerContent.replace(
          /\n/g,
          "\n" + spaces + "  "
        );
        // Nest the structure
        return `${indentedSelector} {\n${spaces}  ${indentedInnerContent}\n${spaces}}`;
      } else {
        return match;
      }
    }
  );
}

function nestSelectedScss() {
  const editor = vscode.window.activeTextEditor;

  if (editor) {
    const document = editor.document;
    const selection = editor.selection;

    if (!selection.isEmpty) {
      const range = new vscode.Range(selection.start, selection.end);
      const selectedText = document.getText(range);

      // Nest the selected SCSS code
      const nestedScss = nestStructure(selectedText);

      editor.edit((editBuilder) => {
        editBuilder.replace(range, nestedScss);
      });
    }
  }
}
