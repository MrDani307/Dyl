const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Эндпоинт для проверки связи при запуске
app.get('/init', (req, res) => {
    res.json({ status: "ok" });
});

// Эндпоинт, который отдает защищенный Lua-код по запросу
app.post('/get-feature', (req, res) => {
    const { feature } = req.body;

    // ФУНКЦИЯ 1: Например, настройки твоего Аимбота или Хитбоксов
    if (feature === "hitbox_config") {
        return res.json({
            code: "return { Size = 15, Transparency = 0.5, TargetPart = 'HumanoidRootPart' }"
        });
    }

    // ФУНКЦИЯ 2: Например, сложная логика или скорость для Fly/Speedhack
    if (feature === "speed_logic") {
        return res.json({
            code: "return { SpeedValue = 50, Method = 'Velocity' }"
        });
    }

    // Если запрошено неизвестно что
    res.status(400).json({ error: "Feature not found" });
});

app.listen(PORT, () => {});
