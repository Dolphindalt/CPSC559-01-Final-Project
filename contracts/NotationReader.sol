// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract NotationReader {

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
    END
  }

  mapping(uint16 => uint8) internal scanningTable;
  mapping(uint16 => Terminal) internal tokenTable;

  struct Token {
    Terminal class;
    string value;
  }

  constructor() {
    buildScanningTable();
    buildTokenTable();
  }

  function getToken(uint8 marker, bytes memory input) view public returns (Token memory, uint8) {
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
    if (marker < bytes(input).length) {
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

  // Helper function.
  function pairToKey(uint8 state, uint8 character) pure internal returns (uint16) {
    return uint16(state) | (uint16(character) << 8);
  }

  // Helper function.
  function concatenate(string memory s1, uint8 s2) public pure returns (string memory) {
    return string(abi.encodePacked(s1, bytes1(s2)));
  }

}
