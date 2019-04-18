# IFTTT CLI
Manage IFTTT from the command line.

# Featrues
IFTTT is a very useful service that links various services, but no API is provided. 
Creating a large number of applets can be difficult to manage and maintain. 
With this tool you can easily manage and maintain IFTTT from the command line. 

The specification starts Chrome in headless mode with Puppeteer and performs web operation in the background. 

# DEMO

![demo](https://raw.githubusercontent.com/miso-develop/ifttt-cli/master/images/demo.gif)

# Getting Started

## Prerequisites
An environment of Node.js v8.0.0 or higher is required. 

## Installation

```bash
$ npm install -g ifttt-cli
```

## Login
First, log in to IFTTT. 
Execute the following command to launch Chrome and display the IFTTT login screen. Please login. 

```bash
$ ifttt login
```

You can also login in headless mode by specifying the `-e, --email` option, followed by the e-mail address and password. 

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
Display a list of applets. 
The applet ID and applet name are displayed. 

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

Specifying the `-l, --long` option also displays trigger and action information. 

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
Get recipe information of specified applet ID. 
As JSON data is standard output, please reduce it when saving it. 

```bash
$ ifttt get <applet-id> > recipe.json
```

Specify `-a, --all` option instead of applet ID to get recipe information of all applets. 

```bash
$ ifttt get -a > all-recipe.json
```

## Create
Create an applet of recipe contents by specifying a recipe JSON file. 

```bash
$ ifttt create recipe.json
```

## Delete
Removes the applet with the specified applet ID. 

```bash
$ ifttt delete <applet-id>
```

## Update
Update the contents of the recipe by specifying the recipe JSON file. 

```bash
$ ifttt update recipe.json
```

## Connect
Connect to the specified service. 
If the service needs to log in, Chrome will be launched, so please use your browser to log in. 

An example of standard output JSON is [this](#recipe-json-sample).

```bash
$ ifttt connect <service-id>
```

## Logout
Log out of IFTTT. 

```bash
$ ifttt logout
```

## Recipe JSON sample
The following JSON data is a recipe when `Google Assistant` `Say a simple phrase` is specified as a trigger and `Webhooks` `Make a web request` is specified as an action. 

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
1. Fork it
1. Create your feature branch
1. Commit your changes
1. Push to the branch
1. Create new Pull Request

# License
[MIT](./LICENSE)

# Acknowledgments
This README is translated into English by Google Translate based on README_ja.md.
