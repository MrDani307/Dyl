const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const COUNTER_URL = "https://script.google.com/macros/s/AKfycbwAaAoVS_HpdsIgaauLs0QG2U4DnRvTBfsEDJhl_eesoQ-7ahLqEm16_iWfh-ft-YY-/exec";

app.get('/init', (req, res) => {
    res.json({ status: "ok" });
});

app.post('/log', async (req, res) => {
    const { player, gameName, placeId } = req.body;
    try {
        await fetch(COUNTER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `p=${encodeURIComponent(player)}&pl=${encodeURIComponent(gameName)}&pid=${placeId}`
        });
        res.json({ status: "logged" });
    } catch (e) {
        res.status(500).json({ error: "Failed to log" });
    }
});

app.post('/get-feature', (req, res) => {
    const { feature } = req.body;

    if (feature === "ui_builder") {
        return res.json({
            code: `
                local ScreenGui, Theme, Style = ...
                
                local ShadowFrame = Instance.new("Frame")
                ShadowFrame.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
                ShadowFrame.BackgroundTransparency = 0.8
                ShadowFrame.Position = UDim2.new(0.05, 4, 0.35, 4)
                ShadowFrame.Size = UDim2.new(0, 175, 0, 260)
                ShadowFrame.ZIndex = 0
                Style.applyCorner(ShadowFrame, 16)
                ShadowFrame.Parent = ScreenGui

                local Frame = Instance.new("Frame")
                Frame.BackgroundColor3 = Color3.fromRGB(255, 255, 255)
                Frame.BackgroundTransparency = 1
                Frame.Position = UDim2.new(0.05, 0, 0.35, 20)
                Frame.Size = UDim2.new(0, 175, 0, 0)
                Frame.Active = true
                Frame.ClipsDescendants = true
                Style.applyCorner(Frame, 16)
                local OuterStroke = Style.applyStroke(Frame, Theme.primary, 1.2, 0.6)
                Frame.Parent = ScreenGui

                local GlassEffect = Instance.new("ImageLabel")
                GlassEffect.BackgroundTransparency = 1
                GlassEffect.Size = UDim2.new(1, 0, 1, 0)
                GlassEffect.Image = "rbxassetid://10531154831"
                GlassEffect.ImageTransparency = 0.3
                GlassEffect.ScaleType = Enum.ScaleType.Crop
                GlassEffect.ZIndex = 0
                GlassEffect.Parent = Frame

                local ParticleCanvas = Instance.new("Frame")
                ParticleCanvas.BackgroundTransparency = 1
                ParticleCanvas.Size = UDim2.new(1, 0, 1, 0)
                ParticleCanvas.ZIndex = 0
                ParticleCanvas.ClipsDescendants = true
                ParticleCanvas.Parent = Frame

                local TitleGlow = Instance.new("Frame")
                TitleGlow.BackgroundColor3 = Theme.primary
                TitleGlow.BackgroundTransparency = 0.9
                TitleGlow.Position = UDim2.new(0.05, 0, 0, 2)
                TitleGlow.Size = UDim2.new(0.9, 0, 0, 30)
                TitleGlow.BorderSizePixel = 0
                TitleGlow.ZIndex = 0
                Style.applyCorner(TitleGlow, 8)
                TitleGlow.Parent = Frame

                local Highlight = Instance.new("Frame")
                Highlight.BackgroundColor3 = Theme.primary
                Highlight.BackgroundTransparency = 0.6
                Highlight.Position = UDim2.new(0.08, 0, 0, 4)
                Highlight.Size = UDim2.new(0.84, 0, 0, 4)
                Highlight.BorderSizePixel = 0
                Style.applyCorner(Highlight, 1)
                Highlight.Parent = Frame

                local TitleIcon = Instance.new("TextLabel")
                TitleIcon.BackgroundTransparency = 1
                TitleIcon.Position = UDim2.new(0, 8, 0, 2)
                TitleIcon.Size = UDim2.new(0, 24, 0, 34)
                TitleIcon.Font = Enum.Font.GothamBold
                TitleIcon.Text = "🔦"
                TitleIcon.TextColor3 = Theme.text
                TitleIcon.TextSize = 16
                TitleIcon.TextXAlignment = Enum.TextXAlignment.Center
                TitleIcon.Parent = Frame

                local Title = Instance.new("TextLabel")
                Title.BackgroundTransparency = 1
                Title.Size = UDim2.new(1, -60, 0, 34)
                Title.Position = UDim2.new(0, 32, 0, 2)
                Title.Font = Enum.Font.GothamBold
                Title.Text = "Laser Tool"
                Title.TextColor3 = Theme.text
                Title.TextSize = 14
                Title.TextXAlignment = Enum.TextXAlignment.Left
                Title.Active = true
                Title.Parent = Frame

                local StatusIndicator = Instance.new("Frame")
                StatusIndicator.BackgroundColor3 = Theme.danger
                StatusIndicator.Size = UDim2.new(0, 8, 0, 8)
                StatusIndicator.Position = UDim2.new(1, -36, 0, 13)
                StatusIndicator.BorderSizePixel = 0
                StatusIndicator.ZIndex = 5
                Style.applyCorner(StatusIndicator, 1)
                StatusIndicator.Parent = Frame

                local StatusPulse = Instance.new("Frame")
                StatusPulse.BackgroundColor3 = Theme.danger
                StatusPulse.Size = UDim2.new(1, 0, 1, 0)
                StatusPulse.BorderSizePixel = 0
                StatusPulse.ZIndex = 4
                Style.applyCorner(StatusPulse, 1)
                StatusPulse.Parent = StatusIndicator

                local CounterLabel = Instance.new("TextLabel")
                CounterLabel.BackgroundTransparency = 1
                CounterLabel.Position = UDim2.new(0, 0, 0, 18)
                CounterLabel.Size = UDim2.new(1, 0, 0, 11)
                CounterLabel.Font = Enum.Font.Gotham
                CounterLabel.Text = "Uses: 0"
                CounterLabel.TextColor3 = Theme.textDim
                CounterLabel.TextSize = 8
                CounterLabel.TextXAlignment = Enum.TextXAlignment.Center
                CounterLabel.Parent = Frame

                local DebugLabel = Instance.new("TextLabel")
                DebugLabel.BackgroundTransparency = 1
                DebugLabel.Position = UDim2.new(0, 0, 0, 28)
                DebugLabel.Size = UDim2.new(1, 0, 0, 10)
                DebugLabel.Font = Enum.Font.Gotham
                DebugLabel.Text = "Tracking: 0 lasers"
                DebugLabel.TextColor3 = Theme.textDim
                DebugLabel.TextSize = 7
                DebugLabel.TextXAlignment = Enum.TextXAlignment.Center
                DebugLabel.Visible = false
                DebugLabel.Parent = Frame

                local ToggleBtn = Instance.new("TextButton")
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
                ToggleBtn.Parent = Frame

                local Divider = Instance.new("Frame")
                Divider.BackgroundColor3 = Theme.primary
                Divider.BackgroundTransparency = 0.7
                Divider.Position = UDim2.new(0, 12, 0, 34)
                Divider.Size = UDim2.new(1, -24, 0, 1)
                Divider.BorderSizePixel = 0
                Divider.Parent = Frame

                local ScrollFrame = Instance.new("ScrollingFrame")
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
                ScrollFrame.Parent = Frame

                local ScrollLayout = Instance.new("UIListLayout")
                ScrollLayout.SortOrder = Enum.SortOrder.LayoutOrder
                ScrollLayout.Padding = UDim.new(0, 5)
                ScrollLayout.Parent = ScrollFrame

                local ScrollPadding = Instance.new("UIPadding")
                ScrollPadding.PaddingLeft = UDim.new(0, 10)
                ScrollPadding.PaddingRight = UDim.new(0, 10)
                ScrollPadding.PaddingTop = UDim.new(0, 5)
                ScrollPadding.PaddingBottom = UDim.new(0, 10)
                ScrollPadding.Parent = ScrollFrame

                return {
                    Frame = Frame, ShadowFrame = ShadowFrame, GlassEffect = GlassEffect, ParticleCanvas = ParticleCanvas,
                    Highlight = Highlight, TitleGlow = TitleGlow, Title = Title, StatusIndicator = StatusIndicator,
                    StatusPulse = StatusPulse, CounterLabel = CounterLabel, DebugLabel = DebugLabel, ToggleBtn = ToggleBtn,
                    Divider = Divider, ScrollFrame = ScrollFrame, OuterStroke = OuterStroke
                }
            `
        });
    }

    if (feature === "toast_system") {
        return res.json({
            code: `
                local ScreenGui, Theme, Style, TweenService, task_wait, task_delay = ...
                local ToastSystem = { queue = {}, active = false }
                
                function ToastSystem.process()
                    if #ToastSystem.queue == 0 then ToastSystem.active = false return end
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
                    
                    TweenService:Create(toastFrame, TweenInfo.new(0.3, Enum.EasingStyle.Back), { Position = UDim2.new(0.5, -100, 0, 20) }):Play()
                    task_wait(toast.duration)
                    TweenService:Create(toastFrame, TweenInfo.new(0.3), { Position = UDim2.new(0.5, -100, 0, -50), BackgroundTransparency = 1 }):Play()
                    task_delay(0.3, function()
                        toastFrame:Destroy()
                        ToastSystem.process()
                    end)
                end

                function ToastSystem.show(text, duration, color)
                    duration = duration or 2
                    color = color or Theme.primary
                    table.insert(ToastSystem.queue, {text = text, duration = duration, color = color})
                    if not ToastSystem.active then ToastSystem.process() end
                end

                return ToastSystem
            `
        });
    }

    if (feature === "constructors") {
        return res.json({
            code: `
                local Theme, Style, TweenService = ...
                local Utils = {}

                function Utils.makeButton(parent, text, h, layoutOrder, color)
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

                function Utils.makeLabel(parent, text, posY)
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

                return Utils
            `
        });
    }

    if (feature === "palette_builder") {
        return res.json({
            code: `
                local ScrollFrame, Theme, Style, TweenService, ALL_COLORS, COLOR_CELL = ...
                return function(parentFrame)
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
                    clip.Position = UDim2.new(0, 24, 0, 64)
                    clip.Size = UDim2.new(1, -48, 0, 60)
                    clip.BackgroundTransparency = 1
                    clip.ClipsDescendants = true
                    
                    local grid = Instance.new("Frame")
                    grid.Parent = clip
                    grid.BackgroundTransparency = 1
                    grid.Size = UDim2.new(0, 9999, 1, 0)
                    
                    local uiGrid = Instance.new("UIGridLayout")
                    uiGrid.Parent = grid
                    uiGrid.CellSize = UDim2.new(0, 24, 0, 24)
                    uiGrid.CellPadding = UDim2.new(0, 3, 0, 3)
                    uiGrid.FillDirectionMaxCells = 1
                    uiGrid.FillDirection = Enum.FillDirection.Vertical
                    
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
                    arrowL.MouseButton1Click:Connect(function()
                        scrollOff = math.max(0, scrollOff - COLOR_CELL * 2)
                        TweenService:Create(grid, TweenInfo.new(0.2, Enum.EasingStyle.Quart), { Position = UDim2.new(0, -scrollOff, 0, 0) }):Play()
                    end)
                    arrowR.MouseButton1Click:Connect(function()
                        scrollOff = scrollOff + COLOR_CELL * 2
                        TweenService:Create(grid, TweenInfo.new(0.2, Enum.EasingStyle.Quart), { Position = UDim2.new(0, -scrollOff, 0, 0) }):Play()
                    end)
                    
                    return container, rbBtn, colorBtns
                end
            `
        });
    }

    if (feature === "anims_and_loops") {
        return res.json({
            code: `
                local ParticleCanvas, bgParticles, StatusPulse, Highlight, Frame, ShadowFrame, ScrollFrame, TweenService, Theme, math_random, task_spawn, task_wait, UDim2, math_sin, math_clamp = ...
                
                task_spawn(function()
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
                                local pulse = math_sin(timeAcc * pt.pulseRate + pt.phase) * 0.12
                                pt.gui.BackgroundTransparency = math_clamp(pt.baseTrans + pulse, 0.75, 0.95)
                                local szPulse = 1 + math_sin(timeAcc * pt.pulseRate * 0.7 + pt.phase) * 0.2
                                pt.gui.Size = UDim2.new(0, pt.sz * szPulse, 0, pt.sz * szPulse)
                            end
                        end
                        task_wait(0.016)
                    end
                end)

                task_spawn(function()
                    while StatusPulse and StatusPulse.Parent do
                        TweenService:Create(StatusPulse, TweenInfo.new(1), {
                            Size = UDim2.new(3, 0, 3, 0), Position = UDim2.new(-1, 0, -1, 0), BackgroundTransparency = 1
                        }):Play()
                        task_wait(1)
                        StatusPulse.Size = UDim2.new(1, 0, 1, 0)
                        StatusPulse.Position = UDim2.new(0, 0, 0, 0)
                        StatusPulse.BackgroundTransparency = 0.7
                    end
                end)

                task_spawn(function()
                    while Highlight and Highlight.Parent do
                        TweenService:Create(Highlight, TweenInfo.new(2.5, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut), {BackgroundTransparency = 0.85}):Play()
                        task_wait(2.5)
                        TweenService:Create(Highlight, TweenInfo.new(2.5, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut), {BackgroundTransparency = 0.55}):Play()
                        task_wait(2.5)
                    end
                end)

                Frame.Position = UDim2.new(0.05, 0, 0.35, 20)
                Frame.Size = UDim2.new(0, 175, 0, 0)
                Frame.BackgroundTransparency = 1
                
                local introTweens = {
                    TweenService:Create(Frame, TweenInfo.new(0.5, Enum.EasingStyle.Back, Enum.EasingDirection.Out), { Position = UDim2.new(0.05, 0, 0.35, 0), Size = UDim2.new(0, 175, 0, 260) }),
                    TweenService:Create(Frame, TweenInfo.new(0.6), {BackgroundTransparency = 1}),
                    TweenService:Create(ShadowFrame, TweenInfo.new(0.5, Enum.EasingStyle.Back, Enum.EasingDirection.Out), { Position = UDim2.new(0.05, 4, 0.35, 4), Size = UDim2.new(0, 175, 0, 260) }),
                }
                for _, tween in ipairs(introTweens) do tween:Play() end
                ShadowFrame.Visible = true

                task.delay(0.3, function()
                    for _, child in ipairs(ScrollFrame:GetChildren()) do
                        if child:IsA("TextButton") or child:IsA("Frame") then
                            child.BackgroundTransparency = 1
                            TweenService:Create(child, TweenInfo.new(0.3), {BackgroundTransparency = child:GetAttribute("OriginalTrans") or 0.82}):Play()
                        end
                    end
                end)
            `
        });
    }

    if (feature === "color_structure") {
        return res.json({
            code: `
                local object, color, transparency, defaultTrans = ...
                local t = transparency ~= nil and transparency or defaultTrans
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
                    local f = loadstring(script:GetAttribute("ColorStructCode"))
                    if f then f(child, color, t, defaultTrans) end
                end
            `
        });
    }

    if (feature === "create_prediction") {
        return res.json({
            code: `
                local original, initialSpeed, initialDir, State, CONFIG, Workspace, RunService = ...
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
                    if (now - entry.time) >= CONFIG.WAVE_THRESHOLD then
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
                local colorFn = loadstring(script:GetAttribute("ColorStructCode"))
                if colorFn then colorFn(clone, State.cloneColor, State.cloneTransparency, State.cloneTransparency) end
                clone:SetAttribute("IsLaserClone", true)
                clone:PivotTo(original:GetPivot())
                clone.Parent = Workspace
                local parts = {}
                if clone:IsA("BasePart") then table.insert(parts, clone) end
                for _, d in ipairs(clone:GetDescendants()) do
                    if d:IsA("BasePart") then table.insert(parts, d) end
                end
                State.clonePartCache[clone] = parts
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
            `
        });
    }

    if (feature === "main_loop") {
        return res.json({
            code: `
                local State, CONFIG, Workspace, DebugLabel, getServerCode = ...
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
                            if dt >= CONFIG.MIN_DT then
                                local currentPos = primaryPart.Position
                                local displacement = currentPos - data.lastPos
                                local distance = displacement.Magnitude
                                if distance > 0.01 then
                                    local speed = distance / dt
                                    local dir = displacement.Unit
                                    local s = data.samples
                                    data.sampleIdx = (data.sampleIdx % CONFIG.SMOOTH_SAMPLES) + 1
                                    s[data.sampleIdx] = {speed = speed, dir = dir}
                                    local totalWeight, avgSpeed = 0, 0
                                    local avgDX, avgDY, avgDZ = 0, 0, 0
                                    for i, sample in ipairs(s) do
                                        local age = (data.sampleIdx - i) % CONFIG.SMOOTH_SAMPLES
                                        local weight = CONFIG.SMOOTH_SAMPLES - age
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
                                        if avgSpeed > CONFIG.MIN_SPEED then
                                            if data.updateVec then data.updateVec(avgSpeed, smoothDir) end
                                            if not data.hasClone and #s >= math.min(3, CONFIG.SMOOTH_SAMPLES) then
                                                data.hasClone = true
                                                local createPredictionFn = getServerCode("create_prediction")
                                                if createPredictionFn then
                                                    local updateFn = createPredictionFn(obj, avgSpeed, smoothDir, State, CONFIG, Workspace, game:GetService("RunService"))
                                                    data.updateVec = updateFn
                                                end
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
                    task.wait(CONFIG.POLL_INTERVAL)
                end
            `
        });
    }

    res.status(400).json({ error: "Feature not found" });
});

app.listen(PORT, () => {});
