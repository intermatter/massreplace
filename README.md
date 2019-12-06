# Mass Replace

Mass search and replace utility using a TOML file.

## Installation

Globally
````
npm i -g massreplace
````

Or locally
````
npm i -D massreplace
````

## Usage

Create a TOML file anywhere, idealy in the root directory of your workspace or repository, specify the replacement targets and using the CLI, run

````(bash)
massreplace /path/to/file.toml
````

By default, the utility will look for a TOML file saved as `replace.toml` in the directory in which you run the command `massreplace` without specifying a file path.

### Example `replace.toml`

````(toml)
targets = [
  {
    search = "Foo", replacement = "bar", type = "r", path = "./", ignore = ["lib/"], recursive = true, global = true
  }
]
ignore = [
    "node_modules/"
]
````

### Interface

````()
targets: [array of objects] each of which defines a search and replace target.

    search: [string | regex] defines the target search string.

    replacement: [string | regex] defines the replacement string.

    type: [string] one flag can be specified using the complete name or the shorthand.
        - case-sensitive: ('s')
            Performs a case-sensitive string search.
            This flag will be used by default if no flag is specified.
        - case-insensitive: ('i')
            Performs a case-insensitive string search.
        - conservative: ('c')
            Performs a standard-case string search, replacing matches with the replacement string.
            e.g. ("Foo", "foo", "FOO") => "Bar"
        - preservative: ('p')
            Perfroms a standard-case string search, replacing matches with the corrosponding standard-case variation of the replacement string.
            e.g. ("Foo", "foo", "FOO") => ("Bar", "bar", "BAR")
        - regex-search: ('r')
            Perfroms a regex search, replacing matches with the replacement string.
        - regex-replace: ('x')
            Performs a regex search, replacing matches with the replacement regex pattern.

    scope: [string] one flag can be specified using the complete name or the shorthand.
        - content: ('c')
            Applies the search and replace target to any matching file content.
            This flag will be used by default if no flag is specified.
        - name: ('n')
            Applies the search and replace target to any matching file name or directory name.
        - file-name: ('f')
            Applies the search and replace target to any matching file name.
        - dir-name: ('d')
            Applies the search and replace target to any matching directory name.

    path: [string] defines the root search path for the target.

    recursive: [boolean = true] defines wether or not to search recursively.

    ignore: [array of strings] each of which defines a path to exclude locally.

    global: [boolean = false] if set, the target will inheret globally ignored paths.

ignore: [array of strings] each of which defines a path to exclude globally.
````

### `ignore` path rules

* Any valid absolute or a relative path can be specified in the `ignore` array.
* POSIX and Windows path types are both supported, however, you can use only one or the other.
* If a file name is specified, all matching files and directories will be ignored.
* If a file name followed by a forward slash or an escaped backslash is specified, only matching directories will be ignored.
* All non-absolute paths are relative to the root path (the directory which contains the TOML file).