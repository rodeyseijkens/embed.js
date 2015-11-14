class Highlight {
    constructor(output, options) {
        if (!hljs) {
            throw new ReferenceError(
                `'hljs is not defined. HighlightJS library is needed to highlight code. Visit https://highlightjs.org/'`
            );
        }
        this.output = output;
        this.options = options;
        this.regex = /(`{3})(\s|[a-z]+)\s*([\s\S]*?[^`])\s*\1(?!`)/gm;
        this.inlineCodeRegex = /(`)\s*([\s\S]*?[^`])\s*\1(?!`)/gm;
    }

    /**
     * Encodes the characters like <, > and space and replaces them with
     * &lt;, &gt; and &gt; respectively.
     * @param  {string} code The string that has to be encoded.
     * @return {string}      The encoded string
     */
    encode(code) {
        code = code.replace(/&amp;/gm, '');
        code = code.replace(/&lt;/g, '<');
        code = code.replace(/&gt;/g, '>');
        return code;
    }

    /**
     * removes whitespace characters
     * @param  {string} code The string from which the whitespace has to be removed
     * @return {string}
     */
    trimSpace(code) {
        code = code.replace(/^([ \t]*)/g, ''); // leading whitespace
        code = code.replace(/[ \t]*$/g, ''); // trailing whitespace
        return code;
    }

    /**
     * Places the code and the language name in the required template
     * @param {string} processedCode
     * @param {string} language
     * @return {string}
     */
    addTemplate(processedCode, language){
        return `<pre><code class="ejs-code hljs ${language}">${processedCode.value}</code></pre>`
    }

    /**
     * Replaces the code block with the pre tags and returns a string having the code
     * formatting using Highlight.js.
     * => Matches the string with the regex and finds the code written in three back-ticks ```
     * => Detects whether any language has been provided by the user.
     *     The format supported by embed.js is
     *         ```[language-name]
     *         var a = 2;
     *         ```
     * => Trims all the unnecessary spaces and newlines from the code.
     * => Passes the code to `hljs.highlightAuto(code, language)` which returns a formatted string
     *     having the html tags for styling. The `language` here is optional. In case we don't pass the
     *     language, it tries to detect the language itself.
     * => Replaces the code string in the template with the formatted string
     * @return {string} The string in which the code is formatted
     */
    process() {
        this.output = this.output.replace(this.inlineCodeRegex,(match,group1,group2)=>{
            return `<code>${group2}</code>`
        })

        let result = this.output.replace(this.regex, (match, group1, group2, group3) => {
            let code = group3;
            code = this.trimSpace(code);
            code = this.encode(code);

            // to prevent auto-linking. Not necessary in code
            // *blocks*, but in code spans. Will be converted
            // back after the auto-linker runs.
            code = code.replace(/:\/\//g, '~P');

            let language = group2.split('\n')[0];
            let highlightedCode;

            if (language) {
                highlightedCode = hljs.highlightAuto(code, [language]);
            } else {
                highlightedCode = hljs.highlightAuto(code);
                language = highlightedCode.language;
            }

            return this.addTemplate(highlightedCode, language);

        });
        return result;
    }
}

module.exports = Highlight;
