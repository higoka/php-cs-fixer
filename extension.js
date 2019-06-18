const vscode = require('vscode')
const { exec } = require('child_process')

function activate(context) {
  if (vscode.window.activeTextEditor.document.languageId !== 'php') {
    return
  }

  const config = vscode.workspace.getConfiguration('php-cs-fixer')

  context.subscriptions.push(vscode.commands.registerCommand('php-cs-fixer.fix', function () {
    const param = []

    if (config.executable) {
      param.push(config.executable)
    }

    param.push(`fix ${vscode.window.activeTextEditor.document.fileName}`)

    if (config.configFile) {
      param.push(`--config=${config.configFile}`)
    }

    // console.log(param.join(' '))

    exec(param.join(' '), function (err, stdout, stderr) {
      if (err) {
        vscode.window.showErrorMessage('PHP-CS-Fixer: An error occurred.')
        throw err
      }

      vscode.window.showInformationMessage('PHP-CS-Fixer: File successfully fixed.')
    })
  }))

  context.subscriptions.push(vscode.workspace.onWillSaveTextDocument(function (e) {
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
