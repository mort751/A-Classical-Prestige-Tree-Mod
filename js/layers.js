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
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points.", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {return true},
    upgrades: {
    11: {
        title: "The Start",
        description: "Start generating points.",
        cost: new Decimal(1),
    },
    12: {
        title: "Multiplier",
        description: "Multiply point generation by 3.",
        cost: new Decimal(2),
        unlocked() { return hasUpgrade('p', 11) },
    },
    13: {
        title: "Prestige Synergy",
        description: "Boost point generation based on prestige points.",
        cost: new Decimal(5),
        unlocked() { return hasUpgrade('p', 12) },
        effect() { return player.p.points.add(1).sqrt().add(1) },
        effectDisplay() { return format(this.effect()) + "x" }
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
    color: "#dc8213",
    requires: new Decimal(100), // Can be a function that takes requirement increases into account
    resource: "time flux", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.25, // Prestige currency exponent
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
    layerShown() {return hasUpgrade('p', 11) || player[this.layer].unlocked},
    effect() {
        let effect = new Decimal(2)
        return effect
    },
    update(diff) {
        if(player[this.layer].activeTime.gt(0)) player[this.layer].activeTime = player[this.layer].activeTime.sub(diff)
    },
    effectTime() {return tmp[this.layer].timeBase.mul(tmp[this.layer].timeMult.pow(player[this.layer].points))}, 
    timeBase() {
       let base = new Decimal(60) 
       return base
    },
    timeMultBase() {
        let base = new Decimal(1.1)
        return base
    },
    clickables: { 
    11: {
        display() {
            if(player[this.layer].activeTime.gt(0)) return "Speeding up time by " + format(tmp[this.layer].effect) + "x for " + formatTime(player[this.layer].activeTime) + " seconds"
            else return "Speed up time by " + format(tmp[this.layer].effect) + "x for " + formatTime(tmp[this.layer].effectTime) + " seconds "
        },
        canClick() {return player[this.layer].activeTime.lt(1) && player[this.layer].points.gt(0)},
        onClick() {
            player[this.layer].activeTime = tmp[this.layer].effectTime
            player[this.layer].points = new Decimal(0)
        }
    }
    },
    upgrades: {
    }
})