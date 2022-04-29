// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

library StackLib {
    struct Stack {
        uint8[] mem;
        uint64 length;
    }

    function stackPop(Stack memory stack) pure internal returns (uint8 data) {
        data = stack.mem[stack.length - 1];
        delete stack.mem[stack.length - 1];
        stack.length -= 1;
        return data;
    }

    function stackPush(Stack memory stack, uint8 data) pure internal {
        stack.mem[stack.length] = data;
        stack.length += 1;
    }

    function stackPeek(Stack memory stack) pure internal returns (uint8) {
        return stack.mem[stack.length - 1];
    }
}