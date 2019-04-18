# IFTTT CLI
IFTTT をコマンドラインから管理するツールです。 

# Featrues
IFTTT は様々なサービスを連携してくれる大変便利なサービスですが、API が提供されていません。 
アプレットを多数作成すると管理やメンテナンスが困難になってきます。 
このツールを使えば IFTTT の管理やメンテナンスをコマンドラインによって簡単に行えます。 

仕組みは Puppeteer にて Chrome をヘッドレスモードで起動し、バックグラウンドで Web 操作を行います。 

# DEMO

![demo](https://github.com/miso-develop/ifttt-cli-dev/images/demo.gif)

# Getting Started

## Prerequisites
Node.js v8.0.0以上の環境が必要です。 

## Installation

```bash
$ npm install -g ifttt-cli
```

## Login
IFTTT へのログインを行います。 
以下のコマンドを実行すると Chrome が起動し IFTTT のログイン画面が表示されるのでログインしてください。 

```bash
$ ifttt login
```

`-e, --email`オプションに続けてメールアドレスとパスワードを指定することでヘッドレスモードでログインできます。 

```bash
$ ifttt login -e email@example.com password
```

# Usage

```bash
$ ifttt --help
ifttt [options] <command>

Control IFTTT from the command line.

Commands:
  ifttt [options] <command>                 Control IFTTT from the command line.
                                                                       [default]
  ifttt login [-e, --email <mail address>   Log in to IFTTT.
  <password>]                               If the option is omitted, please log
                                            in from the launched browser.
  ifttt logout                              Log out of IFTTT.
  ifttt connect <service>                   Connect to the specified service.
  ifttt list [-l, --long]                   Display a list of applets.
                                            Use the `-l, --long` option to
                                            display the details.
  ifttt get [id..]                          Get the applet recipe.
                                            The recipe of all applets is
                                            acquired by specifying `-a, --all`
                                            option.
  ifttt create <file>                       Create the applet.
                                            Specify and execute a JSON file
                                            containing a recipe.
  ifttt delete <id..>                       Remove the applet.
                                            Specify the ID of the applet you
                                            want to delete and execute it.
  ifttt update <file>                       Update the applet.
                                            Specify and execute a JSON file
                                            containing a recipe.

Positionals:
  command
     [required] [choices: "login", "logout", "connect", "list", "get", "create",
                                                             "delete", "update"]

Options:
  -b, --browser, --no-headless  Control while displaying chrome.       [boolean]
  -h, --help                    Show help                              [boolean]
  -v, --version                 Show version number                    [boolean]
```

## List
アプレットの一覧を表示します。 
アプレット ID 、アプレット名が表示されます。 

```bash
$ ifttt list
┌───────────┬─────────┐
│ ID        │ Name    │
├───────────┼─────────┤
│ 12345678d │ applet1 │
├───────────┼─────────┤
│ 23456789d │ applet2 │
├───────────┼─────────┤
│ 34567890d │ applet3 │
└───────────┴─────────┘

```

`-l, --long`オプションを指定するとトリガーやアクションの情報も表示されます。 

```bash
$ ifttt list -l
┌───────────┬─────────┬──────────────────┬──────────┬────────┐
│ ID        │ Name    │ Trigger          │ Action   │ Status │
├───────────┼─────────┼──────────────────┼──────────┼────────┤
│ 12345678d │ applet1 │ Google Assistant │ Webhooks │ true   │
├───────────┼─────────┼──────────────────┼──────────┼────────┤
│ 23456789d │ applet2 │ Amazon Alexa     │ Webhooks │ false  │
├───────────┼─────────┼──────────────────┼──────────┼────────┤
│ 34567890d │ applet3 │ Webhooks         │ Clova    │ true   │
└───────────┴─────────┴──────────────────┴──────────┴────────┘

```

## Get
指定のアプレット ID のレシピ情報を取得します。 
JSON データが標準出力されるので、保存する場合はリダイレクトしてください。 

標準出力されるJSONの例は[こちら](#recipe-json-sample)。

```bash
$ ifttt get <applet-id> > recipe.json
```

アプレット ID の代わりに`-a, --all`オプションを指定すると全てのアプレットのレシピ情報を取得します。 

```bash
$ ifttt get -a > all-recipe.json
```

## Create
レシピの JSON ファイルを指定することでレシピの内容のアプレットを作成します。 

```bash
$ ifttt create recipe.json
```

## Delete
指定のアプレット ID のアプレットを削除します。 

```bash
$ ifttt delete <applet-id>
```

## Update
レシピの JSON ファイルを指定することでレシピの内容のアプレットを更新します。 

```bash
$ ifttt update recipe.json
```

## Connect
指定のサービスへの Connect を行います。 
サービス側でログインが必要な場合は Chrome が起動されるのでブラウザを操作してログインを行ってください。 

```bash
$ ifttt connect <service-id>
```

## Logout
IFTTT からログアウトします。 

```bash
$ ifttt logout
```

## Recipe JSON sample
以下の JSON データはトリガーに `Google Assistant` の `Say a simple phrase` を、アクションに `Webhooks` の `Make a web request` を指定した場合のレシピです。 

```json
[
  {
    "id": "12345678d",
    "name": "applet name",
    "notification": false,
    "status": true,
    "trigger": {
      "service": "google_assistant",
      "type": "simple_voice_trigger",
      "fields": [
        {
          "name": "voice_input_1",
          "value": "sample",
          "type": "text_field"
        },
        {
          "name": "voice_input_2",
          "value": "",
          "type": "text_field"
        },
        {
          "name": "voice_input_3",
          "value": "",
          "type": "text_field"
        },
        {
          "name": "tts_response",
          "value": "sample",
          "type": "text_field"
        },
        {
          "name": "supported_languages_for_user",
          "value": "en",
          "type": "collection_select"
        }
      ]
    },
    "action": {
      "service": "maker_webhooks",
      "type": "make_web_request",
      "fields": [
        {
          "name": "url",
          "value": "https://example.com/",
          "type": "text_field"
        },
        {
          "name": "method",
          "value": "GET",
          "type": "collection_select"
        },
        {
          "name": "content_type",
          "value": "application/json",
          "type": "collection_select"
        },
        {
          "name": "body",
          "value": "sample",
          "type": "text_field"
        }
      ]
    }
  }
]
```

# Built With
* [Puppeteer](https://github.com/GoogleChrome/puppeteer)
* [Yargs](https://github.com/yargs/yargs)
* [rimraf](https://github.com/isaacs/rimraf)
* [Table](https://github.com/gajus/table)
* [validator.js](https://github.com/chriso/validator.js)

# Contribution
1. フォークします
1. featureブランチを作成します
1. 変更をコミットします
1. ブランチにプッシュします
1. 新しいプルリクエストを作成します

# License
[MIT](./LICENSE)
