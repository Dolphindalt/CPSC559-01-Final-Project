// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import './StackLib.sol';

contract NotationReader {

  using StackLib for StackLib.Stack;

  enum Action {
    MOVE,
    RECOGNIZE,
    ERROR
  }

  enum Terminal {
    ERROR,
    PIECE,
    CAPTURE,
    SPACE,
    SQUARE,
    SHORT_CASTLE,
    LONG_CASTLE,
    TURN_MOD,
    END,
    EOF,
    P,
    S,
    E,
    A,
    M
  }

  struct Token {
    Terminal class;
    string value;
  }

  mapping(uint16 => uint8) internal scanningTable;
  mapping(uint16 => Terminal) internal tokenTable;

  enum ParserAction {
    ERROR,
    SHIFT,
    REDUCE,
    GOTO,
    ACCEPT
  }

  struct ParserEntry {
    ParserAction action;
    uint8 cell;
  }

  mapping(uint16 => ParserEntry) internal parseTable;
  mapping(uint8 => uint8) internal rightHandSymbolsCount;
  mapping(uint8 => Terminal) internal leftHandSides;

  constructor() {
    buildScanningTable();
    buildTokenTable();
    buildParsingTable();
  }

  function parseLongAlgebraicBytes(bytes memory input) view public returns(bool) {
    Token memory token;
    uint8 marker = 0;
    uint8 state = 0;

    uint8[] memory stackMem;
    StackLib.Stack memory stack = StackLib.Stack(stackMem, 0);
    stack.stackPush(state);

    while (true) {
      (token, marker) = getToken(marker, input);

      state = stack.stackPeek();
      ParserEntry memory entry = parseTable[pairToKey(state, uint8(token.class))];

      if (entry.action == ParserAction.SHIFT) {
        stack.stackPush(entry.cell);
      } else if (entry.action == ParserAction.REDUCE) {

        // Reduce the right hand side of the rule.
        uint8 rhs = rightHandSymbolsCount[entry.cell];
        for (uint8 i = 0; i < rhs; i++) {
          stack.stackPop();
        }

        // Push GOTO T[TOP, LHS] onto the stack.
        state = stack.stackPeek();
        Terminal lhs = leftHandSides[entry.cell];
        stack.stackPush(parseTable[pairToKey(state, uint8(lhs))].cell);
      } else if (entry.action == ParserAction.ACCEPT) {
        return true;
      } else {
        return false;
      }
    }

    return false;
  }

  function getToken(uint8 marker, bytes memory input) view public returns (Token memory, uint8) {
    if (marker >= input.length) {
      return (Token({ class: Terminal.EOF, value: "$" }), marker);
    }
    
    uint8 currentState = 0;
    uint8 currentCharacter;
    Action action;
    string memory charactersRead = "";
    while (true) {
      (currentCharacter, marker) = getCharacter(marker, input);
      action = chooseAction(currentState, currentCharacter);
      if (action == Action.MOVE) {
        charactersRead = concatenate(charactersRead, currentCharacter);
        currentState = scanningTable[pairToKey(currentState, currentCharacter)];
      } else if (action == Action.RECOGNIZE) {
        if (marker != input.length) {
          marker -= 1;
        }
        return (Token({ class: tokenTable[currentState], value: charactersRead }), marker);
      } else if (action == Action.ERROR) {
        break;
      }
    }
    return (Token({ class: Terminal.ERROR, value: charactersRead }), marker);
  }

  function getCharacter(uint8 marker, bytes memory input) pure internal returns (uint8, uint8) {
    uint8 character;
    if (marker < input.length) {
      character = uint8(input[marker]);
    } else {
      character = 0;
    }
    marker++;
    return (character, marker);
  }

  function chooseAction(uint8 currentState, uint8 currentCharacter) view internal returns (Action) {
    uint16 tableIdx = pairToKey(currentState, currentCharacter);
    bool inFinalState = tokenTable[currentState] != Terminal.ERROR;
    bool hasNextState = scanningTable[tableIdx] != 0;

    if (hasNextState) {
      return Action.MOVE;
    }

    if (inFinalState) {
      return Action.RECOGNIZE;
    }

    return Action.ERROR;
  }

  // Called only on contract creation.
  function buildScanningTable() internal {
    // Short cut loops.
    uint8 i;
    for (i = 97; i <= 104; i++) {
      scanningTable[pairToKey(0, i)] = 5;
    }
    for (i = 49; i <= 57; i++) {
      scanningTable[pairToKey(5, i)] = 6;
    }

    // State 0 transitions.
    scanningTable[pairToKey(0, 75)] = 1;
    scanningTable[pairToKey(0, 81)] = 1;
    scanningTable[pairToKey(0, 78)] = 1;
    scanningTable[pairToKey(0, 82)] = 1;
    scanningTable[pairToKey(0, 66)] = 1;
    scanningTable[pairToKey(0, 97)] = 11;
    scanningTable[pairToKey(0, 48)] = 9;
    scanningTable[pairToKey(0, 120)] = 2;
    scanningTable[pairToKey(0, 79)] = 3;
    scanningTable[pairToKey(0, 43)] = 7;
    scanningTable[pairToKey(0, 35)] = 7;
    scanningTable[pairToKey(0, 32)] = 22;

    // State 3 transitions.
    scanningTable[pairToKey(3, 45)] = 4;

    // And so on...
    scanningTable[pairToKey(4, 79)] = 19;
    scanningTable[pairToKey(9, 45)] = 10;
    scanningTable[pairToKey(10, 49)] = 13;
    scanningTable[pairToKey(11, 45)] = 12;
    scanningTable[pairToKey(11, 47)] = 14;
    scanningTable[pairToKey(12, 48)] = 13;
    scanningTable[pairToKey(14, 50)] = 15;
    scanningTable[pairToKey(15, 45)] = 16;
    scanningTable[pairToKey(16, 49)] = 17;
    scanningTable[pairToKey(17, 45)] = 18;
    scanningTable[pairToKey(18, 50)] = 13;
    scanningTable[pairToKey(19, 45)] = 20;
    scanningTable[pairToKey(20, 43)] = 21;
  }

  // Called only on contract creation.
  function buildTokenTable() internal {
    tokenTable[1] = Terminal.PIECE;
    tokenTable[2] = Terminal.CAPTURE;
    tokenTable[22] = Terminal.SPACE;
    tokenTable[6] = Terminal.SQUARE;
    tokenTable[19] = Terminal.SHORT_CASTLE;
    tokenTable[21] = Terminal.LONG_CASTLE;
    tokenTable[7] = Terminal.TURN_MOD;
    tokenTable[8] = Terminal.TURN_MOD;
    tokenTable[13] = Terminal.END;
  }

  // Called only on contract creation.
  function buildParsingTable() internal {
    parseTable[pairToKey(0, uint8(Terminal.PIECE))] = ParserEntry(ParserAction.SHIFT, 6);
    parseTable[pairToKey(0, uint8(Terminal.SQUARE))] = ParserEntry(ParserAction.REDUCE, 2);
    parseTable[pairToKey(0, uint8(Terminal.SHORT_CASTLE))] = ParserEntry(ParserAction.SHIFT, 4);
    parseTable[pairToKey(0, uint8(Terminal.LONG_CASTLE))] = ParserEntry(ParserAction.SHIFT, 5);
    parseTable[pairToKey(0, uint8(Terminal.EOF))] = ParserEntry(ParserAction.REDUCE, 9);
    parseTable[pairToKey(0, uint8(Terminal.P))] = ParserEntry(ParserAction.GOTO, 3);
    parseTable[pairToKey(0, uint8(Terminal.A))] = ParserEntry(ParserAction.GOTO, 1);
    parseTable[pairToKey(0, uint8(Terminal.M))] = ParserEntry(ParserAction.GOTO, 2);

    parseTable[pairToKey(1, uint8(Terminal.EOF))] = ParserEntry(ParserAction.ACCEPT, 0);

    parseTable[pairToKey(2, uint8(Terminal.PIECE))] = ParserEntry(ParserAction.SHIFT, 6);
    parseTable[pairToKey(2, uint8(Terminal.END))] = ParserEntry(ParserAction.SHIFT, 7);
    parseTable[pairToKey(2, uint8(Terminal.SQUARE))] = ParserEntry(ParserAction.REDUCE, 2);
    parseTable[pairToKey(2, uint8(Terminal.SHORT_CASTLE))] = ParserEntry(ParserAction.SHIFT, 4);
    parseTable[pairToKey(2, uint8(Terminal.LONG_CASTLE))] = ParserEntry(ParserAction.SHIFT, 5);
    parseTable[pairToKey(2, uint8(Terminal.EOF))] = ParserEntry(ParserAction.REDUCE, 9);
    parseTable[pairToKey(2, uint8(Terminal.P))] = ParserEntry(ParserAction.GOTO, 3);
    parseTable[pairToKey(2, uint8(Terminal.A))] = ParserEntry(ParserAction.GOTO, 8);
    parseTable[pairToKey(2, uint8(Terminal.M))] = ParserEntry(ParserAction.GOTO, 2);

    parseTable[pairToKey(3, uint8(Terminal.SQUARE))] = ParserEntry(ParserAction.SHIFT, 9);

    parseTable[pairToKey(4, uint8(Terminal.PIECE))] = ParserEntry(ParserAction.REDUCE, 6);
    parseTable[pairToKey(4, uint8(Terminal.SPACE))] = ParserEntry(ParserAction.REDUCE, 6);
    parseTable[pairToKey(4, uint8(Terminal.TURN_MOD))] = ParserEntry(ParserAction.SHIFT, 11);
    parseTable[pairToKey(4, uint8(Terminal.END))] = ParserEntry(ParserAction.REDUCE, 6);
    parseTable[pairToKey(4, uint8(Terminal.SQUARE))] = ParserEntry(ParserAction.REDUCE, 6);
    parseTable[pairToKey(4, uint8(Terminal.SHORT_CASTLE))] = ParserEntry(ParserAction.REDUCE, 6);
    parseTable[pairToKey(4, uint8(Terminal.LONG_CASTLE))] = ParserEntry(ParserAction.REDUCE, 6);
    parseTable[pairToKey(4, uint8(Terminal.EOF))] = ParserEntry(ParserAction.REDUCE, 6);
    parseTable[pairToKey(4, uint8(Terminal.E))] = ParserEntry(ParserAction.GOTO, 10);

    parseTable[pairToKey(5, uint8(Terminal.PIECE))] = ParserEntry(ParserAction.REDUCE, 6);
    parseTable[pairToKey(5, uint8(Terminal.SPACE))] = ParserEntry(ParserAction.REDUCE, 6);
    parseTable[pairToKey(5, uint8(Terminal.TURN_MOD))] = ParserEntry(ParserAction.SHIFT, 11);
    parseTable[pairToKey(5, uint8(Terminal.END))] = ParserEntry(ParserAction.REDUCE, 6);
    parseTable[pairToKey(5, uint8(Terminal.SQUARE))] = ParserEntry(ParserAction.REDUCE, 6);
    parseTable[pairToKey(5, uint8(Terminal.SHORT_CASTLE))] = ParserEntry(ParserAction.REDUCE, 6);
    parseTable[pairToKey(5, uint8(Terminal.LONG_CASTLE))] = ParserEntry(ParserAction.REDUCE, 6);
    parseTable[pairToKey(5, uint8(Terminal.EOF))] = ParserEntry(ParserAction.REDUCE, 6);
    parseTable[pairToKey(5, uint8(Terminal.E))] = ParserEntry(ParserAction.GOTO, 12);

    parseTable[pairToKey(6, uint8(Terminal.SQUARE))] = ParserEntry(ParserAction.REDUCE, 1);

    parseTable[pairToKey(7, uint8(Terminal.EOF))] = ParserEntry(ParserAction.REDUCE, 7);

    parseTable[pairToKey(8, uint8(Terminal.EOF))] = ParserEntry(ParserAction.REDUCE, 8);

    parseTable[pairToKey(9, uint8(Terminal.SQUARE))] = ParserEntry(ParserAction.SHIFT, 13);

    parseTable[pairToKey(10, uint8(Terminal.PIECE))] = ParserEntry(ParserAction.REDUCE, 4);
    parseTable[pairToKey(10, uint8(Terminal.SPACE))] = ParserEntry(ParserAction.SHIFT, 15);
    parseTable[pairToKey(10, uint8(Terminal.END))] = ParserEntry(ParserAction.REDUCE, 4);
    parseTable[pairToKey(10, uint8(Terminal.SQUARE))] = ParserEntry(ParserAction.REDUCE, 4);
    parseTable[pairToKey(10, uint8(Terminal.SHORT_CASTLE))] = ParserEntry(ParserAction.REDUCE, 4);
    parseTable[pairToKey(10, uint8(Terminal.LONG_CASTLE))] = ParserEntry(ParserAction.REDUCE, 4);
    parseTable[pairToKey(10, uint8(Terminal.EOF))] = ParserEntry(ParserAction.REDUCE, 4);
    parseTable[pairToKey(10, uint8(Terminal.S))] = ParserEntry(ParserAction.GOTO, 14);

    parseTable[pairToKey(11, uint8(Terminal.PIECE))] = ParserEntry(ParserAction.REDUCE, 5);
    parseTable[pairToKey(11, uint8(Terminal.SPACE))] = ParserEntry(ParserAction.REDUCE, 5);
    parseTable[pairToKey(11, uint8(Terminal.END))] = ParserEntry(ParserAction.REDUCE, 5);
    parseTable[pairToKey(11, uint8(Terminal.SQUARE))] = ParserEntry(ParserAction.REDUCE, 5);
    parseTable[pairToKey(11, uint8(Terminal.SHORT_CASTLE))] = ParserEntry(ParserAction.REDUCE, 5);
    parseTable[pairToKey(11, uint8(Terminal.LONG_CASTLE))] = ParserEntry(ParserAction.REDUCE, 5);
    parseTable[pairToKey(11, uint8(Terminal.EOF))] = ParserEntry(ParserAction.REDUCE, 5);

    parseTable[pairToKey(12, uint8(Terminal.PIECE))] = ParserEntry(ParserAction.REDUCE, 4);
    parseTable[pairToKey(12, uint8(Terminal.SPACE))] = ParserEntry(ParserAction.SHIFT, 15);
    parseTable[pairToKey(12, uint8(Terminal.END))] = ParserEntry(ParserAction.REDUCE, 4);
    parseTable[pairToKey(12, uint8(Terminal.SQUARE))] = ParserEntry(ParserAction.REDUCE, 4);
    parseTable[pairToKey(12, uint8(Terminal.SHORT_CASTLE))] = ParserEntry(ParserAction.REDUCE, 4);
    parseTable[pairToKey(12, uint8(Terminal.LONG_CASTLE))] = ParserEntry(ParserAction.REDUCE, 4);
    parseTable[pairToKey(12, uint8(Terminal.EOF))] = ParserEntry(ParserAction.REDUCE, 4);
    parseTable[pairToKey(12, uint8(Terminal.S))] = ParserEntry(ParserAction.GOTO, 16);

    parseTable[pairToKey(13, uint8(Terminal.PIECE))] = ParserEntry(ParserAction.REDUCE, 6);
    parseTable[pairToKey(13, uint8(Terminal.SPACE))] = ParserEntry(ParserAction.REDUCE, 6);
    parseTable[pairToKey(13, uint8(Terminal.TURN_MOD))] = ParserEntry(ParserAction.SHIFT, 11);
    parseTable[pairToKey(13, uint8(Terminal.END))] = ParserEntry(ParserAction.REDUCE, 6);
    parseTable[pairToKey(13, uint8(Terminal.SQUARE))] = ParserEntry(ParserAction.REDUCE, 6);
    parseTable[pairToKey(13, uint8(Terminal.SHORT_CASTLE))] = ParserEntry(ParserAction.REDUCE, 6);
    parseTable[pairToKey(13, uint8(Terminal.LONG_CASTLE))] = ParserEntry(ParserAction.REDUCE, 6);
    parseTable[pairToKey(13, uint8(Terminal.EOF))] = ParserEntry(ParserAction.REDUCE, 6);
    parseTable[pairToKey(13, uint8(Terminal.E))] = ParserEntry(ParserAction.GOTO, 17);

    parseTable[pairToKey(14, uint8(Terminal.PIECE))] = ParserEntry(ParserAction.REDUCE, 11);
    parseTable[pairToKey(14, uint8(Terminal.END))] = ParserEntry(ParserAction.REDUCE, 11);
    parseTable[pairToKey(14, uint8(Terminal.SQUARE))] = ParserEntry(ParserAction.REDUCE, 11);
    parseTable[pairToKey(14, uint8(Terminal.SHORT_CASTLE))] = ParserEntry(ParserAction.REDUCE, 11);
    parseTable[pairToKey(14, uint8(Terminal.LONG_CASTLE))] = ParserEntry(ParserAction.REDUCE, 11);
    parseTable[pairToKey(14, uint8(Terminal.EOF))] = ParserEntry(ParserAction.REDUCE, 11);

    parseTable[pairToKey(15, uint8(Terminal.PIECE))] = ParserEntry(ParserAction.REDUCE, 3);
    parseTable[pairToKey(15, uint8(Terminal.END))] = ParserEntry(ParserAction.REDUCE, 3);
    parseTable[pairToKey(15, uint8(Terminal.SQUARE))] = ParserEntry(ParserAction.REDUCE, 3);
    parseTable[pairToKey(15, uint8(Terminal.SHORT_CASTLE))] = ParserEntry(ParserAction.REDUCE, 3);
    parseTable[pairToKey(15, uint8(Terminal.LONG_CASTLE))] = ParserEntry(ParserAction.REDUCE, 3);
    parseTable[pairToKey(15, uint8(Terminal.EOF))] = ParserEntry(ParserAction.REDUCE, 3);

    parseTable[pairToKey(16, uint8(Terminal.PIECE))] = ParserEntry(ParserAction.REDUCE, 12);
    parseTable[pairToKey(16, uint8(Terminal.END))] = ParserEntry(ParserAction.REDUCE, 12);
    parseTable[pairToKey(16, uint8(Terminal.SQUARE))] = ParserEntry(ParserAction.REDUCE, 12);
    parseTable[pairToKey(16, uint8(Terminal.SHORT_CASTLE))] = ParserEntry(ParserAction.REDUCE, 12);
    parseTable[pairToKey(16, uint8(Terminal.LONG_CASTLE))] = ParserEntry(ParserAction.REDUCE, 12);
    parseTable[pairToKey(16, uint8(Terminal.EOF))] = ParserEntry(ParserAction.REDUCE, 12);

    parseTable[pairToKey(17, uint8(Terminal.PIECE))] = ParserEntry(ParserAction.REDUCE, 4);
    parseTable[pairToKey(17, uint8(Terminal.SPACE))] = ParserEntry(ParserAction.SHIFT, 15);
    parseTable[pairToKey(17, uint8(Terminal.END))] = ParserEntry(ParserAction.REDUCE, 4);
    parseTable[pairToKey(17, uint8(Terminal.SQUARE))] = ParserEntry(ParserAction.REDUCE, 4);
    parseTable[pairToKey(17, uint8(Terminal.SHORT_CASTLE))] = ParserEntry(ParserAction.REDUCE, 4);
    parseTable[pairToKey(17, uint8(Terminal.LONG_CASTLE))] = ParserEntry(ParserAction.REDUCE, 4);
    parseTable[pairToKey(17, uint8(Terminal.EOF))] = ParserEntry(ParserAction.REDUCE, 4);
    parseTable[pairToKey(17, uint8(Terminal.S))] = ParserEntry(ParserAction.GOTO, 18);

    parseTable[pairToKey(18, uint8(Terminal.PIECE))] = ParserEntry(ParserAction.REDUCE, 10);
    parseTable[pairToKey(18, uint8(Terminal.END))] = ParserEntry(ParserAction.REDUCE, 10);
    parseTable[pairToKey(18, uint8(Terminal.SQUARE))] = ParserEntry(ParserAction.REDUCE, 10);
    parseTable[pairToKey(18, uint8(Terminal.SHORT_CASTLE))] = ParserEntry(ParserAction.REDUCE, 10);
    parseTable[pairToKey(18, uint8(Terminal.LONG_CASTLE))] = ParserEntry(ParserAction.REDUCE, 10);
    parseTable[pairToKey(18, uint8(Terminal.EOF))] = ParserEntry(ParserAction.REDUCE, 10);
  
    rightHandSymbolsCount[0] = 1;
    rightHandSymbolsCount[1] = 1;
    rightHandSymbolsCount[2] = 1;
    rightHandSymbolsCount[3] = 1;
    rightHandSymbolsCount[4] = 1;
    rightHandSymbolsCount[5] = 1;
    rightHandSymbolsCount[6] = 1;
    rightHandSymbolsCount[7] = 2;
    rightHandSymbolsCount[8] = 2;
    rightHandSymbolsCount[9] = 1;
    rightHandSymbolsCount[10] = 5;
    rightHandSymbolsCount[11] = 3;
    rightHandSymbolsCount[12] = 3;

    leftHandSides[1] = Terminal.P;
    leftHandSides[2] = Terminal.P;
    leftHandSides[3] = Terminal.S;
    leftHandSides[4] = Terminal.S;
    leftHandSides[5] = Terminal.E;
    leftHandSides[6] = Terminal.E;
    leftHandSides[7] = Terminal.A;
    leftHandSides[8] = Terminal.A;
    leftHandSides[9] = Terminal.A;
    leftHandSides[10] = Terminal.M;
    leftHandSides[11] = Terminal.M;
    leftHandSides[12] = Terminal.M;
  }

  // Helper function.
  function pairToKey(uint8 state, uint8 character) pure internal returns (uint16) {
    return uint16(state) | (uint16(character) << 8);
  }

  // Helper function.
  function concatenate(string memory s1, uint8 s2) public pure returns (string memory) {
    return string(abi.encodePacked(s1, bytes1(s2)));
  }

}
