if (feature === "full_script") {
    return res.json({
        code: `loadstring(game:HttpGet("https://raw.githubusercontent.com/MrDani307/DTL/refs/heads/main/LaserTool"))()`
    });
}
