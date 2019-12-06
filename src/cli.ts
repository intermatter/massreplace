#!/usr/bin/env node
import * as method from "./core";
import { massReplace } from "./replace";
const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);
const _filePath = args[0];
const _rootPath = process.cwd();
var filePath: string;
var defaultFile: boolean;
if (method.isValue(_filePath))
{
	filePath = path.resolve(_filePath);
	defaultFile = false;
} else
{
	filePath = path.join(_rootPath, "replace.toml");
	defaultFile = true;
}
var error: boolean = false;
if (fs.existsSync(filePath))
{
	if (fs.lstatSync(filePath).isFile())
	{
		massReplace(filePath, defaultFile);
	}
	else
	{
		error = true;
	}
}
else 
{
	error = true;
}
if (error)
{
	method.exit("ERROR file " + filePath + " does not exist.");
}