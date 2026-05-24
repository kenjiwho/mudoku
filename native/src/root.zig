const std = @import("std");
const generator = @import("generator.zig");
const Random = std.Random;

pub const BoardContext = struct {
    board: *[81]u8,
    row_masks: [9]u16,
    col_masks: [9]u16,
    box_masks: [9]u16,
    prng: Random.DefaultPrng,

    pub fn init(initBoard: *[81]u8, seed: u64) BoardContext {
        return BoardContext{
            .board = initBoard,
            .row_masks = @splat(0),
            .col_masks = @splat(0),
            .box_masks = @splat(0),
            .prng = Random.DefaultPrng.init(seed),
        };
    }

    /// Return a Random object from the internal prng object.
    pub fn rng(self: *BoardContext) Random {
        return self.prng.random();
    }

    /// Initialize the masks to the current board
    pub fn initializeMasks(self: *BoardContext) void {
        for (0..self.board.len) |i| {
            const num = self.board[i];
            if (num == 0) {
                continue;
            }
            const row = i / 9;
            const col = i % 9;
            const box = (row / 3) * 3 + (col / 3);

            const bit = 1 << num;
            self.row_masks[row] |= bit;
            self.col_masks[col] |= bit;
            self.box_masks[box] |= bit;
        }
    }

    /// Add number to board and update cache.
    pub fn placeNumber(self: *BoardContext, idx: usize, num: u8) void {
        const row = idx / 9;
        const col = idx % 9;
        const box = (row / 3) * 3 + (col / 3);

        self.board[idx] = num;

        const bit = @as(u16, 1) << @intCast(num);
        self.row_masks[row] |= bit;
        self.col_masks[col] |= bit;
        self.box_masks[box] |= bit;
    }

    /// Remove number from board and update cache.
    pub fn removeNumber(self: *BoardContext, idx: usize, num: u8) void {
        const row = idx / 9;
        const col = idx % 9;
        const box = (row / 3) * 3 + (col / 3);

        self.board[idx] = 0;

        const bit = @as(u16, 1) << @intCast(num);
        self.row_masks[row] &= ~bit;
        self.col_masks[col] &= ~bit;
        self.box_masks[box] &= ~bit;
    }

    /// Return a copy of the board state and masks.
    pub fn copy(self: *const BoardContext, board_copy: *[81]u8) BoardContext {
        board_copy.* = self.board.*;

        return BoardContext{
            .board = board_copy,
            .row_masks = self.row_masks,
            .col_masks = self.col_masks,
            .box_masks = self.box_masks,
            .prng = self.prng,
        };
    }
};

var board: [81]u8 = @splat(0);

/// Return pointer to the internal board state.
export fn getBoardPointer() [*]u8 {
    return &board;
}

/// Generate a random puzzle.
export fn generate(seed: u64) void {
    @memset(&board, 0); // reset board
    var ctx = BoardContext.init(&board, seed);
    generator.generate(&ctx);
}
