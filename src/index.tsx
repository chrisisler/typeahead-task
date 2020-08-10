import React, { useRef, FC, useState, useMemo, useEffect } from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';
import {
  createPopper,
  Instance as Popper,
} from '@popperjs/core/lib/popper-lite';

import './index.css';

const colorsList = [
  'AliceBlue',
  'AntiqueWhite',
  'Aqua',
  'Aquamarine',
  'Azure',
  'Beige',
  'Bisque',
  'Black',
  'BlanchedAlmond',
  'Blue',
  'BlueViolet',
  'Brown',
  'BurlyWood',
  'CadetBlue',
  'Chartreuse',
  'Chocolate',
  'Coral',
  'CornflowerBlue',
  'Cornsilk',
  'Crimson',
  'Cyan',
  'DarkBlue',
  'DarkCyan',
  'DarkGoldenRod',
  'DarkGray',
  'DarkGrey',
  'DarkGreen',
  'DarkKhaki',
  'DarkMagenta',
  'DarkOliveGreen',
  'DarkOrange',
  'DarkOrchid',
  'DarkRed',
  'DarkSalmon',
  'DarkSeaGreen',
  'DarkSlateBlue',
  'DarkSlateGray',
  'DarkSlateGrey',
  'DarkTurquoise',
  'DarkViolet',
  'DeepPink',
  'DeepSkyBlue',
  'DimGray',
  'DimGrey',
  'DodgerBlue',
  'FireBrick',
  'FloralWhite',
  'ForestGreen',
  'Fuchsia',
  'Gainsboro',
  'GhostWhite',
  'Gold',
  'GoldenRod',
  'Gray',
  'Grey',
  'Green',
  'GreenYellow',
  'HoneyDew',
  'HotPink',
  'IndianRed',
  'Indigo',
  'Ivory',
  'Khaki',
  'Lavender',
  'LavenderBlush',
  'LawnGreen',
  'LemonChiffon',
  'LightBlue',
  'LightCoral',
  'LightCyan',
  'LightGoldenRodYellow',
  'LightGray',
  'LightGrey',
  'LightGreen',
  'LightPink',
  'LightSalmon',
  'LightSeaGreen',
  'LightSkyBlue',
  'LightSlateGray',
  'LightSlateGrey',
  'LightSteelBlue',
  'LightYellow',
  'Lime',
  'LimeGreen',
  'Linen',
  'Magenta',
  'Maroon',
  'MediumAquaMarine',
  'MediumBlue',
  'MediumOrchid',
  'MediumPurple',
  'MediumSeaGreen',
  'MediumSlateBlue',
  'MediumSpringGreen',
  'MediumTurquoise',
  'MediumVioletRed',
  'MidnightBlue',
  'MintCream',
  'MistyRose',
  'Moccasin',
  'NavajoWhite',
  'Navy',
  'OldLace',
  'Olive',
  'OliveDrab',
  'Orange',
  'OrangeRed',
  'Orchid',
  'PaleGoldenRod',
  'PaleGreen',
  'PaleTurquoise',
  'PaleVioletRed',
  'PapayaWhip',
  'PeachPuff',
  'Peru',
  'Pink',
  'Plum',
  'PowderBlue',
  'Purple',
  'RebeccaPurple',
  'Red',
  'RosyBrown',
  'RoyalBlue',
  'SaddleBrown',
  'Salmon',
  'SandyBrown',
  'SeaGreen',
  'SeaShell',
  'Sienna',
  'Silver',
  'SkyBlue',
  'SlateBlue',
  'SlateGray',
  'SlateGrey',
  'Snow',
  'SpringGreen',
  'SteelBlue',
  'Tan',
  'Teal',
  'Thistle',
  'Tomato',
  'Turquoise',
  'Violet',
  'Wheat',
  'White',
  'WhiteSmoke',
  'Yellow',
  'YellowGreen',
];

const onlyWhitespace = /^\s+$/;

const borderRadius = '3px';

enum Pad {
  XSmall = '0.25rem',
  Small = '0.5rem',
  Medium = '1rem',
  Large = '2rem',
  XLarge = '3rem',
}

enum Color {
  Border = '#25647B',
  TextPrimary = '#454F54',
  TextActive = '#3487A1',
}

const Container = styled.main`
  padding: ${Pad.Medium} ${Pad.Large};
  width: 512px;
  height: 100%;
`;

const TextInput = styled.input.attrs(() => ({ type: 'text' }))`
  font-size: inherit;
  border: 1px solid ${Color.Border};
  padding: ${Pad.Small} ${Pad.Medium};
  border-radius: ${borderRadius};
  width: 300px;
  background: transparent;

  &:focus + label {
    color: ${Color.TextActive};
  }

  @media (max-width: 425px) {
    width: 100%;
  }
`;

const Column = styled.div`
  display: flex;
  flex-flow: column;

  & > *:not(:last-child) {
    margin-bottom: ${Pad.XSmall};
  }
`;

const InputLabel = styled.label`
  color: ${Color.TextPrimary};
  font-size: smaller;
`;

const Title = styled.h2`
  font-weight: 200;
  font-size: 200%;
  margin: ${Pad.Medium} 0;
`;

const Suggestions = styled.div`
  width: 300px;
  overflow-x: hidden;
  background-color: #fff;
  padding: ${Pad.Small} 0;
  border-radius: ${borderRadius};
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.2);

  @media (max-width: 400px) {
    width: 80%;
  }
`;

const UnorderedList = styled.ul`
  list-style-type: none;
  max-height: 256px;
  overflow-y: scroll;
  margin: 0;
  padding: 0;
`;

const ListItem = styled.li`
  text-transform: none;
  padding: ${Pad.Small} ${Pad.Medium};
  overflow: hidden;
  white-space: nowrap;

  &:hover {
    background-color: ${(props: { disabled?: boolean }) =>
      props.disabled ? 'inherit' : '#eee'};
  }
`;

enum TabIndexType {
  NotFocusable = -1,
  Focusable = 0,
}

const Typeahead: FC<{ list: readonly string[] }> = (props) => {
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popperRef = useRef<Popper | null>(null);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [query, setQuery] = useState('');

  const suggestions: string[] = useMemo(() => {
    const lowered = query.toLowerCase();
    return props.list
      .filter((str) => str.toLowerCase().startsWith(lowered))
      .slice(0, 16);
  }, [query, props.list]);

  const openSuggestions = () => {
    setShowSuggestions(true);
    suggestionsRef.current?.setAttribute('data-show', '');
  };

  const closeSuggestions = () => {
    setShowSuggestions(false);
    suggestionsRef.current?.removeAttribute('data-show');
  };

  useEffect(() => {
    if (!inputRef.current || !suggestionsRef.current) return;
    popperRef.current = createPopper(inputRef.current, suggestionsRef.current);
    return () => {
      popperRef.current?.destroy();
    };
  });

  return (
    <Container>
      <Title>Typeahead</Title>
      <Column>
        <InputLabel htmlFor="color-choice">Choose a color</InputLabel>
        <TextInput
          id="color-choice"
          name="color-choice"
          value={query}
          aria-describedby="suggestions"
          onBlur={(event) => {
            const focusedOnSuggestions = !!event.relatedTarget;
            if (showSuggestions && !focusedOnSuggestions) {
              setShowSuggestions(false);
            }
          }}
          onKeyPress={(event) => {
            if (event.key === 'Escape') closeSuggestions();
          }}
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);
            if (value === '' || onlyWhitespace.test(value)) {
              closeSuggestions();
              return;
            }
            openSuggestions();
          }}
          ref={inputRef}
        />
      </Column>
      {showSuggestions && (
        <Suggestions ref={suggestionsRef} role="suggestions">
          <UnorderedList
            tabIndex={TabIndexType.NotFocusable}
            onKeyDown={(event) => {
              if (event.key === 'Escape') closeSuggestions();
            }}
          >
            {suggestions.length ? (
              suggestions.map((color) => (
                <ListItem
                  key={color}
                  tabIndex={TabIndexType.Focusable}
                  onClick={() => {
                    setQuery(color);
                    inputRef.current?.focus();
                    closeSuggestions();
                  }}
                  onKeyPress={(event) => {
                    if (event.key === 'Enter') {
                      setQuery(color);
                      inputRef.current?.focus();
                      closeSuggestions();
                    }
                  }}
                >
                  <b>{color.slice(0, query.length)}</b>
                  {color.slice(query.length)}
                </ListItem>
              ))
            ) : (
              <ListItem disabled tabIndex={TabIndexType.NotFocusable}>
                <em>No matches</em>
              </ListItem>
            )}
          </UnorderedList>
        </Suggestions>
      )}
    </Container>
  );
};

render(<Typeahead list={colorsList} />, document.getElementById('root'));
