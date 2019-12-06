import * as method from "./core";
const fs = require('fs'),
	path = require('path'),
	replace = require("replace");
interface searchTarget
{
	search: string,
	replacement: string,
	type: string,
	path: string,
	recursive: boolean,
	ignore: string[],
	global: boolean
}
interface processTarget
{
	ignore: string[],
	path: string
}
export function massReplace(filePath: string, defaultFile: boolean = false)
{
	var slashChar = method.slashType(filePath);
	var rootPath: string;
	const filePathSegments = filePath.split(slashChar);
	rootPath = filePathSegments.slice(0, filePathSegments.length - 1).join(slashChar);

	const data = method.readToml(filePath);
	const targets: searchTarget[] = data.targets;

	var globalIgnoreList: string[] = method.collectPaths(data.ignore, rootPath, true);

	var targetData: processTarget[] = [];
	targets.forEach(target =>
	{
		if (target.type && !method.isValue(target.type, ["case-sensitive", "d", "case-insensitive", "i", "conservative", "c", "preservative", "p", "regex-search", "s", "regex-replace", "r"]))
		{
			method.exit("ERROR invalid type flag");
		}
		const searchPath = target.path ? method.absolutePath(target.path, rootPath) : rootPath;
		var targetIgnoreList: string[] = [];
		const globalFlag: boolean = target.global ? target.global : false;

		if (target.path && target.ignore && target.ignore.length > 0)
		{
			targetIgnoreList = method.collectPaths(target.ignore, searchPath, false);

			if (globalFlag === true)
			{
				targetIgnoreList = targetIgnoreList.concat(globalIgnoreList);
			}
		}
		else
		{
			if (globalFlag === true)
			{
				targetIgnoreList = globalIgnoreList.slice();
			}
		}

		targetIgnoreList.push(method.absolutePath(filePath, rootPath));
		targetData.push({ ignore: targetIgnoreList, path: searchPath });
	});
	var counter = 0;
	targets.forEach(target =>
	{
		const searchString = method.escapeRegExp(target.search);
		const replacementString = method.escapeRegExp(target.replacement);
		const searchPath = targetData[counter].path;
		const targetIgnoreList = targetData[counter].ignore;
		const recursiveFlag: boolean = target.recursive ? target.recursive : true;
		if (method.isValue(target.type, ["case-insensitive", "i", "conservative", "c", "preservative", "p","regex-search", "s", "regex-replace", "r"]))
		{
			if (method.isValue(target.type, ["case-insensitive","i"]))
			{
				var filesList = method.getInclusions(searchPath, targetIgnoreList);
				var searchPattern = new RegExp(searchString, "i");
				while (method.searchInFiles(searchString, filesList, "i").length > 0)
				{
					replace({
						regex: searchPattern,
						replacement: target.replacement,
						paths: [searchPath],
						recursive: recursiveFlag,
						silent: false,
						exclude: targetIgnoreList.join(",")
					});
				}
			}
			else if (method.isValue(target.type, ["regex-search", "s", "regex-replace", "r"]))
			{
				var filesList = method.getInclusions(searchPath, targetIgnoreList);
				var searchPattern = new RegExp(eval(target.search));
				var replacementValue;
				if(method.isValue(target.type, ["regex-search", "s"]))
				{
					replacementValue = replacementString;
				}
				else
				{
					replacementValue = target.replacement;
				}
				while (method.searchInFiles(target.search, filesList, "r").length > 0)
				{
					replace({
						regex: searchPattern,
						replacement: replacementValue,
						paths: [searchPath],
						recursive: recursiveFlag,
						silent: false,
						exclude: targetIgnoreList.join(",")
					});
				}
			}
			else if (method.isValue(target.type, ["conservative", "c", "preservative", "p"]))
			{
				var searchStringCases: string[] = [];
				var replacementStringCases: string[] = [];

				searchStringCases = method.standardCase(searchString);
				if (method.isValue(target.type, ["preservative", "p"]))
				{
					replacementStringCases = method.standardCase(replacementString);
				}
				var replacementValue;
				for (var i = 0; i < 3; i++)
				{
					if (method.isValue(target.type, ["preservative", "p"]))
					{
						replacementValue = replacementStringCases[i];
					}
					else
					{
						replacementValue = replacementString;
					}
					replace({
						regex: searchStringCases[i],
						replacement: replacementValue,
						paths: [searchPath],
						recursive: recursiveFlag,
						silent: false,
						exclude: targetIgnoreList.join(",")
					});
				}
			}
		}
		else
		{
			replace({
				regex: searchString,
				replacement: target.replacement,
				paths: [searchPath],
				recursive: recursiveFlag,
				silent: false,
				exclude: targetIgnoreList.join(",")
			});
		}
		counter++;
	});
}