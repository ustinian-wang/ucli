# ucli

## Introduction

This is a command line tool for improving effective in development

## Installation

```shell
npm install @ustinian-wang/ucli -g
```

## commands

```shell
ucli --help
```

## docs

```shell
$ ucli --help
Usage: index [options] [command]

A CLI tool using inquirer and commander

Options:
  -V, --version                     output the version number
  -h, --help                        display help for command

Commands:
  git-wf                            generate workflows of git pages
  git-ignore                        generate common .gitignore
  git-check <all>                   check git commit
  we-robots <url> <content> <user>  send message to WeCom
  md-ods                            add .obsidian into current dir for markdown writing
  md-png2jpg                        convert png to jpg in docs/*md and then delete png files
  png2jpg <file>                    convert png to jpg
  help [command]                    display help for command
```