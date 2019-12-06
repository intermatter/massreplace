import * as method from "./core";
const fs = require('fs'),
	path = require('path'),
	replace = require("replace");
interface searchTarget
{
	search: string,
	replacement: string,
	type: string,
	scope: string,
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
		if (target.type && !method.isValue(target.type, ["case-sensitive", "s", "case-insensitive", "i", "conservative", "c", "preservative", "p", "regex-search", "r", "regex-replace", "x"]))
		{
			method.exit("ERROR invalid type flag");
		}
		if (target.scope && !method.isValue(target.scope, ["content", "c", "name", "n", "file-name", "f", "dir-name", "d"]))
		{
			method.exit("ERROR invalid scope flag");
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
		const targetType = method.isValue(target.type, ["case-sensitive", "s", "case-insensitive", "i", "conservative", "c", "preservative", "p","regex-search", "r", "regex-replace", "x"]) ? target.type : "s";
		const targetScope = method.isValue(target.scope, ["content", "c", "name", "n", "file-name", "f", "dir-name", "d"]) ? target.scope : "c";

		if(method.isValue(targetScope, ["content", "c"]))
		{
			// Handle File content Scope
			if (method.isValue(targetType, ["case-sensitive","s"]))
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
			else if (method.isValue(targetType, ["case-insensitive","i"]))
			{
				const filesList = method.getInclusions(searchPath, targetIgnoreList);
				const searchPattern = new RegExp(searchString, "i");
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
			else if (method.isValue(targetType, ["regex-search", "r", "regex-replace", "x"]))
			{
				const filesList = method.getInclusions(searchPath, targetIgnoreList);
				const searchPattern = new RegExp(eval(target.search));
				const replacementValue = method.isValue(targetType, ["regex-search", "r"]) ?
				replacementString : target.replacement;

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
			else if (method.isValue(targetType, ["conservative", "c", "preservative", "p"]))
			{
				const searchStringCases: string[] = method.standardCase(searchString);
				const replacementStringCases: string[] = method.isValue(targetType, ["preservative", "p"]) ?
				method.standardCase(replacementString) : [];

				var replacementValue;
				for (var i = 0; i < 3; i++)
				{
					replacementValue = method.isValue(targetType, ["preservative", "p"]) ? 
					replacementStringCases[i] : replacementString;

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
		// Handle file and directory name scope
		else if(method.isValue(targetScope, ["name", "n", "file-name", "f", "dir-name", "d"]))
		{
			var filesList: string[] = [];

			if(method.isValue(targetScope, ["file-name", "f"]))
			{
				filesList = method.getOnly(method.getInclusions(searchPath, targetIgnoreList), "f");
			}
			else if(method.isValue(targetScope, ["dir-name", "d"]))
			{
				filesList = method.getOnly(method.getInclusions(searchPath, targetIgnoreList), "d");
			}
			else
			{
				filesList = method.getInclusions(searchPath, targetIgnoreList);
			}

			if (method.isValue(targetType, ["case-sensitive","s"]))
			{
				filesList.filter(someFile => {
					return someFile.match(searchString);
				}).forEach(someFile => {
					fs.renameSync(someFile, someFile.replace(searchString, replacementString));
				});
			}
			else if (method.isValue(targetType, ["case-insensitive","i"]))
			{
				const searchPattern = new RegExp(searchString, "i");

				filesList.filter(someFile => {
					return someFile.match(searchPattern);
				}).forEach(someFile => {
					fs.renameSync(someFile, someFile.replace(searchPattern, replacementString));
				});
			}
			else if (method.isValue(targetType, ["regex-search", "r", "regex-replace", "x"]))
			{
				const replacementValue = method.isValue(targetType, ["regex-search", "r"]) ?
				replacementString : target.replacement;

				const searchPattern = new RegExp(eval(target.search));
				filesList.filter(someFile => {
					return someFile.match(searchPattern);
				}).forEach(someFile => {
					fs.renameSync(someFile, someFile.replace(searchPattern, replacementValue));
				});
			}
			else if (method.isValue(targetType, ["conservative", "c", "preservative", "p"]))
			{
				const searchStringCases: string[] = method.standardCase(searchString);
				const replacementStringCases: string[] = method.isValue(targetType, ["preservative", "p"]) ?
				method.standardCase(replacementString) : [];

				for (var i = 0; i < 3; i++)
				{
					const replacementValue = method.isValue(targetType, ["preservative", "p"]) ? 
					replacementStringCases[i] : replacementString;

					filesList.filter(someFile => {
						return someFile.match(searchStringCases[i]);
					}).forEach(someFile => {
						fs.renameSync(someFile, someFile.replace(searchStringCases[i], replacementValue));
					});
				}
			}
		}
		counter++;
	});
}