const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/init', (req, res) => {
    res.json({ status: "ok" });
});

app.post('/get-feature', (req, res) => {
    const { feature } = req.body;

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
