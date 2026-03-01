addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#138cdc",
    requires: new Decimal(5), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() { return player.points }, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if(hasUpgrade(this.layer, 14)) mult = mult.mul(2)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points.", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() { return true },
    passiveGeneration() {
        let passive = new Decimal(0)
        if(hasUpgrade(this.layer, 22)) passive = passive.add(0.1)
        if(player.f.unlocked && player.f.activeTime.gt(0)) passive = passive.mul(tmp.f.effect) 
        return passive
    },
    effect() { 
        let mult = new Decimal(1)
        if(hasUpgrade(this.layer, 13)) mult = mult.mul(1.75)
        return player.p.points.add(1).cbrt().mul(mult) 
    },
    effectDescription() { return "which are currently multiplying point genration by " + format(tmp[this.layer].effect) + "x"},
    upgrades: {
    11: {
        title: "The Start",
        description: "Start generating points.",
        cost: new Decimal(1),
    },
    12: {
        title: "Triple Points",
        description: "Multiply point generation by 3.",
        cost: new Decimal(2),
        unlocked() { return hasUpgrade(this.layer, 11) },
    },
    13: {
        title: "More Prestige Power",
        description: "Increase the prestige point effect by 75%.",
        cost: new Decimal(5),
        unlocked() { return hasUpgrade(this.layer, 12) },
    },
    14: {
        title: "Double Prestige Points",
        description: "Multiply prestige point gain by 2.",
        cost: new Decimal(25),
        unlocked() { return hasUpgrade(this.layer, 13) },
    },
    21: {
        title: "Point Duplication",
        description: "Boost point generation based on points.",
        cost: new Decimal(200),
        unlocked() { return player.f.unlocked },
        effect() { return player.points.add(3).log(3).cbrt() },
        effectDisplay() { return format(this.effect()) + "x" }
    },
    22: {
        title: "Prestige Point Automation",
        description: "Generate 10% of current prestige point gain every second.",
        cost: new Decimal(1000),
        unlocked() { return hasUpgrade(this.layer, 21) },
    },
    }
})

addLayer("f", {
    name: "flux", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "F", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        activeTime: new Decimal(0)
    }},
    branches: ["p"],
    tooltip() {return player[this.layer].points + " time flux" + (player[this.layer].activeTime.gt(0) ? ", " + formatTime(player[this.layer].activeTime) + " remaining" : "") },
    color: "#dc8213",
    requires: new Decimal(200), // Can be a function that takes requirement increases into account
    resource: "time flux", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() { return player.points }, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: Decimal.div(1, 3), // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "f", description: "F: Reset for time flux.", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() { return hasUpgrade('p', 11) || player[this.layer].unlocked },
    tabFormat: [
    "main-display",
    "prestige-button",
    "resource-display",
    ["clickable", 11],
    "blank",
    "milestones",
    "blank",
    "blank",
    "upgrades"
    ],
    onPrestige(gain) {
        if(~hasMilestone(this.layer, 1)) player[this.layer].activeTime = new Decimal(0)
    },
    effect() {
        let effect = new Decimal(2)
        if(hasUpgrade(this.layer, 12)) effect = effect.mul(1.25)
        return effect
    },
    update(diff) {
        if(player[this.layer].activeTime.gt(0)) player[this.layer].activeTime = player[this.layer].activeTime.sub(diff)
    },
    effectTime() {
        let base = new Decimal(60)
        if(hasUpgrade(this.layer, 11)) base = base.mul(2)

        let mult = new Decimal(1)

        return base.mul(player[this.layer].points.cbrt().max(1)).mul(mult)
    }, 
    clickables: { 
    11: {
        display() {
            if(player[this.layer].activeTime.gt(0)) return "Speeding up time by " + format(tmp[this.layer].effect) + "x for " + formatTime(player[this.layer].activeTime)
            else return "Speed up time by " + format(tmp[this.layer].effect) + "x for " + formatTime(tmp[this.layer].effectTime)
        },
        canClick() {return player[this.layer].activeTime.lt(1) && player[this.layer].points.gt(0)},
        onClick() {
            if(hasMilestone(this.layer, 2)) player[this.layer].activeTime = player[this.layer].activeTime.add(tmp[this.layer].effectTime)
            else player[this.layer].activeTime = tmp[this.layer].effectTime
            player[this.layer].points = new Decimal(0)
        }
    }
    },
    milestones: {
    1: {
        requirementDescription: "25 flux points",
        effectDescription: "Flux resets no longer reset time flux.",
        done() { return player[this.layer].points.gte(25) }
    },
    2: {
        requirementDescription: "50 flux points",
        effectDescription: "Re-activating the time flux effect adds to the duration instead of setting it.",
        done() { return player[this.layer].points.gte(50) }
    },
    },
    upgrades: {
    11: {
        title: "Longer Effect",
        description: "Double the duration of the time flux effect.",
        cost: new Decimal(1),
        unlocked() { return player[this.layer].total.gt(1) }
    },
    12: {
        title: "Stronger Effect",
        description: "Increase the power of the time flux effect by 25%.",
        cost: new Decimal(1),
        unlocked() { return player[this.layer].total.gt(1) }
    },
    13: {
        title: "Time is Money",
        description: "Increase the duration of the time flux effect based on how much money you have.",
        cost: new Decimal(5),
        unlocked() { return false }
    },
    },
})

addLayer("m", {
    name: "money", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    branches: ["p"],
    color: "#0b760d",
    requires: new Decimal(200), // Can be a function that takes requirement increases into account
    resource: "money", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() { return player.points }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: Decimal.div(1, 3), // Prestige currency exponent
    getResetGain() { return new Decimal(1) },
    getNextAt(canMax=false) { return new Decimal(200)},
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "f", description: "F: Reset for time flux.", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() { return hasUpgrade('p', 11) || player[this.layer].unlocked },
    tabFormat: [
    "main-display",
    "prestige-button",
    ],
})