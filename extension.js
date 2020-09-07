const vscode = require('vscode')
const { exec } = require('child_process')

function activate(context) {
  if (vscode.window.activeTextEditor.document.languageId !== 'php') {
    return
  }

  const config = vscode.workspace.getConfiguration('php-cs-fixer')

  context.subscriptions.push(vscode.commands.registerCommand('php-cs-fixer.fix', () => {
    if (!config.configFile && config.pathMode === 'intersection') {
      return vscode.window.showErrorMessage('PHP-CS-Fixer: Path mode "intersection" requires a config file be set. Please set one or change path mode to "override".')
    }

    const param = []

    if (config.executable) {
      param.push(config.executable)
    }

    param.push(`fix '${vscode.window.activeTextEditor.document.fileName}' --using-cache=no`)

    if (config.configFile) {
      param.push(`--config=${config.configFile}`)
    }

    if (config.pathMode) {
      param.push(`--path-mode=${config.pathMode}`)
    }

    exec(param.join(' '), (err, stdout, stderr) => {
      if (err) {
        vscode.window.showErrorMessage('PHP-CS-Fixer: An error occurred.')
        throw err
      }
    })
  }))

  context.subscriptions.push(vscode.workspace.onWillSaveTextDocument((e) => {
    if (e.document.languageId === 'php' && config.onSave) {
      e.waitUntil(vscode.commands.executeCommand('php-cs-fixer.fix'))
    }
  }))
}

function deactivate() { }

module.exports = {
  activate,
  deactivate
}
