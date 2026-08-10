        extractCssUrls: (cssText: string) => {
          const results: Array<{ url: string; fullMatch: string; start: number; end: number }> = [];
          let i = 0;
          const len = cssText.length;

          while (i < len) {
            // Look for 'url(' — case insensitive
            if (
              i + 3 < len &&
              cssText[i].toLowerCase() === 'u' &&
              cssText[i + 1].toLowerCase() === 'r' &&
              cssText[i + 2].toLowerCase() === 'l' &&
              cssText[i + 3] === '('
            ) {
              const urlStart = i;
              i += 4; // skip 'url('

              // Skip whitespace
              while (
                i < len &&
                (cssText[i] === ' ' ||
                  cssText[i] === '	' ||
                  cssText[i] === '
')
              ) {
                i++;
              }

              // Check for quote
              let quote: string | null = null;
              if (i < len && (cssText[i] === '"' || cssText[i] === ''')) {
                quote = cssText[i];
                i++;
              }

              // Read the URL value
              let url = '';
              if (quote) {
                // Quoted: read until matching unescaped quote
                while (i < len && cssText[i] !== quote) {
                  if (cssText[i] === '' && i + 1 < len) {
                    i++; // skip backslash
                    url += cssText[i]; // include next char literally
                  } else {
                    url += cssText[i];
                  }
                  i++;
                }
                if (i < len) i++; // skip closing quote
              } else {
                // Unquoted: stop at ) or whitespace (per CSS spec)
                while (
                  i < len &&
                  cssText[i] !== ')' &&
                  cssText[i] !== ' ' &&
                  cssText[i] !== '	' &&
                  cssText[i] !== '
'
                ) {
                  url += cssText[i];
                  i++;
                }
              }

              // Skip trailing whitespace before ')'
              while (
                i < len &&
                (cssText[i] === ' ' ||
                  cssText[i] === '	' ||
                  cssText[i] === '
')
              ) {
                i++;
              }

              if (i < len && cssText[i] === ')') {
                const fullMatch = cssText.substring(urlStart, i + 1);
                results.push({
                  url: url.trim(),
                  fullMatch,
                  start: urlStart,
                  end: i + 1,
                });
                i++;
              } else {
                // Malformed url() — skip past 'url(' and try again
                i = urlStart + 1;
              }
            } else {
              i++;
            }
          }

          return results;
        },
