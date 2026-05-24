const std = @import("std");
const BoardContext = @import("root.zig").BoardContext;

/// Checks if a board is valid from the perspective of cell idx.
fn isValidMove(ctx: *const BoardContext, idx: usize, num: u8) bool {
    const row = idx / 9;
    const col = idx % 9;
    const box = (row / 3) * 3 + (col / 3);

    const bit = @as(u16, 1) << @intCast(num);

    const allTaken = ctx.row_masks[row] | ctx.col_masks[col] | ctx.box_masks[box];

    return (allTaken & bit) == 0;
}

fn singleSolutionInner(ctx: *BoardContext, acc: u8) u8 {
    const idx = std.mem.findScalar(u8, ctx.board, 0) orelse return acc + 1;

    var local_acc = acc;

    var num: u8 = 1;
    while (num <= 9) : (num += 1) {
        if (isValidMove(ctx, idx, num)) {
            ctx.placeNumber(idx, num);
            local_acc = singleSolutionInner(ctx, local_acc);
            ctx.removeNumber(idx, num);
            // if more than 1 solution found, immediately return
            if (local_acc > 1) return local_acc;
        }
    }

    return local_acc;
}

/// Check if there is only one solution for boardState.
fn singleSolution(ctx: *BoardContext) bool {
    var scratch_board: [81]u8 = undefined;
    var ctxCopy = ctx.copy(&scratch_board);
    return singleSolutionInner(&ctxCopy, 0) == 1;
}

fn generateInner(ctx: *BoardContext) bool {
    const idx = std.mem.findScalar(u8, ctx.board, 0) orelse return true;

    var buf = [_]u8{ 1, 2, 3, 4, 5, 6, 7, 8, 9 };
    ctx.rng().shuffle(u8, &buf);
    for (buf) |num| {
        if (isValidMove(ctx, idx, num)) {
            ctx.placeNumber(idx, num);
            if (generateInner(ctx)) return true;
            ctx.removeNumber(idx, num);
        }
    }
    return false;
}

/// Generate sudoku puzzle.
pub fn generate(ctx: *BoardContext) void {
    _ = generateInner(ctx);

    // Initialize shuffled array with indices 0-80
    var indices: [81]u8 = @splat(0);
    for (&indices, 0..) |*item, i| item.* = @intCast(i);
    ctx.rng().shuffle(u8, &indices);

    for (indices) |idx| {
        const num = ctx.board[idx];
        ctx.removeNumber(idx, num);

        if (!singleSolution(ctx)) {
            ctx.placeNumber(idx, num);
        }
    }
}
