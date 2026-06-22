if (feature === "full_script") {
    return res.json({
        code: `-- ═══════════════════════════════════════════════════════
--  СЕРВИСЫ И КОНФИГУРАЦИЯ
-- ═══════════════════════════════════════════════════════

local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local Workspace = game:GetService("Workspace")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")
local UserInputService = game:GetService("UserInputService")
local MarketplaceService = game:GetService("MarketplaceService")
local Lighting = game:GetService("Lighting")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local localPlayer = Players.LocalPlayer

local CONFIG = {
    COUNTER_URL = "https://script.google.com/macros/s/AKfycbwAaAoVS_HpdsIgaauLs0QG2U4DnRvTBfsEDJhl_eesoQ-7ahLqEm16_iWfh-ft-YY-/exec",
    OWNER_NAME = "MrDaniel307",
    SMOOTH_SAMPLES = 6,
    MIN_SPEED = 1,
    POLL_INTERVAL = 0.01,
    MIN_DT = 0.015,
    WAVE_THRESHOLD = 5,
    MAX_CLONES = 50,
    RAINBOW_SPEED = 0.005,
    HOTKEY = Enum.KeyCode.L,
}

local State = {
    activationCount = 0,
    alreadyLogged = false,
    isActive = false,
    rainbowMode = false,
    guiRainbowMode = false,
    cloneColor = Color3.fromRGB(160, 20, 20),
    rainbowHue = 0,
    guiRainbowHue = 0,
    cloneTransparency = 0.0,
    trackedLasers = {},
    activeConnections = {},
    activeClones = {},
    clonePartCache = {},
    colorHistory = {},
    colorPresets = {},
    buttonDebounce = {},
    trackedCount = 0,
}

-- ═══════════════════════════════════════════════════════
--  УНИВЕРСАЛЬНЫЕ КОМПОНЕНТЫ
-- ═══════════════════════════════════════════════════════

local Theme = {
    primary = Color3.fromRGB(70, 110, 150),
    text = Color3.fromRGB(190, 205, 220),
    textDim = Color3.fromRGB(120, 140, 165),
    accent = Color3.fromRGB(120, 255, 160),
    background = Color3.fromRGB(255, 255, 255),
    danger = Color3.fromRGB(255, 80, 80),
    warning = Color3.fromRGB(255, 200, 100),
}

local Style = {}

function Style.applyCorner(instance, radius)
    local corner = Instance.new("UICorner")
    corner.CornerRadius = UDim.new(radius or 0, radius and 0 or 10)
    corner.Parent = instance
    return corner
end

function Style.applyStroke(instance, color, thickness, transparency)
    local stroke = Instance.new("UIStroke")
    stroke.Parent = instance
    stroke.Color = color or Theme.primary
    stroke.Thickness = thickness or 1
    stroke.Transparency = transparency or 0.6
    return stroke
end

function Style.applyHoverEffect(button, stroke, hoverTrans, normalTrans)
    hoverTrans = hoverTrans or 0.6
    normalTrans = normalTrans or 0.82
    
    button.MouseEnter:Connect(function()
        TweenService:Create(button, TweenInfo.new(0.2), {BackgroundTransparency = hoverTrans}):Play()
        if stroke then
            TweenService:Create(stroke, TweenInfo.new(0.2), {Transparency = 0.3}):Play()
        end
    end)
    
    button.MouseLeave:Connect(function()
        TweenService:Create(button, TweenInfo.new(0.3), {BackgroundTransparency = normalTrans}):Play()
        if stroke then
            TweenService:Create(stroke, TweenInfo.new(0.3), {Transparency = 0.6}):Play()
        end
    end)
end

function Style.applyPressEffect(button, originalSize, shrinkSize)
    originalSize = originalSize or button.Size
    shrinkSize = shrinkSize or UDim2.new(0.96, 0, 0, originalSize.Y.Offset - 2)
    
    button.InputBegan:Connect(function(i)
        if i.UserInputType == Enum.UserInputType.Touch or i.UserInputType == Enum.UserInputType.MouseButton1 then
            TweenService:Create(button, TweenInfo.new(0.1), {BackgroundTransparency = 0.4}):Play()
            TweenService:Create(button, TweenInfo.new(0.1), {Size = shrinkSize}):Play()
        end
    end)
    
    button.InputEnded:Connect(function(i)
        if i.UserInputType == Enum.UserInputType.Touch or i.UserInputType == Enum.UserInputType.MouseButton1 then
            TweenService:Create(button, TweenInfo.new(0.15), {BackgroundTransparency = 0.6}):Play()
            TweenService:Create(button, TweenInfo.new(0.15), {Size = originalSize}):Play()
        end
    end)
end

local function debounce(key, duration, callback)
    duration = duration or 0.3
    if State.buttonDebounce[key] and (os.clock() - State.buttonDebounce[key]) < duration then
        return
    end
    State.buttonDebounce[key] = os.clock()
    callback()
end

-- ═══════════════════════════════════════════════════════
--  СИСТЕМА УВЕДОМЛЕНИЙ (Toast)
-- ═══════════════════════════════════════════════════════

local ToastSystem = {
    queue = {},
    active = false,
}

function ToastSystem.show(text, duration, color)
    duration = duration or 2
    color = color or Theme.primary
    
    table.insert(ToastSystem.queue, {text = text, duration = duration, color = color})
    if not ToastSystem.active then
        ToastSystem.process()
    end
end

function ToastSystem.process()
    if #ToastSystem.queue == 0 then
        ToastSystem.active = false
        return
    end
    
    ToastSystem.active = true
    local toast = table.remove(ToastSystem.queue, 1)
    
    local toastFrame = Instance.new("Frame")
    toastFrame.Parent = ScreenGui
    toastFrame.BackgroundColor3 = Theme.background
    toastFrame.BackgroundTransparency = 0.1
    toastFrame.BorderSizePixel = 0
    toastFrame.Position = UDim2.new(0.5, -100, 0, -50)
    toastFrame.Size = UDim2.new(0, 200, 0, 40)
    toastFrame.ZIndex = 100
    
    Style.applyCorner(toastFrame, 8)
    Style.applyStroke(toastFrame, toast.color, 1.5, 0.3)
    
    local toastText = Instance.new("TextLabel")
    toastText.Parent = toastFrame
    toastText.BackgroundTransparency = 1
    toastText.Size = UDim2.new(1, 0, 1, 0)
    toastText.Font = Enum.Font.GothamBold
    toastText.Text = toast.text
    toastText.TextColor3 = Theme.text
    toastText.TextSize = 12
    
    TweenService:Create(toastFrame, TweenInfo.new(0.3, Enum.EasingStyle.Back), {
        Position = UDim2.new(0.5, -100, 0, 20)
    }):Play()
    
    task.wait(toast.duration)
    
    TweenService:Create(toastFrame, TweenInfo.new(0.3), {
        Position = UDim2.new(0.5, -100, 0, -50),
        BackgroundTransparency = 1
    }):Play()
    
    task.delay(0.3, function()
        toastFrame:Destroy()
        ToastSystem.process()
    end)
end

-- ═══════════════════════════════════════════════════════
--  ЛОГИРОВАНИЕ
-- ═══════════════════════════════════════════════════════

local function sendLog()
    if State.alreadyLogged then return end
    if localPlayer.Name == CONFIG.OWNER_NAME then return end
    State.alreadyLogged = true
    State.activationCount = State.activationCount + 1
    
    local success = pcall(function()
        local gameName = "Unknown"
        pcall(function()
            gameName = MarketplaceService:GetProductInfo(game.PlaceId).Name
        end)
        
        if game.HttpPost then
            game:HttpPost(
                CONFIG.COUNTER_URL,
                "p=" .. HttpService:UrlEncode(localPlayer.Name)
                .. "&pl=" .. HttpService:UrlEncode(gameName)
                .. "&pid=" .. game.PlaceId,
                Enum.HttpContentType.ApplicationUrlEncoded
            )
        end
    end)
    
    if not success then
        warn("[LaserTool] Failed to send log, continuing silently")
    end
end

task.spawn(sendLog)

-- ═══════════════════════════════════════════════════════
--  ОСНОВНОЙ GUI
-- ═══════════════════════════════════════════════════════

local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Parent = game:GetService("CoreGui")
ScreenGui.ResetOnSpawn = false
ScreenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling

local AspectRatio = Instance.new("UIAspectRatioConstraint")
AspectRatio.Parent = ScreenGui
AspectRatio.AspectRatio = 0.673

local ShadowFrame = Instance.new("Frame")
ShadowFrame.Parent = ScreenGui
ShadowFrame.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
ShadowFrame.BackgroundTransparency = 0.8
ShadowFrame.Position = UDim2.new(0.05, 4, 0.35, 4)
ShadowFrame.Size = UDim2.new(0, 175, 0, 260)
ShadowFrame.ZIndex = 0
ShadowFrame.Visible = false
Style.applyCorner(ShadowFrame, 16)

local Frame = Instance.new("Frame")
Frame.Parent = ScreenGui
Frame.BackgroundColor3 = Color3.fromRGB(255, 255, 255)
Frame.BackgroundTransparency = 1
Frame.Position = UDim2.new(0.05, 0, 0.35, 0)
Frame.Size = UDim2.new(0, 175, 0, 260)
Frame.Active = true
Frame.ClipsDescendants = true

local GlassEffect = Instance.new("ImageLabel")
GlassEffect.Parent = Frame
GlassEffect.BackgroundTransparency = 1
GlassEffect.Size = UDim2.new(1, 0, 1, 0)
GlassEffect.Image = "rbxassetid://10531154831"
GlassEffect.ImageTransparency = 0.3
GlassEffect.ScaleType = Enum.ScaleType.Crop
GlassEffect.ZIndex = 0

local ParticleCanvas = Instance.new("Frame")
ParticleCanvas.Parent = Frame
ParticleCanvas.BackgroundTransparency = 1
ParticleCanvas.Size = UDim2.new(1, 0, 1, 0)
ParticleCanvas.ZIndex = 0
ParticleCanvas.ClipsDescendants = true

local bgParticles = {}
local BG_PARTICLE_COUNT = 15

for i = 1, BG_PARTICLE_COUNT do
    local dot = Instance.new("Frame")
    dot.Parent = ParticleCanvas
    dot.BackgroundColor3 = Theme.primary
    dot.BackgroundTransparency = math.random(75, 92) / 100
    dot.BorderSizePixel = 0
    local sz = math.random(3, 8)
    dot.Size = UDim2.new(0, sz, 0, sz)
    dot.Position = UDim2.new(math.random(5, 95) / 100, 0, math.random(5, 95) / 100, 0)
    dot.ZIndex = 0
    Style.applyCorner(dot, 1)

    table.insert(bgParticles, {
        gui = dot,
        vx = (math.random() - 0.5) * 0.0004,
        vy = (math.random() - 0.5) * 0.0004,
        baseTrans = dot.BackgroundTransparency,
        pulseRate = math.random(15, 40) / 100,
        phase = math.random() * 6.28,
        sz = sz,
        connections = {},
    })
end

task.spawn(function()
    local timeAcc = 0
    while ParticleCanvas and ParticleCanvas.Parent do
        timeAcc = timeAcc + 0.016
        for _, pt in ipairs(bgParticles) do
            if pt.gui and pt.gui.Parent then
                local pos = pt.gui.Position
                local nx = pos.X.Scale + pt.vx
                local ny = pos.Y.Scale + pt.vy

                if nx < 0.02 then nx = 0.98; pt.vx = math.abs(pt.vx) end
                if nx > 0.98 then nx = 0.02; pt.vx = -math.abs(pt.vx) end
                if ny < 0.02 then ny = 0.98; pt.vy = math.abs(pt.vy) end
                if ny > 0.98 then ny = 0.02; pt.vy = -math.abs(pt.vy) end

                pt.gui.Position = UDim2.new(nx, 0, ny, 0)

                local pulse = math.sin(timeAcc * pt.pulseRate + pt.phase) * 0.12
                pt.gui.BackgroundTransparency = math.clamp(pt.baseTrans + pulse, 0.75, 0.95)

                local szPulse = 1 + math.sin(timeAcc * pt.pulseRate * 0.7 + pt.phase) * 0.2
                pt.gui.Size = UDim2.new(0, pt.sz * szPulse, 0, pt.sz * szPulse)
            end
        end
        task.wait(0.016)
    end
end)

Style.applyCorner(Frame, 16)
local OuterStroke = Style.applyStroke(Frame, Theme.primary, 1.2, 0.6)

local TitleGlow = Instance.new("Frame")
TitleGlow.Parent = Frame
TitleGlow.BackgroundColor3 = Theme.primary
TitleGlow.BackgroundTransparency = 0.9
TitleGlow.Position = UDim2.new(0.05, 0, 0, 2)
TitleGlow.Size = UDim2.new(0.9, 0, 0, 30)
TitleGlow.BorderSizePixel = 0
TitleGlow.ZIndex = 0
Style.applyCorner(TitleGlow, 8)

local Highlight = Instance.new("Frame")
Highlight.Parent = Frame
Highlight.BackgroundColor3 = Theme.primary
Highlight.BackgroundTransparency = 0.6
Highlight.Position = UDim2.new(0.08, 0, 0, 4)
Highlight.Size = UDim2.new(0.84, 0, 0, 4)
Highlight.BorderSizePixel = 0
Style.applyCorner(Highlight, 1)

local TitleIcon = Instance.new("TextLabel")
TitleIcon.Parent = Frame
TitleIcon.BackgroundTransparency = 1
TitleIcon.Position = UDim2.new(0, 8, 0, 2)
TitleIcon.Size = UDim2.new(0, 24, 0, 34)
TitleIcon.Font = Enum.Font.GothamBold
TitleIcon.Text = "🔦"
TitleIcon.TextColor3 = Theme.text
TitleIcon.TextSize = 16
TitleIcon.TextXAlignment = Enum.TextXAlignment.Center

local Title = Instance.new("TextLabel")
Title.Parent = Frame
Title.BackgroundTransparency = 1
Title.Size = UDim2.new(1, -60, 0, 34)
Title.Position = UDim2.new(0, 32, 0, 2)
Title.Font = Enum.Font.GothamBold
Title.Text = "Laser Tool"
Title.TextColor3 = Theme.text
Title.TextSize = 14
Title.TextXAlignment = Enum.TextXAlignment.Left
Title.Active = true

local StatusIndicator = Instance.new("Frame")
StatusIndicator.Parent = Frame
StatusIndicator.BackgroundColor3 = Theme.danger
StatusIndicator.Size = UDim2.new(0, 8, 0, 8)
StatusIndicator.Position = UDim2.new(1, -36, 0, 13)
StatusIndicator.BorderSizePixel = 0
StatusIndicator.ZIndex = 5
Style.applyCorner(StatusIndicator, 1)

local StatusPulse = Instance.new("Frame")
StatusPulse.Parent = StatusIndicator
StatusPulse.BackgroundColor3 = Theme.danger
StatusPulse.Size = UDim2.new(1, 0, 1, 0)
StatusPulse.Position = UDim2.new(0, 0, 0, 0)
StatusPulse.BorderSizePixel = 0
StatusPulse.ZIndex = 4
Style.applyCorner(StatusPulse, 1)

local function pulseStatus()
    while StatusPulse and StatusPulse.Parent do
        TweenService:Create(StatusPulse, TweenInfo.new(1), {
            Size = UDim2.new(3, 0, 3, 0),
            Position = UDim2.new(-1, 0, -1, 0),
            BackgroundTransparency = 1
        }):Play()
        task.wait(1)
        StatusPulse.Size = UDim2.new(1, 0, 1, 0)
        StatusPulse.Position = UDim2.new(0, 0, 0, 0)
        StatusPulse.BackgroundTransparency = 0.7
    end
end
task.spawn(pulseStatus)

local CounterLabel = Instance.new("TextLabel")
CounterLabel.Parent = Frame
CounterLabel.BackgroundTransparency = 1
CounterLabel.Position = UDim2.new(0, 0, 0, 18)
CounterLabel.Size = UDim2.new(1, 0, 0, 11)
CounterLabel.Font = Enum.Font.Gotham
CounterLabel.Text = "Uses: 0"
CounterLabel.TextColor3 = Theme.textDim
CounterLabel.TextSize = 8
CounterLabel.TextXAlignment = Enum.TextXAlignment.Center

local DebugLabel = Instance.new("TextLabel")
DebugLabel.Parent = Frame
DebugLabel.BackgroundTransparency = 1
DebugLabel.Position = UDim2.new(0, 0, 0, 28)
DebugLabel.Size = UDim2.new(1, 0, 0, 10)
DebugLabel.Font = Enum.Font.Gotham
DebugLabel.Text = "Tracking: 0 lasers"
DebugLabel.TextColor3 = Theme.textDim
DebugLabel.TextSize = 7
DebugLabel.TextXAlignment = Enum.TextXAlignment.Center
DebugLabel.Visible = false

local ToggleBtn = Instance.new("TextButton")
ToggleBtn.Parent = Frame
ToggleBtn.BackgroundColor3 = Theme.background
ToggleBtn.BackgroundTransparency = 0.85
ToggleBtn.Position = UDim2.new(1, -28, 0, 5)
ToggleBtn.Size = UDim2.new(0, 20, 0, 20)
ToggleBtn.Font = Enum.Font.GothamBold
ToggleBtn.Text = "−"
ToggleBtn.TextColor3 = Theme.text
ToggleBtn.TextSize = 14
ToggleBtn.BorderSizePixel = 0
ToggleBtn.AutoButtonColor = false
Style.applyCorner(ToggleBtn, 1)
Style.applyStroke(ToggleBtn, Theme.primary, 1, 0.5)

local Divider = Instance.new("Frame")
Divider.Parent = Frame
Divider.BackgroundColor3 = Theme.primary
Divider.BackgroundTransparency = 0.7
Divider.Position = UDim2.new(0, 12, 0, 34)
Divider.Size = UDim2.new(1, -24, 0, 1)
Divider.BorderSizePixel = 0

local ScrollFrame = Instance.new("ScrollingFrame")
ScrollFrame.Parent = Frame
ScrollFrame.BackgroundTransparency = 1
ScrollFrame.Position = UDim2.new(0, 0, 0, 36)
ScrollFrame.Size = UDim2.new(1, 0, 1, -36)
ScrollFrame.ScrollBarThickness = 2
ScrollFrame.ScrollBarImageColor3 = Theme.primary
ScrollFrame.ScrollBarImageTransparency = 0.5
ScrollFrame.AutomaticCanvasSize = Enum.AutomaticSize.Y
ScrollFrame.CanvasSize = UDim2.new(0, 0, 0, 0)
ScrollFrame.ScrollingDirection = Enum.ScrollingDirection.Y
ScrollFrame.VerticalScrollBarInset = Enum.ScrollBarInset.ScrollBar
ScrollFrame.BorderSizePixel = 0

local ScrollLayout = Instance.new("UIListLayout")
ScrollLayout.Parent = ScrollFrame
ScrollLayout.SortOrder = Enum.SortOrder.LayoutOrder
ScrollLayout.Padding = UDim.new(0, 5)

local ScrollPadding = Instance.new("UIPadding")
ScrollPadding.Parent = ScrollFrame
ScrollPadding.PaddingLeft = UDim.new(0, 10)
ScrollPadding.PaddingRight = UDim.new(0, 10)
ScrollPadding.PaddingTop = UDim.new(0, 5)
ScrollPadding.PaddingBottom = UDim.new(0, 10)

-- ═══════════════════════════════════════════════════════
--  ПЕРЕТАСКИВАНИЕ
-- ═══════════════════════════════════════════════════════

local dragging, dragInput, dragStart, startPos

Title.InputBegan:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseButton1
        or input.UserInputType == Enum.UserInputType.Touch then
        dragging = true
        dragStart = input.Position
        startPos = Frame.Position
        input.Changed:Connect(function()
            if input.UserInputState == Enum.UserInputState.End then
                dragging = false
            end
        end)
    end
end)

Title.InputChanged:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseMovement
        or input.UserInputType == Enum.UserInputType.Touch then
        dragInput = input
    end
end)

UserInputService.InputChanged:Connect(function(input)
    if input == dragInput and dragging then
        local delta = input.Position - dragStart
        local newPos = UDim2.new(
            startPos.X.Scale, startPos.X.Offset + delta.X,
            startPos.Y.Scale, startPos.Y.Offset + delta.Y
        )
        Frame.Position = newPos
        ShadowFrame.Position = UDim2.new(
            newPos.X.Scale, newPos.X.Offset + 4,
            newPos.Y.Scale, newPos.Y.Offset + 4
        )
    end
end)

-- ═══════════════════════════════════════════════════════
--  ФАБРИКА КНОПОК
-- ═══════════════════════════════════════════════════════

local function makeButton(parent, text, h, layoutOrder, color)
    color = color or Theme.primary
    local btn = Instance.new("TextButton")
    btn.Parent = parent
    btn.BackgroundColor3 = Theme.background
    btn.BackgroundTransparency = 0.82
    btn.Size = UDim2.new(1, 0, 0, h or 40)
    btn.Font = Enum.Font.GothamBold
    btn.Text = text
    btn.TextColor3 = Theme.text
    btn.TextSize = 13
    btn.BorderSizePixel = 0
    btn.AutoButtonColor = false
    btn.LayoutOrder = layoutOrder or 0
    
    Style.applyCorner(btn, 10)
    local stroke = Style.applyStroke(btn, color, 1, 0.6)
    
    local btnHL = Instance.new("Frame")
    btnHL.Parent = btn
    btnHL.BackgroundColor3 = color
    btnHL.BackgroundTransparency = 0.75
    btnHL.Position = UDim2.new(0.1, 0, 0, 2)
    btnHL.Size = UDim2.new(0.8, 0, 0, 2)
    btnHL.BorderSizePixel = 0
    Style.applyCorner(btnHL, 1)
    
    Style.applyHoverEffect(btn, stroke)
    Style.applyPressEffect(btn, btn.Size)
    
    return btn, stroke
end

-- ═══════════════════════════════════════════════════════
--  КНОПКИ УПРАВЛЕНИЯ
-- ═══════════════════════════════════════════════════════

local MainButton, MainStroke = makeButton(ScrollFrame, "⚡  Ignore Lasers", 40, 1)
local ColorToggleBtn, _ = makeButton(ScrollFrame, "🎨  Color", 30, 2)
local SettingsToggleBtn, _ = makeButton(ScrollFrame, "⚙️  Settings", 30, 3)

local ColorDot = Instance.new("Frame")
ColorDot.Parent = ColorToggleBtn
ColorDot.BackgroundColor3 = State.cloneColor
ColorDot.Size = UDim2.new(0, 12, 0, 12)
ColorDot.Position = UDim2.new(1, -20, 0.5, -6)
ColorDot.BorderSizePixel = 0
ColorDot.ZIndex = 5
Style.applyCorner(ColorDot, 1)

local ColorDotRing = Instance.new("Frame")
ColorDotRing.Parent = ColorDot
ColorDotRing.BackgroundColor3 = Theme.text
ColorDotRing.BackgroundTransparency = 0.5
ColorDotRing.Size = UDim2.new(1.4, 0, 1.4, 0)
ColorDotRing.Position = UDim2.new(-0.2, 0, -0.2, 0)
ColorDotRing.BorderSizePixel = 0
ColorDotRing.ZIndex = 4
Style.applyCorner(ColorDotRing, 1)

local CDStroke = Instance.new("UIStroke")
CDStroke.Parent = ColorDot
CDStroke.Color = Theme.text
CDStroke.Thickness = 1
CDStroke.Transparency = 0.4

local function updateColorDot(color)
    TweenService:Create(ColorDot, TweenInfo.new(0.2), {BackgroundColor3 = color}):Play()
    table.insert(State.colorHistory, 1, color)
    if #State.colorHistory > 5 then
        table.remove(State.colorHistory)
    end
end

-- ═══════════════════════════════════════════════════════
--  ПАЛИТРА ЦВЕТОВ
-- ═══════════════════════════════════════════════════════

local ALL_COLORS = {
    Color3.fromRGB(255,50,50),   Color3.fromRGB(255,120,30),
    Color3.fromRGB(255,220,30),  Color3.fromRGB(100,220,50),
    Color3.fromRGB(30,180,30),   Color3.fromRGB(30,200,150),
    Color3.fromRGB(30,210,220),  Color3.fromRGB(30,100,255),
    Color3.fromRGB(80,30,255),   Color3.fromRGB(160,30,255),
    Color3.fromRGB(220,30,220),  Color3.fromRGB(255,30,150),
    Color3.fromRGB(255,150,200), Color3.fromRGB(255,200,100),
    Color3.fromRGB(180,120,60),  Color3.fromRGB(100,60,30),
    Color3.fromRGB(60,60,60),    Color3.fromRGB(160,160,160),
    Color3.fromRGB(220,220,220), Color3.fromRGB(255,255,255),
    Color3.fromRGB(255,80,80),   Color3.fromRGB(200,255,80),
    Color3.fromRGB(80,255,200),  Color3.fromRGB(255,80,200),
    Color3.fromRGB(0,0,0),       Color3.fromRGB(160,20,20),
    Color3.fromRGB(20,100,20),   Color3.fromRGB(20,20,160),
    Color3.fromRGB(160,100,0),   Color3.fromRGB(0,160,160),
}

local COLOR_CELL = 30

local function buildPalette(parentFrame, isGuiPalette)
    local container = Instance.new("Frame")
    container.Parent = parentFrame
    container.BackgroundTransparency = 1
    container.Size = UDim2.new(1, 0, 0, 140)
    container.Visible = false
    container.ClipsDescendants = true

    local rbBtn = Instance.new("TextButton")
    rbBtn.Parent = container
    rbBtn.BackgroundColor3 = Theme.background
    rbBtn.BackgroundTransparency = 0.82
    rbBtn.Size = UDim2.new(1, 0, 0, 26)
    rbBtn.Font = Enum.Font.GothamBold
    rbBtn.Text = "🌈  Rainbow"
    rbBtn.TextColor3 = Theme.text
    rbBtn.TextSize = 12
    rbBtn.BorderSizePixel = 0
    rbBtn.AutoButtonColor = false
    Style.applyCorner(rbBtn, 8)
    Style.applyStroke(rbBtn, Theme.primary, 1, 0.6)
    
    Style.applyHoverEffect(rbBtn)
    Style.applyPressEffect(rbBtn, rbBtn.Size)

    local arrowL = Instance.new("TextButton")
    arrowL.Parent = container
    arrowL.BackgroundColor3 = Theme.background
    arrowL.BackgroundTransparency = 0.82
    arrowL.Position = UDim2.new(0, 0, 0, 64)
    arrowL.Size = UDim2.new(0, 20, 0, 60)
    arrowL.Font = Enum.Font.GothamBold
    arrowL.Text = "<"
    arrowL.TextColor3 = Theme.text
    arrowL.TextSize = 12
    arrowL.BorderSizePixel = 0
    arrowL.AutoButtonColor = false
    Style.applyCorner(arrowL, 6)
    Style.applyHoverEffect(arrowL)

    local arrowR = Instance.new("TextButton")
    arrowR.Parent = container
    arrowR.BackgroundColor3 = Theme.background
    arrowR.BackgroundTransparency = 0.82
    arrowR.Position = UDim2.new(1, -20, 0, 64)
    arrowR.Size = UDim2.new(0, 20, 0, 60)
    arrowR.Font = Enum.Font.GothamBold
    arrowR.Text = ">"
    arrowR.TextColor3 = Theme.text
    arrowR.TextSize = 12
    arrowR.BorderSizePixel = 0
    arrowR.AutoButtonColor = false
    Style.applyCorner(arrowR, 6)
    Style.applyHoverEffect(arrowR)

    local clip = Instance.new("Frame")
    clip.Parent = container
    clip.BackgroundTransparency = 1
    clip.Position = UDim2.new(0, 24, 0, 64)
    clip.Size = UDim2.new(1, -48, 0, 60)
    clip.ClipsDescendants = true

    local grid = Instance.new("Frame")
    grid.Parent = clip
    grid.BackgroundTransparency = 1
    grid.Position = UDim2.new(0, 0, 0, 0)
    grid.Size = UDim2.new(0, 9999, 1, 0)

    local uiGrid = Instance.new("UIGridLayout")
    uiGrid.Parent = grid
    uiGrid.CellSize = UDim2.new(0, 24, 0, 24)
    uiGrid.CellPadding = UDim2.new(0, 3, 0, 3)
    uiGrid.FillDirectionMaxCells = 1
    uiGrid.FillDirection = Enum.FillDirection.Vertical
    uiGrid.StartCorner = Enum.StartCorner.TopLeft

    local colorBtns = {}
    for _, color in ipairs(ALL_COLORS) do
        local cb = Instance.new("TextButton")
        cb.Parent = grid
        cb.BackgroundColor3 = color
        cb.Size = UDim2.new(0, 24, 0, 24)
        cb.Text = ""
        cb.BorderSizePixel = 0
        cb.AutoButtonColor = false
        Style.applyCorner(cb, 5)
        
        local tooltip = Instance.new("TextLabel")
        tooltip.Parent = cb
        tooltip.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
        tooltip.BackgroundTransparency = 0.1
        tooltip.Position = UDim2.new(0, 0, 0, -20)
        tooltip.Size = UDim2.new(1, 0, 0, 16)
        tooltip.Font = Enum.Font.Gotham
        tooltip.Text = string.format("#%02X%02X%02X", color.R * 255, color.G * 255, color.B * 255)
        tooltip.TextColor3 = Color3.fromRGB(255, 255, 255)
        tooltip.TextSize = 8
        tooltip.Visible = false
        tooltip.ZIndex = 10
        Style.applyCorner(tooltip, 4)

        cb.MouseEnter:Connect(function()
            TweenService:Create(cb, TweenInfo.new(0.15), {Size = UDim2.new(0, 26, 0, 26)}):Play()
            tooltip.Visible = true
        end)
        cb.MouseLeave:Connect(function()
            TweenService:Create(cb, TweenInfo.new(0.15), {Size = UDim2.new(0, 24, 0, 24)}):Play()
            tooltip.Visible = false
        end)
        cb.InputBegan:Connect(function(i)
            if i.UserInputType == Enum.UserInputType.Touch or i.UserInputType == Enum.UserInputType.MouseButton1 then
                TweenService:Create(cb, TweenInfo.new(0.08), {Size = UDim2.new(0, 20, 0, 20)}):Play()
            end
        end)
        cb.InputEnded:Connect(function(i)
            if i.UserInputType == Enum.UserInputType.Touch or i.UserInputType == Enum.UserInputType.MouseButton1 then
                TweenService:Create(cb, TweenInfo.new(0.12), {Size = UDim2.new(0, 24, 0, 24)}):Play()
            end
        end)
        table.insert(colorBtns, {btn = cb, color = color})
    end

    local scrollOff = 0
    local function doScroll()
        TweenService:Create(grid, TweenInfo.new(0.2, Enum.EasingStyle.Quart), {
            Position = UDim2.new(0, -scrollOff, 0, 0)
        }):Play()
    end
    arrowL.MouseButton1Click:Connect(function()
        scrollOff = math.max(0, scrollOff - COLOR_CELL * 2)
        doScroll()
    end)
    arrowR.MouseButton1Click:Connect(function()
        scrollOff = scrollOff + COLOR_CELL * 2
        doScroll()
    end)

    return container, rbBtn, colorBtns
end

local PaletteFrame, RainbowBtn, colorButtons = buildPalette(ScrollFrame)

-- ═══════════════════════════════════════════════════════
--  НАСТРОЙКИ
-- ═══════════════════════════════════════════════════════

local SettingsFrame = Instance.new("Frame")
SettingsFrame.Parent = ScrollFrame
SettingsFrame.BackgroundTransparency = 1
SettingsFrame.Size = UDim2.new(1, 0, 0, 400)
SettingsFrame.Visible = false

local function makeLabel(parent, text, posY)
    local lbl = Instance.new("TextLabel")
    lbl.Parent = parent
    lbl.BackgroundTransparency = 1
    lbl.Position = UDim2.new(0, 0, 0, posY)
    lbl.Size = UDim2.new(1, 0, 0, 14)
    lbl.Font = Enum.Font.Gotham
    lbl.Text = text
    lbl.TextColor3 = Color3.fromRGB(150, 170, 195)
    lbl.TextSize = 10
    lbl.TextXAlignment = Enum.TextXAlignment.Left
    return lbl
end

local activeSlider = nil

UserInputService.InputChanged:Connect(function(i)
    if not activeSlider then return end
    if i.UserInputType == Enum.UserInputType.MouseMovement or i.UserInputType == Enum.UserInputType.Touch then
        activeSlider(i.Position.X)
    end
end)
UserInputService.InputEnded:Connect(function(i)
    if i.UserInputType == Enum.UserInputType.MouseButton1 or i.UserInputType == Enum.UserInputType.Touch then
        activeSlider = nil
    end
end)

local function makeSlider(parent, posY, minV, maxV, defaultV, onChange, label)
    local track = Instance.new("Frame")
    track.Parent = parent
    track.BackgroundColor3 = Theme.background
    track.BackgroundTransparency = 0.82
    track.Position = UDim2.new(0, 0, 0, posY)
    track.Size = UDim2.new(1, 0, 0, 12)
    track.BorderSizePixel = 0
    Style.applyCorner(track, 1)

    local fill = Instance.new("Frame")
    fill.Parent = track
    fill.BackgroundColor3 = Theme.primary
    fill.BackgroundTransparency = 0.3
    fill.Size = UDim2.new((defaultV-minV)/(maxV-minV), 0, 1, 0)
    fill.BorderSizePixel = 0
    Style.applyCorner(fill, 1)

    local knob = Instance.new("Frame")
    knob.Parent = track
    knob.BackgroundColor3 = Theme.text
    knob.BackgroundTransparency = 0.2
    knob.Size = UDim2.new(0, 18, 0, 18)
    knob.Position = UDim2.new((defaultV-minV)/(maxV-minV), -9, 0.5, -9)
    knob.BorderSizePixel = 0
    knob.ZIndex = 5
    Style.applyCorner(knob, 1)

    local valueLabel = Instance.new("TextLabel")
    valueLabel.Parent = track
    valueLabel.BackgroundTransparency = 1
    valueLabel.Position = UDim2.new(1, -30, 0, -14)
    valueLabel.Size = UDim2.new(0, 30, 0, 12)
    valueLabel.Font = Enum.Font.Gotham
    valueLabel.Text = tostring(math.round(defaultV * 100) / 100)
    valueLabel.TextColor3 = Theme.textDim
    valueLabel.TextSize = 9
    valueLabel.TextXAlignment = Enum.TextXAlignment.Right

    local function applyX(absX)
        local rel = math.clamp((absX - track.AbsolutePosition.X) / track.AbsoluteSize.X, 0, 1)
        local val = minV + (maxV - minV) * rel
        fill.Size = UDim2.new(rel, 0, 1, 0)
        knob.Position = UDim2.new(rel, -9, 0.5, -9)
        valueLabel.Text = tostring(math.round(val * 100) / 100)
        onChange(val)
    end

    track.InputBegan:Connect(function(i)
        if i.UserInputType == Enum.UserInputType.MouseButton1 or i.UserInputType == Enum.UserInputType.Touch then
            activeSlider = applyX
            applyX(i.Position.X)
        end
    end)

    return track
end

makeLabel(SettingsFrame, "GUI Transparency", 0)
makeSlider(SettingsFrame, 16, 0.5, 0.95, 0.75, function(v)
    Frame.BackgroundTransparency = v
    GlassEffect.ImageTransparency = v - 0.3
end)

makeLabel(SettingsFrame, "GUI Size", 40)
makeSlider(SettingsFrame, 56, 150, 280, 175, function(v)
    local current = Frame.Size
    Frame.Size = UDim2.new(0, v, 0, current.Y.Offset)
    ShadowFrame.Size = UDim2.new(0, v, 0, current.Y.Offset)
end)

makeLabel(SettingsFrame, "Clone Opacity", 80)
makeSlider(SettingsFrame, 96, 0, 0.9, 0, function(v)
    State.cloneTransparency = v
end)

makeLabel(SettingsFrame, "Rainbow Speed", 120)
makeSlider(SettingsFrame, 136, 0.001, 0.02, 0.005, function(v)
    CONFIG.RAINBOW_SPEED = v
end)

makeLabel(SettingsFrame, "Debug Mode", 160)
local DebugToggle = Instance.new("TextButton")
DebugToggle.Parent = SettingsFrame
DebugToggle.BackgroundColor3 = Theme.background
DebugToggle.BackgroundTransparency = 0.82
DebugToggle.Position = UDim2.new(0, 0, 0, 176)
DebugToggle.Size = UDim2.new(1, 0, 0, 26)
DebugToggle.Font = Enum.Font.GothamBold
DebugToggle.Text = "🔍  Show Debug Info: OFF"
DebugToggle.TextColor3 = Theme.text
DebugToggle.TextSize = 11
DebugToggle.BorderSizePixel = 0
DebugToggle.AutoButtonColor = false
Style.applyCorner(DebugToggle, 8)
Style.applyStroke(DebugToggle, Theme.primary, 1, 0.6)
Style.applyHoverEffect(DebugToggle)
Style.applyPressEffect(DebugToggle, DebugToggle.Size)

makeLabel(SettingsFrame, "GUI Color", 210)
local GuiColorDot = Instance.new("Frame")
GuiColorDot.Parent = SettingsFrame
GuiColorDot.BackgroundColor3 = Color3.fromRGB(255, 255, 255)
GuiColorDot.Size = UDim2.new(0, 10, 0, 10)
GuiColorDot.Position = UDim2.new(1, -10, 0, 212)
GuiColorDot.BorderSizePixel = 0
GuiColorDot.ZIndex = 5
Style.applyCorner(GuiColorDot, 1)

local GCDStroke = Instance.new("UIStroke")
GCDStroke.Parent = GuiColorDot
GCDStroke.Color = Theme.text
GCDStroke.Thickness = 1
GCDStroke.Transparency = 0.4

local function applyGuiColor(color)
    Frame.BackgroundColor3 = color
    OuterStroke.Color = color
    Highlight.BackgroundColor3 = color
    TitleGlow.BackgroundColor3 = color
    TweenService:Create(GuiColorDot, TweenInfo.new(0.2), {BackgroundColor3 = color}):Play()
end

local GuiPaletteOpen = false

local GuiColorToggleBtn = Instance.new("TextButton")
GuiColorToggleBtn.Parent = SettingsFrame
GuiColorToggleBtn.BackgroundColor3 = Theme.background
GuiColorToggleBtn.BackgroundTransparency = 0.82
GuiColorToggleBtn.Position = UDim2.new(0, 0, 0, 228)
GuiColorToggleBtn.Size = UDim2.new(1, 0, 0, 26)
GuiColorToggleBtn.Font = Enum.Font.GothamBold
GuiColorToggleBtn.Text = "🎨  Pick GUI Color"
GuiColorToggleBtn.TextColor3 = Theme.text
GuiColorToggleBtn.TextSize = 11
GuiColorToggleBtn.BorderSizePixel = 0
GuiColorToggleBtn.AutoButtonColor = false
Style.applyCorner(GuiColorToggleBtn, 8)
Style.applyHoverEffect(GuiColorToggleBtn)
Style.applyPressEffect(GuiColorToggleBtn, GuiColorToggleBtn.Size)

local GuiPaletteContainer, GuiRainbowBtn, guiColorButtons = buildPalette(SettingsFrame)
GuiPaletteContainer.Position = UDim2.new(0, 0, 0, 258)

local function updateSettingsHeight()
    local h = 340
    if GuiPaletteOpen then
        h = 450
        GuiPaletteContainer.Visible = true
    else
        GuiPaletteContainer.Visible = false
    end
    SettingsFrame.Size = UDim2.new(1, 0, 0, h)
end
updateSettingsHeight()

local ResetPosBtn = Instance.new("TextButton")
ResetPosBtn.Parent = SettingsFrame
ResetPosBtn.BackgroundColor3 = Theme.background
ResetPosBtn.BackgroundTransparency = 0.82
ResetPosBtn.Position = UDim2.new(0, 0, 0, 340)
ResetPosBtn.Size = UDim2.new(1, 0, 0, 28)
ResetPosBtn.Font = Enum.Font.GothamBold
ResetPosBtn.Text = "↺  Reset Position"
ResetPosBtn.TextColor3 = Theme.text
ResetPosBtn.TextSize = 12
ResetPosBtn.BorderSizePixel = 0
ResetPosBtn.AutoButtonColor = false
Style.applyCorner(ResetPosBtn, 8)
Style.applyHoverEffect(ResetPosBtn)
Style.applyPressEffect(ResetPosBtn, ResetPosBtn.Size)

ResetPosBtn.MouseButton1Click:Connect(function()
    debounce("resetPos", 0.5, function()
        TweenService:Create(Frame, TweenInfo.new(0.3, Enum.EasingStyle.Quart), {
            Position = UDim2.new(0.05, 0, 0.35, 0)
        }):Play()
        TweenService:Create(ShadowFrame, TweenInfo.new(0.3, Enum.EasingStyle.Quart), {
            Position = UDim2.new(0.05, 4, 0.35, 4)
        }):Play()
        ToastSystem.show("Position reset!", 1.5, Theme.primary)
    end)
end)

-- ═══════════════════════════════════════════════════════
--  АНИМАЦИЯ ПАНЕЛЕЙ
-- ═══════════════════════════════════════════════════════

local paletteOpen = false
local settingsOpen = false
local collapsed = false

local function animatePanel(panel, opening, baseY)
    if opening then
        panel.Position = UDim2.new(0, 0, 0, baseY + 14)
        panel.Visible = true
        TweenService:Create(panel, TweenInfo.new(0.22, Enum.EasingStyle.Quart, Enum.EasingDirection.Out), {
            Position = UDim2.new(0, 0, 0, baseY)
        }):Play()
    else
        TweenService:Create(panel, TweenInfo.new(0.16, Enum.EasingStyle.Quart, Enum.EasingDirection.In), {
            Position = UDim2.new(0, 0, 0, baseY + 10)
        }):Play()
        task.delay(0.16, function()
            panel.Visible = false
            panel.Position = UDim2.new(0, 0, 0, baseY)
        end)
    end
end

ToggleBtn.MouseButton1Click:Connect(function()
    debounce("toggle", 0.3, function()
        collapsed = not collapsed
        if collapsed then
            TweenService:Create(Frame, TweenInfo.new(0.25, Enum.EasingStyle.Quart), {
                Size = UDim2.new(0, Frame.Size.X.Offset, 0, 36)
            }):Play()
            TweenService:Create(ShadowFrame, TweenInfo.new(0.25, Enum.EasingStyle.Quart), {
                Size = UDim2.new(0, Frame.Size.X.Offset, 0, 36)
            }):Play()
            ScrollFrame.Visible = false
            Divider.Visible = false
            ToggleBtn.Text = "+"
            ToastSystem.show("GUI minimized", 1)
        else
            TweenService:Create(Frame, TweenInfo.new(0.25, Enum.EasingStyle.Quart), {
                Size = UDim2.new(0, Frame.Size.X.Offset, 0, 260)
            }):Play()
            TweenService:Create(ShadowFrame, TweenInfo.new(0.25, Enum.EasingStyle.Quart), {
                Size = UDim2.new(0, Frame.Size.X.Offset, 0, 260)
            }):Play()
            ScrollFrame.Visible = true
            Divider.Visible = true
            ToggleBtn.Text = "−"
            ToastSystem.show("GUI restored", 1)
        end
    end)
end)

ColorToggleBtn.MouseButton1Click:Connect(function()
    debounce("color", 0.3, function()
        paletteOpen = not paletteOpen
        settingsOpen = false
        animatePanel(SettingsFrame, false, 0)
        SettingsToggleBtn.Text = "⚙️  Settings"
        animatePanel(PaletteFrame, paletteOpen, 0)
        ColorToggleBtn.Text = paletteOpen and "🎨  Hide Colors" or "🎨  Color"
    end)
end)

SettingsToggleBtn.MouseButton1Click:Connect(function()
    debounce("settings", 0.3, function()
        settingsOpen = not settingsOpen
        paletteOpen = false
        animatePanel(PaletteFrame, false, 0)
        ColorToggleBtn.Text = "🎨  Color"
        animatePanel(SettingsFrame, settingsOpen, 0)
        SettingsToggleBtn.Text = settingsOpen and "⚙️  Hide Settings" or "⚙️  Settings"
    end)
end)

GuiColorToggleBtn.MouseButton1Click:Connect(function()
    debounce("guiColor", 0.3, function()
        GuiPaletteOpen = not GuiPaletteOpen
        updateSettingsHeight()
        GuiColorToggleBtn.Text = GuiPaletteOpen and "🎨  Hide GUI Colors" or "🎨  Pick GUI Color"
    end)
end)

UserInputService.InputBegan:Connect(function(input, gameProcessed)
    if gameProcessed then return end
    if input.KeyCode == CONFIG.HOTKEY then
        debounce("hotkey", 0.3, function()
            MainButton.MouseButton1Click:Fire()
        end)
    end
end)

-- ═══════════════════════════════════════════════════════
--  ЛОГИКА ЛАЗЕРОВ
-- ═══════════════════════════════════════════════════════

local SMOOTH_SAMPLES = CONFIG.SMOOTH_SAMPLES
local MIN_SPEED = CONFIG.MIN_SPEED
local POLL_INTERVAL = CONFIG.POLL_INTERVAL
local MIN_DT = CONFIG.MIN_DT
local WAVE_THRESHOLD = CONFIG.WAVE_THRESHOLD

local ClonePool = {
    available = {},
    inUse = {},
    maxSize = CONFIG.MAX_CLONES,
}

function ClonePool.get()
    if #ClonePool.available > 0 then
        local clone = table.remove(ClonePool.available)
        ClonePool.inUse[clone] = true
        return clone
    end
    return nil
end

function ClonePool.release(clone)
    if ClonePool.inUse[clone] then
        ClonePool.inUse[clone] = nil
        clone:ClearAllChildren()
        clone.Parent = nil
        table.insert(ClonePool.available, clone)
    end
end

function ClonePool.cleanup()
    for clone, _ in pairs(ClonePool.inUse) do
        pcall(function() clone:Destroy() end)
    end
    ClonePool.inUse = {}
    for _, clone in ipairs(ClonePool.available) do
        pcall(function() clone:Destroy() end)
    end
    ClonePool.available = {}
end

task.spawn(function()
    while true do
        if State.rainbowMode then
            State.rainbowHue = (State.rainbowHue + CONFIG.RAINBOW_SPEED) % 1
            local newColor = Color3.fromHSV(State.rainbowHue, 1, 1)
            State.cloneColor = newColor
            updateColorDot(newColor)
            for clone, parts in pairs(State.clonePartCache) do
                if clone and clone.Parent then
                    for _, part in ipairs(parts) do
                        if part and part.Parent then
                            part.Color = newColor
                        end
                    end
                else
                    State.clonePartCache[clone] = nil
                end
            end
        end
        if State.guiRainbowMode then
            State.guiRainbowHue = (State.guiRainbowHue + CONFIG.RAINBOW_SPEED) % 1
            applyGuiColor(Color3.fromHSV(State.guiRainbowHue, 0.4, 1))
        end
        task.wait(0.05)
    end
end)

local function colorStructure(object, color, transparency)
    local t = transparency ~= nil and transparency or State.cloneTransparency
    if object:IsA("BasePart") then
        object.Color = color
        object.Transparency = t
        object.Material = Enum.Material.Neon
        object.CanCollide = false
        object.CanTouch = false
        object.CanQuery = false
        object.Anchored = true
    end
    for _, child in ipairs(object:GetChildren()) do
        colorStructure(child, color, t)
    end
end

local function buildPartCache(clone)
    local parts = {}
    if clone:IsA("BasePart") then table.insert(parts, clone) end
    for _, d in ipairs(clone:GetDescendants()) do
        if d:IsA("BasePart") then table.insert(parts, d) end
    end
    State.clonePartCache[clone] = parts
end

local function createDynamicPrediction(original, initialSpeed, initialDir)
    local now = os.clock()
    
    if #State.activeClones >= CONFIG.MAX_CLONES then
        local oldest = table.remove(State.activeClones, 1)
        if oldest and oldest.clone then
            pcall(function() oldest.clone:Destroy() end)
            State.clonePartCache[oldest.clone] = nil
        end
    end

    for i = #State.activeClones, 1, -1 do
        local entry = State.activeClones[i]
        if (now - entry.time) >= WAVE_THRESHOLD then
            if entry.clone and entry.clone.Parent then entry.clone:Destroy() end
            State.clonePartCache[entry.clone] = nil
            table.remove(State.activeClones, i)
        end
    end

    local clone = original:Clone()
    for _, child in ipairs(clone:GetDescendants()) do
        if child:IsA("Script") or child:IsA("LocalScript") or child:IsA("ModuleScript") then
            child:Destroy()
        end
    end

    colorStructure(clone, State.cloneColor, State.cloneTransparency)
    clone:SetAttribute("IsLaserClone", true)
    clone:PivotTo(original:GetPivot())
    clone.Parent = Workspace
    buildPartCache(clone)
    table.insert(State.activeClones, {clone = clone, time = os.clock()})

    local autonomousSpeed = initialSpeed
    local autonomousDir = initialDir
    local isAutonomous = false

    local conn
    conn = RunService.Heartbeat:Connect(function(dt)
        if not State.isActive or not clone or not clone.Parent then
            if conn then conn:Disconnect() end
            State.clonePartCache[clone] = nil
            pcall(function() if clone then clone:Destroy() end end)
            return
        end
        if not isAutonomous then
            if original and original.Parent then
                local ok, cf = pcall(function() return original:GetPivot() end)
                if ok then clone:PivotTo(cf) else isAutonomous = true end
            else
                isAutonomous = true
            end
        else
            local currentPivot = clone:GetPivot()
            clone:PivotTo(currentPivot + (autonomousDir * (autonomousSpeed * dt)))
        end
    end)

    table.insert(State.activeConnections, conn)
    return function(newSpeed, newDir)
        autonomousSpeed = newSpeed
        autonomousDir = newDir
    end
end

local function mainLoop()
    local lastScan = 0
    local laserCache = {}

    while State.isActive do
        local now = os.clock()

        if now - lastScan > 0.5 then
            lastScan = now
            laserCache = {}
            for _, obj in ipairs(Workspace:GetDescendants()) do
                if obj:GetAttribute("IsLaserClone") then continue end
                local isLaser = obj.Name:lower():find("laser") or obj.Name:lower():find("beam")
                if isLaser and (obj:IsA("BasePart") or obj:IsA("Model")) then
                    local primaryPart = obj:IsA("Model") and obj.PrimaryPart or obj
                    if primaryPart and primaryPart:IsA("BasePart") then
                        table.insert(laserCache, obj)
                    end
                end
            end
            State.trackedCount = #laserCache
            DebugLabel.Text = "Tracking: " .. State.trackedCount .. " lasers"
        end

        for _, obj in ipairs(laserCache) do
            if not obj.Parent then continue end
            if obj:GetAttribute("IsLaserClone") then continue end

            local primaryPart = obj:IsA("Model") and obj.PrimaryPart or obj
            if not (primaryPart and primaryPart:IsA("BasePart")) then continue end

            if not State.trackedLasers[obj] then
                State.trackedLasers[obj] = {
                    lastPos = primaryPart.Position, lastTime = os.clock(),
                    samples = {}, sampleIdx = 0, updateVec = nil, hasClone = false,
                }
            else
                local data = State.trackedLasers[obj]
                local currentTime = os.clock()
                local dt = currentTime - data.lastTime
                if dt >= MIN_DT then
                    local currentPos = primaryPart.Position
                    local displacement = currentPos - data.lastPos
                    local distance = displacement.Magnitude
                    if distance > 0.01 then
                        local speed = distance / dt
                        local dir = displacement.Unit
                        local s = data.samples
                        data.sampleIdx = (data.sampleIdx % SMOOTH_SAMPLES) + 1
                        s[data.sampleIdx] = {speed = speed, dir = dir}
                        local totalWeight, avgSpeed = 0, 0
                        local avgDX, avgDY, avgDZ = 0, 0, 0
                        for i, sample in ipairs(s) do
                            local age = (data.sampleIdx - i) % SMOOTH_SAMPLES
                            local weight = SMOOTH_SAMPLES - age
                            totalWeight = totalWeight + weight
                            avgSpeed = avgSpeed + sample.speed * weight
                            avgDX = avgDX + sample.dir.X * weight
                            avgDY = avgDY + sample.dir.Y * weight
                            avgDZ = avgDZ + sample.dir.Z * weight
                        end
                        if totalWeight > 0 then
                            avgSpeed = avgSpeed / totalWeight
                            local rawDir = Vector3.new(avgDX/totalWeight, avgDY/totalWeight, avgDZ/totalWeight)
                            local smoothDir = rawDir.Magnitude > 0.001 and rawDir.Unit or dir
                            if avgSpeed > MIN_SPEED then
                                if data.updateVec then data.updateVec(avgSpeed, smoothDir) end
                                if not data.hasClone and #s >= math.min(3, SMOOTH_SAMPLES) then
                                    data.hasClone = true
                                    local updateFn = createDynamicPrediction(obj, avgSpeed, smoothDir)
                                    data.updateVec = updateFn
                                    State.trackedLasers[obj] = nil
                                    obj:Destroy()
                                end
                            end
                        end
                    end
                    if State.trackedLasers[obj] then
                        data.lastPos = currentPos
                        data.lastTime = currentTime
                    end
                end
            end
        end

        for obj in pairs(State.trackedLasers) do
            if not obj.Parent then State.trackedLasers[obj] = nil end
        end

        task.wait(POLL_INTERVAL)
    end
end

local function cleanUp()
    for _, conn in ipairs(State.activeConnections) do
        if conn then conn:Disconnect() end
    end
    table.clear(State.activeConnections)
    table.clear(State.trackedLasers)
    for _, entry in ipairs(State.activeClones) do
        if entry.clone and entry.clone.Parent then entry.clone:Destroy() end
    end
    table.clear(State.activeClones)
    table.clear(State.clonePartCache)
    ClonePool.cleanup()
end

task.spawn(function()
    while Highlight and Highlight.Parent do
        TweenService:Create(Highlight, TweenInfo.new(2.5, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut), {BackgroundTransparency = 0.85}):Play()
        task.wait(2.5)
        TweenService:Create(Highlight, TweenInfo.new(2.5, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut), {BackgroundTransparency = 0.55}):Play()
        task.wait(2.5)
    end
end)

-- ═══════════════════════════════════════════════════════
--  ОБРАБОТЧИКИ СОБЫТИЙ
-- ═══════════════════════════════════════════════════════

RainbowBtn.MouseButton1Click:Connect(function()
    debounce("rainbow", 0.3, function()
        State.rainbowMode = not State.rainbowMode
        RainbowBtn.Text = State.rainbowMode and "🌈  Rainbow ON" or "🌈  Rainbow"
        TweenService:Create(RainbowBtn, TweenInfo.new(0.2), {BackgroundTransparency = State.rainbowMode and 0.4 or 0.82}):Play()
        ToastSystem.show(State.rainbowMode and "Rainbow mode enabled!" or "Rainbow mode disabled", 1.5, State.rainbowMode and Color3.fromRGB(255, 100, 200) or Theme.primary)
    end)
end)

for _, entry in ipairs(colorButtons) do
    entry.btn.MouseButton1Click:Connect(function()
        debounce("color" .. tostring(entry.color), 0.1, function()
            State.rainbowMode = false
            RainbowBtn.Text = "🌈  Rainbow"
            TweenService:Create(RainbowBtn, TweenInfo.new(0.2), {BackgroundTransparency = 0.82}):Play()
            State.cloneColor = entry.color
            updateColorDot(State.cloneColor)
            for _, cloneEntry in ipairs(State.activeClones) do
                if cloneEntry.clone and cloneEntry.clone.Parent then
                    colorStructure(cloneEntry.clone, State.cloneColor, State.cloneTransparency)
                end
            end
            ToastSystem.show("Color updated!", 1, entry.color)
        end)
    end)
end

GuiRainbowBtn.MouseButton1Click:Connect(function()
    debounce("guiRainbow", 0.3, function()
        State.guiRainbowMode = not State.guiRainbowMode
        GuiRainbowBtn.Text = State.guiRainbowMode and "🌈  Rainbow ON" or "🌈  Rainbow"
        TweenService:Create(GuiRainbowBtn, TweenInfo.new(0.2), {BackgroundTransparency = State.guiRainbowMode and 0.4 or 0.82}):Play()
    end)
end)

for _, entry in ipairs(guiColorButtons) do
    entry.btn.MouseButton1Click:Connect(function()
        debounce("guiColor" .. tostring(entry.color), 0.1, function()
            State.guiRainbowMode = false
            GuiRainbowBtn.Text = "🌈  Rainbow"
            TweenService:Create(GuiRainbowBtn, TweenInfo.new(0.2), {BackgroundTransparency = 0.82}):Play()
            applyGuiColor(entry.color)
            ToastSystem.show("GUI color updated!", 1, entry.color)
        end)
    end)
end

DebugToggle.MouseButton1Click:Connect(function()
    debounce("debug", 0.3, function()
        DebugLabel.Visible = not DebugLabel.Visible
        DebugToggle.Text = DebugLabel.Visible and "🔍  Show Debug Info: ON" or "🔍  Show Debug Info: OFF"
        ToastSystem.show(DebugLabel.Visible and "Debug info visible" or "Debug info hidden", 1)
    end)
end)

MainButton.MouseButton1Click:Connect(function()
    debounce("main", 0.3, function()
        if not State.isActive then
            State.isActive = true
            MainButton.Text = "⚡  Active..."
            TweenService:Create(MainButton, TweenInfo.new(0.2), {
                BackgroundColor3 = Theme.accent,
                BackgroundTransparency = 0.6
            }):Play()
            TweenService:Create(StatusIndicator, TweenInfo.new(0.3), {BackgroundColor3 = Theme.accent}):Play()
            TweenService:Create(StatusPulse, TweenInfo.new(0.3), {BackgroundColor3 = Theme.accent}):Play()
            task.spawn(mainLoop)
            ToastSystem.show("Laser tracking activated!", 2, Theme.accent)
        else
            State.isActive = false
            MainButton.Text = "⚡  Ignore Lasers"
            TweenService:Create(MainButton, TweenInfo.new(0.2), {
                BackgroundColor3 = Theme.background,
                BackgroundTransparency = 0.82
            }):Play()
            TweenService:Create(StatusIndicator, TweenInfo.new(0.3), {BackgroundColor3 = Theme.danger}):Play()
            TweenService:Create(StatusPulse, TweenInfo.new(0.3), {BackgroundColor3 = Theme.danger}):Play()
            cleanUp()
            ToastSystem.show("Laser tracking disabled", 2, Theme.danger)
        end
    end)
end)

-- ═══════════════════════════════════════════════════════
--  ИНТРО-АНИМАЦИЯ
-- ═══════════════════════════════════════════════════════

Frame.Position = UDim2.new(0.05, 0, 0.35, 20)
Frame.Size = UDim2.new(0, 175, 0, 0)
Frame.BackgroundTransparency = 1

local introTweens = {
    TweenService:Create(Frame, TweenInfo.new(0.5, Enum.EasingStyle.Back, Enum.EasingDirection.Out), {
        Position = UDim2.new(0.05, 0, 0.35, 0),
        Size = UDim2.new(0, 175, 0, 260)
    }),
    TweenService:Create(Frame, TweenInfo.new(0.6), {BackgroundTransparency = 1}),
    TweenService:Create(ShadowFrame, TweenInfo.new(0.5, Enum.EasingStyle.Back, Enum.EasingDirection.Out), {
        Position = UDim2.new(0.05, 4, 0.35, 4),
        Size = UDim2.new(0, 175, 0, 260)
    }),
}

for _, tween in ipairs(introTweens) do
    tween:Play()
end

ShadowFrame.Visible = true

task.delay(0.3, function()
    for _, child in ipairs(ScrollFrame:GetChildren()) do
        if child:IsA("TextButton") or child:IsA("Frame") then
            child.BackgroundTransparency = 1
            TweenService:Create(child, TweenInfo.new(0.3), {BackgroundTransparency = child:GetAttribute("OriginalTrans") or 0.82}):Play()
        end
    end
end)

task.delay(0.8, function()
    ToastSystem.show("Laser Tool loaded! Press L to toggle lasers", 3, Theme.primary)
end)

`
    });
}
