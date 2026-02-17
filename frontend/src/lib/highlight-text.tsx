import type { ReactNode } from 'react';
import { Fragment } from 'react/jsx-runtime';

export function highlightText(text: string, search: string): ReactNode {
  if (!search.trim()) return text;

  const searchTokens = search.toLowerCase().split(' ').filter(Boolean);
  const textTokens = text.split(' ');

  return textTokens.map((token, index) => {
    const matchingText = getMatchingText(token, searchTokens);

    return (
      <Fragment key={index}>
        {index > 0 && ' '}
        {matchingText ? (
          <>
            <span className="font-bold">
              {token.slice(0, matchingText.length)}
            </span>
            {token.slice(matchingText.length)}
          </>
        ) : (
          token
        )}
      </Fragment>
    );
  });
}

function getMatchingText(token: string, searchTokens: string[]) {
  const lowerToken = token.toLowerCase();
  return searchTokens.find(searchToken => lowerToken.startsWith(searchToken));
}
