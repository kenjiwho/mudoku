const std = @import("std");

pub fn build(b: *std.Build) void {
    // target = wasm32-freestanding
    const target = b.resolveTargetQuery(.{ .cpu_arch = .wasm32, .os_tag = .freestanding });
    const optimize = b.standardOptimizeOption(.{});

    const mod = b.addModule("sudoku", .{
        .root_source_file = b.path("src/root.zig"),
        .target = target,
        .optimize = optimize,
    });

    const exe = b.addExecutable(.{
        .name = "sudoku",
        .root_module = mod,
    });
    exe.entry = .disabled;
    exe.rdynamic = true;

    b.installArtifact(exe);
}
